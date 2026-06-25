import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SponsorUpload() {
  const [files, setFiles] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [type, setType] = useState("event");
  const [preview, setPreview] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const apiBase = API_BASE_URL || "";
  const sponsorTitle = {
    event: "Title Sponsors",
    associate: "Co-Sponsors",
    our: "Supported By"
  };

  useEffect(() => {
    fetchSponsors();
    setCurrentPage(1);
  }, [type]);

  const totalPages = Math.ceil(sponsors.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSponsors = sponsors.slice(indexOfFirstItem, indexOfLastItem);

  const fetchSponsors = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/sponsors/${type}`);
      setSponsors(res.data.sponsors || []);
    } catch (err) {
      toast.error("Failed to fetch sponsors");
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;
    const previews = selected.map((file) => URL.createObjectURL(file));
    setFiles(selected);
    setPreview(previews);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("type", type);
    const toastId = toast.loading("Uploading...");
    try {
      await axios.post(`${apiBase}/api/sponsors`, formData);
      toast.update(toastId, { render: "Uploaded successfully!", type: "success", isLoading: false, autoClose: 1500 });
      setFiles([]);
      setPreview([]);
      fetchSponsors();
    } catch (err) {
      toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 1500 });
    }
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/api/sponsors/${id}`);
      toast.success("Sponsor deleted", { position: "top-right" });
      fetchSponsors();
    } catch {
      toast.error("Failed to delete", { position: "top-right" });
    }
  };

  const deleteSponsor = (id) => {
    setDeleteId(id);
  };

  return (
    <div className="sponsor-upload-page" style={{ 
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: "#fbfaff",
      minHeight: "100vh",
      padding: "30px",
      boxSizing: "border-box",
      maxWidth: "100%",
      overflowX: "hidden" 
    }}>
      <ToastContainer autoClose={1500} />

      <style>{`
        .custom-flex-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 0;
          width: 100%;
        }
        .custom-flex-col {
          flex: 1;
          min-width: 300px;
        }
        .page-header { padding-left: 20px; margin-bottom: 30px; }
        .sponsor-card { border-radius: 20px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.04); padding: 25px; margin-bottom: 30px; }
        .upload-box { background: #faf9ff; border: 2px dashed #e0e0e0; border-radius: 15px; padding: 25px; text-align: center; cursor: pointer; transition: 0.3s; }
        .upload-box:hover { border-color: #593983; background: #f3f0f7; }
        .sponsor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 20px; }
        .sponsor-item { background: #fff; padding: 10px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
        .btn-purple { background: #593983; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; width: 100%; }
      `}</style>

      <div className="mb-4 d-flex justify-content-between align-items-center" style={{ paddingLeft: "15px" }}>
        <h2 className="fw-bold m-0 banner-heading" style={{ color: "#2d3436" }}>
          Sponsors Management
        </h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>
      <div className="sponsor-card">
        <div className="custom-flex-row align-items-end">
          <div className="custom-flex-col">
            <label className="small fw-bold text-dark text-uppercase mb-2 d-block">Sponsor Category</label>
            <select
              className="form-select border-0 bg-light py-2"
              style={{ borderRadius: "10px", fontWeight: "400" }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="event">Title Sponsors</option>
              <option value="associate">Co-Sponsors</option>
              <option value="our">Supported By</option>
            </select>
          </div>
          <div className="custom-flex-col">
            <input type="file" id="fileUpload" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
            <label htmlFor="fileUpload" className="upload-box d-block m-0">
              <i className="fas fa-images mb-1" style={{ fontSize: '1.2rem', color: '#593983' }}></i>
              <p className="m-0 small fw-bold text-muted">Click to select sponsor logo images</p>
              <p className="small text-muted mb-0">PNG / JPG recommended · any size · under 5 MB</p>
            </label>
          </div>
        </div>
        {preview.length > 0 && (
          <div className="mt-4 p-3 rounded bg-light border">
            <p className="small fw-bold mb-2">Selected Preview:</p>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {preview.map((src, i) => (
                <img key={i} src={src} width={60} height={60} alt="preview" style={{ borderRadius: "8px", objectFit: 'cover' }} />
              ))}
            </div>
            <button className="btn-purple" onClick={handleUpload}>
              Upload {preview.length} Image(s)
            </button>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">
          <span style={{ color: '#2D3436' }}>{sponsorTitle[type]}</span>
        </h4>
        <span className="badge bg-white text-dark border px-3 py-2" style={{ borderRadius: "10px" }}>{sponsors.length} Logos</span>
      </div>
      <div className="sponsor-grid">
        {currentSponsors.length > 0 ? (
          currentSponsors.map((sp) => (
            <div key={sp.id} className="sponsor-item">
              <img src={sp.imageUrl} width={140} height={140} alt="Sponsor" style={{ borderRadius: "8px", objectFit: 'contain' }} />
              <button
                className="btn btn-link text-danger btn-sm mt-2 d-block mx-auto text-decoration-none fw-bold"
                onClick={() => deleteSponsor(sp.id)}
              >
                <i className="fas fa-trash-alt me-1"></i> Delete
              </button>
            </div>
          ))
        ) : (
          <div className="w-100 py-5 text-center text-muted border rounded bg-white" style={{ gridColumn: "1 / -1" }}>
            <p className="m-0">No sponsors found in this category.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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


      {deleteId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "50px",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              width: "450px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "slideDown 0.3s ease-out"
            }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="m-0 fw-bold" style={{ color: "#2d3436", fontSize: "1.1rem" }}>
                Are you sure you want to delete?
              </h5>
              <button
                className="btn-close"
                style={{ cursor: "pointer", fontSize: "0.8rem" }}
                onClick={() => setDeleteId(null)}
              ></button>
            </div>
            <div className="p-3 d-flex justify-content-end gap-2 border-top bg-light-subtle">
              <button
                className="btn fw-bold px-4"
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn fw-bold px-4"
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
                onClick={() => { confirmDelete(deleteId); setDeleteId(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SponsorUpload;
