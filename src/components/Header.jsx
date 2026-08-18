import React, { useState, useRef, useEffect } from 'react';

export default function Header({ onOpenInstall, notificationsEnabled, onToggleNotifications, alerts, onAlertClick, onWipeMemory }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [wipeText, setWipeText] = useState('🗑️ Wipe Memory');
  
  const settingsRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = alerts ? alerts.filter(a => !a.read).length : 0;

  const btnStyle = {
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 12px', 
    background: '#1e293b', 
    border: '1px solid #0f172a', 
    borderRadius: '12px',
    cursor: 'pointer', 
    color: '#fff', 
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    position: 'relative'
  };

  const iconStyle = { width: '20px', height: '20px', objectFit: 'contain', filter: 'brightness(0) invert(1)' };

  const dropdownStyle = {
    position: 'absolute',
    top: '120%',
    right: '0',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    minWidth: '240px',
    zIndex: 50,
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const dropdownItemStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  };

  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand">
          <img src="/assets/truthbot-mascot.png" alt="TruthBot Logo" className="brand-mascot" />
          <span>TruthBot</span>
        </div>

        <nav className="nav-links" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '16px', marginLeft: '32px' }}>
          
          {/* Top Group: PC, Android, GitHub */}
          <div className="nav-group-top" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={btnStyle} onClick={() => onOpenInstall('pc')}>
              <img src="/assets/icon-pc.png" alt="PC Icon" style={iconStyle} />
              <span>PC Guide</span>
            </button>

            <button style={btnStyle} onClick={() => onOpenInstall('android')}>
              <img src="/assets/icon-android.png" alt="Android Icon" style={iconStyle} />
              <span>Android/iOS</span>
            </button>

            <a 
              href="https://github.com/RexEth070/truthbot" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={btnStyle}
            >
              <img src="/assets/icon-github.png" alt="GitHub Icon" style={iconStyle} />
              <span>GitHub</span>
            </a>
          </div>

          {/* Bottom Group: Notifications, Settings */}
          <div className="nav-group-bottom" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Notification Bell */}
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button 
                style={btnStyle}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <img src="/assets/icon-bell.png" alt="Alerts" style={iconStyle} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    boxShadow: '0 0 0 2px #ffffff'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div style={{...dropdownStyle, minWidth: '300px', maxHeight: '400px', overflowY: 'auto'}}>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                    Live Alerts
                  </div>
                  {alerts && alerts.length > 0 ? (
                    alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        onClick={() => { onAlertClick(alert.id); setShowNotifications(false); }}
                        style={{
                          ...dropdownItemStyle, 
                          background: alert.read ? '#ffffff' : '#fef2f2',
                          borderLeft: alert.read ? 'none' : '4px solid #ef4444',
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{alert.serviceName}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Terms updated silently. Tap to view.</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                      No alerts found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Menu */}
            <div ref={settingsRef} style={{ position: 'relative' }}>
              <button 
                style={btnStyle}
                onClick={() => setShowSettings(!showSettings)}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>⚙️</span>
              </button>

              {showSettings && (
                <div style={dropdownStyle}>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                    Settings
                  </div>
                  <button 
                    style={dropdownItemStyle}
                    onClick={() => { onToggleNotifications(); setShowSettings(false); }}
                  >
                    <span style={{ color: notificationsEnabled ? '#10b981' : '#64748b' }}>●</span> 
                    {notificationsEnabled ? 'Push Alerts Enabled' : 'Enable Push Alerts'}
                  </button>
                  <button 
                    style={{ ...dropdownItemStyle, color: wipeText === 'Memory Wiped!' ? '#10b981' : '#ef4444', fontWeight: wipeText === 'Memory Wiped!' ? 'bold' : 'normal' }}
                    onClick={() => { 
                      onWipeMemory(); 
                      setWipeText('Memory Wiped!');
                      setTimeout(() => {
                        setShowSettings(false);
                        setWipeText('🗑️ Wipe Memory');
                      }, 1500);
                    }}
                  >
                    {wipeText}
                  </button>
                </div>
              )}
            </div>
          </div>

        </nav>
      </div>
    </header>
  );
}
