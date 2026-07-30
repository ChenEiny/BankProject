import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HealthBadge() {
  const [health, setHealth] = useState<{ status: string; type: 'success' | 'warning' | 'error' | 'checking' }>({
    status: 'CHECKING',
    type: 'checking',
  });

  useEffect(() => {
    const checkStatus = () => {
      api.get('/health')
        .then((res) => {
          if (res.data.status === 'UP') {
            setHealth({ status: 'System Online', type: 'success' });
          } else {
            setHealth({ status: 'Degraded', type: 'warning' });
          }
        })
        .catch(() => {
          setHealth({ status: 'Offline', type: 'error' });
        });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`health-badge ${health.type}`}>
      <span className="health-dot" />
      <span className="health-status-text">{health.status}</span>
    </div>
  );
}