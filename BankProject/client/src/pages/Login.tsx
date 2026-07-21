import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../api/authService';
import api from '../api/axios';
import { User } from '../types';
import AuthLayout from '../components/layout/AuthLayout';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) 
{
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkExistingAuth = async () => {
      try {
        const res = await api.get('/auth/me'); 
        if (isMounted && res.data?.user) {
          onLoginSuccess(res.data.user);
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // Not authenticated
      }
    };

    checkExistingAuth();

    return () => 
    {
      isMounted = false;
    };
  }, [navigate, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => 
  {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      if (result.user) {
        onLoginSuccess(result.user);
      }
      navigate('/dashboard');
    } catch (err: unknown) 
    {
      if (err instanceof Error) 
      {
        setError(err.message);
      } else 
      {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="SafeBank Portal" 
      subtitle="Enter your credentials to access your account"
    >
      {error && (
        <div className="error-alert">
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        
        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Password</label>

          </div>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="eye-btn"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <Loader2 size={18} className="spinner" /> Securely Logging in...
            </>
          ) : (
            'Sign In to Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <Link to="/register">
            Open an Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}