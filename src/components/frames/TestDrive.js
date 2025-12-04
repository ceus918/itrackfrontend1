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
const [stock, setStock] = useState([]);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [newStock, setNewStock] = useState({
  unitName2: '',
  unitId2: '',
  bodyColor2: '',
  variation2: '',
});
const [currentUser, setCurrentUser] = useState(null);

const [userRole, setUserRole] = useState(null);
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
  

const fileInputRef = React.useRef(null);


  // FETCH INVENTORY VEHICLES + TEST DRIVE LIST
  useEffect(() => {
  fetchVehicles();
  fetchTestDrives();
  fetchStock(); // <-- add this line

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
    axios.get('https://itrack-web-backend.onrender.com/api/getTestDriveInv')

      .then(res => {
        console.log(res.data); // 
        console.log(vehicles);

        const availableVehicles = res.data.filter(v => v.quantity2 > 0);
        setVehicles(availableVehicles);
      })
      .catch(err => console.error(err));
  };

//Scheduled
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
    return vehicle ? `${vehicle.unitName2} - ${vehicle.variation2} (${vehicle.bodyColor2})` : 'Vehicle Info';
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


const handleAddStockChange = (e) => {
  const { name, value } = e.target;
  setNewStock((prev) => ({ ...prev, [name]: value }));
};



const handleAddStockSubmit = async (e) => {
  e.preventDefault();

  const { unitName2, unitId2, bodyColor2, variation2 } = newStock;
  const conductionError = validateConductionNumber(unitId2);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  if (!unitName2 || !unitId2 || !bodyColor2 || !variation2) {
    alert('All fields are required!');
    return;
  }

  try {
    await axios.post('https://itrack-web-backend.onrender.com/api/createTestDriveInv', newStock);
    alert('✅ Test drive unit added successfully!');
    setNewStock({ unitName2: '', unitId2: '', bodyColor2: '', variation2: '' });
    setIsAddModalOpen(false);
    fetchStock(); // refresh list
  } catch (error) {
    console.error('Error adding test drive unit:', error);
    alert('❌ Failed to add test drive unit.');
  }
};


const fetchStock = () => {
  axios.get('https://itrack-web-backend.onrender.com/api/getTestDriveInv')
    .then(res => setStock(res.data))
    .catch(err => console.error('Error fetching test drive inventory:', err));
};

const handleDeleteStock = (id) => {
  const deletedStock = stock.find(item => item._id === id);
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${deletedStock.unitName2}" with Conduction Number "${deletedStock.unitId2}"?`
  );
  if (!confirmDelete) return;

  axios.delete(`https://itrack-web-backend.onrender.com/api/deleteTestDriveInv/${id}`)
    .then(() => {
      alert('✅ Deleted successfully!');
      fetchStock();
    })
    .catch(() => alert('❌ Failed to delete.'));
};



const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editStock, setEditStock] = useState({
  _id: '',
  unitName2: '',
  unitId2: '',
  bodyColor2: '',
  variation2: '',
});


const handleEditStockClick = (stockItem) => {
  setEditStock(stockItem);
  setIsEditModalOpen(true);
};

const handleEditStockChange = (e) => {
  setEditStock({ ...editStock, [e.target.name]: e.target.value });
};

const handleEditStockSubmit = async (e) => {
  e.preventDefault();

  const { unitName2, unitId2, bodyColor2, variation2 } = editStock;
  const conductionError = validateConductionNumber(unitId2);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  if (!unitName2 || !unitId2 || !bodyColor2 || !variation2) {
    alert('All fields are required!');
    return;
  }

  try {
    await axios.put(
      `https://itrack-web-backend.onrender.com/api/updateTestDriveInv/${editStock._id}`,
      editStock
    );
    alert('✅ Test drive unit updated successfully!');
    setIsEditModalOpen(false);
    fetchStock(); // Refresh list
  } catch (error) {
    console.error('Error updating test drive unit:', error);
    alert('❌ Failed to update test drive unit.');
  }
};



