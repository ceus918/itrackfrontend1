import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ for table export
import searchIcon from '../icons/search.png';
import addIcon from '../icons/add.png'; 
import logo from '../icons/I-track logo.png'; 
import downloadIcon from '../icons/download2.png';
import { getCurrentUser } from '../getCurrentUser';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [newStock, setNewStock] = useState({
  unitName: '',
  unitId: '',
  bodyColor: '',
  variation: '',
  status: 'In Stockyard'   // default
});


  const [editStock, setEditStock] = useState(null);


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [changeLogs, setChangeLogs] = useState([]);
const [isLogModalOpen, setIsLogModalOpen] = useState(false);
const [userRole, setUserRole] = useState(null);
const [currentUser, setCurrentUser] = useState(null);

const [fullUser, setFullUser] = useState(null);
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [profileData, setProfileData] = useState({ name: '', phoneno: '', picture: '' });
const [profileImage, setProfileImage] = useState(null);
const fileInputRef = React.useRef(null);

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


  useEffect(() => {
    fetchStock();
    fetchSalesAgent();
    getCurrentUser().then(user => {
      setUserRole(user ? user.role : null);
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

  const fetchStock = () => {
  axios.get("https://itrack-web-backend.onrender.com/api/getStock")
      .then((response) => {
        setStock(response.data);
      })
      .catch((error) => console.log(error));
  };



  const handleCreateStock = () => {
    const { unitName, unitId, bodyColor, variation} = newStock;

    const conductionError = validateConductionNumber(unitId);
  if (conductionError) {
    alert(conductionError);
    return;
  }
  
    if (!unitName || !unitId || !bodyColor || !variation) {
      alert('All fields are required!');
      return;
    }
  
  axios.post("https://itrack-web-backend.onrender.com/api/createStock", newStock)
      .then(() => {
        fetchStock();
        setNewStock({
  unitName: '',
  unitId: '',
  bodyColor: '',
  variation: '',
  status: 'In Stockyard'   // reset default
});

        setIsCreateModalOpen(false);
      })
      .catch((error) => {
  console.error("Error creating stock:", error.response || error);
  alert(error.response?.data?.message || "Failed to add stock");
});

  };



  const handleUpdateStock = (id) => {
  const { unitName, unitId, bodyColor, variation, assignedTo } = editStock;

  const conductionError = validateConductionNumber(unitId);
  if (conductionError) {
    alert(conductionError);
    return;
  }
  if (!unitName || !unitId || !bodyColor || !variation || !editStock.status) {
  alert('All fields are required!');
  return;
}


  const oldStock = stock.find(item => item._id === id);

  axios.put(`https://itrack-web-backend.onrender.com/api/updateStock/${id}`, editStock)
    .then(() => {
      setChangeLogs(prev => [
        ...prev,
        {
          type: 'Edit',
          timestamp: new Date().toLocaleString(),
          before: oldStock,
          after: editStock
        }
      ]);
      fetchStock();
      setEditStock(null);
    })
    .catch((error) => console.log(error));
};


  const handleDeleteStock = (id) => {
  const deletedStock = stock.find(item => item._id === id);

  // ✅ Step 1: Ask for confirmation
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${deletedStock.unitName}" with Conduction Number "${deletedStock.unitId}"?`
  );

  if (!confirmDelete) {
    return; // Cancel delete if user presses Cancel
  }

  // ✅ Step 2: Proceed only if confirmed
  axios.delete(`https://itrack-web-backend.onrender.com/api/deleteStock/${id}`)
    .then(() => {
      setChangeLogs(prev => [
        ...prev,
        {
          type: 'Delete',
          timestamp: new Date().toLocaleString(),
          before: deletedStock,
          after: null
        }
      ]);
      fetchStock();
      alert(`"${deletedStock.unitName}" has been successfully deleted.`);
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to delete stock. Please try again.');
    });
};




 const getAgeString = (createdAt) => {
  if (!createdAt) return 'N/A';

  const created = new Date(createdAt);
  if (isNaN(created)) return 'Invalid date';

  const now = new Date();
  const diffMs = now - created;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const displayHours = hours % 24;
  const displayMinutes = minutes % 60;
  const displaySeconds = seconds % 60;

  let result = '';
  if (days > 0) result += `${days}d `;
  result += `${displayHours}h`;
  // result += `${displayHours}h ${displayMinutes}m`;

  return result;
};

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  // Strict filter for dropdowns (body color or variation)
  const bodyColors = ["Black", "White", "Gray", "Blue", "Orange"];
  const variations = ["4x2 LSA", "4x4", "LS-E", "LS"];
  const unitNames = ["Isuzu MU-X", "Isuzu D-MAX", "Isuzu Traviz"];

  let strictlyFilteredStock = stock;
if (bodyColors.includes(filterTerm)) {
  strictlyFilteredStock = strictlyFilteredStock.filter(req => req.bodyColor === filterTerm);
} else if (variations.includes(filterTerm)) {
  strictlyFilteredStock = strictlyFilteredStock.filter(req => req.variation === filterTerm);
} else if (unitNames.includes(filterTerm)) {
  strictlyFilteredStock = strictlyFilteredStock.filter(req => req.unitName === filterTerm);
}


  // Original search logic (broad search)
  const filteredStock = stock.filter((req) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      String(req.unitName).toLowerCase().includes(searchValue) ||
      String(req.unitId).toLowerCase().includes(searchValue) ||
      String(req.bodyColor).toLowerCase().includes(searchValue) ||
      String(req.variation).toLowerCase().includes(searchValue) ||
      getAgeString(req.createdAt).toLowerCase().includes(searchValue)
    );
  });

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6; // You can change this number if needed

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentStock = filteredStock.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

const handleDownloadInventoryPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Inventory Report', 14, 15);

    const inventoryData = stock.map(item => [
  item.unitName,
  item.unitId,
  item.bodyColor,
  item.variation,
  item.status,
  item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-CA') : 'N/A'
]);


autoTable(doc, {
  head: [['Unit Name', 'Conduction Number', 'Body Color', 'Variation', 'Date Added']],

      body: inventoryData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    doc.save('Inventory.pdf');
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
  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-wrapper")) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);


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


const [agents, setAgents] = useState([]);

const fetchSalesAgent = () => {
  axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
    .then(res => {
      const driverList = res.data.filter(u => u.role?.toLowerCase() === "sales agent");
      setAgents(driverList);
    })
    .catch(err => console.error(err));
};


  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main">
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>Vehicle Stocks</h3>
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




        <div className="user-management-header" style={{ gap: 0 }}>
          <button 
            onClick={handleDownloadInventoryPDF} 
            className="printbtn" style={{  fontSize: '10px', display: 'flex', alignItems: 'center',marginRight:5 ,gap:3}}
            tabIndex={0}
          ><img src={downloadIcon} alt="Download" className="button-icon2" />
          Print PDF
          </button>
          {/* Filter Dropdown Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              className="filterbtn"
              style={{  fontSize: '11px', display: 'flex', alignItems: 'center',marginRight:5 ,gap:3}}
              tabIndex={0}
              onClick={e => {
                const dropdown = document.getElementById('filter-dropdown-panel');
                if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
              }}
            >
              <img src={require('../icons/sort.png')}  style={{ width: 12, height: 12,marginLeft: 4 , }} />Filter
             
            </button>
            
            <div id="filter-dropdown-panel" style={{ display: 'none', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 6, padding: '12px 16px', minWidth: 180, zIndex: 10, position: 'absolute', marginTop: 38 }}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block',textAlign:"left" }}>Body Color</label>
                <select
                  className="filter-dropdown"
                  onChange={e => setFilterTerm(e.target.value)}
                  value={filterTerm && ["Black","White","Gray","Blue","Orange"].includes(filterTerm) ? filterTerm : ""}
                  style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 4 }}
                >
                  <option value="">All</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                  <option value="Gray">Gray</option>
                  <option value="Blue">Blue</option>
                  <option value="Orange">Orange</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block',textAlign:"left" }}>Variation</label>
                <select
                  className="filter-dropdown"
                  onChange={e => setFilterTerm(e.target.value)}
                  value={filterTerm && ["4x2 LSA","4x4","LS-E","LS"].includes(filterTerm) ? filterTerm : ""}
                  style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 4 }}
                >
                  <option value="">All</option>
                  <option value="4x2 LSA">4x2 LSA</option>
                  <option value="4x4">4x4</option>
                  <option value="LS-E">LS-E</option>
                  <option value="LS">LS</option>
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
  <label style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block', textAlign: "left" }}>
    Unit Name
  </label>
  <select
    className="filter-dropdown"
    onChange={e => setFilterTerm(e.target.value)}
    value={filterTerm && ["Isuzu MU-X", "Isuzu D-MAX", "Isuzu Traviz"].includes(filterTerm) ? filterTerm : ""}
    style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 4 }}
  >
    <option value="">All</option>
    <option value="Isuzu MU-X">Isuzu MU-X</option>
    <option value="Isuzu D-MAX">Isuzu D-MAX</option>
    <option value="Isuzu Traviz">Isuzu Traviz</option>
  </select>
</div>
            </div>

          </div>
          
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
  <button className="create-btn" onClick={() => setIsCreateModalOpen(true)} style={{ marginLeft:4}} >
    <img src={addIcon} alt="Add" className="add-icon" />
    Add Stock
  </button>
)}
        </div>

        {isCreateModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Add Stock</p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">
          {/* ------------------ UNIT NAME ------------------ */}
          <div className="modal-form-group">
            <label>
              Unit Name <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={newStock.unitName}
              onChange={(e) => {
                const unitName = e.target.value;
                setNewStock({
                  ...newStock,
                  unitName,
                  variation: "" // reset variation when unit changes
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
              value={newStock.unitId}
              onChange={(e) =>
                setNewStock({ ...newStock, unitId: e.target.value })
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
              value={newStock.bodyColor}
              onChange={(e) =>
                setNewStock({ ...newStock, bodyColor: e.target.value })
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
              value={newStock.variation}
              onChange={(e) =>
                setNewStock({ ...newStock, variation: e.target.value })
              }
              required
              disabled={!newStock.unitName}
            >
              <option value="">Select Variation</option>
              {newStock.unitName &&
                unitOptions[newStock.unitName]?.map((variation, index) => (
                  <option key={index} value={variation}>
                    {variation}
                  </option>
                ))}
            </select>
          </div>

<div className="modal-form-group">
            <label>
              Variation <span style={{ color: "red" }}>*</span>
            </label>
         <select
  value={newStock.status}
  onChange={(e) =>
    setNewStock({ ...newStock, status: e.target.value })
  }
  className="modal-input force-width" 
>
  <option value="In Stockyard">In Stockyard</option>
  <option value="Available">Available</option>
</select>
</div>



        </div>

        {/* ------------------ BUTTONS ------------------ */}
        <div className="modal-buttons">
          <button className="create-btn1" onClick={handleCreateStock}>
            Add
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

{/* ------------------ EDIT STOCK MODAL ------------------ */}
{editStock && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Edit Stock</p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">
          {/* ------------------ UNIT NAME ------------------ */}
          <div className="modal-form-group">
            <label>
              Unit Name <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={editStock.unitName}
              onChange={(e) => {
                const unitName = e.target.value;
                setEditStock({
                  ...editStock,
                  unitName,
                  variation: "" // reset variation when unit changes
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
              value={editStock.unitId}
              onChange={(e) =>
                setEditStock({ ...editStock, unitId: e.target.value })
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
              value={editStock.bodyColor}
              onChange={(e) =>
                setEditStock({ ...editStock, bodyColor: e.target.value })
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
              value={editStock.variation}
              onChange={(e) =>
                setEditStock({ ...editStock, variation: e.target.value })
              }
              required
              disabled={!editStock.unitName}
            >
              <option value="">Select Variation</option>
              {editStock.unitName &&
                unitOptions[editStock.unitName]?.map((variation, index) => (
                  <option key={index} value={variation}>
                    {variation}
                  </option>
                ))}
            </select>
          </div>

          <div className="modal-form-group">
  <label>Status</label>
  <select
    value={editStock.status}
    onChange={(e) =>
      setEditStock({ ...editStock, status: e.target.value })
    }
    className="modal-input"
  >
    <option value="In Stockyard">In Stockyard</option>
    <option value="Available">Available</option>
  </select>
</div>


        </div>

        {/* ------------------ BUTTONS ------------------ */}
        <div className="modal-buttons">
          <button
            className="create-btn1"
            onClick={() => handleUpdateStock(editStock._id)}
          >
            Save
          </button>
          <button className="cancel-btn1" onClick={() => setEditStock(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        
        <div className="content">
          
          <div className="table-container">
        
        <table >
          <thead>
            <tr>
              <th>Unit Name</th>
              <th>Conduction Number</th>
              <th>Body Color</th>
              <th>Variation</th>
              <th>Age (In Storage)</th>
              <th>Date Added</th>
              <th>Status</th>

 {/* Added Quantity column header */}
              {!['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
              <tr class="header-spacer-row"><td ></td></tr>
            {(filterTerm ? strictlyFilteredStock : currentStock).map((stockItem) => (


              <tr key={stockItem._id}>
                <td>{stockItem.unitName}</td>
                <td>{stockItem.unitId}</td>
                <td>{stockItem.bodyColor}</td>
                <td>{stockItem.variation}</td>
                <td>{getAgeString(stockItem.createdAt)}</td> 
                <td>{stockItem.createdAt ? new Date(stockItem.createdAt).toLocaleDateString('en-CA') : 'N/A'}</td>
                <td>{stockItem.status}</td>

 {/* Display quantity in the table */}
                {!['Sales Agent', 'Manager', 'Supervisor'].includes(userRole) && (
                  <td>
                    <button className="action-btn" onClick={() => setEditStock(stockItem)}>Edit</button>{' '}
                    <button className="action-btn" onClick={() => handleDeleteStock(stockItem._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
  <div className="pagination-wrapper">
    <div className="pagination-info">
      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStock.length)} of {filteredStock.length} results
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


{isLogModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Change Logs</h3>
      <div className="modal-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {changeLogs.length === 0 ? (
          <p>No changes yet.</p>
        ) : (
          <ul>
            {changeLogs.map((log, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{log.type}</strong> on <em>{log.timestamp}</em><br />
                {log.before && (
                  <>
                    <strong>Before:</strong> {log.before.unitName}, {log.before.unitId}, {log.before.bodyColor}, {log.before.variation}<br />
                  </>
                )}
                {log.after && (
                  <>
                    <strong>After:</strong> {log.after.unitName}, {log.after.unitId}, {log.after.bodyColor}, {log.after.variation}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="modal-buttons">
        <button className="cancel-btn" onClick={() => setIsLogModalOpen(false)}>Close</button>
      </div>
    </div>
  </div>
)}


      </div>
      
    </div>
    </div>
    </div>
  );
};

export default Inventory;
