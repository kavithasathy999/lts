import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const DestinationsTextAdmin = () => {
  const [paragraph, setParagraph] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const containerStyle = {
    fontFamily: "'Montserrat', sans-serif",
    color: "#333",
    padding: "20px",
    width: "100%",
    maxWidth: "calc(100vw - 350px)", 
    minWidth: "0",
    flex: "1 1 auto", 
    display: "block",
    boxSizing: "border-box",
    overflowX: "auto", 
  };

  const cardStyle = {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
    backgroundColor: "#fff"
  };

  const headerStyle = {
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "1.5rem"
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/destination-text`)
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph || ""));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/destination-images`)
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      toast.info("Please select at least one image");
      return;
    }
    if (images.length + selectedImages.length > 12) {
      toast.error("Only 12 images can be uploaded.");
      return;
    }
    const formData = new FormData();
    selectedImages.forEach((img) => formData.append("images", img));
    formData.append("descriptions", JSON.stringify(imageDescriptions));
    const res = await fetch(`${API_BASE_URL}/api/destination-images`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    toast.success(data.message);
    fetch(`${API_BASE_URL}/api/destination-images`)
      .then((res) => res.json())
      .then((data) => setImages(data));
    setSelectedImages([]);
    setImageDescriptions([]);
  };

  const deleteImage = (id) => {
    setDeleteId(id);
  };

  const updateParagraph = async () => {
    const res = await fetch(`${API_BASE_URL}/api/destination-text`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paragraph }),
    });
    const data = await res.json();
    toast.success(data.message);
  };

  const handleImageSelection = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 12) {
      toast.error("Only 12 images can be uploaded.");
      e.target.value = "";
      return;
    }
    const validImages = [];
    const descriptions = [];
    for (const file of files) {
      try {
        const bitmap = await createImageBitmap(file);
        const width = bitmap.width;
        const height = bitmap.height;
        if (Math.abs(width - 3342) <= 10 && Math.abs(height - 2131) <= 10) {
          validImages.push(file);
          descriptions.push("");
        } else {
          toast.warn(`Corresponding image is not exact size, but uploaded`);
          validImages.push(file); 
          descriptions.push("");
        }
      } catch (err) {
        console.error("Image read error:", err);
        toast.error(`Failed to process "${file.name}"`);
      }
    }
    setSelectedImages(validImages);
    setImageDescriptions(descriptions);
  };

  return (
    <div className="destinations-admin-page" style={containerStyle}>
      <ToastContainer position="top-right" autoClose={1500} />
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
          .destinations-admin-page .row { margin: 0 !important; width: 100% !important; }
          .destinations-admin-page .container-fluid { padding: 0 !important; }
        `}
      </style>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-2 w-100" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <h2 className="text-dark fw-bold m-0">Destinations Configuration</h2>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
        </div>
        <div className="mb-5">
          <textarea
            className="form-control"
            rows="6"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            style={{ borderRadius: "8px", padding: "15px", border: "1px solid #ddd", width: "100%" }}
          />
          <button 
            className="btn btn-success mt-3" 
            onClick={updateParagraph}
            style={{ fontWeight: "600", padding: "10px 25px", borderRadius: "8px" }}
          >
            Update Paragraph
          </button>
        </div>

        <hr />

        <div className="mt-5">
          <h3 style={{ ...headerStyle, fontSize: "1.5rem" }}>Upload Destination Images</h3>
          <p className="text-dark" style={{ fontSize: "0.9rem" }}>Required resolution: (3342 × 2131 px) <p className="small text-muted mb-0">A file size below 5 MB is preferred</p></p>
          <input
            type="file"
            className="form-control mt-2"
            multiple
            accept="image/*"
            onChange={handleImageSelection}
            style={{ borderRadius: "8px", maxWidth: "100%" }}
          />
          <button 
            className="btn btn-primary mt-3" 
            onClick={uploadImages}
            style={{ fontWeight: "600", padding: "10px 25px", borderRadius: "8px", backgroundColor: "#007bff" }}
          >
            Upload Image
          </button>
        </div>
        <div className="mt-5">
          <h3 style={{ ...headerStyle, fontSize: "1.5rem" }}>Uploaded Images</h3>
          <div className="row mt-3 g-4"> 
            {images.map((img) => (
              <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={img.id}>
                <div className="card h-100 p-3" style={cardStyle}>
                  <img
                    src={`${API_BASE_URL}${img.image_url}`}
                    className="card-img-top"
                    alt="Destination"
                    style={{ height: "180px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div className="card-body px-0 pb-0">
                    <textarea
                      className="form-control mt-2"
                      rows="2"
                      placeholder="Enter description"
                      value={img.description || ""}
                      onChange={(e) => {
                        const updated = images.map((i) =>
                          i.id === img.id ? { ...i, description: e.target.value } : i
                        );
                        setImages(updated);
                      }}
                      style={{ fontSize: "14px", borderRadius: "6px" }}
                    />
                    <div className="d-grid gap-2 mt-3">
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#198754", color: "#ffffff", fontWeight: "600", borderRadius: "6px" }}
                        onClick={async () => {
                          await fetch(`${API_BASE_URL}/api/destination-images/${img.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ description: img.description }),
                          });
                          toast.success("Description Saved");
                        }}
                      >
                        Save Description
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        style={{ fontWeight: "600", borderRadius: "6px" }}
                        onClick={() => deleteImage(img.id)}
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
              overflow: "hidden"
            }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="m-0 fw-bold" style={{ fontSize: "1.1rem" }}>
                Delete Image?
              </h5>
              <button
                className="btn-close"
                onClick={() => setDeleteId(null)}
              ></button>
            </div>
            <div className="p-3">
              <p style={{ fontSize: "14px", color: "#666" }}>
                Are you sure you want to delete this image? This action cannot be undone.
              </p>
            </div>
            <div className="p-3 d-flex justify-content-end gap-2 border-top bg-light-subtle">
              <button
                className="btn btn-secondary btn-sm px-4 fw-bold"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm px-4 fw-bold"
                onClick={async () => {
                  const res = await fetch(
                    `${API_BASE_URL}/api/destination-images/${deleteId}`,
                    { method: "DELETE" }
                  );
                  const result = await res.json();
                  setImages(images.filter((img) => img.id !== deleteId));
                  toast.success(result.message);
                  setDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationsTextAdmin;