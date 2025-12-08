import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/ServiceRequest.css";

const UnitAllocation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allocations, setAllocations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAllocation, setNewAllocation] = useState({
    unitName: "",
    unitId: "",
    bodyColor: "",
    variation: "",
    assignedTo: "" 
  });

  const [editAllocation, setEditAllocation] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAllocations();
    fetchDrivers();
    fetchAvailableUnits();
  }, []);

  // GET all allocations
  const fetchAllocations = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getUnitAllocation")
      .then(res => setAllocations(res.data))
      .catch(err => console.error(err));
  };

  // GET all Sales Agents
  const fetchDrivers = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getUsers")
      .then(res => {
        const driverList = res.data.filter(u => u.role?.toLowerCase() === "sales agent");
        setAgents(driverList);
      })
      .catch(err => console.error(err));
  };

  // GET available units from inventory
  const fetchAvailableUnits = () => {
    axios.get("https://itrack-web-backend.onrender.com/api/getStock")
      .then(res => {
        const units = res.data.filter(u =>
          u.status === "In Stockyard" || u.status === "Available"
        );
        setAvailableUnits(units);
      })
      .catch(err => console.error(err));
  };

  // CREATE allocation
  const handleCreateAllocation = () => {
    if (!newAllocation.unitId || !newAllocation.assignedTo) {
      alert("All fields are required!");
      return;
    }

    axios.post("https://itrack-web-backend.onrender.com/api/createUnitAllocation", newAllocation)
      .then(() => {
        fetchAllocations();
        setNewAllocation({
          unitName: "",
          unitId: "",
          bodyColor: "",
          variation: "",
          assignedTo: ""
        });
        setIsModalOpen(false);
        setCurrentPage(1);
      })
      .catch(err => console.error(err));
  };

  // UPDATE allocation
  const handleUpdateAllocation = (id) => {
    axios.put(`https://itrack-web-backend.onrender.com/api/updateUnitAllocation/${id}`, editAllocation)
      .then(() => {
        fetchAllocations();
        setEditAllocation(null);
      })
      .catch(err => console.error(err));
  };

  // DELETE allocation
  const handleDeleteAllocation = (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation?")) return;

    axios.delete(`https://itrack-web-backend.onrender.com/api/deleteUnitAllocation/${id}`)
      .then(() => {
        fetchAllocations();
        setCurrentPage(1);
      })
      .catch(err => console.error(err));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAllocations = allocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allocations.length / itemsPerPage);

  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        
        {/* Header */}
        <header className="header" style={{ display: "flex", alignItems: "center" }}>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h3 className="header-title1" style={{ marginLeft: 10 }}>Unit Allocation</h3>
        </header>

        {/* Add button */}
        <div className="user-management-header">
          <button className="create-btn" onClick={() => setIsModalOpen(true)}>
            + Allocate Unit
          </button>
        </div>

        {/* Table */}
        <div className="content">
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Conduction Number</th>
                  <th>Body Color</th>
                  <th>Variation</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentAllocations.map(alloc => (
                  <tr key={alloc._id}>
                    <td>{alloc.unitName}</td>
                    <td>{alloc.unitId}</td>
                    <td>{alloc.bodyColor}</td>
                    <td>{alloc.variation}</td>
                    <td>{alloc.assignedTo}</td>
                    <td>
                      <button className="action-btn" onClick={() => setEditAllocation(alloc)}>
                        Edit
                      </button>{' '}
                      <button className="action-btn" onClick={() => handleDeleteAllocation(alloc._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={i + 1 === currentPage ? "active-page" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
              </div>
            )}
          </div>
        </div>

       {/* Modal */}
{(isModalOpen || editAllocation) && (
  <div className="modal-overlay">
    <div className="modal2">
      <p className="modaltitle">
        {isModalOpen ? "Allocate Unit" : "Edit Allocation"}
      </p>
      <div className="modalline"></div>

      <div className="modal-content">
        <div className="modal-form">

          {/* ------------------ SELECT UNIT ------------------ */}
          <div className="modal-form-group">
            <label>
              Unit <span style={{ color: "red" }}>*</span>
            </label>

            <select
              value={
                isModalOpen ? newAllocation.unitId : editAllocation.unitId
              }
              onChange={(e) => {
                const selectedUnit = availableUnits.find(
                  (u) => u.unitId === e.target.value
                );

                if (selectedUnit) {
                  if (isModalOpen) {
                    setNewAllocation({
                      ...newAllocation,
                      unitName: selectedUnit.unitName,
                      unitId: selectedUnit.unitId,
                      bodyColor: selectedUnit.bodyColor,
                      variation: selectedUnit.variation,
                    });
                  } else {
                    setEditAllocation({
                      ...editAllocation,
                      unitName: selectedUnit.unitName,
                      unitId: selectedUnit.unitId,
                      bodyColor: selectedUnit.bodyColor,
                      variation: selectedUnit.variation,
                    });
                  }
                }
              }}
              required
            >
              <option value="">Select Unit</option>
              {availableUnits.map((unit) => (
                <option key={unit._id} value={unit.unitId}>
                  {unit.unitName} - {unit.unitId} ({unit.bodyColor})
                </option>
              ))}
            </select>
          </div>

          {/* ------------------ ASSIGN TO ------------------ */}
          <div className="modal-form-group">
            <label>
              Assign To <span style={{ color: "red" }}>*</span>
            </label>

            <select
              value={
                isModalOpen ? newAllocation.assignedTo : editAllocation.assignedTo
              }
              onChange={(e) => {
                const value = e.target.value;

                if (isModalOpen) {
                  setNewAllocation((prev) => ({
                    ...prev,
                    assignedTo: value,
                  }));
                } else {
                  setEditAllocation((prev) => ({
                    ...prev,
                    assignedTo: value,
                  }));
                }
              }}
              required
            >
              <option value="">Select Sales Agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ------------------ BUTTONS ------------------ */}
        <div className="modal-buttons">
          <button
            className="create-btn1"
            onClick={() =>
              isModalOpen
                ? handleCreateAllocation()
                : handleUpdateAllocation(editAllocation._id)
            }
          >
            {isModalOpen ? "Allocate" : "Save"}
          </button>

          <button
            className="cancel-btn1"
            onClick={() => {
              setIsModalOpen(false);
              setEditAllocation(null);
            }}
          >
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

export default UnitAllocation;
