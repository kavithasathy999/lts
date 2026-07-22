import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap"; 

function RegistrationDetails() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [data, setData] = useState(location.state); 
  const [notes, setNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const originalNotesRef = useRef(""); 

  useEffect(() => {
    if (data?.notes) {
      setNotes(data.notes);
      originalNotesRef.current = data.notes;
    }
  }, [data]);

  if (!data) return <p>No Data Found</p>;

  const saveNotes = () => {
    if (notes === originalNotesRef.current) return; 
    axios.put(`${API_BASE_URL}/api/save-notes/${data.id}`, {
      notes: notes
    })
      .then(() => {
        toast.success("Notes saved");
        originalNotesRef.current = notes; 
      })
      .catch(() => toast.error("Error saving notes"));
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    axios.put(
      `${API_BASE_URL}/api/confirm/${data.id}`,
      {
        exhibitors: [] 
      }
    )
    .then((res) => {
      toast.success("Confirmed & Mail Sent");
      if (res.data?.data) {
        setData(res.data.data);
      } else {
        setData({ ...data, status: "Confirmed" });
      }
    })
    .catch((err) => {
      console.log(err.response?.data || err);
      toast.error("Error confirming");
    })
    .finally(() => setIsConfirming(false));
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    setIsRejecting(true);
    axios.put(`${API_BASE_URL}/api/reject/${data.id}`, {
      reason: rejectionReason
    })
    .then(() => {
      toast.success("Rejected & Mail Sent");
      setShowRejectModal(false);
      setData({ ...data, status: "Rejected", comments: rejectionReason });
      setRejectionReason("");
    })
    .catch(() => toast.error("Error rejecting"))
    .finally(() => {
      setIsRejecting(false);
    });
  };

  return (
    <div className="container" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="fw-bold mb-3">Exhibitor Registration Details</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
        </div>
      <div className="card shadow-sm border-0">
        <div className="table-responsive" style={{ border: "1px solid #dee2e6" }}>
          <table className="table mb-0">
            <tbody>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Contact Person Name</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.name}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Number of Exhibitors</th>
                <td>{data.exhibitor_count !== undefined ? data.exhibitor_count + 1 : 1}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Email</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.email}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Mobile</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>
                  {data.mobile
                    ? data.mobile.replace(/^(\+\d{1,2})(\d{10})$/, "$1 $2")
                    : ""}
                </td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Company</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.company}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>GST</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.gst || "—"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Zone</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.zone_name}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Selected Stall</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.stall_no}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Stall Cost</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>₹{data.stall_price || 0}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Address Line 1</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.address1 || "-"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Address Line 2</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.address2 || "—"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Country</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.country || "-"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>State</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.state || "-"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>City</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.city || "-"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Pincode</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>{data.pincode || "-"}</td>
              </tr>
              <tr>
                <th style={{ background: "#f8f9fa", width: "30%" }}>Status</th>
                <td style={{ borderLeft: "1px solid #dee2e6" }}>
                  <span
                    className={`badge ${
                      data.status === "Confirmed"
                        ? "bg-success"
                        : data.status === "Rejected"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {data.status}
                  </span>
                </td>
              </tr>
              {(data.status === "Rejected" || data.comments) && (
                <tr>
                  <th style={{ background: "#f8f9fa", width: "30%" }}>Comments</th>
                  <td style={{ borderLeft: "1px solid #dee2e6", color: "#dc2626", fontWeight: "600" }}>
                    {data.comments || data.reject_reason || "—"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-top">
          <label className="mb-2 fw-bold">Internal Admin Notes: (Auto Save)</label>
          <textarea
            className="form-control"
            placeholder="Add Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          ></textarea>
        </div>
        <div className="d-flex justify-content-center gap-3 p-3 border-top">
          {(data.status === "Pending" || data.status === "Waiting" || data.status === "Rejected") && (
            <button 
              className="btn btn-success px-4"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Please wait..." : "Approve"}
            </button>
          )}
          {(data.status === "Pending" || data.status === "Waiting" || data.status === "Confirmed") && (
            <button 
              className="btn btn-danger px-4"
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </button>
          )}
        </div>
      </div>

      <Modal show={showRejectModal} onHide={() => !isRejecting && setShowRejectModal(false)} centered>
        <Modal.Header closeButton={!isRejecting}>
          <Modal.Title>Rejection Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Please provide a reason for rejection:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason..."
              disabled={isRejecting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={isRejecting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={isRejecting}>
            {isRejecting ? "Please wait..." : "Reject & Send Email"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer autoClose={1500} />
    </div>
  );
}

export default RegistrationDetails;