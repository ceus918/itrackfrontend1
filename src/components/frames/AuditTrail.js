import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import '../css/ServiceRequest.css';
import logo from '../icons/I-track logo.png'; 
import addIcon from '../icons/add.png'; 
import searchIcon from '../icons/search.png';
import downloadIcon from '../icons/download2.png';
import ViewShipment from "./ViewShipment"; 
import { getCurrentUser } from '../getCurrentUser';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
   const [auditLogs, setAuditLogs] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', phoneno: '', picture: '' });
    const [profileImage, setProfileImage] = useState('');
    const [fullUser, setFullUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const fileInputRef = useRef(null);
    

  useEffect(() => {
  axios
    .get('https://itrack-web-backend.onrender.com/api/audit-trail', { withCredentials: true })
    .then((res) => {
      setLogs(res.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);


  if (loading) return <div>Loading audit trail...</div>;

  // Utility: compare before & after, return only changed fields
  const getChanges = (before, after) => {
    if (!before || !after) return [];

    return Object.keys(after).reduce((changes, key) => {
      if (before[key] !== after[key]) {
        changes.push({ field: key, before: before[key], after: after[key] });
      }
      return changes;
    }, []);
  };


  const renderActivitySummary = (log) => {
  const { action, target, performedBy, details } = log;
  let summary = `${performedBy} ${action} ${target}`;

  // Check for profile picture change
  if (
    details?.before?.picture &&
    details?.after?.picture &&
    details.before.picture !== details.after.picture
  ) {
    summary = `${performedBy} ${action} ${target} → Profile picture changed`;
  }

  return summary;
};

  return (
    <div className="app">
      <Sidebar sidebarOpen={true} setSidebarOpen={() => {}} />
      <div className="main">
        {/* Header */}
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="toggle-btn" onClick={() => {}}>☰</button>
            <h3 className="header-title1" style={{ marginLeft: 10 }}>Audit Trail</h3>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0px' }}>
            {fullUser && fullUser.name && (
              <div className="loggedinuser" onClick={() => setIsProfileModalOpen(true)} style={{ fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                Welcome, {fullUser.name}
              </div>
            )}
          </div>
        </header>

        {/* Audit Table */}
        <div className="content">
        

          <div className="table-container">
        <div style={{ padding: 20 }}>
          <h3>Audit Logs</h3>
          <table style={{ width: "100%", }}>
             <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Performed By</th>
            <th>Details</th>
          </tr>
        </thead>
            <tbody >
          {logs.map((log, idx) => {
            const changes = getChanges(log.details?.before, log.details?.after);

            return (
              <tr style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #e3e1e1ff', }} key={idx}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.resource}</td>
                <td>{log.performedBy}</td>
                <td>
    
  {(() => {
    const changes = getChanges(log.details?.before, log.details?.after);

    // CASE 1: Only profile picture changed
    if (
      log.action.toLowerCase() === "update" &&
      changes.length === 1 &&
      changes[0].field === "picture"
    ) {
      return <div >Profile picture changed</div>;
    }

    // CASE 2: Multiple fields changed → show list
    if (log.action.toLowerCase() === "update" && changes.length > 0) {
      return (
        <div style={{ fontSize: 12 }}>
          {changes.map((c, i) => (
            <div key={i} style={{ marginBottom: 1 }}>
              <strong>{c.field}:</strong>{" "}
              <span style={{ color: "red" }}>
                {typeof c.before === "object"
                  ? JSON.stringify(c.before, null, 1)
                  : c.before}
              </span>{" "}
              →{" "}
              <span style={{ color: "green" }}>
                {typeof c.after === "object"
                  ? JSON.stringify(c.after, null, 1)
                  : c.after}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // CASE 3: Create
    if (log.action.toLowerCase() === "create" && log.details?.after) {
      return (
        <div style={{ fontSize: 12, color: "green" }}>
          <strong>Created:</strong> {JSON.stringify(log.details.after, null, 2)}
        </div>
      );
    }

    // CASE 4: Delete
    if (log.action.toLowerCase() === "delete" && log.details?.before) {
      return (
        <div style={{ fontSize: 12, color: "red" }}>
          <strong>Deleted:</strong> {JSON.stringify(log.details.before, null, 2)}
        </div>
      );
    }

    // CASE 5: Fallback summary
    return (
      log.details?.summary ||
      (typeof log.details === "string"
        ? log.details
        : renderActivitySummary(log))
    );
  })()}



  </td>
              </tr>
            );
          })}
        </tbody>
          </table>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default AuditTrail;
