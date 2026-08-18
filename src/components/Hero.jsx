import React, { useState, useRef } from 'react';

export default function Hero({ onAnalyzeUrl, loading, onScrollToHowItWorks }) {
  const [inputUrl, setInputUrl] = useState('');
  const [scanResult, setScanResult] = useState(null);
  
  const mascotRef = useRef(null);
  const [mascotStyle, setMascotStyle] = useState({ 
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
  });

  const handleMouseMove = (e) => {
    if (!mascotRef.current) return;
    const { left, top, width, height } = mascotRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20; // 20 dampens the tilt
    const y = -(e.clientY - top - height / 2) / 20;
    
    setMascotStyle({
      transform: `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.05)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setMascotStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setScanResult(null);
      const result = await onAnalyzeUrl(inputUrl.trim());
      if (result) {
        setScanResult(result);
      }
    }
  };

  return (
    <section className="hero-section container">
      <div className="hero-grid">
        {/* Left Column: Copy, Actions, URL Ingest */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: '700', color: 'var(--high-risk-color)', fontFamily: 'var(--font-mono)' }}>
            <span className="pulse-dot" style={{ backgroundColor: 'var(--high-risk-color)', boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)' }}></span>
            <span>AUTONOMOUS LEGAL AGENT</span>
          </div>

          <h1 className="hero-headline">
            Never Agree Blindly <span>Again.</span>
          </h1>

          <p className="hero-desc">
            99% of people agree to Terms & Conditions without reading them. TruthBot acts as your personal AI lawyer—ingesting complex legal structures, translating predatory jargon, and defending your rights online.
          </p>

          <div className="hero-actions">
            <button className="cta-btn-primary" onClick={onScrollToHowItWorks}>
              <span>See How It Works</span>
              <span>↓</span>
            </button>
          </div>

          {/* Universal URL Ingestion Bar */}
          <form onSubmit={handleSubmit} className="url-bar-container" style={{ position: 'relative', zIndex: 10 }}>
            <img src="/assets/icon-search.png" alt="Search / Inspect" className="url-icon" />
            <input
              type="text"
              className="url-input"
              placeholder="Paste any Terms of Service URL..."
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
            />
            <button type="submit" className="url-submit-btn" disabled={loading}>
              {loading ? 'Scanning Structure...' : 'Scan Agreement'}
            </button>
          </form>

          {/* Scan Results Dropdown Menu */}
          {scanResult && <div style={{
              marginTop: '16px',
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(16px)',
              animation: 'fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>Structural Scan: {scanResult.serviceName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setScanResult(null)}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Dismiss Results"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {scanResult.error ? (
                <p style={{ color: 'var(--high-risk-color)', fontSize: '0.95rem', margin: 0 }}>Error: {scanResult.error}</p>
              ) : (
                <>
                  <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '20px', textAlign: 'left', fontWeight: '500' }}>
                    {scanResult.summary}
                  </p>
                  
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '16px', fontSize: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', textAlign: 'left', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Structural Risk Breakdown
                  </h4>
                  
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {scanResult.clauses && scanResult.clauses.map((clause, idx) => {
                      const isHighRisk = clause.severity === 'High Risk';
                      return (
                        <div key={idx} style={{ 
                          padding: '20px', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: isHighRisk ? 'var(--high-risk-bg)' : 'var(--risk-bg)', 
                          border: `1px solid ${isHighRisk ? 'rgba(220, 38, 38, 0.2)' : 'rgba(217, 119, 6, 0.2)'}`,
                          borderLeft: `4px solid ${isHighRisk ? 'var(--high-risk-color)' : 'var(--risk-color)'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                               <h5 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.05rem' }}>{clause.clauseTitle}</h5>
                               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{clause.category}</span>
                            </div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: '700', 
                              color: isHighRisk ? '#991b1b' : '#92400e',
                              backgroundColor: isHighRisk ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)'
                            }}>
                              {clause.severity}
                            </span>
                          </div>
                          
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', fontStyle: 'italic', borderLeft: '2px solid var(--border-subtle)', paddingLeft: '12px' }}>
                            "{clause.clauseText}"
                          </p>
                          
                          <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>AI Context:</strong>
                            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, marginBottom: '12px' }}>{clause.plainEnglish}</p>
                            
                            <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Legal Danger:</strong>
                            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0 }}>{clause.riskExplanation}</p>
                            
                            {clause.remedy && (
                              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
                                <strong style={{ color: '#059669', fontSize: '0.85rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Suggested Remedy:</strong>
                                <p style={{ color: '#047857', fontSize: '0.9rem', margin: 0 }}>{clause.remedy}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          }
        </div>

        {/* Right Column: TruthBot Mascot Showcase */}
        <div 
          className="hero-mascot-card" 
          ref={mascotRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="mascot-image-wrapper" style={{ ...mascotStyle, transformStyle: 'preserve-3d' }}>
            <img 
              src="/assets/truthbot-mascot.png" 
              alt="TruthBot Sentinel Mascot" 
              className="mascot-hero-img" 
              style={{ filter: 'drop-shadow(0 0 24px rgba(2, 132, 199, 0.2))', width: '100%', maxWidth: '450px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
