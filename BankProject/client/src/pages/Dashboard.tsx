import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import api from '../api/axios';
import { Account, Transaction } from '../types';

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // טופס העברה
  const [transfer, setTransfer] = useState({ receiverEmail: '', amount: '' });
  const [transferStatus, setTransferStatus] = useState({ type: '', msg: '' });
  const [transferring, setTransferring] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError('');
      setLoading(true);

      // 1. טעינת נתוני החשבון
      const dashRes = await api.get('/dashboard');
      const rawAccount = dashRes.data?.data?.account || dashRes.data?.account || dashRes.data?.data || dashRes.data;
      
      if (rawAccount) {
        setAccount({
          accountId: rawAccount.accountId || rawAccount.account_id || rawAccount.id || 'N/A',
          email: rawAccount.email || rawAccount.user_email || '',
          phone: rawAccount.phone || rawAccount.phoneNumber || 'N/A',
          balance: Number(rawAccount.balance ?? 0)
        });
      }

      // 2. טעינת היסטוריית העסקאות
      try {
        const historyRes = await api.get('/transactions/history');
        const txList = historyRes.data?.transactions || historyRes.data?.data?.transactions || historyRes.data?.data || (Array.isArray(historyRes.data) ? historyRes.data : []);
        setHistory(Array.isArray(txList) ? txList : []);
      } catch (historyErr) {
        console.warn('Could not fetch history (or none exists yet):', historyErr);
        setHistory([]);
      }

    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      console.error('Failed to load dashboard:', axiosError);
      setError(axiosError.response?.data?.error || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatus({ type: '', msg: '' });
    setTransferring(true);

    try {
      const res = await api.post('/transactions/transfer', {
        receiverEmail: transfer.receiverEmail,
        amount: Number(transfer.amount),
      });

      setTransferStatus({ 
        type: 'success', 
        msg: res.data?.message || 'Transfer completed successfully!' 
      });
      setTransfer({ receiverEmail: '', amount: '' });
      
      fetchDashboardData();
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setTransferStatus({ 
        type: 'error', 
        msg: axiosError.response?.data?.error || 'Transfer failed.' 
      });
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</h3>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

  const lastTransaction = history.length > 0 ? history[0] : null;

  // בדיקה דינמית: האם המשתמש המחובר כרגע הוא השולח?
  const isSender = account && lastTransaction 
    ? (lastTransaction.sender_email || lastTransaction.sender_email) === account.email 
    : false;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Bank Dashboard</h1>

      {/* 1. כרטיס נתוני חשבון ויתרה */}
      {account && (
        <div style={{ background: '#2a2a2a', color: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Account Overview</h3>
          <p><strong>Account ID:</strong> {account.accountId}</p>
          <p><strong>Email:</strong> {account.email}</p>
          <p><strong>Phone:</strong> {account.phone}</p>
          <h2 style={{ color: '#4caf50', marginTop: '10px' }}>
            Balance: ${Number(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      )}

      {/* 2. תצוגת העברה אחרונה - דינמית לפי שולח/מקבל */}
      {lastTransaction && account && (
        <div style={{ background: '#1e3a1e', borderLeft: '5px solid #4caf50', color: '#fff', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#81c784' }}>Last Transaction</h4>
          <p style={{ margin: 0 }}>
            {isSender ? (
              <>
                Sent <strong>${Number(lastTransaction.amount || 0).toFixed(2)}</strong> to <strong>{lastTransaction.receiver_email || lastTransaction.receiver_email}</strong>
              </>
            ) : (
              <>
                Received <strong>${Number(lastTransaction.amount || 0).toFixed(2)}</strong> from <strong>{lastTransaction.sender_email || lastTransaction.receiver_email}</strong>
              </>
            )}
            {' '}on {new Date(lastTransaction.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* 3. טופס העברת כספים */}
      <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Transfer Money</h3>
        {transferStatus.msg && (
          <p style={{ color: transferStatus.type === 'error' ? '#ff6b6b' : '#51cf66', fontWeight: 'bold' }}>
            {transferStatus.msg}
          </p>
        )}
        <form onSubmit={handleTransfer} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="email" 
            placeholder="Receiver Email" 
            value={transfer.receiverEmail} 
            onChange={(e) => setTransfer({ ...transfer, receiverEmail: e.target.value })} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555' }}
          />
          <input 
            type="number" 
            step="0.01" 
            min="0.01"
            placeholder="Amount" 
            value={transfer.amount} 
            onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555' }}
          />
          <button type="submit" disabled={transferring} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {transferring ? 'Processing...' : 'Send Transfer'}
          </button>
        </form>
      </div>

      {/* 4. היסטוריית פעולות */}
      <div>
        <h3>Transaction History</h3>
        {history.length === 0 ? (
          <p>No transactions recorded yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #555' }}>
                <th style={{ padding: '8px' }}>Date</th>
                <th style={{ padding: '8px' }}>Sender</th>
                <th style={{ padding: '8px' }}>Receiver</th>
                <th style={{ padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx, idx) => (
                <tr key={tx.id || idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '8px' }}>
                    {new Date(tx.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px' }}>{tx.sender_email || tx.sender_email || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{tx.receiver_email || tx.receiver_email || 'N/A'}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>
                    ${Number(tx.amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}