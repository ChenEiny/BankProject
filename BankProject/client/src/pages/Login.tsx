import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import api from '../api/axios';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // בדיקה בטעינת הקומפוננטה: אם המשתמש כבר מחובר - מעבירים אותו ישר ל-Dashboard!
  useEffect(() => {
    let isMounted = true;

    const checkExistingAuth = async () => {
      try {
        // קריאה קלה לשרת לבדוק אם אנחנו authenticated (למשל מול me / health / verify)
        const res = await api.get('/auth/me'); 
        if (isMounted && res.data?.user) {
          onLoginSuccess(res.data.user);
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // אם החזיר 401/404 - המשתמש באמת לא מחובר, נשארים במסך ה-Login
      }
    };

    checkExistingAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      
      if (result.user) {
        onLoginSuccess(result.user);
      }
      
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2>Bank Login</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  error: { color: 'red', marginBottom: '10px', fontWeight: 'bold' }
};