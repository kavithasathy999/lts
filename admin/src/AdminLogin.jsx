import { API_BASE_URL } from "./config/api";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './App.css';

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin")) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.username,     
          password: formData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin", JSON.stringify({
          id: data.id,
          username: "Admin",         
          email: data.email,
          profile_photo: data.profile_photo || null
        }));
        navigate("/admin");
      } else {
        setError(data.message || "Invalid Username or Password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, please try again later");
    }
  };

  return (
    <div className="admin-login-bg d-flex justify-content-center align-items-center">
      <div className="login-card shadow-lg">
        <div className="text-center mb-3">
          <img src="/assets/logo152.png" className="login-logo" alt="Event Logo" />
          <h3 className="mt-2 fw-bold" style={{ fontFamily: "ui-sans-serif", color: "#51518c" }}>Admin Login</h3>
        </div>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label custom-label">Username:</label>
            <input
              type="text"
              name="username"
              className="form-control custom-input"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label custom-label">Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control custom-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>
          <button type="submit" className="login-btn w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;