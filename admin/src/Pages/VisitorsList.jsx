import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VisitorList() {
    const [visitors, setVisitors] = useState([]);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [visitorToDelete, setVisitorToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const navigate = useNavigate();

    useEffect(() => {
        fetchVisitors();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchVisitors = () => {
        axios
        .get(`${API_BASE_URL}/api/visitors`)
        .then((res) => setVisitors(res.data))
        .catch((err) => console.log(err));
    };

    const filteredVisitors = visitors.filter((v) => {
<<<<<<< HEAD
        const keyword = search.trim().toLowerCase();
        const nameCompanyMatch = (
=======
        const keyword = search.toLowerCase();
        return (
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
            (v.first_name || "").toLowerCase().includes(keyword) ||
            (v.company_name || "").toLowerCase().includes(keyword) ||
            (v.email || "").toLowerCase().includes(keyword) ||
            (v.mobile_number || "").toLowerCase().includes(keyword)
        );
<<<<<<< HEAD
        const idStr = v.visitor_id ? String(v.visitor_id) : "";
        const isApproved = v.status === "approved";
        const idMatch = isApproved && idStr.toLowerCase().includes(keyword);

        return nameCompanyMatch || idMatch;
=======
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
    });

    const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
    const safeCurrentPage = Math.min(currentPage, totalPages || 1);
    const indexOfLastItem = safeCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedVisitors = filteredVisitors.slice(indexOfFirstItem, indexOfLastItem);

    const confirmDelete = async () => {
      if (!visitorToDelete) return;
      await axios.delete(
        `${API_BASE_URL}/api/visitors/${visitorToDelete.id}`
      );
      toast.success("Visitor deleted successfully");
      fetchVisitors();
      window.dispatchEvent(new Event("visitorUpdated"));
    };

    const openDeleteModal = (visitor) => {
      setVisitorToDelete(visitor);
      setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
      setDeleteModalOpen(false);
      setVisitorToDelete(null);
    };

    const exportToCSV = () => {
      const headers = [
          "Person Name",
          "Company Name",
          "Email Address",
          "Mobile Number"
      ];
      const rows = filteredVisitors.map(v => [
          v.first_name,
          v.company_name,
          v.email,
          v.mobile_number
      ]);
      let csvContent = "data:text/csv;charset=utf-8," + "Total Visitors (Checked-In)\n\n" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Total_Visitors.csv");
      document.body.appendChild(link);
      link.click();
    };

   return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={1500} />
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark fw-bold mb-3">Checked-In - Visitor Details</h2>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-1"></i> Back
            </button>
        </div>
        <div className="d-flex gap-2 mb-3">
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control"
<<<<<<< HEAD
              placeholder="Search by name, company, email, mobile, visitor ID..."
=======
              placeholder="Search by name, company, email, mobile..."
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: "65px", fontSize: "16px", paddingRight: "45px" }}
            />
            <i className="fas fa-search"
              style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              pointerEvents: "none"
              }}
            ></i>
          </div>
            <button
              className="btn btn-success"
              onClick={exportToCSV}
              style={{ height: "65px" }}
            >
              Export CSV
            </button>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>S.No</th>
<<<<<<< HEAD
              <th>Visitor Id</th>
=======
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
              <th>Person Name</th>
              <th>Company Name</th>
              <th>Email Address</th>
              <th>Mobile Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVisitors.length > 0 ? (
                paginatedVisitors.map((v, index) => (
                <tr key={v.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
<<<<<<< HEAD
                    <td>{v.status === "approved" ? v.visitor_id : "-"}</td>
=======
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
                    <td>{v.first_name}</td>
                    <td>{v.company_name}</td>
                    <td>{v.email}</td>
                    <td>{v.mobile_number}</td>
                    <td>
                    <button
                      className="btn btn-sm btn-info me-1"
                      onClick={() => navigate(`/admin/visitor/${v.id}`)}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="View"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm bg-black text-white border-0 me-1"
                      onClick={() => openDeleteModal(v)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
<<<<<<< HEAD
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
=======
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
                    No matching visitors found
                </td>
                </tr>
            )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4" style={{ fontFamily: "var(--bs-font-sans-serif)" }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </button>
          <span className="small fw-bold text-dark mx-2">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {selectedVisitor && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h4 className="mb-3">Visitor Details</h4>
              <p><b>Exhibitor Company Name:</b> {selectedVisitor.company_name}</p>
              <p><b>Contact Person Name:</b> {selectedVisitor.first_name}</p>
              <p><b>Email Address:</b> {selectedVisitor.email}</p>
              <p><b>Mobile Number:</b> {selectedVisitor.mobile_number}</p>
              <p><b>Designation:</b> {selectedVisitor.designation || "-"}</p>
              <p><b>Country:</b> {selectedVisitor.country}</p>
              <p><b>State:</b> {selectedVisitor.state}</p>
              <p><b>City:</b> {selectedVisitor.city}</p>
              <p><b>Pincode:</b> {selectedVisitor.pincode}</p>
              <p><b>Address Line 1:</b> {selectedVisitor.address1}</p>
              <p><b>Address Line 2:</b> {selectedVisitor.address2}</p>
              <button
                className="btn btn-dark mt-3"
                onClick={() => setSelectedVisitor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && visitorToDelete && (
        <div 
          className="modal d-block" 
          style={{ 
            background: "rgba(0,0,0,0.6)", 
            zIndex: 1050,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "auto"
          }}
        >
          <div className="modal-dialog" style={{ marginTop: "25px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Are you sure you want to delete?
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      await confirmDelete();
                      closeDeleteModal();
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to delete visitor");
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Please wait..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisitorList;