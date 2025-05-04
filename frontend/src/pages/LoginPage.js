import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verify2FALogin, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    token: ''
  });
  
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { email, password, token } = formData;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      // If 2FA is required and token is provided
      if (requireTwoFactor) {
        await verify2FALogin(email, password, token);
        navigate('/');
      } else {
        // First login attempt
        const response = await login({ email, password });
        
        // Check if 2FA is required
        if (response.requireTwoFactor) {
          setRequireTwoFactor(true);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{requireTwoFactor ? 'Two-Factor Authentication' : 'Login'}</h2>
        
        {loginError && <div className="auth-error">{loginError}</div>}
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!requireTwoFactor ? (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="token">Authentication Code</label>
              <input
                type="text"
                id="token"
                name="token"
                value={token}
                onChange={handleChange}
                required
                placeholder="Enter your authentication code"
                autoComplete="off"
              />
              <small className="form-text">
                Enter the code from your authenticator app or one of your backup codes.
              </small>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : requireTwoFactor ? 'Verify' : 'Login'}
          </button>
        </form>
        
        {!requireTwoFactor && (
          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;