const validateConductionNumber = (value) => {
  const regex = /^[A-Za-z0-9]+$/; // Only letters and numbers
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




const unitOptions = {
  "Isuzu D-Max": [
    "Cab and Chassis",
    "CC Utility Van Dual AC",
    "4x2 LT MT",
    "4x4 LT MT",
    "4x2 LS-A MT",
    "4x2 LS-A MT Plus",
    "4x2 LS-A AT",
    "4x2 LS-A AT Plus",
    "4x4 LS-A MT",
    "4x4 LS-A MT Plus",
    "4x2 LS-E AT",
    "4x4 LS-E AT",
    "4x4 Single Cab MT"
  ],
  "Isuzu MU-X": [
    "1.9L MU-X 4x2 LS AT",
    "3.0L MU-X 4x2 LS-A AT",
    "3.0L MU-X 4x2 LS-E AT",
    "3.0L MU-X 4x4 LS-E AT"
  ],
  "Isuzu Traviz": [
    "SWB 2.5L 4W 9FT Cab & Chassis",
    "SWB 2.5L 4W 9FT Utility Van Dual AC",
    "LWB 2.5L 4W 10FT Cab & Chassis",
    "LWB 2.5L 4W 10FT Utility Van Dual AC",
    "LWB 2.5L 4W 10FT Aluminum Van",
    "LWB 2.5L 4W 10FT Aluminum Van w/ Single AC",
    "LWB 2.5L 4W 10FT Dropside Body",
    "LWB 2.5L 4W 10FT Dropside Body w/ Single AC"
  ],
  "Isuzu QLR Series": [
    "QLR77 E Tilt 3.0L 4W 10ft 60A Cab & Chassis",
    "QLR77 E Tilt Utility Van w/o AC",
    "QLR77 E Non-Tilt 3.0L 4W 10ft 60A Cab & Chassis",
    "QLR77 E Non-Tilt Utility Van w/o AC",
    "QLR77 E Non-Tilt Utility Van Dual AC"
  ],
  "Isuzu NLR Series": [
    "NLR77 H Tilt 3.0L 4W 14ft 60A",
    "NLR77 H Jeepney Chassis (135A)",
    "NLR85 Tilt 3.0L 4W 10ft 90A",
    "NLR85E Smoother"
  ],
  "Isuzu NMR Series": [
    "NMR85H Smoother",
    "NMR85 H Tilt 3.0L 6W 14ft 80A Non-AC"
  ],
  "Isuzu NPR Series": [
    "NPR85 Tilt 3.0L 6W 16ft 90A",
    "NPR85 Cabless for Armored"
  ],
  "Isuzu NPS Series": [
    "NPS75 H 3.0L 6W 16ft 90A"
  ],
  "Isuzu NQR Series": [
    "NQR75L Smoother",
    "NQR75 Tilt 5.2L 6W 18ft 90A"
  ],
  "Isuzu FRR Series": [
    "FRR90M 6W 20ft 5.2L",
    "FRR90M Smoother"
  ],
  "Isuzu FTR Series": [
    "FTR90M 6W 19ft 5.2L"
  ],
  "Isuzu FVR Series": [
    "FVR34Q Smoother",
    "FVR 34Q 6W 24ft 7.8L w/ ABS"
  ],
  "Isuzu FTS Series": [
    "FTS34 J",
    "FTS34L"
  ],
  "Isuzu FVM Series": [
    "FVM34T 10W 26ft 7.8L w/ ABS",
    "FVM34W 10W 32ft 7.8L w/ ABS"
  ],
  "Isuzu FXM Series": ["FXM60W"],
  "Isuzu GXZ Series": ["GXZ60N"],
  "Isuzu EXR Series": ["EXR77H 380PS 6W Tractor Head"]
};

const UnitDropdown = () => {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
}

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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>Test Drive</h3>
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



        <div className="testdrive-content">

        
{/* ✅ Test Drive Inventory Section */}
{fullUser && fullUser.role === 'Admin' && (
<div className="testdrive-section" style={{ marginTop: '40px' }}>
  <div className="testdrive-header">
    <h3 className="testdrive-title">Test Drive Inventory</h3>
    <div className="testdrive-btn-container">
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="testdrive-btn2"
      >
        + Add
      </button>
    </div>
  </div>

  <div className="testdrive-table-container">
    <table className="testdrive-table">
      <thead>
        <tr>
          <th>Unit Name</th>
          <th>Conduction Number</th>
          <th>Body Color</th>
          <th>Variation</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {stock.length > 0 ? (
          stock.map((item) => (
            <tr key={item._id}>
              <td>{item.unitName2}</td>
              <td>{item.unitId2}</td>
              <td>{item.bodyColor2}</td>
              <td>{item.variation2}</td>
              <td>
                <div className="testdrive-dropdown">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditStockClick(item)}
                  >
                    Edit
                  </button> {' '}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteStock(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
              No test drive inventory available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
)}




 {/* ✅ Add Modal */}
{isAddModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Add Test Drive Unit</p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">
          {/* ------------------ UNIT NAME ------------------ */}
          <div className="modal-form-group">
            <label>
              Unit Name <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={newStock.unitName2}
              onChange={(e) => {
                const unitName = e.target.value;
                setNewStock({
                  ...newStock,
                  unitName2: unitName,
                  variation2: "" // reset variation when unit changes
                });
              }}
              required
            >
              <option value="">Select Unit Name</option>
              {Object.keys(unitOptions).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* ------------------ CONDUCTION NUMBER ------------------ */}
          <div className="modal-form-group">
            <label>
              Conduction Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={newStock.unitId2}
              onChange={(e) =>
                setNewStock({ ...newStock, unitId2: e.target.value })
              }
              required
            />
          </div>

          {/* ------------------ BODY COLOR ------------------ */}
          <div className="modal-form-group">
            <label>
              Body Color <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={newStock.bodyColor2}
              onChange={(e) =>
                setNewStock({ ...newStock, bodyColor2: e.target.value })
              }
              required
            >
              <option value="">Select Body Color</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
              <option value="Blue">Blue</option>
              <option value="Orange">Orange</option>
            </select>
          </div>

          {/* ------------------ VARIATION ------------------ */}
          <div className="modal-form-group">
            <label>
              Variation <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={newStock.variation2}
              onChange={(e) =>
                setNewStock({ ...newStock, variation2: e.target.value })
              }
              required
              disabled={!newStock.unitName2}
            >
              <option value="">Select Variation</option>
              {newStock.unitName2 &&
                unitOptions[newStock.unitName2]?.map((variation, index) => (
                  <option key={index} value={variation}>
                    {variation}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* ------------------ BUTTONS ------------------ */}
        <div className="modal-buttons">
          <button className="create-btn1" onClick={handleAddStockSubmit}>
            Add
          </button>
          <button
            className="cancel-btn1"
            onClick={() => setIsAddModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ✅ Edit Modal */}
{isEditModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Edit Test Drive Unit</p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">
          {/* ------------------ UNIT NAME ------------------ */}
          <div className="modal-form-group">
            <label>
              Unit Name <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={editStock.unitName2}
              onChange={(e) => {
                const unitName = e.target.value;
                setEditStock({
                  ...editStock,
                  unitName2: unitName,
                  variation2: "" // reset variation when unit changes
                });
              }}
              required
            >
              <option value="">Select Unit Name</option>
              {Object.keys(unitOptions).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* ------------------ CONDUCTION NUMBER ------------------ */}
          <div className="modal-form-group">
            <label>
              Conduction Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={editStock.unitId2}
              onChange={(e) =>
                setEditStock({ ...editStock, unitId2: e.target.value })
              }
              required
            />
          </div>

          {/* ------------------ BODY COLOR ------------------ */}
          <div className="modal-form-group">
            <label>
              Body Color <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={editStock.bodyColor2}
              onChange={(e) =>
                setEditStock({ ...editStock, bodyColor2: e.target.value })
              }
              required
            >
              <option value="">Select Body Color</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
              <option value="Blue">Blue</option>
              <option value="Orange">Orange</option>
            </select>
          </div>

          {/* ------------------ VARIATION ------------------ */}
          <div className="modal-form-group">
            <label>
              Variation <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={editStock.variation2}
              onChange={(e) =>
                setEditStock({ ...editStock, variation2: e.target.value })
              }
              required
              disabled={!editStock.unitName2}
            >
              <option value="">Select Variation</option>
              {editStock.unitName2 &&
                unitOptions[editStock.unitName2]?.map((variation, index) => (
                  <option key={index} value={variation}>
                    {variation}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* ------------------ BUTTONS ------------------ */}
        <div className="modal-buttons">
          <button className="create-btn1" onClick={handleEditStockSubmit}>
            Save
          </button>
          <button
            className="cancel-btn1"
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}






  {/* Hide this whole section when userRole is 'Admin' */}
{fullUser && fullUser.role !== 'Admin' && (
  <>
    <h3>Schedule a Test Drive</h3>

    <div className="testdrive-modal">
      <form onSubmit={handleSubmit} className="testdrive-form">
        <div className="testdrive-form-group">
          <label>Available Vehicle <span style={{ color: 'red' }}>*</span></label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="">Select a Vehicle</option>
            {vehicles
              .filter(vehicle => !testDrives.some(td => td.vehicleId === vehicle._id))
              .map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.unitName2} — {vehicle.variation2} ({vehicle.bodyColor2}) | ID: {vehicle.unitId2}
                </option>
              ))}
          </select>
        </div>

        <div className="testdrive-form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="testdrive-form-group">
          <label>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="testdrive-form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="testdrive-form-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
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
  </>
)}



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