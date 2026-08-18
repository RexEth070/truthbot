import React from 'react';

export default function NotificationModal({ alertData, onClose }) {
  if (!alertData) return null;

  const actionWord = alertData.updateType === 'UPDATE' ? 'updated' : 'changed';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header-section">
          <img 
            src="/assets/truthbot-mascot.png" 
            alt="Alert" 
            className="modal-icon-glow"
          />
          <h2 className="modal-header-title">{alertData.serviceName} {actionWord} their T&C</h2>
        </div>

        <div className="modal-body-section">
          <h4 className="modal-subheader">{alertData.affectedCategories}</h4>
          
          <div className="modal-context-box">
            <p className="modal-context-text">
              {alertData.summary}
            </p>
          </div>

          <div className="modal-diff-container">
             <div className="diff-header">AI Structural Diff:</div>
             <div className="diff-content">
                <div className="diff-old"><span className="diff-badge old">OLD</span> {alertData.oldClause}</div>
                <div className="diff-new">
                  <span className="diff-badge new">NEW</span> 
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{alertData.newClause}</span>
                </div>
             </div>
          </div>
        </div>

        <button 
          className="cta-btn-primary full-width" 
          onClick={onClose}
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
