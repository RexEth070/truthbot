import React from 'react';

export default function ContactSection() {
  return (
    <section className="container" style={{ padding: '80px 0', borderTop: '1px solid #e2e8f0', marginTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.4rem', color: '#0f172a' }}>
          Get in touch
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Support & Contact */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
            alt="Email" 
            style={{ 
              width: '56px', 
              height: '56px', 
              objectFit: 'contain', 
              marginBottom: '20px'
            }} 
          />
          <div style={{ marginTop: '10px' }}>
            <a href="mailto:samrexdbg@gmail.com" className="cta-btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
              samrexdbg@gmail.com
            </a>
          </div>
        </div>

        {/* Social Profile */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <img src="/assets/icon-x.png" alt="Twitter" style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '20px' }} />
          <div style={{ marginTop: '10px' }}>
            <a href="https://x.com/rexkillz_" target="_blank" rel="noreferrer" className="cta-btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
              @rexkillz_
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
