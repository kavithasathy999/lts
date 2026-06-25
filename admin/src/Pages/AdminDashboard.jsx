import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    availableStalls: 0,
    bookedStalls: 0,
    totalVisitors: null,
    totalContacts: 0,
    approvedVisitors: 0
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStats = () => {
      axios.get(`${API_BASE_URL}/api/dashboard-stats`)
        .then(res => {
          setStats(res.data);
          setVisitorCount(res.data.checkedInVisitors || 0);
        })
        .catch(err => console.log(err));
    };
    fetchStats();
    const handleUpdate = () => {
      fetchStats();
    };
    window.addEventListener("visitorUpdated", handleUpdate);
    const interval = setInterval(fetchStats, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("visitorUpdated", handleUpdate);
    };
  }, []);

  return (
    <div className="dashboard-main-content" style={{ 
      fontFamily: "'Montserrat', sans-serif", 
      backgroundColor: "#fbfaff", 
      minHeight: "100vh",
      overflowX: "hidden", 
    }}>
      <style>{`
        .stat-card {
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0 !important;
          cursor: default;
          background: #fff;
          border-radius: 16px;
          height: 140px; /* Reduced height for a sleeker look */
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
          border-color: #dcdde1 !important;
        }
        .icon-circle {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          opacity: 0.8;
        }
        .constrained-row {
          max-width: 1200px; 
        }
        .stat-label {
          font-size: 13px;
          color: #7f8c8d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #2d3436;
          margin: 0;
        }
      `}</style>

      <div className="mb-4">
        <h2 className="fw-bold m-0 dashboard-heading" style={{ color: "#2d3436", letterSpacing: "-0.5px"  }}>
          Dashboard Overview
        </h2>
      </div>
      <div className="row g-4 constrained-row">
        <StatCard label="Total Exhibitors (Regs)" value={stats.totalRegistrations} icon="fas fa-users" color="#4e73df" onClick={() => navigate("/admin/registrations")} />
        <StatCard label="Confirmed Exhibitors" value={stats.confirmedBookings} icon="fas fa-check-circle" color="#1cc88a" onClick={() => navigate("/admin/registrations")} />
        <StatCard label="Exhibitors Pending Requests" value={stats.pendingRequests} icon="fas fa-clock" color="#f6c23e" onClick={() => navigate("/admin/registrations")} />     
        <StatCard label="Total Visitors (Regs)" value={stats.totalVisitors || 0} icon="fas fa-users" color="#36b9cc" onClick={() => navigate("/admin/visitor-registrations")} />
        <StatCard label="Confirmed Visitors"  value={stats.approvedVisitors || 0} icon="fas fa-user-check" color="#1cc88a" onClick={() => navigate("/admin/visitor-registrations")} />
        <StatCard label="Visitor Pending Requests" value={stats.pendingVisitors || 0} icon="fas fa-user-clock" color="#f39c12" onClick={() => navigate("/admin/visitor-registrations")} />
        <StatCard label="Total Visitors (Checked-in)" value={visitorCount || 0} icon="fas fa-eye" color="#36b9cc" onClick={() => navigate("/admin/visitors")} />
        <StatCard label="Available Stalls" value={stats.availableStalls} icon="fas fa-store" color="#593983"  onClick={() => navigate("/admin/stalls")}  />
        <StatCard label="Booked Stalls" value={stats.bookedStalls} icon="fas fa-lock" color="#e74a3b" onClick={() => navigate("/admin/registrations")} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, onClick }) {
  return (
    <div className="col-lg-4 col-md-6"> 
      <div className="card p-4 stat-card" style={{cursor: "pointer"}} onClick={onClick}> 
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="fs-6 text-dark stat-label" style={{fontWeight: "600"}}>{label}</p>
            <h2 className="stat-value">{value}</h2>
          </div>
          <div className="icon-circle">
            <i className={icon} style={{ color: color }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;