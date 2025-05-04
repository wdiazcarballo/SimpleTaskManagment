import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const Setup2FAPage = () => {
  const navigate = useNavigate();
  const { user, setup2FA, verify2FA, error } = useAuth();
  
  const [qrCode, setQRCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Backup Codes
  const [loading, setLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.twoFactorEnabled) {
      navigate('/profile');
    }
  }, [user, navigate]);
  
  // Load 2FA setup on mount
  useEffect(() => {
    const loadSetup = async () => {
      if (user && !user.twoFactorEnabled) {
        setLoading(true);
        try {
          const data = await setup2FA();
          setQRCode(data.qrCodeUrl);
          setSecret(data.tempSecret);
          setLoading(false);
        } catch (err) {
          setSetupError('Failed to generate 2FA setup. Please try again.');
          setLoading(false);
        }
      }
    };
    
    loadSetup();
  }, [user, setup2FA]);
  
  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };
  
  const handleVerify = async (e) => {
    e.preventDefault();
    setSetupError('');
    setLoading(true);
    
    try {
      const data = await verify2FA(token);
      setBackupCodes(data.backupCodes);
      setStep(3); // Show backup codes
    } catch (err) {
      setSetupError('Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/');
  };
  
  const handleFinish = () => {
    navigate('/');
  };
  
  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\\n');
    navigator.clipboard.writeText(codesText);
    alert('Backup codes copied to clipboard!');
  };
  
  // Render loading state
  if (loading && step === 1) {
    return <div className="auth-container loading">Generating 2FA setup...</div>;
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card wider">
        {step === 1 && (
          <>
            <h2>Set Up Two-Factor Authentication</h2>
            <p className="auth-description">
              Two-factor authentication adds an extra layer of security to your account.
              When enabled, you will need to provide a code from your authenticator app
              along with your password to log in.
            </p>
            
            {setupError && <div className="auth-error">{setupError}</div>}
            {error && <div className="auth-error">{error}</div>}
            
            <div className="setup-container">
              <div className="qr-container">
                {qrCode && <QRCodeSVG value={qrCode} size={200} />}
              </div>
              
              <div className="setup-instructions">
                <h3>Setup Instructions:</h3>
                <ol>
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>If you can't scan the code, enter this key manually: <code>{secret}</code></li>
                </ol>
                
                <div className="setup-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleSkip}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2>Verify Two-Factor Authentication</h2>
            <p className="auth-description">
              Enter the 6-digit code from your authenticator app to verify setup.
            </p>
            
            {setupError && <div className="auth-error">{setupError}</div>}
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label htmlFor="token">Authentication Code</label>
                <input
                  type="text"
                  id="token"
                  name="token"
                  value={token}
                  onChange={handleTokenChange}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  autoComplete="off"
                />
              </div>
              
              <div className="setup-actions">
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}
        
        {step === 3 && (
          <>
            <h2>Backup Codes</h2>
            <p className="auth-description">
              <strong>Important:</strong> Keep these backup codes in a safe place. If you lose your authenticator 
              device, you can use these one-time codes to access your account. Each code can only be used once.
            </p>
            
            <div className="backup-codes">
              <ul>
                {backupCodes.map((code, index) => (
                  <li key={index}><code>{code}</code></li>
                ))}
              </ul>
              
              <button 
                className="btn btn-secondary"
                onClick={copyBackupCodes}
              >
                Copy to Clipboard
              </button>
            </div>
            
            <div className="setup-actions centered">
              <button 
                className="btn btn-primary"
                onClick={handleFinish}
              >
                Finish Setup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Setup2FAPage;