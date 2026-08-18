import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SeeHowItWorks from './components/SeeHowItWorks';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import InstallModal from './components/InstallModal';
import NotificationModal from './components/NotificationModal';

export default function App() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [installModalType, setInstallModalType] = useState(null); // 'pc' | 'android' | null
  const [loading, setLoading] = useState(false);
  
  // Memory States
  const [scanHistory, setScanHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Load persistent memory from CockroachDB backend on mount
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const [agreementsRes, alertsRes] = await Promise.all([
          fetch('/api/agreements'),
          fetch('/api/alerts')
        ]);
        
        if (agreementsRes.ok) {
          const data = await agreementsRes.json();
          if (data.agreements) {
            // Map the backend DB format to the frontend format
            const mappedHistory = data.agreements.map(a => ({
              id: a.id,
              serviceName: a.service_name,
              url: a.url,
              clauses: (a.clauses || []).map(c => c.plain_english)
            }));
            setScanHistory(mappedHistory);
          }
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          if (data.alerts) {
            setAlerts(data.alerts);
          }
        }
      } catch (err) {
        console.error('Failed to load memory from CockroachDB:', err);
      }
    };

    fetchMemory();
  }, []);
  
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Connect to SSE Live Watchdog Stream
  useEffect(() => {
    const eventSource = new EventSource('/api/sentinel/stream');

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'CONTRACT_ALTERED_ALERT') {
          // Add to local state (backend handles DB persistence)
          setAlerts(prev => {
            const newAlerts = [{ ...data, id: Date.now(), read: false }, ...prev];
            return newAlerts;
          });

          // Trigger Device / Browser Push Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const actionWord = data.updateType === 'UPDATE' ? 'updated' : 'changed';
            new Notification(`${data.serviceName} ${actionWord} their T&C`, {
              body: `${data.affectedCategories}\n\n${data.summary}`,
              icon: '/assets/truthbot-mascot.png'
            });
          }
        }
      } catch (err) {
        console.warn('SSE Parse error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Handle URL Analysis
  const handleAnalyzeUrl = async (url) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      // Add ID and keep original URL
      data.id = data.agreementId || Date.now();
      data.url = url;

      setScanHistory(prev => {
        const newHistory = [data, ...prev];
        return newHistory;
      });

      return data;
    } catch (err) {
      console.error('Error analyzing agreement:', err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle Browser Push Notification Permission
  const handleToggleNotifications = async () => {
    // If currently enabled, let the user logically toggle them off in the app state
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      alert('Push alerts paused. TruthBot will not send you browser notifications.');
      return;
    }

    if (!('Notification' in window)) {
      alert('Your browser does not support web push notifications. Note: iOS Safari requires adding the app to your Home Screen first.');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Notifications are currently blocked. Please allow notifications for this site in your browser settings.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      try {
        new Notification('🛡️ TruthBot Sentinel Active', {
          body: 'You are protected 24/7 against stealth contractual alterations.',
          icon: '/assets/truthbot-mascot.png'
        });
        alert('Push alerts enabled successfully!');
      } catch (e) {
        alert('Push alerts enabled, but your device may restrict displaying them unless added to the Home Screen.');
      }
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('🛡️ TruthBot Sentinel Active', {
            body: 'You are protected 24/7 against stealth contractual alterations.',
            icon: '/assets/truthbot-mascot.png'
          });
          alert('Push alerts enabled successfully!');
        } else {
          alert('Notification permission was denied. You will not receive push alerts.');
        }
      } catch (err) {
        alert('An error occurred while requesting notification permissions.');
      }
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWipeMemory = () => {
    localStorage.removeItem('truthbot_scan_history');
    localStorage.removeItem('truthbot_alerts');
    setScanHistory([]);
    setAlerts([]);
  };

  const handleAlertClick = (alertId) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === alertId ? { ...a, read: true } : a);
      localStorage.setItem('truthbot_alerts', JSON.stringify(updated));
      return updated;
    });
    const clickedAlert = alerts.find(a => a.id === alertId);
    if (clickedAlert) setSelectedAlert(clickedAlert);
  };

  return (
    <div>
      <Header 
        onOpenInstall={(type) => setInstallModalType(type)}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        alerts={alerts}
        onAlertClick={handleAlertClick}
        onWipeMemory={handleWipeMemory}
      />

      <Hero 
        onAnalyzeUrl={handleAnalyzeUrl}
        loading={loading}
        onScrollToHowItWorks={handleScrollToHowItWorks}
      />

      <SeeHowItWorks />

      <ContactSection />

      <Footer />

      {/* Modals */}
      <InstallModal 
        type={installModalType}
        onClose={() => setInstallModalType(null)}
      />
      
      <NotificationModal 
        alertData={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </div>
  );
}
