import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminManageStalls() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedStalls, setBookedStalls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [inputValue, setInputValue] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteBooked, setDeleteBooked] = useState(false);
  const [startNumber, setStartNumber] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadZones = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/admin/sections`)
      .then((res) => {
        setZones(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadBookedStalls = () => {
    axios.get(`${API_BASE_URL}/api/registrations`)
      .then(res => {
        const stalls = res.data.map(r => ({
          key: `${r.zone}-${r.stall_no}`,
          status: r.status,
          waiting: r.waiting_list === 1
        }));
        setBookedStalls(stalls);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadZones();
    loadBookedStalls();
    const handleStorage = () => {
      loadBookedStalls();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const totalPages = Math.ceil(zones.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentZones = zones.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async () => {
    const count = parseInt(inputValue);
    if (!inputValue || (modalType === "stall" && count <= 0)) {
      toast.warn("Please enter a valid amount");
      return;
    }
    try {
      if (modalType === "zone") {
        await axios.post(`${API_BASE_URL}/admin/add-section`, {
          name: inputValue
        });
        toast.success(`Zone "${inputValue}" created!`);
      }
      if (modalType === "stall") {
        const currentZone = zones.find(z => z.id === selectedZoneId);
        const startFrom = parseInt(startNumber);
        if (!startFrom || startFrom <= 0) {
          toast.warn("Please enter a valid starting stall number");
          return;
        }
        const addPromises = [];
        for (let i = 0; i < count; i++) {
          addPromises.push(
            axios.post(`${API_BASE_URL}/admin/add-stall`, {
              sectionId: selectedZoneId,
              stall_no: startFrom + i
            })
          );
        }
        await Promise.all(addPromises);
        toast.success(
          `Successfully added stalls ${startFrom} to ${startFrom + count - 1} in Zone ${currentZone.name}`
        );
      }
      setShowModal(false);
      setInputValue("");
      setStartNumber("");
      loadZones();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    }
  };

  const openDeleteModal = (type, id, isBooked = false) => {
    if (type === "stall" && isBooked) {
      toast.info("Cannot delete booked stall", { position: "top-right" });
      return;
    }
    setDeleteType(type);
    setDeleteId(id);
    setDeleteBooked(isBooked);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === "zone") {
        await axios.delete(`${API_BASE_URL}/admin/delete-section/${deleteId}`);
        toast.error("Zone deleted successfully!", { position: "top-right" });
      }
      if (deleteType === "stall") {
        await axios.delete(`${API_BASE_URL}/admin/delete-stall/${deleteId}`);
        toast.success("Stall deleted successfully!", { position: "top-right" });
      }
      setShowDeleteModal(false);
      loadZones();
    } catch (err) {
      toast.error("Failed to delete", { position: "top-right" });
    }
  };

  return (
    <div className="admin-manage-stalls-container" style={{ 
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: "#fbfaff",
      minHeight: "100vh",
      padding: "40px",
      flex: "1 1 0", 
      minWidth: 0,   
      maxWidth: "100%",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
      <ToastContainer autoClose={1500} />
      <style>{`
        .manage-stalls-title { font-weight: 700; color: #2d3436; padding-left: 15px; margin-bottom: 30px; }
        
        .zone-card { 
          border: none !important; 
          border-radius: 20px; 
          background: #ffffff; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.04); 
          transition: all 0.3s ease; 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          min-width: 0;
        }
        
        .zone-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(89, 57, 131, 0.1) !important; }
        
        .stall-grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr); 
          gap: 10px;
          padding: 20px;
        }

        .stall-item { 
          font-size: 11px; 
          font-weight: 600; 
          border-radius: 10px; 
          padding: 6px 4px; 
          background: #f8f9fa; 
          border: 1px solid #edf2f7; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: border-color 0.2s; 
          white-space: nowrap;
        }

        .stall-item:hover { border-color: #593983; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; flex-shrink: 0; }   
        
        .btn-add-primary { background-color: #593983; border: none; border-radius: 12px; padding: 12px 25px; font-weight: 600; color: white; transition: opacity 0.2s; }
        .btn-add-primary:hover { opacity: 0.9; color: white; }
        
        .zone-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 350px), 1fr)); 
          gap: 25px; 
          width: 100%;
        }
        
        .zone-grid-item { width: 100%; min-width: 0; }
        .sidebar-safe-row { margin: 0 !important; width: 100%; }
      `}</style>
      
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h2 className="manage-stalls-title m-0">
          Manage Zones & Stalls
        </h2>
        <div
          className="d-flex align-items-center gap-3 mt-2 ms-3"
          style={{ fontSize: "14px", fontWeight: "600" }}
        >
          <div className="d-flex align-items-center gap-1">
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#1cc88a",
                display: "inline-block"
              }}
            ></span>
            <span>Available</span>
          </div>

          <div className="d-flex align-items-center gap-1">
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#e74a3b",
                display: "inline-block"
              }}
            ></span>
            <span>Booked</span>
          </div>

          <div className="d-flex align-items-center gap-1">
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#2d3436",
                display: "inline-block"
              }}
            ></span>
            <span>Blocked</span>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
          <button
            className="btn-add-primary shadow-sm"
            onClick={() => {
              setModalType("zone");
              setShowModal(true);
              setInputValue("");
            }}
          >
            <i className="fas fa-plus me-2"></i> Add Zone
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <>
          <div className="zone-grid sidebar-safe-row">
          {currentZones.map((zone) => (
          <div className="zone-grid-item" key={zone.id}>
            <div className="card zone-card">
              <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <span className="fw-bold" style={{ fontSize: "1.1rem" }}>Zone {zone.name}</span>
                <button
                  className="btn btn-sm text-danger border-0 p-2"
                  onClick={() => openDeleteModal("zone", zone.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <div className="stall-grid-container">
                {zone.stalls
                  .slice() 
                  .sort((a, b) => parseInt(a.stall_no) - parseInt(b.stall_no)) 
                  .map((stall) => {
                    const stallKey = `${zone.id}-${stall.stall_no}`; 
                    const stallData = bookedStalls.find(s => s.key === stallKey);
                      console.log("Booked:", bookedStalls);
                      console.log("Checking:", stallKey, stallData);
                    const isBooked = stallData?.status === "Confirmed";
                    let dotColor = "#1cc88a"; 
                    if (stall.status === "Blocked") {
                      dotColor = "#2d3436";
                    } else if (stallData?.status === "Confirmed") {
                      dotColor = "#e74a3b"; 
                    } else if (stallData?.waiting || stallData?.status === "Waiting") {
                      dotColor = "#ffc107"; 
                    }
                    
                    return (
                      <div key={stall.id} className="stall-item shadow-sm">
                        <span className="status-dot" style={{ backgroundColor: dotColor }}></span>
                        S{stall.stall_no}
                        <button
                          className="btn btn-link text-muted p-0 ms-1 text-decoration-none"
                          style={{ fontSize: "9px" }}
                          onClick={() => openDeleteModal("stall", stall.id, isBooked)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    );
                  })}
              </div>
              <div className="card-footer bg-white border-0 pb-4 px-4 mt-auto">
                <button
                  className="btn btn-outline-success w-100 fw-bold py-2"
                  style={{ borderRadius: "10px", fontSize: "13px" }}
                  onClick={() => {
                    setModalType("stall");
                    setSelectedZoneId(zone.id);
                    setShowModal(true);
                    setInputValue("");
                  }}
                >
                  + Add Stall
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4 mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </button>
            <span className="small fw-bold text-dark mx-2">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-3" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="fw-bold m-0">
                  {modalType === "zone" ? "Create New Zone" : "Create New Stall"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
             <div className="modal-body">
                <label className="text-muted small mb-2 fw-bold text-uppercase">
                  {modalType === "zone" ? "Zone Name" : "How many stalls to add?"}
                </label>
                {modalType === "zone" ? (
                  <input
                    className="form-control py-2"
                    style={{ borderRadius: "10px" }}
                    placeholder="e.g. A, B"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                ) : (
                  <div>
                    <label className="text-muted small mb-2 fw-bold text-uppercase">
                      Starting Stall Number
                    </label>
                    <input
                      className="form-control text-center fw-bold mb-3"
                      style={{ height: "45px", borderRadius: "10px" }}
                      type="number"
                      min="1"
                      placeholder="e.g. 16"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                    />
                    <label className="text-muted small mb-2 fw-bold text-uppercase">
                      Number Of Stalls To Create
                    </label>
                    <div className="input-group d-flex align-items-center justify-content-center">
                      <button 
                        className="btn btn-outline-secondary px-3" 
                        style={{ borderRadius: "10px 0 0 10px", height: "45px" }}
                        type="button"
                        onClick={() => setInputValue(prev => Math.max(1, (parseInt(prev) || 1) - 1))}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input
                        className="form-control text-center fw-bold"
                        style={{ maxWidth: "100px", height: "45px", borderLeft: "none", borderRight: "none" }}
                        type="number"
                        min="1"
                        value={inputValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseInt(val) >= 0) {
                            setInputValue(val);
                          }
                        }}
                      />
                      <button 
                        className="btn btn-primary px-3" 
                        style={{ backgroundColor: "#593983", border: "none", borderRadius: "0 10px 10px 0", height: "45px" }}
                        type="button"
                        onClick={() => setInputValue(prev => (parseInt(prev) || 0) + 1)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <p className="text-center text-muted small mt-2">
                      Example: Start 16 + Create 5 → 16,17,18,19,20
                    </p>
                  </div>
                )}
                {modalType === "stall" && (
                  <p className="text-center text-muted small mt-2">
                    Type a number or use the buttons
                  </p>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light px-4" style={{ borderRadius: "10px" }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn text-white px-4" style={{ backgroundColor: "#593983", borderRadius: "10px" }} onClick={handleSubmit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4" style={{ borderRadius: "20px" }}>
              <div className="text-center mb-3">
                <i className="fas fa-exclamation-triangle text-danger fs-1"></i>
              </div>
              <h5 className="text-center fw-bold">Are you sure?</h5>
              <p className="text-center text-muted">
                This action cannot be undone. You are about to delete this {deleteType}.
              </p>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-light w-100 py-2" style={{ borderRadius: "10px" }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger w-100 py-2" style={{ borderRadius: "10px" }} onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageStalls;