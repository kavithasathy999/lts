import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isVisitorsOpen, setIsVisitorsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState("280px"); 

  const sidebarStyle = {
    width: sidebarWidth,
    backgroundColor: "#593983",
    color: "#fff",
    height: "auto",
    transition: "all 0.3s ease",
    fontFamily: "'Montserrat', sans-serif" 
  };


  const linkStyle = "nav-link text-white d-flex align-items-center px-3 py-3 rounded";
  return (
    <div className="sidebar p-3" style={sidebarStyle}>
      <Link to="/admin" className="text-decoration-none text-white">
        <div className="d-flex align-items-center gap-3 mb-4 mt-2">
          <img
            src="/assets/logo152.png"
            alt="logo"
            style={{ width: "45px", height: "45px", borderRadius: "4px" }}
          />
          <h4 className="m-0 fw-bold admin-panel" style={{ fontSize: "1.4rem", letterSpacing: "1px" }}>
            Admin Panel
          </h4>
        </div>
      </Link>
      <ul className="nav flex-column gap-2 sidebar-row">
        <li className="nav-item">
          <Link to="/admin" className={linkStyle} onClick={() => setSidebarWidth("280px")}>
            <i className="fas fa-chart-line me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i>
            <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>Dashboard</span>
          </Link>
          <Link to="/admin/upload-voucher" className={linkStyle} onClick={() => setSidebarWidth("280px")}>
            <i className="fas fa-book-open me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i>
            <span style={{ fontSize: "1.15rem", fontWeight: "600" }}>Brochure</span>
          </Link>
          <Link to="/admin/banner" className={linkStyle} onClick={() => setSidebarWidth("280px")}>
            <i className="fas fa-flag me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i> 
            <span style={{ fontSize: "1.15rem", fontWeight: "600" }}>Banners</span>
          </Link>
          <Link to="/admin/sponsors" className={linkStyle} onClick={() => setSidebarWidth("280px")}>
            <i className="fas fa-handshake me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i> 
            <span style={{ fontSize: "1.15rem", fontWeight: "600" }}>Sponsors</span>
          </Link>
        </li>
        <li className="nav-item">
          <div 
            className={`${linkStyle} justify-content-between`} 
            style={{ cursor: "pointer" }}
            onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-store me-3" style={{ width: "24px", fontSize: "1.10rem", WebkitTextStroke: "1px" }}></i>
              <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>For Exhibitors</span>
            </div>
            <i className={`fas fa-chevron-${isRegistrationOpen ? "down" : "right"}`} style={{ fontSize: "1rem" }}></i>
          </div>
          {isRegistrationOpen && (
            <ul className="nav flex-column ms-4 mt-1 border-start border-secondary border-opacity-25">
              <li className="nav-item">
                <Link to="/admin/registrations" className={linkStyle}>
                  <i className="fas fa-users me-3" style={{ width: "20px", fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Registrations</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/stalls-old" className={linkStyle}>
                  <i className="fas fa-list me-3" style={{ width: "20px", fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Stalls List</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/stalls" className={linkStyle}>
                  <i className="fas fa-map-marked-alt me-3" style={{ width: "20px", fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Zones & Stalls</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/stall-pricing" className={linkStyle}>
                  <i class="bi bi-currency-dollar me-3" style={{ width: "20px", fontSize: "1.1rem", WebkitTextStroke: "1px" }}></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Stalls Cost</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/exhibitor-event-settings" className={linkStyle}>
                  <i className="fas fa-calendar-alt me-4"></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Event Title</span>
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <div 
            className={`${linkStyle} justify-content-between`} 
            style={{ cursor: "pointer" }}
            onClick={() => setIsVisitorsOpen(!isVisitorsOpen)}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-user-circle me-3" style={{ width: "24px", fontSize: "1.10rem", WebkitTextStroke: "1px" }}></i>
              <span style={{ fontSize: "1.15rem", fontWeight: "600" }}>For Visitors</span>
            </div>
            <i className={`fas fa-chevron-${isVisitorsOpen ? "down" : "right"}`}></i>
          </div>
          {isVisitorsOpen && (
            <ul className="nav flex-column ms-4 mt-1 border-start border-secondary border-opacity-25">
              <li className="nav-item">
                <Link to="/admin/visitor-registrations" className={linkStyle}>
                  <i className="fas fa-users me-3"></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Registrations</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/visitor-event-settings" className={linkStyle}>
                  <i className="fas fa-calendar-alt me-4"></i>
                  <span style={{ fontSize: "1.10rem", fontWeight: "600" }}>Event Details</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/visitors" className={linkStyle}>
                  <i className="fas fa-user-check me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i>
                  <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>Total Visitors</span>
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item mt-2">
          <Link to="/admin/map" className={linkStyle}>
            <i className="fas fa-map me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i>
            <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>Map</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/edit-destination-text" className={linkStyle}>
            <i className="fas fa-map-marker-alt me-3" style={{ width: "24px", fontSize: "1.3rem" }}></i>
            <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>Destinations</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
