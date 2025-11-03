import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../css/Dashboard.css';
import logo from '../icons/I-track logo.png'; 
import Sidebar from './Sidebar'; 
import { getCurrentUser } from '../getCurrentUser';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stockCount, setStockCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);
  const [stockData, setStockData] = useState([]);
  const [allocation, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
const [profileData, setProfileData] = useState({
  name: '',
  phoneno: '',
  picture: ''
});
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  


  // Enhanced color palette for the pie chart
  const CHART_COLORS = [
    '#e50914', // Red (customized from blue)
    '#005d9bff', // 
    '#231f20', // 
    '#234a5cff', 
    '#709cb7', // 
    '#00aaffff', 
   
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / stockData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
      
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <p style={{ margin: 0, color: '#374151', fontWeight: '600' }}>{data.name}</p>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>
            Quantity: <span style={{ color: '#111827', fontWeight: '600' }}>{data.value}</span>
          </p>
          {/* <p style={{ margin: '2px 0 0 0', color: '#6B7280' }}>
            Percentage: <span style={{ color: '#111827', fontWeight: '600' }}>{percentage}%</span>
          </p> */}
        </div>
      );
    }
    return null;
  };

  // Custom label function
  // Remove percentage label from pie chart
  const renderCustomLabel = () => null;

  useEffect(() => {
  // axios.get("http://localhost:8000/api/getStock")
  axios.get("https://itrack-web-backend.onrender.com/api/getStock")
      .then((response) => {
        setStockCount(response.data.length);
        // Aggregate quantity by unitName
        const unitMap = {};
        response.data.forEach(item => {
          if (item.unitName) {
            unitMap[item.unitName] = (unitMap[item.unitName] || 0) + (item.quantity || 1);
          }
        });
        const pieData = Object.entries(unitMap).map(([name, value]) => ({ name, value }));
        setStockData(pieData);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    getCurrentUser().then(user => {
      setCurrentUser(user);
      if (user && user.email) {
  // axios.get("http://localhost:8000/api/getUsers")
  axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
          .then(res => {
            const found = res.data.find(u => u.email === user.email);
            setFullUser(found);
          })
          .catch(() => setFullUser(null));
      }
    });
  }, []);

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
  // axios.get("http://localhost:8000/api/getCompletedRequests", { withCredentials: true })
  axios.get("https://itrack-web-backend.onrender.com/api/getCompletedRequests", { withCredentials: true })
      .then((res) => {
        setCompletedCount(res.data.length);
      })
      .catch((err) => console.log(err));
  }, []);

const [ongoingCount, setOngoingCount] = useState(0);
const [inTransitCount, setInTransitCount] = useState(0);

   const cards = [
    { title: "Total Stocks", value: stockCount, route: "/inventory" },
    { title: "Finished Vehicle Preparation", value: completedCount, dark: true, route: "/reports" },
    { title: "Ongoing Shipment", value: inTransitCount, route: "/driverallocation" },
    { title: "Ongoing Vehicle Preparation", value: ongoingCount, route: "/servicerequest" },
  ];

const [recentPreparations, setRecentPreparations] = useState([]);

useEffect(() => {
  // Step 1: Fetch all requests
  // axios.get("http://localhost:8000/api/getRequest", { withCredentials: true })
  axios.get("https://itrack-web-backend.onrender.com/api/getRequest", { withCredentials: true })
    .then(async (res) => {
      console.log('All service requests:', res.data); // Debug log
      // Step 2: Filter and sort for the 5 most recent 'In Progress' requests
      const inProgress = res.data.filter(req => req.status === 'In Progress');
      console.log('Filtered in progress:', inProgress); // Debug log
      const sortedInProgress = inProgress.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateCreated);
        const dateB = new Date(b.createdAt || b.dateCreated);
        return dateB - dateA;
      });
      const top5 = sortedInProgress.slice(0, 5);
      setOngoingCount(inProgress.length);
      // Step 3: Fetch each request one by one by ID
      const fetched = [];
      for (let req of top5) {
        try {
          // const resp = await axios.get(`http://localhost:8000/api/getRequest/${req._id}`, { withCredentials: true });
          const resp = await axios.get(`https://itrack-web-backend.onrender.com/api/getRequest/${req._id}`, { withCredentials: true });
          if (resp.data) fetched.push(resp.data);
        } catch (e) {
          console.log('Error fetching by ID:', req._id, e); // Debug log
        }
      }
      console.log('Fetched recentPreparations:', fetched); // Debug log
      setRecentPreparations(fetched);
    })
    .catch((err) => console.log(err));
}, []);

