import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(loginData.email, loginData.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/tasks');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (signupData.password !== signupData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    setLoading(true);
    
    const result = await register(signupData.name, signupData.email, signupData.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/tasks');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="main">
        <input 
          type="checkbox" 
          id="chk" 
          aria-hidden="true"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />

        {/* Sign Up Form */}
        <div className="signup">
          <form onSubmit={handleSignupSubmit}>
            <label htmlFor="chk" aria-hidden="true">Sign up</label>
            <input 
              type="text" 
              name="name" 
              placeholder="User name" 
              value={signupData.name}
              onChange={handleSignupChange}
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={signupData.email}
              onChange={handleSignupChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={signupData.password}
              onChange={handleSignupChange}
              required 
            />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required 
            />
            {passwordError && <div className="auth-error">{passwordError}</div>}
            {error && !isChecked && <div className="auth-error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Sign up'}
            </button>
          </form>
        </div>

        {/* Login Form */}
        <div className="login">
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="chk" aria-hidden="true">Login</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={loginData.email}
              onChange={handleLoginChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={loginData.password}
              onChange={handleLoginChange}
              required 
            />
            {error && isChecked && <div className="auth-error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;