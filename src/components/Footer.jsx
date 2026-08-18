import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <img 
            src="/assets/truthbot-mascot.png" 
            alt="TruthBot Mascot" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
            TruthBot
          </span>
          <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>24/7 LEGAL SENTINEL</span>
        </div>

        <p className="footer-quote">
          "Built for the 5.4 Billion people who use the internet and agree to Terms &amp; Conditions."
        </p>

        <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.8rem' }}>
          Powered by CockroachDB Vector Indexing &amp; AWS Bedrock AI Reasoning.
        </div>
      </div>
    </footer>
  );
}
