import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function RegistrationList() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const [filter, setFilter] = useState(() => {
    if (location.state && location.state.statusFilter) {
      return location.state.statusFilter === "all" ? "" : location.state.statusFilter;
    }
    return "";
  });

  useEffect(() => {
    if (location.state && location.state.statusFilter !== undefined) {
      setFilter(location.state.statusFilter === "all" ? "" : location.state.statusFilter);
    }
  }, [location.state]);
  const [data, setData] = useState([]);
  const [loadingAction, setLoadingAction] = useState("");
  const [modalType, setModalType] = useState("");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [qrName, setQrName] = useState("");
  const [qrModal, setQrModal] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [exhibitors, setExhibitors] = useState([{ name: "", mobile: "", email: "", company: "" }]);
  const [exhibitorErrors, setExhibitorErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const navigate = useNavigate();

  const waitForPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    });

  const fetchData = () => {
    axios
      .get(`${API_BASE_URL}/api/registrations`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new Tooltip(el));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const validateExhibitors = () => {
    let errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10,15}$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    exhibitors.forEach((ex, index) => {
      let err = {};
      if (!ex.name.trim()) {
        err.name = "Name is required";
      } else if (!nameRegex.test(ex.name)) {
        err.name = "Only alphabets allowed";
      }
      if (!ex.mobile.trim()) {
        err.mobile = "Mobile number is required";
      } else if (!mobileRegex.test(ex.mobile)) {
        err.mobile = "Enter valid mobile number";
      }
      if (!ex.email.trim()) {
        err.email = "Email is required";
      } else if (!emailRegex.test(ex.email)) {
        err.email = "Enter valid email";
      }
      if (!ex.company.trim()) {
        err.company = "Company name is required";
      }
      errors[index] = err;
    });
    setExhibitorErrors(errors);
    const hasErrors = errors.some(
      (err) => Object.keys(err).length > 0
    );
    return !hasErrors;
  };

  const openExhibitorView = (item) => {
    navigate("/admin/exhibitor-details", {
      state: item,
    });
  };

  const openModal = (type, item) => {
    if (type === "delete" && item.status === "Confirmed") {
      toast.info("You must reject the exhibitor before deleting");
      return;
    }
    if (type === "reject" && item.status === "Rejected") {
      toast.info("This exhibitor is already rejected");
      return;
    }
    setModalType(type);
    setSelected(item);
    setRejectReason("");
    if (type === "confirm") {
      setExhibitors([{ name: "", mobile: "", email: "", company: "" }]);
    }
    if (type === "edit") {
      axios
      .get(`${API_BASE_URL}/api/exhibitors/${item.id}`)
      .then((res) => {
        if (res.data?.length > 0) {
          setExhibitors(res.data);
        } else {
          setExhibitors([{ name: "", mobile: "", email: "", company: "" }]);
        }
      })
      .catch(() => {
        toast.error("Failed to load exhibitors");
      });
    }
  };

  const handleAddExhibitor = async () => {
    if (!validateExhibitors()) {
      toast.error("Please fill all exhibitor details");
      return;
    }
    flushSync(() => setLoadingAction("addExhibitor"));
    const toastId = toast.loading("Adding exhibitors...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    axios
      .post(
        `${API_BASE_URL}/api/exhibitors/add/${selected.id}`,
        { exhibitors }
      )
      .then(() => {
        toast.update(toastId, {
          render: "Exhibitors Added Successfully",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchData();
        closeModal();
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Failed to add exhibitors",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleConfirm = async () => {
    const exhibitorsToConfirm = exhibitors.filter((ex) =>
      ex.name.trim() || ex.mobile.trim() || ex.email.trim() || ex.company.trim()
    );
    setExhibitorErrors([]);
    flushSync(() => setLoadingAction("confirm"));
    const toastId = toast.loading("Confirming exhibitor...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    axios
      .put(`${API_BASE_URL}/api/confirm/${selected.id}`, {
        exhibitors: exhibitorsToConfirm,
      })
      .then((res) => {
        if (res.data.blocked) {
          toast.update(toastId, {
            render: res.data.message,
            type: "warning",
            isLoading: false,
            autoClose: 1500,
          });
          return;
        }
        toast.update(toastId, {
          render: "Exhibitor Confirmed Successfully",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchData();
        closeModal();
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Failed to confirm exhibitor",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleReject = async () => {
    flushSync(() => setLoadingAction("reject"));
    const toastId = toast.loading("Rejecting exhibitor...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    axios
      .put(`${API_BASE_URL}/api/reject/${selected.id}`, {
        reason: rejectReason,
      })
      .then(() => {
        toast.update(toastId, {
          render: "Exhibitor Rejected Successfully",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchData();
        closeModal();
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Failed to reject exhibitor",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleDelete = async () => {
    flushSync(() => setLoadingAction("delete"));
    const toastId = toast.loading("Deleting registration...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    axios
      .delete(
        `${API_BASE_URL}/api/delete-registration/${selected.id}`
      )
      .then(() => {
        toast.update(toastId, {
          render: "Registration Deleted Successfully",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchData();
        closeModal();
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Failed to delete registration",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const handleEditSave = () => {
    if (!validateExhibitors()) {
      toast.error("Please fill all exhibitor details correctly");
      return;
    }
    setLoadingAction("edit");
    axios
      .put(
        `${API_BASE_URL}/api/exhibitors/update/${selected.id}`,
        { exhibitors }
      )
      .then(() => {
        toast.success("Exhibitors updated successfully");
        fetchData();
        closeModal();
      })
      .catch(() => toast.error("Failed to update exhibitors"))
      .finally(() => setLoadingAction(""));
  };

  const closeModal = () => {
    setModalType("");
    setSelected(null);
    setRejectReason("");
  };

  const filtered = data.filter((item) => {
    const searchText = search.toLowerCase();
    const filterText = filter.toLowerCase();
    const dateString = new Date(item.created_at)
      .toLocaleDateString("en-GB")
      .toLowerCase();
    return (
      (item.name.toLowerCase().includes(searchText) ||
        item.company.toLowerCase().includes(searchText)) &&
      (filter
        ? item.status.toLowerCase().includes(filterText) ||
          dateString.includes(filterText)
        : true)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleWaitingList = async (id) => {
    flushSync(() => setLoadingAction(`waiting-${id}`));
    const toastId = toast.loading("Moving to waiting list...", {
      closeOnClick: false,
      autoClose: false,
    });
    await waitForPaint();
    axios
      .put(`${API_BASE_URL}/api/waiting-list/${id}`)
      .then(() => {
        toast.update(toastId, {
          render: "Exhibitor Moved to Waiting List",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchData();
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Failed to move to Waiting List",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      })
      .finally(() => setLoadingAction(""));
  };

  const loadExhibitorsForEdit = async (registrationId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/exhibitors/${registrationId}`
      );
      if (res.data) {
        setExhibitors(res.data.length ? res.data : [
          { name: "", mobile: "", email: "", company: "" }
        ]);
      }
    } catch (err) {
      toast.error("Failed to load exhibitors");
    }
  };

  const handleSaveEdit = () => {
    setLoadingAction("edit");
    axios
      .put(
        `${API_BASE_URL}/api/exhibitors/update/${selected.id}`,
        { exhibitors }
      )
      .then(() => {
        toast.success("Exhibitors updated successfully");
        fetchData();
        closeModal();
      })
      .catch(() => toast.error("Failed to update exhibitors"))
      .finally(() => setLoadingAction(""));
  };

  const removeExhibitor = (index) => {
    const updated = exhibitors.filter((_, i) => i !== index);
    setExhibitors(updated.length ? updated : [{ name: "", mobile: "", email: "", company: "" }]);
  };

  const addExhibitor = () => {
    setExhibitors([
      ...exhibitors,
      { name: "", mobile: "", email: "", company: "" }
    ]);
  };

  const updateExhibitor = (index, field, value) => {
    let updatedValue = value;
    if (field === "name") {
      updatedValue = value.replace(/[^A-Za-z\s]/g, "");
    }
    if (field === "mobile") {
      updatedValue = value.replace(/\D/g, "").slice(0, 15);
    }
    if (field === "email") {
      updatedValue = value.replace(/\s/g, "");
    }
    const updated = [...exhibitors];
    updated[index][field] = updatedValue;
    setExhibitors(updated);
    const errors = [...exhibitorErrors];
    if (!errors[index]) {
      errors[index] = {};
    }
    if (field === "name") {
      if (!updatedValue.trim()) {
        errors[index].name = "Name is required";
      } else if (!/^[A-Za-z\s]+$/.test(updatedValue)) {
        errors[index].name = "Only alphabets allowed";
      } else {
        errors[index].name = "";
      }
    }
    if (field === "mobile") {
      if (!updatedValue.trim()) {
        errors[index].mobile = "Mobile number is required";
      } else if (!/^[0-9]{10,15}$/.test(updatedValue)) {
        errors[index].mobile = "Enter valid mobile number";
      } else {
        errors[index].mobile = "";
      }
    }
    if (field === "email") {
      if (!updatedValue.trim()) {
        errors[index].email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedValue)) {
        errors[index].email = "Enter valid email";
      } else {
        errors[index].email = "";
      }
    }
    if (field === "company") {
      if (!updatedValue.trim()) {
        errors[index].company = "Company name is required";
      } else {
        errors[index].company = "";
      }
    }
    setExhibitorErrors(errors);
  };

  const generateQR = async (item) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/generate-qr/${item.id}`
      );
      const fileName = res.data.file;
      const url = `${API_BASE_URL}/qrcodes/${fileName}`;
      setQrImage(url);
      setQrName(item.name);
      setSelected(item);
      setQrModal(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "QR failed");
    }
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
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
          <img src="${qrImage}" />
          <div class="name">${qrName || "—"}</div>
          <div class="info">${selected?.mobile || "—"}</div>
          <div class="info">${selected?.email || "—"}</div>
          <div class="info">${selected?.company || "—"}</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQR = async () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 520;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 35, 20, 250, 250);
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 22px Arial";
      ctx.fillText(qrName || "—", canvas.width / 2, 300);
      ctx.font = "bold 16px Arial";
      ctx.fillText(`${selected?.mobile || "—"}`, canvas.width / 2, 340);
      ctx.fillText(`${selected?.email || "—"}`, canvas.width / 2, 370);
      ctx.fillText(`${selected?.company || "—"}`, canvas.width / 2, 400);
      const link = document.createElement("a");
      link.download = "Exhibitor_QRcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }
  const title = "Exhibitor Registrations";
  const headers = [
    "S No",
    "Name",
    "Company",
    "Mobile",
    "Zone",
    "Stall",
    "Status",
    "Reg Date"
  ];
  const rows = filtered.map((item, index) => {
    const rowData = [
      index + 1,
      item.name,
      item.company || "N/A",
      `\t${item.mobile || ""}`,
      item.zone_name || "N/A",
      `\t${item.stall_no || ""}`,
      item.status,
      `\t${new Date(item.created_at).toLocaleDateString("en-GB")}`
    ];
    return rowData
      .map(value => {
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });
  const csvContent = "\uFEFF" + title + "\n\n" + headers.join(",") + "\n" + rows.join("\n");
  
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Exhibitor_Registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="registration-list"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div
        className="d-flex justify-content-between align-items-center mb-2"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <h2 className="text-dark fw-bold m-0">Exhibitor Registrations</h2>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>
      <div className="d-flex gap-2 mb-3">
        <div className="position-relative w-100">
          <input
            className="form-control"
            placeholder="Search Name / Company"
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: "65px", paddingRight: "35px" }}
          />
          <i
            className="fas fa-search"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              pointerEvents: "none",
            }}
          ></i>
        </div>
        <div className="position-relative w-100">
          <input
            className="form-control"
            placeholder="Search Date / Status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ height: "65px", paddingRight: "35px" }}
          />
          <i
            className="fas fa-search"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              pointerEvents: "none",
            }}
          ></i>
        </div>
        <button className="btn btn-success export-button" onClick={exportCSV}>
          Export CSV
        </button>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>S No</th>
            <th>Person Name</th>
            <th>Company Name</th>
            <th>Mobile Number</th>
            <th>Zone</th>
            <th>Stall No</th>
            <th  className="text-center">Status</th>
            <th>Reg Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={item.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{item.name}</td>
              <td>{item.company}</td>
              <td>{item.mobile}</td>
              <td>{item.zone_name}</td>
              <td>{item.stall_no}</td>
              <td className="text-center">
                <span
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor:
                      item.status === "Confirmed"
                        ? "green"
                        : item.status === "Pending"
                        ? "gray"
                        : item.status === "Rejected"
                        ? "red"
                        : "#ffc107",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    display: "inline-block",
                    minWidth: "90px",
                    textAlign: "center",
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td>{new Date(item.created_at).toLocaleDateString("en-GB")}</td>
              <td>
                <button
                  className="btn btn-info btn-sm me-1"
                  onClick={() =>
                    navigate("/admin/registration-details", {
                      state: item,
                    })
                  }
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="View Details"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="btn btn-secondary btn-sm me-1"
                  onClick={() =>
                    navigate("/admin/exhibitor-details", {
                      state: item,
                    })
                  }
                  data-bs-toggle="tooltip"
                  title="View Exhibitors"
                >
                  <i className="fas fa-users"></i>
                </button>
                <button
                  className="btn btn-success btn-sm me-1"
                  onClick={async () => {
                    setModalType("confirm");
                    setSelected(item);
                    setIsEditMode(true);
                    await loadExhibitorsForEdit(item.id);
                  }}
                  disabled={item.status === "Confirmed"}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Confirm"
                >
                  <i className="fas fa-check"></i>
                </button>
                <button
                  className="btn btn-danger btn-sm me-1"
                  onClick={() => {
                    openModal("reject", item);
                  }}
                  disabled={item.status === "Rejected"}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={item.status === "Rejected" ? "Already rejected" : "Reject"}
                >
                  <i className="fas fa-times"></i>
                </button>
                <button
                  className="btn btn-warning btn-sm me-1"
                  onClick={() => handleWaitingList(item.id)}
                  disabled={
                    item.status === "Confirmed" ||
                    item.status === "Waiting" ||
                    item.status === "Rejected" ||
                    item.waiting_list === 1
                  }
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Waiting List"
                >
                  <i className="fas fa-clock"></i>
                </button>
                <button
                  className="btn btn-dark btn-sm me-1"
                  onClick={() => {
                    openModal("delete", item);
                  }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
                <button
                  className="btn btn-primary btn-sm me-1"
                  onClick={() => generateQR(item)}
                  disabled={item.status !== "Confirmed"}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Generate QR"
                >
                  <i className="fas fa-qrcode"></i>
                </button>
                <button
                  className="btn btn-secondary btn-sm me-1"
                  onClick={async () => {
                    setModalType("addExhibitor");
                    setSelected(item);
                    setIsEditMode(false);
                    try {
                      const res = await axios.get(
                        `${API_BASE_URL}/api/exhibitors/${item.id}`
                      );
                      const nextExhibitorNumber =
                        res.data && res.data.length > 0
                          ? res.data.length + 1
                          : 1;
                      setExhibitors([
                        {
                          name: "",
                          mobile: "",
                          email: "",
                          company: "",
                          exhibitorNo: nextExhibitorNumber
                        }
                      ]);
                    } catch (err) {
                      toast.error("Failed to load exhibitors");
                    }
                  }}
                  data-bs-toggle="tooltip"
                  title="Add Exhibitors"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  className="btn btn-info btn-sm me-1"
                  onClick={() => openModal("edit", item)}
                  data-bs-toggle="tooltip"
                  title="Edit Exhibitors"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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

      {modalType && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3 position-relative">
              <button
                onClick={closeModal}
                style={{
                  color: "#dc2626",
                  fontWeight: "bold",
                  position: "absolute",
                  top: 10,
                  right: 10,
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
              {(modalType === "confirm" || modalType === "edit" || modalType === "addExhibitor") && (
                <>
                  <h5 className="fs-3 mb-3">
                    {modalType === "edit" ? "Edit Exhibitor Details" : "Enter Exhibitor Details"}
                  </h5>
                  {exhibitors.map((ex, index) => (
                    <div key={index} className="border p-2 mb-2 rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="fs-5 text-decoration-underline">Exhibitor - {ex.exhibitorNo || index + 1}</strong>
                        {exhibitors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExhibitor(index)}
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              fontWeight: "bold",
                              borderRadius: "50%",
                              width: "38px",
                              height: "38px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            title="Remove Exhibitor"
                          >
                            −
                          </button>
                        )}
                      </div>
                      <label className="text-dark fw-semibold mt-2 mb-1">Name:</label>
                      <input
                        className="form-control"
                        placeholder="Name"
                        value={ex.name}
                        onChange={(e) =>
                          updateExhibitor(index, "name", e.target.value)
                        }
                      />
                      {exhibitorErrors[index]?.name && (
                        <small className="text-danger d-block mb-2">
                          {exhibitorErrors[index].name}
                        </small>
                      )}
                      <label className="text-dark fw-semibold mt-2 mb-1">Mobile:</label>
                      <input
                        className="form-control"
                        placeholder="Mobile"
                        maxLength={15}
                        value={ex.mobile}
                        onChange={(e) =>
                          updateExhibitor(index, "mobile", e.target.value)
                        }
                      />
                      {exhibitorErrors[index]?.mobile && (
                        <small className="text-danger d-block mb-2">
                          {exhibitorErrors[index].mobile}
                        </small>
                      )}
                      <label className="text-dark fw-semibold mt-2 mb-1">Email:</label>
                      <input
                        className="form-control"
                        placeholder="Email"
                        value={ex.email}
                        onChange={(e) =>
                          updateExhibitor(index, "email", e.target.value)
                        }
                      />
                      {exhibitorErrors[index]?.email && (
                        <small className="text-danger d-block mb-2">
                          {exhibitorErrors[index].email}
                        </small>
                      )}
                      <label className="text-dark fw-semibold mt-2 mb-1">Company:</label>
                      <input
                        className="form-control"
                        placeholder="Company"
                        value={ex.company}
                        onChange={(e) =>
                          updateExhibitor(index, "company", e.target.value)
                        }
                      />
                      {exhibitorErrors[index]?.company && (
                        <small className="text-danger d-block mb-2">
                          {exhibitorErrors[index].company}
                        </small>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-sm btn-primary mt-2" onClick={addExhibitor}>
                    + Add Exhibitor
                  </button>
                </>
              )}
              
              {modalType === "reject" && (
                <>
                  <p className="fw-semibold text-dark">
                    Are you sure you want to reject this exhibitor?
                  </p>
                  <textarea
                    className="form-control mt-2"
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}
              {modalType === "delete" && (
                <p className="fw-semibold text-dark mb-0">
                  Are you sure you want to delete this registration?
                </p>
              )}
              <div className="mt-3 text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                {modalType === "confirm" && (
                  <button
                    className="btn btn-success"
                    onClick={handleConfirm}
                    disabled={loadingAction === "confirm"}
                  >
                    {loadingAction === "confirm" ? "Please wait..." : "Confirm"}
                  </button>
                )}
                {modalType === "addExhibitor" && (
                  <button
                    className="btn btn-primary"
                    onClick={handleAddExhibitor}
                    disabled={loadingAction === "addExhibitor"}
                  >
                    {loadingAction === "addExhibitor"
                      ? "Please wait..."
                      : "Save Exhibitors"}
                  </button>
                )}
                {modalType === "edit" && (
                  <button
                    className="btn btn-success"
                    onClick={handleEditSave}
                  >
                    Save Changes
                  </button>
                )}
                {modalType === "reject" && (
                  <button
                    className="btn btn-danger"
                    onClick={handleReject}
                    disabled={loadingAction === "reject"}
                  >
                    {loadingAction === "reject"
                      ? "Please wait..."
                      : "Confirm Reject"}
                  </button>
                )}
                {modalType === "delete" && (
                  <button
                    className="btn btn-dark"
                    onClick={handleDelete}
                    disabled={loadingAction === "delete"}
                  >
                    {loadingAction === "delete"
                      ? "Please wait..."
                      : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {qrModal && (
          <div
            className="modal d-block"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content p-4 text-center position-relative" style={{ borderRadius: "20px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                <button
                  onClick={() => setQrModal(false)}
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
                    src={qrImage}
                    alt="QR Code"
                    style={{ width: "220px", display: "inline-block" }}
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
                    { label: "Name", value: qrName },
                    { label: "Mobile", value: selected?.mobile },
                    { label: "Email", value: selected?.email },
                    { label: "Company", value: selected?.company }
                  ].map((item, index) => (
                  <div key={index} style={{ 
                    display: "flex",                
                    justifyContent: "left",
                    alignItems: "left",          
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
      <ToastContainer autoClose={1500} />
    </div>
  );
}

export default RegistrationList;
