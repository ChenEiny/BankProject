import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/layout/AuthLayout';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkExistingAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (isMounted && res.data?.user) {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch {
        // Not authenticated - stay on the register page
      }
      if (isMounted) {
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try
    {
      const res = await api.post('/auth/signup', formData);
      setStatus({ type: 'success', msg: `${res.data.message || 'Registration successful'}. Please check your email.` });
      setFormData({ email: '', phone: '', password: '' });
    } catch (err)
    {
      const axiosError = err as AxiosError<{ error?: string }>;
      setStatus({ type: 'error', msg: axiosError.response?.data?.error || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <AuthLayout title="Open an Account" subtitle="Register for secure access to SafeBank">
        <div className="auth-form" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 size={24} className="spinner" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Open an Account"
      subtitle="Register for secure access to SafeBank"
    >
      {status.msg && (
        <div className={status.type === 'error' ? 'error-alert' : 'status-badge success'}>
          {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{status.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <div className="input-wrapper">
            <Phone size={18} className="input-icon" />
            <input
              type="tel"
              placeholder="+972..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <Loader2 size={18} className="spinner" /> Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
