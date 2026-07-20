import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HealthBadge() {
  const [health, setHealth] = useState<{ status: string; color: string }>({
    status: 'CHECKING',
    color: 'gray',
  });

  useEffect(() => {
    const checkStatus = () => {
      api.get('/health')
        .then((res) => {
          if (res.data.status === 'UP') {
            setHealth({ status: 'System Online', color: '#2e7d32' });
          } else {
            setHealth({ status: 'Degraded', color: '#ed6c02' });
          }
        })
        .catch(() => {
          setHealth({ status: 'Offline', color: '#d32f2f' });
        });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      fontSize: '12px',
      padding: '4px 10px',
      borderRadius: '12px',
      color: 'white',
      backgroundColor: health.color,
      fontWeight: 'bold',
    }}>
      {health.status}
    </span>
  );
}