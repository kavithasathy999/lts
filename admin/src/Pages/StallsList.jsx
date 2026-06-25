import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';

function StallsList() {
  const [stalls, setStalls] = useState([]);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedStallId, setSelectedStallId] = useState(null);
  const [sizeInput, setSizeInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const loadStalls = () => {
    axios
      .get(`${API_BASE_URL}/admin/stall-data`)
      .then((res) => setStalls(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadStalls();
  }, []);

  const totalPages = Math.ceil(stalls.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStalls = stalls.slice(indexOfFirstItem, indexOfLastItem);

  const updateStatus = (id, status) => {
    axios
      .put(`${API_BASE_URL}/admin/update-stall-status/${id}`, { status })
      .then(() => {
        loadStalls();
        if (status === "Blocked") {
          toast.warning("Stall Blocked Successfully");
        } else if (status === "Assigned") {
          toast.success("Stall Assigned Successfully");
        } else if (status === "Available") {
          toast.success("Stall Marked as Available");
        }
      })
    .catch((err) => console.log(err));
  };

  const handleSizeUpdate = async () => {
    try {
      const updatedSize = sizeInput.trim() === "" ? "" : sizeInput;
      await axios.put(
        `${API_BASE_URL}/admin/update-stall-size/${selectedStallId}`,
        { size: updatedSize }
      );
      toast.success("Stall Size Updated Successfully");
      setShowSizeModal(false);
      loadStalls(); 
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const releaseStall = async (stallId) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/release-stall/${stallId}`);
      toast.info("Stall Released Successfully");
      loadStalls();
    } catch (err) {
      console.error("Error releasing stall:", err);
    }
  };

  const isActionDisabled = (stall) => stall.status === "Blocked";

  return (
    <div className="container mt-4 stalls-manage" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <h2 className="text-dark fw-bold m-0">Stalls List</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>
      <table className="table table-bordered table-striped text-center">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Zone</th>
            <th>Stall</th>
            <th>Size</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStalls.map((s, index) => (
            <tr key={s.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{s.zone_name}</td>
              <td>{s.stall_no}</td>
              <td>
                {s.size || ""}
                <i
                  className="bi bi-pencil-square ms-2 text-primary fs-6"
                  style={{ cursor: "pointer" }}
                  title="Edit Size"
                  onClick={() => {
                    setSelectedStallId(s.id);
                    setSizeInput(s.size || "");
                    setShowSizeModal(true);
                  }}
                ></i>
              </td>
              <td>
                <span
                  className={`fs-6 badge ${
                    s.status === "Available"
                      ? "bg-success"
                      : s.status === "Assigned"
                      ? "bg-primary"
                      : "bg-dark"
                  }`}
                >
                  {s.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-success btn-sm me-1 fs-6"
                  disabled={isActionDisabled(s)}
                  onClick={() => updateStatus(s.id, "Available")}
                >
                  Available
                </button>
                <button
                  className="btn btn-primary btn-sm me-1 fs-6"
                  disabled={isActionDisabled(s)}
                  onClick={() => updateStatus(s.id, "Assigned")}
                >
                  Assign
                </button>
                <button
                  className="btn btn-dark btn-sm me-1 fs-6"
                  disabled={isActionDisabled(s)}
                  onClick={() => updateStatus(s.id, "Blocked")}
                >
                  Block
                </button>
                <button
                  className="btn btn-warning btn-sm fs-6"
                  onClick={() => releaseStall(s.id)}
                >
                  Release
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

      {showSizeModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3 position-relative">
              <button
                onClick={() => setShowSizeModal(false)}
                style={{
                  position: "absolute",
                  color: "red",
                  top: "10px",
                  right: "10px",
                  border: "none",
                  background: "transparent",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>
              <h5 className="mb-3">Edit Stall Size</h5>
              <input
                className="form-control"
                placeholder="Ex: 10x10"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
              />
              <div className="mt-3 text-end">
                <button className="btn btn-danger me-2" onClick={() => setShowSizeModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleSizeUpdate}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer autoClose={1500} />
    </div>
  );
}

export default StallsList;