useEffect(() => {
  // axios.get("http://localhost:8000/api/getAllocation", { withCredentials: true })
  axios.get("https://itrack-web-backend.onrender.com/api/getAllocation", { withCredentials: true })
    .then((res) => {
      const inTransit = res.data.filter(item => item.status === 'In Transit');
      setInTransitCount(inTransit.length);
    })
    .catch((err) => console.log(err));
}, []);


  // Fetch allocations
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await axios.get("https://itrack-web-backend.onrender.com/api/getAllocation"); 
        setAllocations(res.data);
      } catch (error) {
        console.error("Error fetching allocations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  
  
  const logAuditTrail = async (action, resource, performedBy, details) => {
  try {
    await axios.post(
      "https://itrack-web-backend.onrender.com/api/audit-trail",
      {
        action,
        resource,
        performedBy,
        details, // { message: "Profile picture changed" }
        timestamp: new Date().toISOString(),
      },
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Failed to log audit trail:", err);
  }
};





  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newImage = reader.result;
      setProfileData((prev) => ({ ...prev, picture: newImage }));
      setProfileImage(newImage);

      if (fullUser && fullUser.email) {
        localStorage.setItem(`profileImage_${fullUser.email}`, newImage);
      }

      // ✅ Create a simple audit log
      await axios.post(
        "https://itrack-web-backend.onrender.com/api/audit-trail",
        {
          action: "Update",
          resource: "Profile Image",
          performedBy: fullUser.email || fullUser.name,
          details: "Profile picture changed",
          timestamp: new Date().toISOString(),
        },
        { withCredentials: true }
      );
    };
    reader.readAsDataURL(file);
  }
};




  const handleUpdateProfile = () => {
  if (!profileData.name || !profileData.phoneno) {
    alert("Name and phone number are required.");
    return;
  }

  const updatedData = {
    name: profileData.name,
    phoneno: profileData.phoneno,
    picture: profileData.picture, // ✅ include the image
  };

  axios
    .put(`https://itrack-web-backend.onrender.com/api/updateUser/${fullUser._id}`, updatedData)
    .then(() => {
      alert("Profile updated successfully!");
      setFullUser({ ...fullUser, ...updatedData });
      if (fullUser && fullUser.email) {
  localStorage.setItem(`profileImage_${fullUser.email}`, profileData.picture || "");
}

      setIsProfileModalOpen(false);
    })
    .catch((error) => {
      console.error("Update failed:", error);
      alert("Failed to update profile.");
    });
};


useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-wrapper")) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);


