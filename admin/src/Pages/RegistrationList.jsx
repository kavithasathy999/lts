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
  const [qrExhibitors, setQrExhibitors] = useState([]);
  const [activePersonIndex, setActivePersonIndex] = useState(0);
  const [qrModal, setQrModal] = useState(false);
  const [isPrintingActive, setIsPrintingActive] = useState(false);
  const [showStartPrintModal, setShowStartPrintModal] = useState(false);
  const [showStopPrintModal, setShowStopPrintModal] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState("all");
  const batchPrintWindowRef = React.useRef(null);
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
          setExhibitors([{ name: item?.name || "", mobile: item?.mobile || "", email: item?.email || "", company: item?.company || "" }]);
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

  const loadExhibitorsForEdit = async (item) => {
    const regId = typeof item === "object" ? item.id : item;
    const defaultComp = typeof item === "object" ? item.company : "";
    const defaultName = typeof item === "object" ? item.name : "";
    const defaultMob = typeof item === "object" ? item.mobile : "";
    const defaultEmail = typeof item === "object" ? item.email : "";
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/exhibitors/${regId}`
      );
      if (res.data && res.data.length > 0) {
        setExhibitors(res.data);
      } else {
        setExhibitors([
          { name: defaultName, mobile: defaultMob, email: defaultEmail, company: defaultComp }
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
      setActivePersonIndex(0);
      const res = await axios.get(
        `${API_BASE_URL}/api/generate-qr/${item.id}`
      );
      setSelected(item);
      if (res.data.exhibitors && res.data.exhibitors.length > 0) {
        setQrExhibitors(
          res.data.exhibitors.map((ex) => ({
            ...ex,
            qrUrl: `${API_BASE_URL}/qrcodes/${ex.fileName || ex.file}`
          }))
        );
      } else {
        const fileName = res.data.file;
        const url = `${API_BASE_URL}/qrcodes/${fileName}`;
        setQrExhibitors([
          {
            id: `main_${item.id}`,
            exhibitorNo: 1,
            isPrimary: true,
            name: item.name,
            mobile: item.mobile,
            company: item.company,
            qrUrl: url
          }
        ]);
      }
      setQrModal(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "QR failed");
    }
  };

  const printQR = (exhibitor) => {
    const targetEx = exhibitor || qrExhibitors[0];
    if (!targetEx) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${targetEx.name || "Exhibitor"}</title>
          <style>
            @page {
              margin: 0;
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              flex-direction: column;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
            }
            .card {
              border: none;
              padding: 10px;
              text-align: center;
              width: 320px;
              background: #ffffff;
            }
            img {
              width: 220px;
              height: 220px;
              margin-bottom: 8px;
            }
            .info-box {
              background: transparent;
              padding: 5px 0;
              border: none;
              text-align: center;
            }
            .val-name {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .val-mobile {
              font-size: 15px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 6px;
            }
            .val-company {
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${targetEx.qrUrl}" />
            <div class="info-box">
              <div class="val-name">${targetEx.name || "—"}</div>
              <div class="val-mobile">${targetEx.mobile || "—"}</div>
              <div class="val-company">${targetEx.company || "—"}</div>
            </div>
          </div>
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

  const downloadQR = async (exhibitor) => {
    const targetEx = exhibitor || qrExhibitors[0];
    if (!targetEx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = targetEx.qrUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 340;
      canvas.height = 420;
      
      // Card Background (No Border)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR Code Image
      ctx.drawImage(img, 45, 15, 250, 250);

      ctx.textAlign = "center";
      const centerX = canvas.width / 2;

      let currentY = 295;

      // NAME (Centered, Same Dark Color #0f172a)
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Arial";
      ctx.fillText(targetEx.name || "—", centerX, currentY);
      currentY += 28;

      // MOBILE (Centered, Same Dark Color #0f172a)
      ctx.fillStyle = "#0f172a";
      ctx.font = "600 15px Arial";
      ctx.fillText(targetEx.mobile || "—", centerX, currentY);
      currentY += 28;

      // COMPANY (Centered, Same Dark Color #0f172a, Extra Bold)
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 17px Arial";
      ctx.fillText(targetEx.company || "—", centerX, currentY);

      const link = document.createElement("a");
      const safeName = (targetEx.name || "Exhibitor").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `Exhibitor_QR_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const companyOptions = Array.from(
    new Set(
      data
        .filter((item) => item.status === "Confirmed" && item.company && item.company.trim())
        .map((item) => item.company.trim())
    )
  ).sort();

  const handleStartBatchPrint = async () => {
    setShowStartPrintModal(false);

    let confirmedList = data.filter((item) => item.status === "Confirmed");
    if (selectedCompanyFilter !== "all") {
      confirmedList = confirmedList.filter(
        (item) => item.company && item.company.trim() === selectedCompanyFilter
      );
    }

    if (confirmedList.length === 0) {
      toast.error("No confirmed exhibitors found for selected company filter");
      return;
    }

    confirmedList.sort((a, b) => (a.company || "").localeCompare(b.company || ""));

    setIsPrintingActive(true);
    const toastId = toast.loading("Preparing print document...", {
      closeOnClick: false,
      autoClose: false,
    });

    try {
      const allExhibitorCards = [];

      for (let i = 0; i < confirmedList.length; i++) {
        const item = confirmedList[i];
        try {
          const res = await axios.get(`${API_BASE_URL}/api/generate-qr/${item.id}`);
          if (res.data.exhibitors && res.data.exhibitors.length > 0) {
            res.data.exhibitors.forEach((ex) => {
              allExhibitorCards.push({
                ...ex,
                qrUrl: `${API_BASE_URL}/qrcodes/${ex.fileName || ex.file}`
              });
            });
          } else {
            allExhibitorCards.push({
              name: item.name,
              mobile: item.mobile,
              company: item.company,
              qrUrl: `${API_BASE_URL}/qrcodes/${res.data.file}`
            });
          }
        } catch (e) {
          console.error(`QR fetch failed for item ${item.id}`, e);
        }
      }

      toast.dismiss(toastId);

      if (allExhibitorCards.length === 0) {
        toast.error("Failed to generate QR codes for print");
        setIsPrintingActive(false);
        return;
      }

      const printWindow = window.open("", "_blank");
      batchPrintWindowRef.current = printWindow;

      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups to print.");
        setIsPrintingActive(false);
        return;
      }

      const cardsHtml = allExhibitorCards.map((ex) => `
        <div class="card">
          <img src="${ex.qrUrl}" />
          <div class="info-box">
            <div class="val-name">${ex.name || "—"}</div>
            <div class="val-mobile">${ex.mobile || "—"}</div>
            <div class="val-company">${ex.company || "—"}</div>
          </div>
        </div>
      `).join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Exhibitors</title>
            <style>
              @page {
                margin: 0;
              }
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 30px;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                box-sizing: border-box;
                background: #ffffff;
              }
              .card {
                border: none;
                padding: 10px;
                text-align: center;
                width: 300px;
                background: #ffffff;
                page-break-inside: avoid;
              }
              img {
                width: 220px;
                height: 220px;
                margin-bottom: 8px;
              }
              .info-box {
                background: transparent;
                padding: 5px 0;
                border: none;
                text-align: center;
              }
              .val-name {
                font-size: 18px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 4px;
              }
              .val-mobile {
                font-size: 15px;
                font-weight: 600;
                color: #0f172a;
                margin-bottom: 6px;
              }
              .val-company {
                font-size: 17px;
                font-weight: 800;
                color: #0f172a;
              }
            </style>
          </head>
          <body>
            ${cardsHtml}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      const checkWindowClosed = setInterval(() => {
        if (!printWindow || printWindow.closed) {
          clearInterval(checkWindowClosed);
          setIsPrintingActive(false);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Error generating print document");
      setIsPrintingActive(false);
    }
  };

  const handleStopBatchPrint = () => {
    if (batchPrintWindowRef.current && !batchPrintWindowRef.current.closed) {
      try {
        batchPrintWindowRef.current.close();
      } catch (e) {
        console.error(e);
      }
    }
    setIsPrintingActive(false);
    setShowStopPrintModal(false);
    toast.info("Printing stopped");
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

        <div>
          {!isPrintingActive ? (
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => setShowStartPrintModal(true)}
            >
              <i className="fas fa-print me-1"></i> Print
            </button>
          ) : (
            <button
              className="btn btn-danger btn-sm me-2"
              onClick={() => setShowStopPrintModal(true)}
            >
              <i className="fas fa-times me-1"></i> Cancel
            </button>
          )}

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
        </div>
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
                    await loadExhibitorsForEdit(item);
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
                      const existing = res.data || [];
                      const nextExhibitorNumber =
                        existing.length > 0 ? existing.length + 1 : 1;
                      setExhibitors([
                        ...existing,
                        {
                          name: "",
                          mobile: "",
                          email: "",
                          company: item.company || "",
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
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: "550px" }}>
            <div
              className="modal-content p-4 position-relative"
              style={{
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0 text-dark">
                  Exhibitor QR Code
                </h5>
                <button
                  onClick={() => setQrModal(false)}
                  style={{
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
              </div>

              {qrExhibitors.length > 1 && (
                <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                  {qrExhibitors.map((_, idx) => (
                    <button
                      key={idx}
                      className={`btn btn-sm ${
                        activePersonIndex === idx ? "btn-primary shadow-sm" : "btn-outline-secondary"
                      }`}
                      onClick={() => setActivePersonIndex(idx)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 18px",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      Person {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {(() => {
                const activeEx = qrExhibitors[activePersonIndex] || qrExhibitors[0];
                if (!activeEx) return null;
                return (
                  <div
                    className="p-3 text-center border-0 rounded-4 position-relative"
                    style={{ background: "#ffffff" }}
                  >
                    <div
                      className="mb-2 text-center"
                      style={{
                        background: "#fff",
                        padding: "5px",
                        display: "inline-block",
                        borderRadius: "15px"
                      }}
                    >
                      <img
                        src={activeEx.qrUrl}
                        alt={`QR Code ${activeEx.name}`}
                        style={{ width: "220px", display: "inline-block" }}
                      />
                    </div>

                    <div
                      style={{
                        padding: "10px 15px",
                        textAlign: "center",
                        border: "none"
                      }}
                    >
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        {activeEx.name || "—"}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>
                        {activeEx.mobile || "—"}
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                        {activeEx.company || "—"}
                      </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-primary px-4"
                        onClick={() => printQR(activeEx)}
                        style={{ borderRadius: "10px", fontWeight: "600", padding: "10px 25px" }}
                      >
                        Print
                      </button>
                      <button
                        className="btn btn-success px-4"
                        onClick={() => downloadQR(activeEx)}
                        style={{ borderRadius: "10px", fontWeight: "600", padding: "10px 25px" }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {showStartPrintModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center position-relative" style={{ borderRadius: "15px" }}>
              <h5 className="fw-bold mb-3 text-dark">Print Exhibitors</h5>
              <p className="text-dark fw-bold~ mb-3 fs-6">Are you sure want to print?</p>

              <div className="mb-4 text-start">
                <label className="fw-bold text-dark mb-1 fs-6">Company Name:</label>
                <select
                  className="form-select"
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {companyOptions.map((comp, idx) => (
                    <option key={idx} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowStartPrintModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleStartBatchPrint}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStopPrintModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center position-relative" style={{ borderRadius: "15px" }}>
              <h5 className="fw-bold mb-3 text-dark">Stop Printing</h5>
              <p className="text-secondary mb-4 fs-6">Are you sure want to stop printing</p>

              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowStopPrintModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={handleStopBatchPrint}
                >
                  Yes
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
