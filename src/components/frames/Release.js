// Release.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";


import downloadIcon from "../icons/download.png";

const Release = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requests, setRequests] = useState([]);

  const [fullUser, setFullUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    phoneno: "",
    picture: "",
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ============================
  // FETCH RELEASE REQUESTS
  // ============================
  const fetchCompletedRequests = async () => {
    try {
      const res = await axios.get(
        "https://itrack-web-backend.onrender.com/api/getGoToRelease",
        { withCredentials: true }
      );
      console.log("Release Requests:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  // ============================
  // MARK AS RELEASED
  // ============================
  const handleMarkReleased = async (id) => {
    try {
      await axios.put(
        `https://itrack-web-backend.onrender.com/api/markReleased/${id}`,
        {},
        { withCredentials: true }
      );

      fetchCompletedRequests();
      alert("Vehicle successfully marked as released!");
    } catch (err) {
      console.log(err);
    }
  };

  // ============================
  // FAKE: Fetch user for header
  // ============================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("fullUser"));
    if (user) setFullUser(user);
  }, []);

  const handleProfileChange = () => {};

  const handleUpdateProfile = () => {};
  const handleChangePassword = () => {};

  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main">

        {/* ========== HEADER (Copied From Your Design) ========== */}
        <header
          className="header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h3 className="header-title1" style={{ marginLeft: 10 }}>
              Release Vehicles
            </h3>
          </div>

          {/* -------- Right Side User + Profile -------- */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0px",
            }}
          >
            {fullUser?.name && (
              <div
                className="loggedinuser"
                onClick={() => {
                  setProfileData({
                    name: fullUser.name,
                    phoneno: fullUser.phoneno,
                    picture: fullUser.picture || "",
                  });
                  setIsProfileModalOpen(true);
                }}
                style={{
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Welcome, {fullUser.name}
              </div>
            )}

            <div
              className="profile-wrapper"
              style={{ position: "relative", cursor: "pointer" }}
            >
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

              <input
                type="file"
                id="profilePicInput"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleProfileChange}
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

        {/* ==========================
                TABLE
        =========================== */}
        <div className="content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Conduction Number</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr className="header-spacer-row">
                  <td></td>
                </tr>

                {requests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.unitName}</td>
                    <td>{item.vehicleRegNo}</td>
                    <td>{item.service}</td>
                    <td>{item.status}</td>

                    <td>
                      <button
                        className="action-btn"
                        style={{
                          background: "#e7212bff",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: "6px",
                        }}
                        
                      >
                        Mark as Released
                      </button>
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                      No vehicles pending for release.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Release;
