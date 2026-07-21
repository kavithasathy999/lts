import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from 'react';
import { flushSync } from "react-dom";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from "bootstrap";
import axios from 'axios';

const VisitorRegistrations = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState({});
  const [searchNameCompany, setSearchNameCompany] = useState("");
  const location = useLocation();
  const [searchStatusType, setSearchStatusType] = useState(() => {
    if (location.state && location.state.statusFilter) {
      return location.state.statusFilter === "all" ? "" : location.state.statusFilter;
    }
    return "";
  });

  useEffect(() => {
    if (location.state && location.state.statusFilter !== undefined) {
      setSearchStatusType(location.state.statusFilter === "all" ? "" : location.state.statusFilter);
    }
  }, [location.state]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [visitorToReject, setVisitorToReject] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedVisitorForAction, setSelectedVisitorForAction] = useState(null);
  const [actionType, setActionType] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown-container")) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [sortDropdownOpen]);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const waitForPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    });

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/visitors/registrations`);
        setVisitors(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching visitors", err);
        setLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new Tooltip(el));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchNameCompany, searchStatusType]);

  const formatPhoneNumber = (num) => {
    if (!num) return <span className="text-muted">No Contact</span>;
    const cleanNum = num.toString().replace(/\+/g, '').trim();
    if (cleanNum.length > 10) {
      const countryCode = cleanNum.slice(0, cleanNum.length - 10);
      const mobilePart = cleanNum.slice(-10);
      return `+${countryCode} ${mobilePart}`;
    }
    return `+${cleanNum}`;
  };

  const filteredVisitors = visitors.filter(v => {
    const nameCompanyMatch = (
      `${v.first_name || ""} ${v.last_name || ""} ${v.company_name || ""}`
    ).toLowerCase().includes(searchNameCompany.toLowerCase());

    const statusVal = v.status ? v.status.toLowerCase() : "pending";
    const searchLower = searchStatusType.trim().toLowerCase();

    const statusMatch = statusVal.includes(searchLower);

    const idStr = v.visitor_id ? String(v.visitor_id) : "";
    const isApproved = v.status === "approved";
    const idMatch = isApproved && idStr.toLowerCase().includes(searchLower);

    return nameCompanyMatch && (statusMatch || idMatch);
  });

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedVisitors = filteredVisitors.slice(indexOfFirstItem, indexOfLastItem);

  const updateStatus = async (id, status, notes = "") => {
    const loadingMessage =
      status === "approved"
        ? "Confirming visitor..."
        : status === "rejected"
          ? "Rejecting visitor..."
          : "Moving visitor to waiting list...";
    const successMessage =
      status === "approved"
        ? "Visitor confirmed successfully"
        : status === "rejected"
          ? "Visitor rejected successfully"
          : "Moved to Waiting List Successfully";
    const successType = status === "rejected" ? "error" : "success";
    setLoadingMap(prev => ({ ...prev, [`${id}_${status}`]: true }));
    const toastId = toast.loading(loadingMessage, {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    try {
      await axios.put(
        `${API_BASE_URL}/api/visitors/status/${id}`,
        { status, notes }
      );
      const res = await axios.get(
        `${API_BASE_URL}/api/visitors/registrations`
      );
      setVisitors(res.data);
      if (status === "rejected") closeRejectModal();
      toast.update(toastId, {
        render: successMessage,
        type: successType,
        isLoading: false,
        autoClose: 1500,
      });
    }
    catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    } finally {
      setLoadingMap(prev => ({ ...prev, [`${id}_${status}`]: false }));
    }
  };

  const openRejectModal = (visitor) => {
    setVisitorToReject(visitor);
    setRejectionNotes("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setVisitorToReject(null);
  };

  const openDeleteModal = (visitor) => {
    setVisitorToDelete(visitor);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setVisitorToDelete(null);
  };

  const confirmDelete = async () => {
    if (!visitorToDelete) return;
    setDeleteLoading(true);
    const toastId = toast.loading("Deleting visitor...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    try {
      await axios.delete(
        `${API_BASE_URL}/api/visitors/${visitorToDelete.id}`
      );
      setVisitors(prev => prev.filter(v => v.id !== visitorToDelete.id));
      toast.update(toastId, {
        render: "Visitor deleted successfully",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Delete failed",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const downloadQR = () => {
    if (!selectedVisitor || !selectedVisitor.qr_code) return;
    const url = `${API_BASE_URL}/qrcodes/${selectedVisitor.qr_code}`;
    const fullName = `${selectedVisitor.first_name} ${selectedVisitor.last_name}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 380;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 35, 20, 250, 250);
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 22px Arial";
      ctx.fillText(fullName || "—", canvas.width / 2, 300);
      ctx.font = "bold 16px Arial";
      ctx.fillText(selectedVisitor.company_name || "—", canvas.width / 2, 335);
      const link = document.createElement("a");
      link.download = "Visitor_QRcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const printQR = () => {
    if (!selectedVisitor || !selectedVisitor.qr_code) return;
    const url = `${API_BASE_URL}/qrcodes/${selectedVisitor.qr_code}`;
    const fullName = `${selectedVisitor.first_name} ${selectedVisitor.last_name}`;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Print QR - ${fullName}</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              flex-direction: column;
              font-family: Arial;
            }
            img {
              width: 250px;
              height: 250px;
            }
            .name {
              font-size: 22px;
              font-weight: bold;
              color: #1e293b;
              margin-top: 15px;
            }
            .info {
              font-size: 16px;
              font-weight: bold;
              color: #1e293b;
              margin-top: 6px;
            }
          </style>
        </head>
        <body>
          <img src="${url}" id="qrImage" />
          <div class="name">${fullName || "—"}</div>
          <div class="info">${selectedVisitor.company_name || "—"}</div>
          <script>
            const img = document.getElementById('qrImage');
            img.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const exportToCSV = () => {
    if (filteredVisitors.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "S No",
      "Full Name",
      "Mobile Number",
      "Email Address",
      "Company Name",
      "Country",
      "State",
      "City"
    ];
    const rows = filteredVisitors.map((v, index) => {
      const formattedStatus = v.status
        ? v.status.charAt(0).toUpperCase() + v.status.slice(1)
        : "Pending";
      const data = [
        index + 1,
        `${v.first_name} ${v.last_name}`,
        `\t${v.mobile_number || "N/A"}`,
        v.email || "N/A",
        v.company_name || "N/A",
        v.country || "N/A",
        v.state || "N/A",
        v.city || "N/A"
      ];
      return data
        .map(value => {
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",");
    });
    const csvContent = "\uFEFF" + "Visitor Registrations\n\n" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Visitor_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openQRModal = (visitor) => {
    setSelectedVisitor(visitor);
    setQrModalOpen(true);
  };

  const closeQRModal = () => {
    setQrModalOpen(false);
    setSelectedVisitor(null);
  };

  return (
    <div style={{ fontFamily: "var(--bs-font-sans-serif)" }}>
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="container-fluid p-2">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2 w-100" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <h2 className="text-dark fw-bold m-0">Visitor Registrations</h2>
                <div className="d-flex align-items-center gap-2 sort-dropdown-container">
                  <div className="dropdown" style={{ position: "relative" }}>
                    <button
                      className="btn btn-outline-primary btn-sm dropdown-toggle"
                      type="button"
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      style={{ fontWeight: "600" }}
                    >
                      Sort By: {searchStatusType ? (searchStatusType.charAt(0).toUpperCase() + searchStatusType.slice(1)) : "All"}
                    </button>
                    {sortDropdownOpen && (
                      <ul className="dropdown-menu show" style={{ position: "absolute", top: "100%", right: 0, zIndex: 1000, minWidth: "120px" }}>
                        <li><button className="dropdown-item" onClick={() => { setSearchStatusType(""); setSortDropdownOpen(false); }}>All</button></li>
                        <li><button className="dropdown-item" onClick={() => { setSearchStatusType("approved"); setSortDropdownOpen(false); }}>Approved</button></li>
                        <li><button className="dropdown-item" onClick={() => { setSearchStatusType("pending"); setSortDropdownOpen(false); }}>Pending</button></li>
                        <li><button className="dropdown-item" onClick={() => { setSearchStatusType("rejected"); setSortDropdownOpen(false); }}>Rejected</button></li>
                      </ul>
                    )}
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate(-1)}
                  >
                    <i className="fas fa-arrow-left me-1"></i> Back
                  </button>
                </div>
              </div>
            </div>
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search Name / Company"
                    value={searchNameCompany}
                    onChange={(e) => setSearchNameCompany(e.target.value)}
                    className="form-control"
                    style={{ height: "65px", fontSize: "16px", paddingRight: "40px" }}
                  />
                  <i
                    className="fas fa-search"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>
              </div>
              <div className="col-md-5">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search Status"
                    value={searchStatusType}
                    onChange={(e) => setSearchStatusType(e.target.value)}
                    className="form-control"
                    style={{ height: "65px", fontSize: "16px", paddingRight: "40px" }}
                  />
                  <i
                    className="fas fa-search"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>
              </div>
              <div className="col-md-2 d-flex justify-content-md-end">
                <button
                  className="btn btn-success"
                  style={{
                    height: "65px",
                    minWidth: "100px",
                    fontWeight: "600",
                    backgroundColor: "#198754",
                    lineHeight: "1.2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center"
                  }}
                  onClick={exportToCSV}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Visitor Id</th>
                    <th>Person Name</th>
                    <th>Company Name</th>
                    <th>Mobile Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "var(--bs-font-sans-serif)" }}>
                  {paginatedVisitors.length > 0 ? (
                    paginatedVisitors.map((v, index) => (
                      <tr key={v.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{v.status === "approved" ? v.visitor_id : "-"}</td>
                        <td>{`${v.first_name} ${v.last_name}`}</td>
                        <td>{v.company_name}</td>
                        <td>{formatPhoneNumber(v.mobile_number)}</td>
                        <td>
                          {v.status === "approved" ? (
                            <span className="badge bg-success" style={{ fontSize: "14px", padding: "6px 10px" }}>
                              Approved
                            </span>
                          ) : v.status === "rejected" ? (
                            <span className="badge bg-danger" style={{ fontSize: "14px", padding: "6px 10px" }}>
                              Rejected
                            </span>
                          ) : v.status === "waiting list" ? (
                            <span className="badge bg-warning text-white" style={{ fontSize: "14px", padding: "6px 10px" }}>
                              Waiting List
                            </span>
                          ) : (
                            <span className="badge bg-secondary" style={{ fontSize: "14px", padding: "6px 10px" }}>
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <div>
                            <button
                              className="btn btn-sm btn-info me-1"
                              onClick={() =>
                                navigate("/admin/visitor-details", {
                                  state: v
                                })
                              }
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-success me-1"
                              disabled={v.status === "approved" || loadingMap[`${v.id}_approved`]}
                              onClick={() => {
                                setSelectedVisitorForAction(v);
                                setActionType("approved");
                                setConfirmModalOpen(true);
                              }}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Approve"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger me-1"
                              disabled={v.status === "rejected" || loadingMap[`${v.id}_rejected`]}
                              onClick={() => openRejectModal(v)}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Reject"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-warning me-1"
                              disabled={
                                v.status === "approved" ||
                                v.status === "rejected" ||
                                loadingMap[`${v.id}_waiting list`]
                              }
                              onClick={() => {
                                setSelectedVisitorForAction(v);
                                setActionType("waiting list");
                                setConfirmModalOpen(true);
                              }}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Move to Waiting List"
                            >
                              <i className="fas fa-clock"></i>
                            </button>
                            <button
                              className="btn btn-sm bg-black text-white border-0 me-1"
                              onClick={() => openDeleteModal(v)}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Delete Visitor"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={!v.qr_code}
                              style={{ marginLeft: "5px" }}
                              onClick={() => openQRModal(v)}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="View QR"
                            >
                              <i className="fas fa-qrcode"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No matching records
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
            </div>
          </div>
        </div>
      </div>
      {qrModalOpen && selectedVisitor && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center position-relative" style={{ borderRadius: "20px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <button
                onClick={closeQRModal}
                style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  border: "none",
                  background: "#fee2e2",
                  fontSize: 18,
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#dc2626",
                  transition: "0.3s"
                }}
              >
                ✕
              </button>
              <div className="mb-4" style={{ background: "#fff", padding: "10px", display: "inline-block", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <img
                  src={`${API_BASE_URL}/qrcodes/${selectedVisitor.qr_code}`}
                  alt="QR Code"
                  style={{ width: "220px", height: "220px", objectFit: "contain", display: "inline-block" }}
                  onError={(e) => {
                    console.error("QR Image failed to load:", e.target.src);
                    e.target.src = "https://via.placeholder.com/250?text=QR+Not+Found";
                  }}
                />
              </div>
              <div style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "15px",
                textAlign: "left",
                border: "1px solid #e2e8f0"
              }}>
                {[
                  { label: "Name", value: `${selectedVisitor.first_name} ${selectedVisitor.last_name}` },
                  { label: "Company", value: selectedVisitor.company_name }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    marginBottom: index !== 3 ? "12px" : "0",
                    borderBottom: index !== 3 ? "1px dashed #e2e8f0" : "none",
                    paddingBottom: index !== 3 ? "8px" : "0"
                  }}>
                    <span style={{
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#627c9f",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {item.label}:
                    </span>
                    <span style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#1e293b",
                      textAlign: "left",
                      marginLeft: "5px"
                    }}>
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 d-flex justify-content-center gap-3">
                <button
                  className="btn btn-primary px-4"
                  onClick={printQR}
                  style={{ borderRadius: "10px", fontWeight: "600", padding: "10px 25px" }}
                >
                  Print
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={downloadQR}
                  style={{ borderRadius: "10px", fontWeight: "600", padding: "10px 25px" }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmModalOpen && selectedVisitorForAction && (
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
                  {actionType === "waiting list"
                    ? "Are you want to move to Waiting List?"
                    : "Are you sure want to confirm?"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModalOpen(false)}
                ></button>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmModalOpen(false)}
                >
                  Cancel
                </button>
                {actionType === "waiting list" ? (
                  <>
                    <button
                      className="btn btn-warning px-4"
                      disabled={confirmLoading}
                      onClick={async () => {
                        setConfirmLoading(true);
                        try {
                          await updateStatus(selectedVisitorForAction.id, "waiting list");
                          setConfirmModalOpen(false);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setConfirmLoading(false);
                        }
                      }}
                    >
                      {confirmLoading ? "Please wait..." : "Confirm"}
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-success px-4"
                    disabled={confirmLoading}
                    onClick={async () => {
                      setConfirmLoading(true);
                      try {
                        await updateStatus(selectedVisitorForAction.id, actionType);
                        setConfirmModalOpen(false);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setConfirmLoading(false);
                      }
                    }}
                  >
                    {confirmLoading ? "Please wait..." : "Confirm"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectModalOpen && (
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
          <div className="modal-dialog" style={{ marginTop: "50px" }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rejection Reason</h5>
                <button type="button" className="btn-close" onClick={closeRejectModal}></button>
              </div>
              <div className="modal-body text-start">
                <div className="form-group">
                  <label className="mb-2 fw-semibold">Add Notes:</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={closeRejectModal}>Cancel</button>
                <button
                  className="btn btn-danger px-4"
                  disabled={loadingMap[`${visitorToReject?.id}_rejected`]}
                  onClick={() => updateStatus(visitorToReject.id, "rejected", rejectionNotes)}
                >
                  {loadingMap[`${visitorToReject?.id}_rejected`] ? "Please wait..." : "Reject Now"}
                </button>
              </div>
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
                  onClick={confirmDelete}
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
};

export default VisitorRegistrations;
