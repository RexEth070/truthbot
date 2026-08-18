import React from 'react';

export default function WelcomeBanner({ user }) {
  if (!user) return null;

  return (
    <div className="welcome-banner container">
      <div className="welcome-left">
        <img 
          src="/assets/truthbot-mascot.png" 
          alt="TruthBot Mascot" 
          className="welcome-avatar" 
        />
        <div>
          <h2 className="welcome-title">Welcome to TruthBot, {user.name}</h2>
          <p className="welcome-sub">Standing guard over your legal agreements.</p>
        </div>
      </div>
    </div>
  );
}
