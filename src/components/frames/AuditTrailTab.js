import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuditTrailTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios.get('https://itrack-web-backend.onrender.com/api/audit-trail')
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading audit trail...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>Audit Trail</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Performed By</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.resource}</td>
              <td>{log.performedBy}</td>
              <td>
                {log.details && log.details.summary ? (
                  <span style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{log.details.summary}</span>
                ) : (
                  <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.details, null, 2)}</pre>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrailTab;
