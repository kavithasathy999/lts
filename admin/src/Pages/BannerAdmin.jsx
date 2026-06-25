import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {useNavigate} from 'react-router-dom';

function BannerAdmin() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    time: ""
  });

  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/banner`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data?.eventInfo?.title || "",
          location: data?.eventInfo?.location || "",
          date: data?.eventInfo?.date || "",
          time: data?.eventInfo?.time || ""
        });
        setPreview(data?.slides || []);
      })
      .catch((err) => console.log(err));
  }, []);

  const totalPages = Math.ceil(preview.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPreview = preview.slice(indexOfFirstItem, indexOfLastItem);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      toast.info(`${files.length} image(s) selected`);
    }
    setNewImages((prev) => [...prev, ...files]);
    const previewUrls = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreview((prev) => [...prev, ...previewUrls]);
  };

  const handleDelete = async (img, index) => {
    try {
      if (img.id) {
        await fetch(`${API_BASE_URL}/api/banner/${img.id}`, {
          method: "DELETE"
        });
        toast.info("Image deleted successfully");
      } else if (img.file) {
        setNewImages((prev) => prev.filter((f) => f !== img.file));
        toast.info("Removed from new uploads");
      }
      setPreview((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete image");
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("location", form.location);
    formData.append("date", form.date);
    formData.append("time", form.time);
    newImages.forEach((img) => {
      formData.append("slides", img);
    });
    try {
      const res = await fetch(`${API_BASE_URL}/api/banner`, {
        method: "POST",
        body: formData
      });
      await res.json();
      toast.success("Banner updated successfully");
      setIsEditing(false);
      setNewImages([]);
      fetch(`${API_BASE_URL}/api/banner`)
        .then(res => res.json())
        .then(data => setPreview(data?.slides || []));
        
    } catch (err) {
      console.log(err);
      toast.error("Error saving data");
    }
  };

  return (
    <div className="home-page"
      style={{ 
      fontFamily: "'Montserrat', sans-serif", 
      backgroundColor: "#fbfaff", 
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden",
      padding: "40px" 
    }}>
      <ToastContainer autoClose={1500} />
      
      <div className="mb-4 d-flex justify-content-between align-items-center" style={{ paddingLeft: "15px" }}>
        <h2 className="fw-bold m-0 banner-heading" style={{ color: "#2d3436" }}>
          Homepage Management
        </h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="card p-4 border-0 shadow-sm" style={{ borderRadius: "20px" }}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="small fw-bold text-dark text-uppercase mb-1">Event Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter Event Title"
              className="form-control px-3"
              style={{ 
                backgroundColor: isEditing ? "#fff" : "#f8f9fa",
                borderRadius: "10px",
                height: "45px",
              }}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="small fw-bold text-dark text-uppercase mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Event Location"
              className="form-control px-3"
              style={{ 
                backgroundColor: isEditing ? "#fff" : "#f8f9fa",
                borderRadius: "10px",
                height: "45px"
              }}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="small fw-bold text-dark text-uppercase mb-1">Date</label>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Oct 20 - 22, 2024"
              className="form-control px-3"
              style={{ 
                backgroundColor: isEditing ? "#fff" : "#f8f9fa",
                borderRadius: "10px",
                height: "45px"
              }}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="small fw-bold text-dark text-uppercase mb-1">Time</label>
            <input
              name="time"
              value={form.time}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. 10:00 AM - 08:00 PM"
              className="form-control px-3"
              style={{ 
                backgroundColor: isEditing ? "#fff" : "#f8f9fa",
                borderRadius: "10px",
                height: "45px",
              }}
            />
          </div>
        </div>

        <div className="mt-2 mb-4 d-flex gap-2">
          {!isEditing ? (
            <button
              className="btn text-white px-4"
              style={{ backgroundColor: "#593983", borderRadius: "10px", fontWeight: "600" }}
              onClick={() => setIsEditing(true)}
            >
              <i className="fas fa-edit me-2"></i> Edit Details
            </button>
          ) : (
            <>
              <button 
                className="btn btn-success px-4" 
                style={{ borderRadius: "10px", fontWeight: "600" }} 
                onClick={handleSave}
              >
                <i className="fas fa-save me-2"></i> Save Changes
              </button>

              <button
                className="btn btn-light px-4 border"
                style={{ borderRadius: "10px", fontWeight: "600" }}
                onClick={() => {
                  setIsEditing(false);
                  toast.warning("Edit cancelled");
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <hr className="my-4 text-muted opacity-25" />

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0" style={{ color: "#2d3436" }}>Banner Images</h5>
            {newImages.length > 0 && (
              <button 
                className="btn btn-primary px-4 shadow-sm"
                style={{ borderRadius: "10px", fontWeight: "600", backgroundColor: "#007bff" }}
                onClick={handleSave}
              >
                <i className="fas fa-cloud-upload-alt me-2"></i> Upload Image
              </button>
            )}
          </div>

          <div className="upload-dropzone p-4 text-center border-dashed" 
               style={{ 
                 border: "2px dashed #dee2e6", 
                 borderRadius: "15px", 
                 backgroundColor: "#fcfcfc",
                 cursor: "pointer" 
               }}
               onClick={() => document.getElementById('fileInput').click()}
          >
            <i className="fas fa-images fa-2x mb-2 text-muted"></i>
            <p className="small text-muted mb-0">Click here to select images for the banner slider</p>
            <p className="small text-muted mb-0">A file size below 5 MB is preferred</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px"
          }}
        >
          {currentPreview.map((img, index) => {
            const actualIndex = indexOfFirstItem + index;
            return (
              <div key={actualIndex} className="text-center p-2 border rounded shadow-sm bg-light" style={{ borderRadius: "15px", position: "relative" }}>            
                {/* STATUS BADGE */}
                {!img.id && (
                  <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2" style={{ zIndex: 2 }}>Selected</span>
                )}        
                <img
                  src={img.image || img.preview}
                  width="100%"
                  height="120"
                  style={{ objectFit: "cover", borderRadius: "10px" }}
                  alt="slide"
                />
                <button
                  className="btn btn-outline-danger btn-sm mt-3 w-100 fw-bold border-0"
                  onClick={() => handleDelete(img, actualIndex)}
                >
                  <i className="fas fa-trash-alt me-2"></i> Delete
                </button>
              </div>
            );
          })}
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
      </div>
    </div>
  );
}

export default BannerAdmin;
