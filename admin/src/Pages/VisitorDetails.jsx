import { API_BASE_URL } from "../config/api";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';

const VisitorDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(state);
  const [loading, setLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  
  if (!visitor) return <div className="p-3">No visitor data found</div>;

  const handleStatusUpdate = async (status, notes = "") => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/visitors/status/${visitor.id}`, { 
        status, 
        notes 
      });
      setVisitor(prev => ({ ...prev, status }));
      toast.success(`Visitor ${status} successfully`);
      setRejectModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fs-2 fw-bold">Visitor Registration Details</h5>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <tbody>
                <tr>
                  <th className="bg-light" style={{ width: "30%" }}>Full Name</th>
                  <td>{visitor.first_name} {visitor.last_name}</td>
                </tr>
                <tr>
                  <th className="bg-light">Email</th>
                  <td>{visitor.email || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Mobile</th>
                  <td>{visitor.mobile_number || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Company</th>
                  <td>{visitor.company_name || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Designation</th>
                  <td>{visitor.designation || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Address Line 1</th>
                  <td>{visitor.address1 || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Address Line 2 (Optional)</th>
                  <td>{visitor.address2 || "—"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Country</th>
                  <td>{visitor.country || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">State</th>
                  <td>{visitor.state || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">City</th>
                  <td>{visitor.city || "-"}</td>
                </tr>
                <tr>
                <th className="bg-light">Pincode</th>
                  <td>{visitor.pincode || "-"}</td>
                </tr>
                <tr>
                  <th className="bg-light">Status</th>
                  <td>
                    <span className={`badge ${
                      visitor.status === 'approved' ? 'bg-success' : 
                      visitor.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                    }`} style={{ fontSize: "13px" }}>
                      {visitor.status ? visitor.status.toUpperCase() : "PENDING"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="bg-light">Visitor Business Card</th>
                  <td>
                    {visitor.file_path ? (
                      visitor.file_name?.match(/\.(jpeg|jpg|png)$/i) ? (
                        <img
                          src={`${API_BASE_URL}/${visitor.file_path}`}
                          alt="Uploaded"
                          style={{ width: "380px", height: "280px", borderRadius: "6px", cursor: "pointer" }}
                          onClick={() =>
                            setPreviewImage(`${API_BASE_URL}/${visitor.file_path}`)
                          }
                        />
                      ) : visitor.file_name?.match(/\.pdf$/i) ? (
                        <iframe
                          src={`${API_BASE_URL}/${visitor.file_path}`}
                          title="PDF Preview"
                          style={{ width: "380px", height: "280px", border: "none" }}
                        />
                      ) : (
                        <a
                          href={`${API_BASE_URL}/${visitor.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {visitor.file_name}
                        </a>
                      )
                    ) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3 d-flex justify-content-center gap-3">
            {visitor.status !== "approved" && (
            <button className="btn btn-success px-4" onClick={() => handleStatusUpdate("approved")} disabled={loading}>
                {loading ? "Wait..." : "Approve"}
            </button>
            )}
            {visitor.status !== "rejected" && (
            <button className="btn btn-danger px-4" onClick={() => setRejectModalOpen(true)} disabled={loading}>
                Reject
            </button>
            )}
        </div>
    </div>

      {rejectModalOpen && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rejection Reason</h5>
                <button type="button" className="btn-close" onClick={() => setRejectModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <label className="mb-2 fw-bold">Add Notes:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRejectModalOpen(false)}>Cancel</button>
                <button 
                  className="btn btn-danger px-4" 
                  disabled={loading}
                  onClick={() => handleStatusUpdate("rejected", rejectionNotes)}
                >
                  {loading ? "Please wait..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.8)", zIndex: 1100 }}
          onClick={() => setPreviewImage(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorDetails;