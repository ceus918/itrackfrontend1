import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../components/css/Login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <label htmlFor="password">New Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
