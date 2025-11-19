import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../css/ServiceRequest.css';
import searchIcon from '../icons/search.png';
import logo from '../icons/I-track logo.png'; 
import addIcon from '../icons/add.png'; 
import dropdownIcon from '../icons/drop-down-arrow.png'; 
import { getCurrentUser } from '../getCurrentUser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import downloadIcon from '../icons/download2.png';



const ServiceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    dateCreated: '',
    vehicleRegNo: '',
    service: [],
    status: 'Pending'
  });
  const [editRequest, setEditRequest] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [editServiceDropdownOpen, setEditServiceDropdownOpen] = useState(false); // New state for edit modal
 
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState('');
  const [profileData, setProfileData] = useState({
  name: fullUser?.name || '',
  phoneno: fullUser?.phoneno || '',
  picture: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [useExistingUnit, setUseExistingUnit] = useState(false);

  const [user, setUser] = useState([]);
  const [editUser, setEditUser] = useState(null);
   const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [newUser, setNewUser] = useState({
    password: "",
    // other fields...
  });



  const validateConductionNumber = (value) => {
  const regex = /^[A-Za-z0-9]+$/; // only letters and numbers
  if (!value) {
    return "Conduction Number is required.";
  }
  if (!regex.test(value)) {
    return "Conduction Number must be alphanumeric (letters and numbers only).";
  }
  if (value.length < 6 || value.length > 8) {
    return "Conduction Number must be 6 to 8 characters.";
  }
  return null;
};


  const filteredRequests = requests.filter((req) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      req.dateCreated.toLowerCase().includes(searchValue) ||
      req.vehicleRegNo.toLowerCase().includes(searchValue) ||
      req.service.join(', ').toLowerCase().includes(searchValue) ||
      req.status.toLowerCase().includes(searchValue)
    );
  });

 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(6); // Change to your desired items per page

 const indexOfLastRequest = currentPage * itemsPerPage;
 const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
 const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

 const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Live countdown state
  const [countdowns, setCountdowns] = useState({});
  const countdownInterval = useRef(null);

  useEffect(() => {
  fetchRequests();
  axios.get("https://itrack-web-backend.onrender.com/api/getStock")
    .then(res => setInventory(res.data))
    .catch(err => console.log(err));

  getCurrentUser().then(user => {
    setCurrentUser(user);
    if (user && user.email) {
      axios.get("https://itrack-web-backend.onrender.com/api/getUsers", { withCredentials: true })
        .then(res => {
          const found = res.data.find(u => u.email === user.email);
          setFullUser(found);
        })
        .catch(() => setFullUser(null));
    }
  });
}, []);


  // Setup live countdowns for in-progress requests
  useEffect(() => {
    // Clear previous interval
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    // Initialize countdowns
    const newCountdowns = {};
    currentRequests.forEach(req => {
      if (
        req.status === 'In Progress' &&
        req.serviceTime &&
        req.inProgressAt
      ) {
        // Calculate end time
        const start = new Date(req.inProgressAt).getTime();
        const end = start + req.serviceTime * 60 * 1000;
        newCountdowns[req._id] = Math.max(0, Math.floor((end - Date.now()) / 1000));
      }
    });
    setCountdowns(newCountdowns);

    // Start interval to update countdowns every second
    countdownInterval.current = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          updated[id] = Math.max(0, updated[id] - 1);
        });
        return updated;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequests]);

  const fetchRequests = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getRequest", { withCredentials: true })
      .then((res) => setRequests(res.data))
      .catch((err) => console.log(err));
  };

  const handleCreateRequest = () => {
  const { dateCreated, vehicleRegNo, service, unitName } = newRequest;

  const conductionError = validateConductionNumber(vehicleRegNo);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  if (!dateCreated || !vehicleRegNo || service.length === 0 || !unitName) {
    alert("All fields are required.");
    return;
  }

  // Extra validation: prevent duplicate service request for same unit
  const existingUnit = inventory.find(u => u.unitId === vehicleRegNo);
  if (!useExistingUnit && existingUnit) {
    const proceed = window.confirm(
      `This conduction number already exists in inventory as "${existingUnit.unitName}". Do you still want to proceed manually?`
    );
    if (!proceed) return;
  }

  axios.post("https://itrack-web-backend.onrender.com/api/createRequest", newRequest, { withCredentials: true })
    .then(() => {
      fetchRequests();
      setNewRequest({
        dateCreated: '',
        vehicleRegNo: '',
        unitName: '',
        service: [],
        status: 'Pending'
      });
      setUseExistingUnit(false);
      setIsCreateModalOpen(false);
    })
    .catch((err) => console.log(err));
};


  
  const handleUpdateRequest = (id) => {
  const { dateCreated, vehicleRegNo, service, unitName } = editRequest;

  const conductionError = validateConductionNumber(vehicleRegNo);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  if (!dateCreated || !vehicleRegNo || service.length === 0 || !unitName) {
    alert("All fields are required.");
    return;
  }

  axios.put(`https://itrack-web-backend.onrender.com/api/updateRequest/${id}`, editRequest, { withCredentials: true })
    .then(() => {
      fetchRequests();
      setEditRequest(null);
    })
    .catch((err) => console.log(err));
};

  

  const handleDeleteRequest = (id) => {
  const deletedRequest = requests.find(req => req._id === id);

  // ✅ Step 1: Ask for confirmation before deleting
  const confirmDelete = window.confirm(
    `Are you sure you want to delete the request for "${deletedRequest.unitName}" with Conduction Number "${deletedRequest.vehicleRegNo}"?`
  );

  if (!confirmDelete) {
    return; // ❌ Cancel delete if user pressed Cancel
  }

  // ✅ Step 2: Proceed only if confirmed
  axios.delete(`https://itrack-web-backend.onrender.com/api/deleteRequest/${id}`, { withCredentials: true })
    .then(() => {
      fetchRequests();
      alert(`Request for "${deletedRequest.unitName}" has been successfully deleted.`);
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to delete request. Please try again.');
    });
};


  const handleDownloadRequestsPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Vehicle Preparation Requests', 14, 15);

  const requestData = filteredRequests.map(req => [
    new Date(req.dateCreated).toLocaleDateString('en-CA'),
    req.vehicleRegNo,
    req.unitName,
    Array.isArray(req.service) ? req.service.join(', ') : req.service,
    req.status,
    req.serviceTime ? `${req.serviceTime} min` : '—'
  ]);

  autoTable(doc, {
    head: [['Date Created', 'Conduction No.', 'Unit Name', 'Service', 'Status', 'Estimated Time']],
    body: requestData,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  doc.save('ServiceRequests.pdf');
};

const handleProfileClick = () => {
  fileInputRef.current.click();
};

const handleProfileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const newImage = reader.result;
    // ONLY update modal state, no immediate upload or audit log
    setProfileData(prev => ({ ...prev, picture: newImage }));
    setProfileImage(newImage); // preview in modal
  };
  reader.readAsDataURL(file);
};



  const handleUpdateProfile = async () => {
  if (!profileData.name || !profileData.phoneno) {
    alert("Name and phone number are required.");
    return;
  }

  const updatedData = {
    name: profileData.name,
    phoneno: profileData.phoneno,
    picture: profileData.picture,
  };

  try {
    await axios.put(
      `https://itrack-web-backend.onrender.com/api/updateUser/${fullUser._id}`,
      updatedData
    );

    // ✅ update frontend state
    setFullUser({ ...fullUser, ...updatedData });
    if (fullUser?.email) {
      localStorage.setItem(`profileImage_${fullUser.email}`, profileData.picture || "");
    }

    // ✅ log audit only after save
    await axios.post(
      "https://itrack-web-backend.onrender.com/api/audit-trail",
      {
        action: "Update",
        resource: "User",
        performedBy: fullUser.name,
        details: { summary: "Profile picture changed" },
        timestamp: new Date().toISOString(),
      },
      { withCredentials: true }
    );

    alert("Profile updated successfully!");
    setIsProfileModalOpen(false);
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update profile.");
  }
};

