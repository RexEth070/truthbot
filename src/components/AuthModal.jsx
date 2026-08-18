import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    setLoading(true);
    setError('');

    try {
      // MOCK BACKEND FOR HACKATHON DEMO to avoid CockroachDB sleep issues
      await new Promise(resolve => setTimeout(resolve, 800)); // fake network delay
      
      const demoOTP = '123456';
      
      // Simulate sending email to user
      alert(`Verification code successfully dispatched to ${email}. Check your inbox! (Demo code is ${demoOTP})`);
      
      setDemoCode(demoOTP);
      setStep('OTP');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // MOCK BACKEND FOR HACKATHON DEMO
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (otp !== demoCode) {
        throw new Error('Invalid verification code. Please try again.');
      }

      // Mock User
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        push_enabled: true
      };

      onAuthSuccess(mockUser);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src="/assets/icon-gmail.png" 
            alt="Gmail" 
            style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '12px' }}
          />
          <h2>{step === 'EMAIL' ? 'Passwordless Sign In' : 'Enter 6-Digit Code'}</h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '6px' }}>
            {step === 'EMAIL' 
              ? 'No password required. We will send a secure 6-digit code to your inbox.' 
              : `Verification code dispatched to ${email}`}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label className="form-label">Your Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="samuel@truthbot.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="cta-btn-primary" 
              style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              disabled={loading}
            >
              {loading ? 'Sending Code...' : 'Next: Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">6-Digit Code</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem' }}
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="cta-btn-primary" 
              style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button 
                type="button" 
                onClick={() => setStep('EMAIL')}
                style={{ color: '#475569', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
