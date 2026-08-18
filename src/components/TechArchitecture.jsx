import React from 'react';

export default function TechArchitecture() {
  return (
    <section className="container" style={{ margin: '60px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '10px' }}>
          Autonomous Distributed Architecture
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          Built with resilient serverless cloud primitives designed to persist memory across restarts, regions, and failures.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* CockroachDB Vector Memory */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.4rem' }}>🪳</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>CockroachDB Distributed Memory</h3>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#10b981' }}>VECTOR(1536) &amp; ACID State</span>
            </div>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '14px' }}>
            Permanent semantic ledger storing 1536-dimensional embeddings of known predatory clauses alongside strict ACID audit records of all contract modifications and user alert deliveries.
          </p>
          <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Zero memory loss across node restarts</li>
            <li>Sub-10ms Cosine Distance vector indexing</li>
            <li>Distributed agreement versioning &amp; diff trails</li>
          </ul>
        </div>

        {/* AWS Bedrock Engine */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>AWS Bedrock AI Synthesis</h3>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>amazon.nova-micro-v1:0</span>
            </div>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '14px' }}>
            Multi-tier legal reasoning engine that parses complex legalese into digestible consumer English, computes penalty weights, and synthesizes 30-day opt-out instructions.
          </p>
          <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Real-time legal jargon translation</li>
            <li>Zero corporate buzzwords or vague fluff</li>
            <li>Actionable consumer defense playbooks</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
