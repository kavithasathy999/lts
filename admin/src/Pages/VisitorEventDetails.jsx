import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const VisitorEventDetails = () => {
  const [settings, setSettings] = useState({
    event_title: "",
    venue: "",
    event_time: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/visitor-settings`);
      setSettings(res.data);
    } catch (err) {
      toast.error("Failed to load event settings");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/visitor-settings/update`, settings);
      toast.success("Event details updated successfully!");
    } catch (err) {
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: "32px" }}>
                  Visitor - Event Details
                </h3>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-arrow-left me-1"></i> Back
                </button>
              </div>
              <p className="text-muted small mt-2">
                These details will be automatically updated in the visitor registration emails
              </p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Event Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="e.g. Luxury Travel Expo 2026"
                    value={settings.event_title}
                    onChange={(e) => setSettings({ ...settings, event_title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Venue Location</label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows="3"
                    placeholder="e.g. Merlis Hotel, Coimbatore"
                    value={settings.venue}
                    onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Event Time Slot</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="e.g. 10:00 AM - 07:00 PM"
                    value={settings.event_time}
                    onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                    required
                  />
                </div>
                <div className="d-grid mt-5">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg rounded-pill shadow-sm py-3 fw-bold"
                    style={{ backgroundColor: "#593983", border: "none" }}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Event Title"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorEventDetails;