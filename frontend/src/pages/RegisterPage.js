import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Check if passwords match
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'password') {
        setPasswordMatch(value === formData.confirmPassword);
      } else {
        setPasswordMatch(value === formData.password);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      setRegisterError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await register({
        name,
        email,
        password
      });
      
      // Redirect to setup 2FA page
      navigate('/setup-2fa');
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        
        {registerError && <div className="auth-error">{registerError}</div>}
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>
          
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
              minLength="6"
            />
            <small className="form-text">
              Password must be at least 6 characters long
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className={!passwordMatch ? 'input-error' : ''}
            />
            {!passwordMatch && (
              <small className="text-error">Passwords do not match</small>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading || !passwordMatch}
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;