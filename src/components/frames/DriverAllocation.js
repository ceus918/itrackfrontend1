import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../css/ServiceRequest.css';
import logo from '../icons/I-track logo.png'; 
import addIcon from '../icons/add.png'; 
import searchIcon from '../icons/search.png';
import { getCurrentUser } from '../getCurrentUser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import downloadIcon from '../icons/download2.png';
import ViewShipment from "./ViewShipment"; // <-- add this


const DriverAllocation = () => {
  const [allocation, setAllocations] = useState([]);
  const [isViewShipmentOpen, setIsViewShipmentOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
  const [newAllocation, setNewAllocation] = useState({
    
    unitName: '',
    unitId: '',
    bodyColor: '',
    variation: '',
    assignedDriver: '',
    status: 'Pending',
    date: '' // Added date field

  });
  const [editAllocation, setEditAllocation] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [isRowModalOpen, setIsRowModalOpen] = useState(false); // NEW STATE
  const [profileData, setProfileData] = useState({ name: '', phoneno: '', picture: '' });
  const [profileImage, setProfileImage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = React.useRef(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

    const [inventory, setInventory] = useState([]);

const fetchInventory = () => {
  axios
    .get("https://itrack-web-backend.onrender.com/api/getStock")
    .then((res) => setInventory(res.data))
    .catch((err) => console.log(err));
};


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
    fetchAllocations();
    fetchInventory(); 
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

  const fetchAllocations = () => {
  axios.get("https://itrack-web-backend.onrender.com/api/getAllocation", { withCredentials: true })
      .then((res) => setAllocations(res.data))
      .catch((err) => console.log(err));
  };


  // Units that are NOT currently allocated
const availableUnits = inventory.filter(
  (unit) => !allocation.some((a) => a.unitId === unit.unitId)
);



  const handleCreate = () => {
  const { unitName, unitId, bodyColor, variation, assignedDriver, date } = newAllocation;

  // Validate conduction number
  const conductionError = validateConductionNumber(unitId);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  // Required fields
  if (!unitName || !unitId || !bodyColor || !variation || !assignedDriver || !date) {
    alert("All fields are required.");
    return;
  }

  // ✅ PREVENT DUPLICATE ALLOCATION
  const isAlreadyAllocated = allocation.some(
    (allocation) => allocation.unitId === unitId
  );

  if (isAlreadyAllocated) {
    alert("This unit is already allocated to a driver.");
    return;
  }

  // Submit
  axios.post(
    "https://itrack-web-backend.onrender.com/api/createAllocation",
    newAllocation,
    { withCredentials: true }
  )
  .then(() => {
    fetchAllocations();   // Refresh list
        // (optional) only if you have fetchUnits function

    // Reset form
    setNewAllocation({
      unitName: "",
      unitId: "",
      bodyColor: "",
      variation: "",
      assignedDriver: "",
      status: "Pending",
      date: "",
    });

    setIsCreateModalOpen(false);
  })
  .catch((err) => console.log(err));
};



  const handleUpdate = (id) => {
  const { unitName, unitId, bodyColor, variation, assignedDriver,date } = editAllocation;

  const conductionError = validateConductionNumber(unitId);
  if (conductionError) {
    alert(conductionError);
    return;
  }

  if (!unitName || !unitId || !bodyColor || !variation || !assignedDriver||!date) {
    alert("All fields are required.");
    return;
  }

  axios.put(`https://itrack-web-backend.onrender.com/api/updateAllocation/${id}`, editAllocation, { withCredentials: true })
    .then(() => {
      fetchAllocations();
      setEditAllocation(null);
    })
    .catch((err) => console.log(err));
};


  const handleDelete = (id) => {
  const deletedAllocation = allocation.find(item => item._id === id);

  // ✅ Step 1: Ask for confirmation before deleting
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${deletedAllocation.unitName}" with Conduction Number "${deletedAllocation.unitId}"?`
  );

  if (!confirmDelete) {
    return; // ❌ Cancel delete if user presses Cancel
  }

  // ✅ Step 2: Proceed only if confirmed
  axios.delete(`https://itrack-web-backend.onrender.com/api/deleteAllocation/${id}`, { withCredentials: true })
    .then(() => {
      fetchAllocations();
      alert(`"${deletedAllocation.unitName}" has been successfully deleted.`);
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to delete allocation. Please try again.');
    });
};


  const [drivers, setDrivers] = useState([]);

useEffect(() => {
  fetchAllocations();
  fetchDrivers(); // <-- Fetch drivers when component loads
}, []);

const fetchDrivers = () => {
  axios.get("https://itrack-web-backend.onrender.com/api/getUsers", { withCredentials: true })
    .then((res) => {
      const driverList = res.data.filter(user => user.role === "Driver");
      setDrivers(driverList);
    })
    .catch((err) => console.log(err));
};

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6; // Adjust how many items per page

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentAllocations = allocation.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(allocation.length / itemsPerPage);


const handleDownloadAllocationsPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Driver Allocations', 14, 15);

  const allocationData = allocation.map(item => [
    new Date(item.date).toLocaleDateString('en-CA'),
    item.unitName,
    item.unitId,
    item.bodyColor,
    item.variation,
    item.assignedDriver,
    item.status
  ]);

  autoTable(doc, {
    head: [['Date', 'Unit Name', 'Conduction No.', 'Body Color', 'Variation', 'Assigned Driver', 'Status']],
    body: allocationData,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  doc.save('DriverAllocations.pdf');
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
    if (savedImage) {
      setProfileImage(savedImage);
    }
    setProfileData(prev => ({ ...prev, name: fullUser.name, phoneno: fullUser.phoneno, picture: savedImage || '' }));
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


// Only show allocations that the current user is allowed to see
const visibleAllocations = currentAllocations.filter(item => {
  if (!fullUser) return false;

  if (fullUser.role === "Admin") {
    return true; // Admin sees all
  }

  if (fullUser.role === "Sales Agent") {
    // Find the inventory item for this allocation
    const inventoryItem = inventory.find(u => u.unitId === item.unitId);
    return inventoryItem?.assignedTo === fullUser.name; // Only show if assigned to this user
  }

  return false; // Other roles see nothing
});



  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
    <h3 className="header-title1" style={{ marginLeft: 10 }}>Driver Allocation</h3>
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
            onClick={handleDownloadAllocationsPDF} 
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
               {fullUser?.role === "Admin" && (
  <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
    <img src={addIcon} alt="Add" className="add-icon" />
    Allocate Driver
  </button>
)}
             </div>


        <div className="content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                <th>Date</th>
                  <th>Unit Name</th>
                  <th>Conduction Number</th>
                  <th>Body Color</th>
                  <th>Variation</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

               <tbody>
    {visibleAllocations.map((item) => (

      <tr 
        key={item._id} 
        onClick={() => {
          setSelectedRow(item);
          setIsViewShipmentOpen(true);
        }}
        style={{ cursor: "pointer" }}
      >
        <td>{new Date(item.date).toLocaleDateString('en-CA')}</td>
        <td>{item.unitName}</td>
        <td>{item.unitId}</td>
        <td>{item.bodyColor}</td>
        <td>{item.variation}</td>
        <td>{item.assignedDriver}</td>
        <td>
          <span className={`status-badge ${(item.status || "").toLowerCase().replace(' ', '-')}`}>

            {item.status}
          </span>
        </td>
        <td>
          <button 
            className="action-btn" 
            onClick={(e) => { e.stopPropagation(); setEditAllocation(item); }}
          >
            Edit
          </button>
          {" "}
          <button 
            className="action-btn" 
            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
            </table>


{/* View Shipments Modal */}
  <ViewShipment
    isOpen={isViewShipmentOpen}
    onClose={() => setIsViewShipmentOpen(false)}
    data={selectedRow}
  />

            

            {totalPages > 1 && (
  <div className="pagination-wrapper">
    <div className="pagination-info">
      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allocation.length)} of {allocation.length} results
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


       {isCreateModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Allocate Driver</p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">
          {/* ------------------ UNIT NAME ------------------ */}
          {/* UNIT NAME */}
<div className="modal-form-group">
  <label>Unit Name</label>

  <select
  value={newAllocation.selectedUnitId || ""}
  disabled={availableUnits.length === 0}
  onChange={(e) => {
    const selected = availableUnits.find(i => i._id === e.target.value);

    if (selected) {
      setNewAllocation({
        ...newAllocation,
        selectedUnitId: selected._id,   // <-- FIX: store the selected _id
        unitName: selected.unitName,
        unitId: selected.unitId,
        bodyColor: selected.bodyColor,
        variation: selected.variation
      });
    }
  }}
>

    <option value="">
      {availableUnits.length === 0
        ? "No units available"
        : "Select Unit"}
    </option>

    {availableUnits.map(item => (
      <option key={item._id} value={item._id}>
        {item.unitName} — {item.bodyColor} — {item.unitId}
      </option>
    ))}
  </select>
</div>

         

          <div className="modal-form-group">
            <label>Assigned Driver</label>
            <select
              value={newAllocation.assignedDriver}
              onChange={(e) =>
                setNewAllocation({ ...newAllocation, assignedDriver: e.target.value })
              }
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver.name}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label>Status</label>
            <select
              value={newAllocation.status}
              onChange={(e) =>
                setNewAllocation({ ...newAllocation, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              
            </select>
          </div>

          <div className="modal-form-group force-width">
            <label>Date</label>
            <input className="modal-form-group force-width2"
              type="date"
              value={newAllocation.date}
              onChange={(e) =>
                setNewAllocation({ ...newAllocation, date: e.target.value })
              }
            />
          </div>
        </div>

        <div className="modal-buttons">
          <button className="create-btn3" onClick={handleCreate}>
            Confirm
          </button>
          <button
            className="cancel-btn3"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{editAllocation && (
  <div className="modal-overlay">
    <div className="modal">
      <p className="modaltitle">Edit Allocation</p>
      <div className="modalline"></div>
      <div className="modal-content">
        <div className="modal-form">

          {/* ------------------ UNIT NAME (MANUAL INPUT) ------------------ */}
          <div className="modal-form-group">
            <label>Unit Name</label>
            <input
              type="text"
              value={editAllocation.unitName}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, unitName: e.target.value })
              }
            />
          </div>

          {/* ------------------ CONDUCTION NUMBER (MANUAL) ------------------ */}
          <div className="modal-form-group">
            <label>Conduction Number</label>
            <input
              type="text"
              value={editAllocation.unitId}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, unitId: e.target.value })
              }
            />
          </div>

          {/* ------------------ BODY COLOR (MANUAL INPUT) ------------------ */}
          <div className="modal-form-group">
            <label>Body Color</label>
            <input
              type="text"
              value={editAllocation.bodyColor}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, bodyColor: e.target.value })
              }
            />
          </div>

          {/* ------------------ VARIATION (MANUAL INPUT) ------------------ */}
          <div className="modal-form-group">
            <label>Variation</label>
            <input
              type="text"
              value={editAllocation.variation}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, variation: e.target.value })
              }
            />
          </div>

          {/* ------------------ ASSIGNED DRIVER ------------------ */}
          <div className="modal-form-group">
            <label>Assigned Driver</label>
            <select
              value={editAllocation.assignedDriver}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, assignedDriver: e.target.value })
              }
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver.name}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* ------------------ STATUS ------------------ */}
          <div className="modal-form-group">
            <label>Status</label>
            <select
              value={editAllocation.status}
              onChange={(e) =>
                setEditAllocation({ ...editAllocation, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
            
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* ------------------ DATE ------------------ */}
<div className="modal-form-group force-width">
  <label>Date</label>
  <input
    className="modal-form-group force-width2"
    type="date"
    value={
      editAllocation.date
        ? editAllocation.date
        : "" // fallback if empty
    }
    onChange={(e) =>
      setEditAllocation({ ...editAllocation, date: e.target.value })
    }
  />
</div>


        </div>

        <div className="modal-buttons">
          <button
            className="create-btn1"
            onClick={() => handleUpdate(editAllocation._id)}
          >
            Save
          </button>
          <button className="cancel-btn1" onClick={() => setEditAllocation(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}




      </div>
    </div>
  );
};

export default DriverAllocation;
