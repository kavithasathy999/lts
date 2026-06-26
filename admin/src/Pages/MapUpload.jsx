import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect, useRef } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

function MapUpload() {
  const [file, setFile] = useState(null);          
  const [mapUrl, setMapUrl] = useState('');        
  const [uploadedFileName, setUploadedFileName] = useState(''); 
  const fileRef = useRef();
  const navigate = useNavigate();

  const fetchMap = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/map`);
      setMapUrl(res.data.mapImageUrl || '');
      if (res.data.mapImageUrl) {
        const parts = res.data.mapImageUrl.split(/[/\\]/); 
        setUploadedFileName(parts[parts.length - 1]);
      } else {
        setUploadedFileName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMap();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append('map', file);
    try {
      await axios.post(`${API_BASE_URL}/api/map`, formData);
      toast.success("Map uploaded successfully!"); 
      setFile(null);
      fileRef.current.value = "";
      fetchMap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload map. Please try again.");
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/map`);
      toast.success("Map removed successfully");
      setMapUrl('');
      setUploadedFileName('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove map.");
    }
  };

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: "#fbfaff",
      minHeight: "100vh"
    },
    headerSection: {
      paddingLeft: "20px",
      marginBottom: "30px",
    },
    uploadCard: {
      background: "#fff",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      maxWidth: "800px",
      border: "none"
    },
    dropZone: {
      border: "2px dashed #d1d5db",
      borderRadius: "15px",
      padding: "40px",
      textAlign: "center",
      backgroundColor: "#f9fafb",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginBottom: "20px"
    },
    previewImage: {
      maxWidth: "100%",
      borderRadius: "12px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      border: "4px solid #fff"
    }
  };

  return (
    <div className="map-upload" style={styles.container}>
      <div className="d-flex justify-content-between align-items-center mb-2 w-100" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <h2 className="text-dark fw-bold m-0">Map Configuration</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>

      <div style={styles.uploadCard}>
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
<<<<<<< HEAD
          onChange={(e) => {
            setFile(e.target.files[0]);
            e.target.value = "";
          }}
=======
          onChange={(e) => setFile(e.target.files[0])}
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
          accept="image/*"
        />

        <div 
          style={styles.dropZone} 
          onClick={() => fileRef.current.click()}
          onMouseOver={(e) => e.currentTarget.style.borderColor = "#593983"}
          onMouseOut={(e) => e.currentTarget.style.borderColor = "#d1d5db"}
        >
          <i className="fas fa-cloud-upload-alt mb-3" style={{ fontSize: "40px", color: "#593983" }}></i>
          <h5 className="fw-bold">Click to select a new map</h5>
          <p className="text-muted small">Supports JPG, PNG or SVG formats</p>
          <p className="small text-muted mb-0">A file size below 5 MB is preferred</p>
          {file && (
            <div className="mt-3">
              <span className="badge bg-primary px-3 py-2" style={{ borderRadius: "8px" }}>
                {file.name}
              </span>
            </div>
          )}
        </div>

        <div className="d-flex gap-3 align-items-center mb-4">
          <button 
            className="btn btn-primary px-5 py-2 shadow-sm" 
            onClick={handleUpload} 
            disabled={!file}
            style={{ 
              backgroundColor: "#593983", 
              borderColor: "#593983",
              borderRadius: "12px",
              fontWeight: "600"
            }} 
          >
            Upload Map
          </button>

          {uploadedFileName && (
            <button 
              className="btn btn-outline-danger px-4 py-2" 
              onClick={handleRemove} 
              style={{ borderRadius: "12px", fontWeight: "600" }}
            >
              <i className="fas fa-trash-alt me-2"></i> Remove Map
            </button>
          )}
        </div>

        <hr className="my-4" style={{ opacity: "0.1" }} />

        {mapUrl ? (
          <div>
            <h6 className="text-dark fw-bold mb-3" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Active Floor Plan Preview
            </h6>
            <div style={{ backgroundColor: "#f1f3f9", padding: "20px", borderRadius: "15px", textAlign: "center" }}>
              <img src={mapUrl} alt="Uploaded Map" style={styles.previewImage} />
              <div className="mt-3 small text-muted fw-bold">
                <i className="fas fa-file-image me-2"></i> {uploadedFileName}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted italic">No floor plan has been uploaded yet.</p>
          </div>
        )}
      </div>
      <ToastContainer autoClose={1500} />
    </div>
  );
}

export default MapUpload;