import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../css/ServiceRequest.css';
import searchIcon from '../icons/search.png';
import addIcon from '../icons/add.png'; 
import hideIcon from '../icons/hide.png';
import showIcon from '../icons/show.png';
import { getCurrentUser } from '../getCurrentUser';
import AuditTrailTab from './AuditTrailTab';

const ManageUser = () => {
  const [user, setUser] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    phoneno: '',
    email: '',
    password: '',
    role: '' // default role
  });
  
  const [editUser, setEditUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [profileData, setProfileData] = useState({ name: '', phoneno: '', picture: '' });
  const [profileImage, setProfileImage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fileInputRef = React.useRef(null);


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

  const fetchUsers = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteUser = (id) => {
  const deletedUser = user.find(u => u._id === id);

  // ✅ Step 1: Ask for confirmation before deleting
  const confirmDelete = window.confirm(
    `Are you sure you want to delete the user "${deletedUser.name}" with email "${deletedUser.email}"?`
  );

  if (!confirmDelete) {
    return; // ❌ Cancel delete if user pressed Cancel
  }

  // ✅ Step 2: Proceed only if confirmed
  axios.delete(`https://itrack-web-backend.onrender.com/api/deleteUser/${id}`)
    .then(() => {
      fetchUsers();
      alert(`"${deletedUser.name}" has been successfully deleted.`);
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to delete user. Please try again.');
    });
};


  const handleCreateUser = () => {
  if (!newUser.name || !newUser.phoneno || !newUser.email || !newUser.password || !newUser.role) {
    alert("All fields are required!");
    return;
  }

  // Password validation
  if (newUser.password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  // Check for duplicate email or phone number
  const duplicateEmail = user.find(u => u.email === newUser.email);
  const duplicatePhone = user.find(u => u.phoneno === newUser.phoneno);

  if (duplicateEmail) {
    alert("Email already exists. Please use a different email.");
    return;
  }

  if (duplicatePhone) {
    alert("Phone number already exists. Please use a different phone number.");
    return;
  }

  axios.post("https://itrack-web-backend.onrender.com/api/createUser", newUser)
    .then(() => {
      fetchUsers();
      setNewUser({ name: '', phoneno: '', email: '', password: '', role: '' });
      setIsCreateModalOpen(false); 
    })
    .catch((error) => {
      alert("Failed to create user. Please check your input and try again.");
      console.log(error);
    });
};


  
  const handleUpdateUser = (id) => {
  if (!editUser.name || !editUser.phoneno || !editUser.email || !editUser.password || !editUser.role) {
    alert("All fields are required!");
    return;
  }

  // Password validation
  if (editUser.password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  // Check for duplicates excluding the current user
  const duplicateEmail = user.find(u => u.email === editUser.email && u._id !== id);
  const duplicatePhone = user.find(u => u.phoneno === editUser.phoneno && u._id !== id);

  if (duplicateEmail) {
    alert("Email already exists. Please use a different email.");
    return;
  }

  if (duplicatePhone) {
    alert("Phone number already exists. Please use a different phone number.");
    return;
  }

  axios.put(`https://itrack-web-backend.onrender.com/api/updateUser/${id}`, editUser)
    .then(() => {
      fetchUsers();
      setEditUser(null);
    })
    .catch((error) => console.log(error));
};



   const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStock = user.filter((req) => {
  const searchValue = searchTerm.toLowerCase();
  const matchesSearch =
    String(req.name).toLowerCase().includes(searchValue) ||
    String(req.phoneno).toLowerCase().includes(searchValue) ||
    String(req.email).toLowerCase().includes(searchValue) ||
    String(req.password).toLowerCase().includes(searchValue) ||
    String(req.role).toLowerCase().includes(searchValue);

  const matchesRole = roleFilter ? req.role === roleFilter : true;

  return matchesSearch && matchesRole;
});

const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 6; // change this number if needed

const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;
const currentUsers = filteredStock.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(filteredStock.length / usersPerPage);


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

      // ✅ Audit trail log
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
    <>
      <div className="app">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main">
           <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>User Management</h3>
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




          
          {activeTab === 'users' && (
            <div className="content">
              <div className="user-management-header">
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

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <button
    className="filterbtn"
    style={{ fontSize: '11px', display: 'flex', alignItems: 'center', marginRight: 5, gap: 3 }}
    tabIndex={0}
    onClick={e => {
      const dropdown = document.getElementById('filter-dropdown-panel');
      if (dropdown)
        dropdown.style.display =
          dropdown.style.display === 'block' ? 'none' : 'block';
    }}
  >
    <img
      src={require('../icons/sort.png')}
      style={{ width: 12, height: 12, marginLeft: 4 }}
    />
    Filter
  </button>

  <div
    id="filter-dropdown-panel"
    style={{
      display: 'none',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      borderRadius: 6,
      padding: '12px 16px',
      minWidth: 180,
      zIndex: 10,
      position: 'absolute',
      marginTop: 38,
    }}
  >
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          fontWeight: 600,
          fontSize: 12,
          marginBottom: 6,
          display: 'block',
          textAlign: 'left',
        }}
      >
        User Role
      </label>
      <select
        className="filter-dropdown"
        onChange={e => setRoleFilter(e.target.value)}
        value={
          roleFilter &&
          ['Admin', 'Sales Agent', 'Driver', 'Manager', 'Supervisor', 'Dispatch'].includes(
            roleFilter
          )
            ? roleFilter
            : ''
        }
        style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 4 }}
      >
        <option value="">All</option>
        <option value="Admin">Admin</option>
        <option value="Sales Agent">Sales Agent</option>
        <option value="Driver">Driver</option>
        <option value="Manager">Manager</option>
        <option value="Supervisor">Supervisor</option>
        <option value="Dispatch">Dispatch</option>
      </select>
    </div>

    <div style={{ textAlign: 'right', marginTop: 8 }}>
     
    </div>
  </div>
</div>


  <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
    <img src={addIcon} alt="Add" className="add-icon" />
    Add User
  </button>
</div>

              {isCreateModalOpen && (
                <div className="modal-overlay">
                  <div className="modal">
                    <p className='modaltitle'>Create New User</p>
                      <div className='modalline'> 
                    <div className="modal-content">
                      <div className="modal-form">
                        <div className="modal-form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Phone No.</label>
                          <input
                            type="text"
                            value={newUser.phoneno}
                            onChange={(e) => setNewUser({ ...newUser, phoneno: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Password</label>
                          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <img
                              src={showPassword ? hideIcon : showIcon}
                              alt={showPassword ? 'Hide' : 'Show'}
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ position: 'absolute', right: '10px', cursor: 'pointer', width: '15px', height: '15px' }}
                            />
                          </div>
                        </div>
                        <div className="modal-form-group">
                          <label>Role</label>
                          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="">Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="Sales Agent">Sales Agent</option>
                            <option value="Driver">Driver</option>
                            <option value="Manager">Manager</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Dispatch">Dispatch</option>
                          </select>
                        </div>
                      </div>
                      <div className="modal-buttons">
                        <button className="create-btn1" onClick={handleCreateUser}>Create</button>
                        <button className="cancel-btn1" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )}
              {editUser && (
                <div className="modal-overlay">
                  <div className="modal">
                    <p className='modaltitle'>Edit User</p>
                     <div className='modalline'> 
                    <div className="modal-content">
                      <div className="modal-form">
                        <div className="modal-form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            value={editUser.name}
                            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Phone No.</label>
                          <input
                            type="text"
                            value={editUser.phoneno}
                            onChange={(e) => setEditUser({ ...editUser, phoneno: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                          />
                        </div>
                        <div className="modal-form-group">
                          <label>Password</label>
                          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <input
                              type={showEditPassword ? "text" : "password"}
                              value={editUser.password}
                              onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <img
                              src={showEditPassword ? hideIcon : showIcon}
                              alt={showEditPassword ? 'Hide' : 'Show'}
                              onClick={() => setShowEditPassword(!showEditPassword)}
                              style={{ position: 'absolute', right: '10px', cursor: 'pointer', width: '15px', height: '15px' }}
                            />
                          </div>
                        </div>
                        <div className="modal-form-group">
                          <label>Role</label>
                          <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                            <option value="">Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="Sales Agent">Sales Agent</option>
                            <option value="Driver">Driver</option>
                            <option value="Manager">Manager</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Dispatch">Dispatch</option>
                          </select>
                        </div>
                      </div>
                      <div className="modal-buttons">
                        <button className="create-btn1" onClick={() => { handleUpdateUser(editUser._id); setEditUser(null); }}>Save</button>
                        <button className="cancel-btn1" onClick={() => setEditUser(null)}>Cancel</button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone No.</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="header-spacer-row"><td></td></tr>
                    {currentUsers.map((userItem) => (
                      <tr key={userItem._id}>
                        <td>{userItem.name}</td>
                        <td>{userItem.phoneno}</td>
                        <td>{userItem.email}</td>
                        <td>{'********'}</td>
                        <td>{userItem.role}</td>
                        <td>
                          <button className="action-btn" onClick={() => setEditUser(userItem)}>Edit</button>{' '}
                          <button className="action-btn" onClick={() => handleDeleteUser(userItem._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <div className="pagination-info">
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredStock.length)} of {filteredStock.length} results
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
                          className={"pagination-btn" + (currentPage === i + 1 ? " active-page" : "")}
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
              <button onClick={() => setIsAuditModalOpen(true)} style={{ color:'black',fontSize:'10px', margin: '16px 0', padding: '6px 12px', background: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Audit Trail
              </button>
              {isAuditModalOpen && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: 8,
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: 24,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                    position: 'relative'
                  }}>
                    <button onClick={() => setIsAuditModalOpen(false)} style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'transparent',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: '#888'
                    }}>&times;</button>
                    <AuditTrailTab />
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'audit' && (
            <div className="content">
              <AuditTrailTab />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageUser;
