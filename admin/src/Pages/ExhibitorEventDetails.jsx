import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";

const ExhibitorEventDetails = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings/event-title`);
        setEventTitle(res.data.title || "");
      } catch (err) {
        console.error("Error fetching title", err);
      } finally {
        setFetching(false);
      }
    };
    fetchTitle();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      return toast.warn("Please enter a title before saving");
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/settings/event-title`, { title: eventTitle });
      toast.success("Event Title Saved Successfully!");
    } catch (err) {
      toast.error("Failed to save title");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-5 text-center">Loading settings...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-header text-dark py-3">
          <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <h2 className="text-dark fw-bold m-0">Exhibitor - Event Title</h2>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
          </div>
          <p className="text-muted small">These details will be automatically updated in the exhibitor registration emails</p>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="form-label fw-bold">Set Event Title</label>
              <div className="text-muted small mb-2">
                It will be used in all exhibitor emails (Registration, Confirmation, Rejection)
              </div>
              <input
                type="text"
                className="form-control form-control-lg border-2"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>
            <button 
              type="submit" 
              className={`btn ${eventTitle ? 'btn-primary' : 'btn-success'} px-5`} 
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Title"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default ExhibitorEventDetails;