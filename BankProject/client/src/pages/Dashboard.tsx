import React, { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { 
  CreditCard, 
  Send, 
  History, 
  Clock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  User,
  Mail,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Bell
} from 'lucide-react';
import api from '../api/axios';
import { Account, Transaction } from '../types';
import BankCard from '../components/common/BankCard';
import { useSocket } from '../context/SocketContext';
import { TransferNotification } from '../types/socket';

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // התראות בזמן אמת מה-Socket
  const [realtimeNotification, setRealtimeNotification] = useState<TransferNotification | null>(null);

  // טופס העברה
  const [transfer, setTransfer] = useState({ receiverEmail: '', amount: '' });
  const [transferStatus, setTransferStatus] = useState({ type: '', msg: '' });
  const [transferring, setTransferring] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError('');

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
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      console.error('Failed to load dashboard:', axiosError);
      setError(axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 🔔 חיבור ה-Socket: קבלת התראה בזמן אמת + רענון נתונים אוטומטי
  useSocket(
    useCallback((data: TransferNotification) => {
      setRealtimeNotification(data);
      fetchDashboardData(); // רענון היתרה וההיסטוריה מיידית ללא רענון עמוד
    }, [fetchDashboardData])
  );

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
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      const serverMsg = axiosError.response?.data?.error || axiosError.response?.data?.message;

      setTransferStatus({ 
        type: 'error', 
        msg: serverMsg || 'Transfer failed. Please check the recipient details.' 
      });
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="spinner" size={36} />
        <p>Loading your financial portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="submit-btn" style={{ maxWidth: '200px' }}>
          Try Again
        </button>
      </div>
    );
  }

  const lastTransaction = history.length > 0 ? history[0] : null;
  const isSender = account && lastTransaction 
    ? (lastTransaction.sender_email || lastTransaction.sender_email) === account.email 
    : false;

  return (
    <div className="dashboard-container">

      {/* 🔔 באנר התראה בזמן אמת (Real-Time Live Toast/Banner) */}
      {realtimeNotification && (
        <div className="status-badge success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} className="animate-bounce" />
            <span>
              <strong>Instant Alert:</strong> Received <strong>${realtimeNotification.amount.toFixed(2)}</strong> from {realtimeNotification.senderEmail}!
            </span>
          </div>
          <button 
            onClick={() => setRealtimeNotification(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* גריד של כרטיס יתרה + כרטיס העברה */}
      <div className="dashboard-grid">
        
        {/* 1. כרטיס נתוני חשבון ויתרה */}
        {account && (
          <BankCard 
            title="Account Overview" 
            subtitle="Current Balance & Details"
            icon={<CreditCard size={22} />}
          >
            <h1 className="balance-amount">
              ${Number(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>

            <div className="account-details-pills">
              <div className="pill"><User size={14} /> ID: {account.accountId}</div>
              <div className="pill"><Mail size={14} /> {account.email}</div>
              <div className="pill"><Phone size={14} /> {account.phone}</div>
            </div>
          </BankCard>
        )}

        {/* 2. כרטיס טופס העברת כספים */}
        <BankCard 
          title="Transfer Money" 
          subtitle="Instant Direct Transfer"
          icon={<Send size={20} />}
        >
          {transferStatus.msg && (
            <div className={`status-badge ${transferStatus.type}`}>
              {transferStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{transferStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleTransfer} className="transfer-form">
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Receiver Email" 
                value={transfer.receiverEmail} 
                onChange={(e) => setTransfer({ ...transfer, receiverEmail: e.target.value })} 
                required 
              />
            </div>

            <div className="flex-row">
              <input 
                type="number" 
                step="0.01" 
                min="0.01"
                placeholder="Amount ($)" 
                value={transfer.amount} 
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} 
                required 
              />
              <button type="submit" disabled={transferring} className="send-btn">
                {transferring ? <Loader2 size={18} className="spinner" /> : 'Send Transfer'}
              </button>
            </div>
          </form>
        </BankCard>

      </div>

      {/* 3. תצוגת העברה אחרונה */}
      {lastTransaction && account && (
        <div className="last-transaction-widget">
          <div className="widget-icon">
            <Clock size={20} />
          </div>
          <div className="widget-content">
            <span className="widget-title">Last Activity</span>
            <p>
              {isSender ? (
                <>
                  Sent <span className="highlight-out">-${Number(lastTransaction.amount || 0).toFixed(2)}</span> to <strong>{lastTransaction.receiver_email}</strong>
                </>
              ) : (
                <>
                  Received <span className="highlight-in">+${Number(lastTransaction.amount || 0).toFixed(2)}</span> from <strong>{lastTransaction.sender_email}</strong>
                </>
              )}
              {' '}on {new Date(lastTransaction.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* 4. היסטוריית פעולות */}
      <BankCard 
        title="Transaction History" 
        subtitle="Recent Financial Records"
        icon={<History size={20} />}
      >
        {history.length === 0 ? (
          <p style={{ color: '#94a3b8', margin: 0 }}>No transactions recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, idx) => {
                  const txIsSender = account?.email === tx.sender_email;
                  return (
                    <tr key={tx.id || idx}>
                      <td>
                        <span className={`tx-type-pill ${txIsSender ? 'out' : 'in'}`}>
                          {txIsSender ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {txIsSender ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td>{new Date(tx.created_at || Date.now()).toLocaleDateString()}</td>
                      <td>{tx.sender_email || 'N/A'}</td>
                      <td>{tx.receiver_email || 'N/A'}</td>
                      <td className={`text-right font-bold ${txIsSender ? 'text-danger' : 'text-success'}`}>
                        {txIsSender ? '-' : '+'}${Number(tx.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </BankCard>

    </div>
  );
}