useEffect(() => {
  if (fullUser && fullUser.email) {
    const savedImage = localStorage.getItem(`profileImage_${fullUser.email}`);
    if (savedImage) setProfileImage(savedImage);
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



const fetchUsers = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getCurrentUser().then(user => {
      setCurrentUser(user);
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

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleChangePassword = () => {
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    alert("All fields are required.");
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  if (passwordData.newPassword.length < 8) {
    alert("New password must be at least 8 characters long.");
    return;
  }

  // ✅ Check if entered current password matches the user's existing one
  if (passwordData.currentPassword !== fullUser.password) {
    alert("Incorrect current password. Please try again.");
    return;
  }

  // ✅ Update password
  axios
    .put(`https://itrack-web-backend.onrender.com/api/updateUser/${fullUser._id}`, {
      ...fullUser,
      password: passwordData.newPassword, // only change password
    })
    .then(() => {
      alert("Password updated successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
      fetchUsers(); // refresh user list if needed
    })
    .catch((error) => {
      console.error("Failed to update password:", error);
      alert("Error updating password. Please try again.");
    });
};




  return (
    <div className="app">
      {/* Create Modal */}
      {isCreateModalOpen && !['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && (
        <div className="modal-overlay">
          <div className="modal">
            <p className='modaltitle'>Create Vehicle Preparation</p>
<div className='modalline'></div>

<div className="modal-content">
  <div className="modal-form">

    {/* Date Created */}
    <div className="modal-form-group">
      <label>Date Created <span style={{ color: 'red' }}>*</span></label>
      <input
        type="date"
        value={newRequest.dateCreated}
        onChange={(e) =>
          setNewRequest({ ...newRequest, dateCreated: e.target.value })
        }
        required
      />
    </div>

    {/* 🔘 Choose between existing inventory or manual input */}
    <div style={{marginTop:'0px' }} className="modal-form-group checkbox-group">
  <label>Use Existing Inventory Unit?</label>
  <input className="big-checkbox"
    type="checkbox"
    checked={useExistingUnit}
    onChange={(e) => setUseExistingUnit(e.target.checked)}
  />
</div>



    {/* 🔘 Conditional form rendering */}
    {useExistingUnit ? (
      <>
        {/* Select from inventory */}
        <div className="modal-form-group">
          <label >Select Existing Unit <span style={{ color: 'red'}}>*</span></label>
          <select style={{ fontSize: '13px' }}
            value={newRequest.unitName || ''}
            onChange={(e) => {
              const selectedUnit = inventory.find(u => u.unitName === e.target.value);
              setNewRequest({
                ...newRequest,
                unitName: selectedUnit?.unitName || '',
                vehicleRegNo: selectedUnit?.unitId || '',
              });
            }}
            required
          >
            <option  value="">Select from Inventory</option>
            {inventory.map((unit) => (
              <option key={unit._id} value={unit.unitName}>
                {unit.unitName} ({unit.unitId})
              </option>
            ))}
          </select>
        </div>
      </>
    ) : (
      <>
        {/* Manual input for Conduction Number */}
        <div className="modal-form-group">
          <label>Conduction Number <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={newRequest.vehicleRegNo}
            onChange={(e) =>
              setNewRequest({ ...newRequest, vehicleRegNo: e.target.value })
            }
            required
          />
        </div>

        {/* Manual input for Unit Name */}
        <div className="modal-form-group">
          <label>Unit Name <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={newRequest.unitName}
            onChange={(e) =>
              setNewRequest({ ...newRequest, unitName: e.target.value })
            }
            required
          />
        </div>
      </>
    )}

    {/* Services dropdown (unchanged) */}
    <div className="modal-form-group">
      <label>Service <span style={{ color: 'red' }}>*</span></label>
      <div className="dropdown">
        <button
          type="button"
          className="dropdown-btn"
          onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span>
            {newRequest.service.length > 0
              ? newRequest.service.join(', ')
              : 'Select Services'}
          </span>
          <img
            src={dropdownIcon}
            alt="Dropdown"
            style={{ width: 7, height: 7, marginRight: 4 }}
          />
        </button>

        {serviceDropdownOpen && (
          <div className="dropdown-menu">
            {['Carwash', 'Tinting', 'Ceramic Coating', 'Accessories', 'Rust Proof'].map(
              (service) => (
                <label key={service} className="dropdown-item">
                  <input
                    type="checkbox"
                    value={service}
                    checked={newRequest.service.includes(service)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewRequest((prev) => ({
                        ...prev,
                        service: prev.service.includes(value)
                          ? prev.service.filter((s) => s !== value)
                          : [...prev.service, value],
                      }));
                    }}
                    required={newRequest.service.length === 0}
                  />
                  {service}
                </label>
              )
            )}
          </div>
        )}
      </div>
    </div>

    {/* Status */}
    <div className="modal-form-group">
      <label>Status</label>
      <select
        value={newRequest.status}
        onChange={(e) =>
          setNewRequest({ ...newRequest, status: e.target.value })
        }
      >
        <option value="Pending">Pending</option>
      </select>
    </div>
  </div>

  {/* Buttons */}
  <div className="modal-buttons">
    <button className="create-btn1" onClick={handleCreateRequest}>
      Submit
    </button>
    <button
      className="cancel-btn1"
      onClick={() => setIsCreateModalOpen(false)}
    >
      Cancel
    </button>
  </div>
</div>
</div>
        </div>
          
      )}

      {/* Edit Modal */}
      {editRequest && !['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && (
  <div className="modal-overlay">
    <div className="modal">
      <p className='modaltitle'>Edit Vehicle Preparation</p>
       <div className='modalline'> 
      <div className="modal-content">
        <div className="modal-form">

          <div className="modal-form-group">
            <label>Date Created <span style={{color: 'red'}}>*</span></label>
            <input
              type="date"
              value={editRequest.dateCreated || ""}
              onChange={(e) =>
                setEditRequest({ ...editRequest, dateCreated: e.target.value })
              }
              required
            />
          </div>

          <div className="modal-form-group">
        <label>Conduction Number <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              value={editRequest.vehicleRegNo}
              onChange={(e) =>
                setEditRequest({ ...editRequest, vehicleRegNo: e.target.value })
              }
              required
            />
          </div>

         <div className="modal-form-group">
  <label>Service <span style={{color: 'red'}}>*</span></label>
  <input
    type="text"
    value={editRequest.service && Array.isArray(editRequest.service) ? editRequest.service.join(', ') : ''}
    disabled
    style={{}}
  />
</div>

<div className="modal-form-group">
  <label>Unit Name <span style={{ color: 'red' }}>*</span></label>
  <select
    value={editRequest.unitName || ''}
    onChange={(e) => {
      const selectedUnit = inventory.find(u => u.unitName === e.target.value);
      setEditRequest({
        ...editRequest,
        unitName: selectedUnit?.unitName || '',
        vehicleRegNo: selectedUnit?.unitId || editRequest.vehicleRegNo, 
      });
    }}
    required
  >
    <option value="">Select from Inventory</option>
    {inventory.map((unit) => (
      <option key={unit._id} value={unit.unitName}>
        {unit.unitName} ({unit.unitId})
      </option>
    ))}
  </select>
</div>


          <div className="modal-form-group">
            <label>Status</label>
          <select
  value={editRequest.status}
  onChange={(e) =>
    setEditRequest({ ...editRequest, status: e.target.value })
  }
>
  <option value="Pending" disabled>Pending</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>


          </div>
        </div>

        <div className="modal-buttons">
          <button className="create-btn1" onClick={() => handleUpdateRequest(editRequest._id)}>
            Save
          </button>
          <button className="cancel-btn1" onClick={() => setEditRequest(null)}>
            Cancel
          </button>
        </div>
      </div>
       </div>
    </div>
  </div>
)}


      {/* Main UI */}
   
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
         <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>Vehicle Preparation</h3>
  </div>

  {/* Profile section on the right */}
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
    profileImage ||
    profileData.picture ||
    fullUser?.picture ||
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
  id="profilePicInput"
  style={{ display: "none" }}
  accept="image/*"
  onChange={handleProfileChange}
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

        
         {isProfileModalOpen && (
  <div className="profile-modal-overlay">
    <div className="profile-modal-container">
      <h2 className="profile-modal-title">Edit Profile</h2>

      <div className="profile-modal-content">
        {/* Profile Image Section */}
        <div className="profile-modal-image-section">
          <img
  src={
    profileData.picture ||
    profileImage ||
    fullUser?.picture ||
    "https://via.placeholder.com/120"
  }
  alt="Profile"
  className="profile-modal-image"
  onClick={() => document.getElementById("profilePicInput").click()}
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
          className="profile-modal-btn profile-modal-btn-change-password"
          
          onClick={() => setIsPasswordModalOpen(true)}  // Updated: Open the password modal
        >
          Change Password
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

{/* Password Change Modal */}
{isPasswordModalOpen && (
  <div className="profile-modal-overlay">
    <div className="profile-modal-container">
      <h2 className="profile-modal-title">Change Password</h2>

      <div className="profile-modal-content">
        {/* Form Section */}
        <div className="profile-modal-form">
          <div className="profile-modal-field">
  <label className="profile-modal-label">Current Password</label>
  <input
    type="password"
    className="profile-modal-input"
    value={passwordData.currentPassword}
    onChange={(e) =>
      setPasswordData({ ...passwordData, currentPassword: e.target.value })
    }
  />
</div>

          <div className="profile-modal-field">
            <label className="profile-modal-label">New Password</label>
            <input
              type="password"
              className="profile-modal-input"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
            />
          </div>

          <div className="profile-modal-field">
            <label className="profile-modal-label">Confirm New Password</label>
            <input
              type="password"
              className="profile-modal-input"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
     <div className="profile-modal-actions">
  <button
    className="profile-modal-btn profile-modal-btn-change-password"
    onClick={handleChangePassword} // ✅ Submit the password change
  >
    Change Password
  </button>
  <button
    className="profile-modal-btn profile-modal-btn-cancel"
    onClick={() => setIsPasswordModalOpen(false)}
  >
    Cancel
  </button>
</div>

      
    </div>
  </div>
)}


      <div className="user-management-header" >
        <button 
                    onClick={handleDownloadRequestsPDF} 
                    className="printbtn" style={{  fontSize: '10px', display: 'flex', alignItems: 'center',marginRight:3 ,gap:3}}
                    tabIndex={0}
                  ><img src={downloadIcon} alt="Download" className="button-icon2" />
                  Print PDF
                  </button>
       <div className="search-container">
         <div className="search-input-wrapper">
           <input
             id="searchInput"
             type="text"
             placeholder="Search..."
             value={searchInput}
             onChange={(e) => setSearchInput(e.target.value)}
           />
           {searchInput && (
             <button
               type="button"
               className="clear-button"
               onClick={() => { setSearchInput(''); setSearchTerm(''); }}
             >
               ✕
             </button>
           )}
         </div>
         <button
           className="search-button-icon-button"
           onClick={() => setSearchTerm(searchInput)}
           aria-label="Search"
         >
           <img src={searchIcon} alt="Search" className="search-icon" />
         </button>
       </div>
       {!['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && (
         <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
         <img src={addIcon} alt="Add" className="add-icon" />
         Create New
       </button>
       )}
     </div>


        <div className="content">
        

          <div className="table-container">
            <table>

            <thead >
              <tr >
                <th>Date Created</th>
                <th>Conduction Number</th>
                <th>Unit Name</th>
                <th>Service</th>
                <th>Status</th>
                <th>Estimated Time (min)</th>
                {!['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
                <tr className="header-spacer-row"><td ></td></tr>
             {currentRequests.map((req) => (

                <tr key={req._id}>
                  <td>{new Date(req.dateCreated).toLocaleDateString('en-CA')}</td>
                  <td>{req.vehicleRegNo}</td>
                  <td>{req.unitName}</td>
                   <td>
                      {Array.isArray(req.service)? req.service.length > 2? `${req.service.slice(0, 2).join(', ')}...`: req.service.join(', ')
                      : req.service}
                      </td>
                  <td>
  <span
    className={`status-badge ${
      req.status === 'Pending'
        ? 'status-pending'
        : req.status === 'In Progress'
        ? 'status-progress'
        : 'status-completed'
    }`}
  >
    {req.status}
  </span>
</td>
<td>
  :
  {req.status === 'In Progress' && req.serviceTime !== undefined && req.serviceTime !== null && req.inProgressAt
    ? (() => {
      const totalSeconds = countdowns[req._id] || 0;
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      let result = '';
      if (days > 0) result += `${days}d `;
      if (hours > 0 || days > 0) result += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
      result += `${String(seconds).padStart(2, '0')}s`;
      return result.trim();
    })()
    : ''}
</td>
{!['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && (
        <td>
         <button
  className="action-btn"
  onClick={() =>
    setEditRequest({
      ...req,
      dateCreated: req.dateCreated
        ? new Date(req.dateCreated).toISOString().split("T")[0]
        : new Date(req.createdAt).toISOString().split("T")[0]
    })
  }
>
  Edit
</button>
 
          {' '}
          <button className="action-btn" onClick={() => handleDeleteRequest(req._id)}>Delete</button>
        </td>
      )}
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
  <div className="pagination-wrapper">
    <div className="pagination-info">
      Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} results
    </div>
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        &#171;
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`pagination-btn ${currentPage === i + 1 ? 'active-page' : ''}`}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        &#187;
      </button>
    </div>
  </div>
)}


          </div>
          
        
        </div>
      </div>
    </div>
  
  );
};

export default ServiceRequest;
