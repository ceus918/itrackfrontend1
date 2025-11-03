import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../css/TestDrive.css';
import { getCurrentUser } from '../getCurrentUser';

const TestDrive = () => {
  const [vehicles, setVehicles] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: '',
    time: '',
    name: '',
    contact: '',
  });
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullUser, setFullUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', phoneno: '', picture: '' });
const [profileImage, setProfileImage] = useState('');
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

const fileInputRef = React.useRef(null);


  // FETCH INVENTORY VEHICLES + TEST DRIVE LIST
  useEffect(() => {
    fetchVehicles();
    fetchTestDrives();
    getCurrentUser().then(user => {
      if (user && user.email) {
        axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
          .then(res => {
            const found = res.data.find(u => u.email === user.email);
            setFullUser(found);
          })
          .catch(() => setFullUser(null));
      }
    });
  }, []);

  const fetchVehicles = () => {
    axios.get('https://itrack-web-backend.onrender.com/api/getStock')
      .then(res => {
        console.log(res.data); // 
        console.log(vehicles);

        const availableVehicles = res.data.filter(v => v.quantity > 0);
        setVehicles(availableVehicles);
      })
      .catch(err => console.error(err));
  };

  const fetchTestDrives = () => {
    axios.get('https://itrack-web-backend.onrender.com/api/getAllTestDrives')
      .then(res => setTestDrives(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://itrack-web-backend.onrender.com/api/createTestDrive', formData);

      setSuccess('Test drive scheduled successfully!');
      setFormData({ vehicleId: '', date: '', time: '', name: '', contact: '' });
      fetchTestDrives(); // Refresh schedule list
    } catch (error) {
      console.error(error);
      setSuccess('Failed to schedule test drive.');
    }
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.unitName} - ${vehicle.variation} (${vehicle.bodyColor})` : 'Vehicle Info';
  };

  const handleDelete = (id) => {
  if (window.confirm('Are you sure you want to delete this test drive?')) {
    axios
      .delete(`https://itrack-web-backend.onrender.com/api/deleteTestDrive/${id}`)
      .then(() => {
        setSuccess('Test drive deleted successfully.');
        fetchTestDrives(); // refresh the list
      })
      .catch(() => {
        setSuccess('Failed to delete test drive.');
      });
  }
};

const [openDropdownId, setOpenDropdownId] = useState(null);
const toggleDropdown = (id) => {
  setOpenDropdownId(prevId => (prevId === id ? null : id));
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
      setProfileData(prev => ({ ...prev, picture: newImage }));
      setProfileImage(newImage);

      if (fullUser && fullUser.email) {
        localStorage.setItem(`profileImage_${fullUser.email}`, newImage);
      }

      // ✅ Audit log
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
    picture: profileData.picture,
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
  if (fullUser && fullUser.email) {
    const savedImage = localStorage.getItem(`profileImage_${fullUser.email}`);
    if (savedImage) setProfileImage(savedImage);
    setProfileData({ 
      name: fullUser.name || '', 
      phoneno: fullUser.phoneno || '', 
      picture: savedImage || ''
    });
  }
}, [fullUser]);


useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-wrapper")) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);






  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>Test Drive</h3>
  </div>

  {/* Profile section on the right */}
  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
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
      style={{ cursor: 'pointer' }}
    >
      <img
        src={fullUser?.picture || profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
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

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleProfileChange}
        style={{ display: "none" }}
      />

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


        <div className="testdrive-content">
  <h3>Schedule a Test Drive</h3>

  <div className="testdrive-modal">
    <form onSubmit={handleSubmit} className="testdrive-form">
      <div className="testdrive-form-group">
        <label>Available Vehicle <span style={{color: 'red'}}>*</span></label>
        <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
          <option value="">Select a Vehicle</option>
          {vehicles.filter(vehicle => !testDrives.some(td => td.vehicleId === vehicle._id))
            .map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.unitName} - {vehicle.variation} ({vehicle.bodyColor}) | Available: {vehicle.quantity}
              </option>
            ))}
        </select>
      </div>

      <div className="testdrive-form-group">
        <label>Date *</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
      </div>

      <div className="testdrive-form-group">
        <label>Time *</label>
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
      </div>

      <div className="testdrive-form-group">
        <label>Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="testdrive-form-group">
        <label>Contact Number *</label>
        <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
      </div>
    </form>

    <div>
      <button type="button" className="testdrive-btn" onClick={handleSubmit}>Schedule</button>
    </div>

    {success && (
      <p className={success.includes('successfully') ? 'testdrive-success' : 'testdrive-error'}>
        {success}
      </p>
    )}
  </div>

  <div className="testdrive-spacer"></div>

  <h3>Scheduled Test Drives</h3>
  <div className="testdrive-table-container">
    <table>
      <thead>
        <tr>
          <th>Vehicle</th>
          <th>Date</th>
          <th>Time</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {testDrives.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
              No test drives scheduled yet.
            </td>
          </tr>
        ) : (
          testDrives.map(schedule => (
            <tr key={schedule._id}>
              <td>{getVehicleInfo(schedule.vehicleId)}</td>
              <td>{schedule.date}</td>
              <td>{new Date(`1970-01-01T${schedule.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
              <td>{schedule.name}</td>
              <td>{schedule.contact}</td>
              <td>
                <div className="testdrive-dropdown">
                  <button className="testdrive-dropbtn" onClick={() => toggleDropdown(schedule._id)}>⋮</button>
                  {openDropdownId === schedule._id && (
                    <div className="testdrive-dropdown-menu">
                      <button onClick={() => handleDelete(schedule._id)}>Delete</button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
    </div>
  );
};

export default TestDrive;