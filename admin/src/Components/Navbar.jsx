import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { clearAdminSession, getStoredAdmin, updateStoredAdmin } from "../utils/adminSession";

function Navbar() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const stored = getStoredAdmin();
    if (stored) {
      setAdmin(stored);
    }
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const admin = getStoredAdmin();
    if (!admin) return;
    const maxSize = 2 * 1024 * 1024; 
    if (file.size > maxSize) {
      toast.error("File is too large! Please upload a photo under 2MB.");
      e.target.value = "";
      return;
    }
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("admin_id", admin.id);
      const res = await fetch(`${API_BASE_URL}/api/upload-profile`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile photo updated!");
        const updated = { ...admin, profile_photo: data.profile_photo };
        updateStoredAdmin(updated);
        setAdmin(updated);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Server error, please try again");
    }
  };

  return (
    <div className="admin-navbar d-flex justify-content-between align-items-center px-4 py-3 shadow-sm">
      <div className="dropdown text-center ms-auto">
        <div className="admin-avatar dropdown-toggle mx-auto" data-bs-toggle="dropdown">
          <img
            src={
              admin?.profile_photo
                ? `${API_BASE_URL}${admin.profile_photo}`
                : "/logo192.png"
            }
            alt="profile"
          />
        </div>

        <p className="mb-0 mt-1 fw-semibold">
          {admin?.username || "User"}
        </p>

        <ul 
          className="dropdown-menu dropdown-menu-end mt-2 border-0 shadow-lg p-2" 
          aria-labelledby="adminProfileDropdown"
          style={{ borderRadius: "12px", minWidth: "200px" }}
        >
      <p className="px-3 mb-1 fw-bold text-muted" style={{ fontSize: '0.8rem' }}></p>
      <li>
        <label 
          className="dropdown-item rounded-2 py-2 px-3 fw-medium" 
          style={{ cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s" }}
        >
          Upload Profile Photo
          <input
            hidden
            type="file"
            name="photo"      
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </label>
      </li>
      <li><hr className="dropdown-divider opacity-50" /></li>
      <li>
        <button 
          className="dropdown-item text-danger rounded-2 py-2 px-3 fw-medium navbar-logout" 
          style={{ fontSize: "0.95rem", transition: "all 0.2s" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </li>
    </ul>
      </div>
    </div>
  );
}

export default Navbar;
