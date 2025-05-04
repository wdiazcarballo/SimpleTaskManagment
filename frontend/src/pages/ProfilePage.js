import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, disable2FA, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    currentPasswordFor2FA: ''
  });
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  const { name, email, password, newPassword, confirmPassword, currentPasswordFor2FA } = formData;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Check if passwords match
    if (name === 'confirmPassword' || name === 'newPassword') {
      if (name === 'newPassword') {
        setPasswordMatch(value === formData.confirmPassword);
      } else {
        setPasswordMatch(value === formData.newPassword);
      }
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // If changing password, validate passwords match
    if (showPasswordChange) {
      if (newPassword !== confirmPassword) {
        setPasswordMatch(false);
        setError('New passwords do not match');
        return;
      }
      
      // Validate password length
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const userData = {
        name,
        email,
      };
      
      // Add passwords only if changing
      if (showPasswordChange && password && newPassword) {
        userData.password = password; // Current password
        userData.newPassword = newPassword; // New password
      }
      
      await updateProfile(userData);
      setSuccess('Profile updated successfully');
      
      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setShowPasswordChange(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!currentPasswordFor2FA) {
      setError('Current password is required to disable 2FA');
      return;
    }
    
    setLoading(true);
    
    try {
      await disable2FA(currentPasswordFor2FA);
      setSuccess('Two-factor authentication disabled successfully');
      setShow2FAModal(false);
      
      // Reset the password field
      setFormData((prev) => ({
        ...prev,
        currentPasswordFor2FA: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };
  
  const setupTwoFactor = () => {
    navigate('/setup-2fa');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="profile-card">
        <h2>Personal Information</h2>
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              required
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
            />
          </div>
          
          <div className="password-change-toggle">
            <button 
              type="button"
              className="btn btn-link"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>
          
          {showPasswordChange && (
            <div className="password-change-section">
              <div className="form-group">
                <label htmlFor="password">Current Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <small className="form-text">
                  Password must be at least 6 characters long
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  className={!passwordMatch ? 'input-error' : ''}
                />
                {!passwordMatch && (
                  <small className="text-error">Passwords do not match</small>
                )}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (showPasswordChange && !passwordMatch)}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      
      <div className="profile-card">
        <h2>Security Settings</h2>
        
        <div className="security-section">
          <div className="security-item">
            <div>
              <h3>Two-Factor Authentication</h3>
              <p>
                {user?.twoFactorEnabled 
                  ? 'Two-factor authentication is enabled for your account.'
                  : 'Protect your account with two-factor authentication.'}
              </p>
            </div>
            
            {user?.twoFactorEnabled ? (
              <button 
                className="btn btn-danger"
                onClick={() => setShow2FAModal(true)}
              >
                Disable 2FA
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={setupTwoFactor}
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 2FA Disable Modal */}
      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Disable Two-Factor Authentication</h3>
            <p>
              Warning: This will remove the extra layer of security from your account.
              Are you sure you want to continue?
            </p>
            
            <form onSubmit={handleDisable2FA}>
              <div className="form-group">
                <label htmlFor="currentPasswordFor2FA">Enter your password to confirm</label>
                <input
                  type="password"
                  id="currentPasswordFor2FA"
                  name="currentPasswordFor2FA"
                  value={currentPasswordFor2FA}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShow2FAModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;