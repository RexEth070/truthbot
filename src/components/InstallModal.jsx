import React from 'react';

export default function InstallModal({ type, onClose }) {
  if (!type) return null;

  const isPc = type === 'pc';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img 
            src={isPc ? '/assets/icon-pc.png' : '/assets/icon-android.png'} 
            alt={isPc ? 'PC' : 'Mobile'} 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <h2>{isPc ? 'PC & Desktop Watchdog Setup' : 'Android & iOS Mobile Setup'}</h2>
        </div>

        {isPc ? (
          <div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px', fontWeight: '500' }}>
              Enable background desktop notifications to receive immediate push alerts when any monitored agreement is edited.
            </p>
            <ol style={{ paddingLeft: '20px', color: '#1e293b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Click the <strong>Enable Push Alerts</strong> toggle on the top navigation bar.</li>
              <li>When Chrome/Edge prompts for permission, click <strong>Allow</strong>.</li>
              <li>Keep TruthBot tab open or pinned in your browser. The autonomous Sentinel poller runs 24/7.</li>
              <li>Optionally install TruthBot as a PWA (Click <em>Install TruthBot</em> in the browser URL bar).</li>
            </ol>
          </div>
        ) : (
          <div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px', fontWeight: '500' }}>
              Add TruthBot to your Home Screen for instant mobile push notifications and 1-tap legal scanning.
            </p>
            
            <h4 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1rem' }}>Android (Chrome)</h4>
            <ol style={{ paddingLeft: '20px', color: '#1e293b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <li>Open TruthBot in Chrome.</li>
              <li>Tap the <strong>three dots menu (⋮)</strong> at the top right.</li>
              <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
            </ol>

            <h4 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1rem' }}>iOS (Safari)</h4>
            <ol style={{ paddingLeft: '20px', color: '#1e293b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Open TruthBot in Safari.</li>
              <li>Tap the <strong>Share button</strong> (square with an up arrow) at the bottom.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen" (➕)</strong>.</li>
            </ol>
          </div>
        )}

        <button 
          className="cta-btn-primary" 
          onClick={onClose}
          style={{ width: '100%', marginTop: '28px', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
        >
          Got It, Thanks
        </button>
      </div>
    </div>
  );
}
