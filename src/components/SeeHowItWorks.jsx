import React from 'react';

export default function SeeHowItWorks() {
  const steps = [
    {
      title: '1. Ingestion',
      subtitle: 'Scrape & Parse',
      desc: 'Paste a URL. The backend fetches the raw HTML, strips out the noise, and parses the legal text into clean, readable blocks.'
    },
    {
      title: '2. Vector Search',
      subtitle: 'CockroachDB Matching',
      desc: 'Text blocks are converted into embeddings and queried against a CockroachDB vector database to instantly flag predatory clauses.'
    },
    {
      title: '3. LLM Translation',
      subtitle: 'Plain English & Remedies',
      desc: 'Flagged clauses are passed to an LLM, which translates the legal jargon into simple terms and provides step-by-step opt-out instructions.'
    },
    {
      title: '4. Live Watchdog',
      subtitle: 'Autonomous Polling',
      desc: 'A background worker periodically re-scrapes the URL. If the company silently changes the terms, you get an instant push notification.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.6rem', color: '#0f172a', marginBottom: '16px' }}>
            How TruthBot Works
          </h2>
          <p style={{ color: '#475569', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            From instant URL scan to persistent background guard. Here is how your autonomous legal agent protects your rights.
          </p>
        </div>

        {/* Unboxed Linear Layout */}
        <div className="step-container" style={{ marginBottom: '60px' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="step-row">
              <div style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flex: 1 }}>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-subtitle" style={{ color: '#ef4444' }}>{step.subtitle}</p>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Engine Status & Technology Logos */}
        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '9999px', background: '#1e293b', border: '1px solid #0f172a', color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '20px' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}></span>
            <span>Agent: ACTIVE</span>
          </div>
          
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '24px' }}>
            Autonomous background engine powered by <strong>CockroachDB</strong> & <strong>AWS Bedrock</strong>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
            <img 
              src="https://cdn.worldvectorlogo.com/logos/cockroachdb.svg" 
              alt="CockroachDB" 
              style={{ height: '36px', objectFit: 'contain' }} 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
              alt="AWS Bedrock" 
              style={{ height: '36px', objectFit: 'contain' }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
