import React from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { Outlet } from "react-router-dom";
import "../App.css";

function AdminLayout() {
  return (
    <div className="d-flex admin-bg">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;

