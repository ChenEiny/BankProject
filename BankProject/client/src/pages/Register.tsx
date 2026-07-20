import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      setStatus({ type: 'success', msg: `${res.data.message || 'Registration successful'}. Please check your email.` });
      setFormData({ email: '', phone: '', password: '' });
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setStatus({ type: 'error', msg: axiosError.response?.data?.error || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign Up</h2>
      {status.msg && (
        <div style={{ color: status.type === 'error' ? 'red' : 'green', marginBottom: '10px' }}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          required 
        />
        <input 
          type="tel" 
          placeholder="Phone (+972...)" 
          value={formData.phone} 
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}