import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);

  async function loadLogs() {
    const response = await fetch('http://localhost:5000/activity-logs', {
      credentials: 'include',
    });

    const data = await response.json().catch(() => []);
    if (response.ok) {
      setLogs(data);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div>
      <NavBar />
      <div style={{ padding: '2rem' }}>
      <h2>Activity Logs</h2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>
            <div><strong>{log.username || 'System'}</strong> • {log.action}</div>
            <div style={{ color: '#475467', marginTop: 6 }}>{log.details || 'No details provided'}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>{new Date(log.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