useEffect(() => {
  if (fullUser && fullUser.email) {
    const savedImage = localStorage.getItem(`profileImage_${fullUser.email}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }
}, [fullUser]);




  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <header className="header">
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h3 className="header-title1">Dashboard</h3>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0px' }}>
            {fullUser && fullUser.name && (
  <div
    className="loggedinuser"
    onClick={() => {
      setProfileData({
        name: fullUser.name,
        phoneno: fullUser.phoneno,
        picture: fullUser.picture || ''
      });
      setIsProfileModalOpen(true);
    }}
    style={{
   
      fontWeight: 500,
      fontSize: 15,
      cursor: 'pointer',
  
    }}
  >
    Welcome, {fullUser.name}
  </div>
)}


            <div
  className="profile-wrapper"
  style={{ position: "relative", cursor: "pointer" }}
>
  {/* Profile image */}
  <img
  src={
    fullUser?.picture ||
    profileImage ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
  }
  alt=""
  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid #ffffff",
    objectFit: "cover",
  }}
/>


  {/* Hidden file input */}
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    onChange={handleProfileChange}
    style={{ display: "none" }}
  />

  {/* Dropdown menu */}
  {isDropdownOpen && (
    <div
      className="profile-dropdown"
      style={{
        position: "absolute",
        top: "50px",
        right: 0,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        width: "150px",
      }}
    >
      <div
        onClick={() => {
          setIsDropdownOpen(false);
          setProfileData({
            name: fullUser.name,
            phoneno: fullUser.phoneno,
            picture: fullUser.picture || "",
          });
          setIsProfileModalOpen(true);
        }}
        style={{
          padding: "10px 12px",
          cursor: "pointer",
          color: "#393939ff",
          fontSize: "13px",
          borderBottom: "1px solid #eee",
        }}
      >
        Edit Profile
      </div>
    </div>
  )}
</div>

          </div>
        </header>
        <div className="dashboard-content">
          <div className="cards">
            {cards.map(({ title, value, dark, route }) => (
              <div 
                key={title} 
                className="card-link"
                onClick={() => {
                  if (route) {
                    window.location.href = route;
                  }
                }}
              >
                <div className={`card ${dark ? "dark" : ""}`}>
                  <h3 className="card-title">{title}</h3>
                  <p className="card-number">{value}</p>
                </div>
              </div>
            ))}
          </div>


         {isProfileModalOpen && (
  <div className="profile-modal-overlay">
    <div className="profile-modal-container">
      <h2 className="profile-modal-title">Edit Profile</h2>

      <div className="profile-modal-content">
        {/* Profile Image Section */}
        <div className="profile-modal-image-section">
          <img
            src={
              fullUser?.picture ||
              profileImage ||
              "https://via.placeholder.com/120"
            }
            alt="Profile"
            className="profile-modal-image"
            onClick={() =>
              document.getElementById("profilePicInput").click()
            }
          />
          <input
            type="file"
            id="profilePicInput"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfileData({ ...profileData, picture: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <small className="profile-modal-image-note">
            Click image to change
          </small>
        </div>

        {/* Form Section */}
        <div className="profile-modal-form">
          <div className="profile-modal-field">
            <label className="profile-modal-label">Name</label>
            <input
              type="text"
              className="profile-modal-input"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
            />
          </div>

          <div className="profile-modal-field">
            <label className="profile-modal-label">Phone Number</label>
            <input
              type="text"
              className="profile-modal-input"
              value={profileData.phoneno}
              onChange={(e) =>
                setProfileData({ ...profileData, phoneno: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="profile-modal-actions">
        <button
          className="profile-modal-btn profile-modal-btn-save"
          onClick={handleUpdateProfile}
        >
          Save Changes
        </button>
        <button
          className="profile-modal-btn profile-modal-btn-cancel"
          onClick={() => setIsProfileModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}




          <div className="dashboard-grid">
  {/* 🥧 Pie Chart */}
  
  <div className="dashboard-item">
    <h4 className="section-title">Stocks Overview</h4>
    {stockData.length > 0 ? (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "20px",
    }}
  >
    {/* 🥧 Pie Chart (Left) */}
    <div style={{ flex: "1 1 250px", minWidth: "250px", height: "250px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stockData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            labelLine={false}
          >
            {stockData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* 📊 Legend (Right) */}
    <div
      style={{
        flex: "1 1 200px",
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {stockData.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              marginRight: "10px",
            }}
          ></div>
          <span style={{ flex: 1, color: "#374151", fontWeight: "500" }}>
            {item.name}
          </span>
          <span style={{ color: "#111827", fontWeight: "600" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
) : (
  <p style={{ textAlign: "center", color: "#888" }}>
    No stock data available
  </p>
)}




  </div>

  {/* 🚗 Table 1: In Progress Preparations */}
  <div className="dashboard-item">
    <h4 className="section-title">Recent In Progress Vehicle Preparation</h4>
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Conduction No.</th>
            <th>Service</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentPreparations.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', color: '#888' }}>
                No recent in progress vehicle preparations.
              </td>
            </tr>
          ) : (
            recentPreparations.slice(0, 5).map((prep, index) => (
              <tr key={index}>
                <td>{prep.vehicleRegNo || prep.unitId || '-'}</td>
                <td>
                  {Array.isArray(prep.service)
                    ? prep.service.join(', ')
                    : prep.service || '-'}
                </td>
                <td>
                  <span className={`status-badge ${prep.status?.toLowerCase().replace(' ', '-')}`}>
                    {prep.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* 🚚 Table 2: Shipments */}
  <div className="dashboard-item">
    <h4 className="section-title">Recent Assigned Shipments</h4>
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Unit Name</th>
            <th>Variation</th>
            <th>Assigned Driver</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allocation.filter(item => ["Pending", "In Transit"].includes(item.status)).length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "#888" }}>
                No pending or in transit shipments.
              </td>
            </tr>
          ) : (
            allocation
              .filter(item => ["Pending", "In Transit"].includes(item.status))
              .slice(0, 3)
              .map(item => (
                <tr key={item._id}>
                  <td>{item.unitName}</td>
                  <td>{item.variation}</td>
                  <td>{item.assignedDriver}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* ✅ Table 3: Completed Requests */}
  <div className="dashboard-item">
    <h4 className="section-title">Recent Completed Requests</h4>
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Conduction No.</th>
            <th>Completed Date</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {allocation.filter(item => item.status === "Completed").length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                No completed requests.
              </td>
            </tr>
          ) : (
            allocation
              .filter(item => item.status === "Completed")
              .slice(0, 3)
              .map(item => (
                <tr key={item._id}>
                  <td>{item.unitName}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.remarks || "-"}</td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>


        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;