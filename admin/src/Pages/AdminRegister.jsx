import { API_BASE_URL } from "../config/api";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminRegister() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Registration successful!", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(data.message || "Registration failed", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Server error, try again later", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="admin-login-bg d-flex justify-content-center align-items-center">
      <div className="login-card shadow-lg">
        <ToastContainer />

        <div className="text-center mb-3">
          <img src="/assets/logo152.png" className="login-logo" alt="Event Logo" />
          <h3 className="mt-2 fw-bold" style={{ fontFamily: "ui-sans-serif", color: "#51518c" }}>
            Register
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label custom-label">Email:</label>
            <input
              type="email"
              name="email"
              className="form-control custom-input"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
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
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn w-100">Register</button>
        </form>
        <div className="text-center mt-3">
          <span>Already have an account? </span>
          <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;