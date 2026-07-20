import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Verification token is missing.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch((err) => {
        const axiosError = err as AxiosError<{ error?: string }>;
        setStatus(axiosError.response?.data?.error || 'Verification failed or link expired.');
      });
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
}