import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VoucherAdmin() {
    const [file, setFile] = useState(null);
    const [existingFileName, setExistingFileName] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const checkExisting = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/voucher-link`);
                if (res.data.url) {
                    setExistingFileName("Golden-Travels.pdf");
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setExistingFileName("No brochure uploaded yet");
                } else {
                    console.error(err);
                }
            }
        };
        checkExisting();
    }, []);

    const handleUpload = async () => {
        if (!file) return toast.error("Please select a file first");
        if (file.type !== "application/pdf") return toast.error("PDF files only!");
        const formData = new FormData();
        formData.append("voucher", file, file.name);
        try {
            setUploading(true);
            const response = await axios.post(`${API_BASE_URL}/api/upload-voucher`,formData);
            if (response.status === 200) {
                toast.success("Brochure Uploaded Successfully");
                setExistingFileName(file.name);
            }
        } catch (error) {
            toast.error("Upload Failed");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container-fluid py-5" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <ToastContainer position="top-right" autoClose={1500} />
            <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                <div className="card-body p-5">
                    <h2 className="mb-4" style={{ fontWeight: "700", color: "#333" }}>Official Brochure</h2>
                    <div className="mb-4 p-3 border rounded bg-light">
                        <small className="text-muted d-block mb-1">Current Active File:</small>
                        <strong className="text-primary">{existingFileName}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label small fw-bold mb-0">
                            Update Brochure (PDF)  
                        </label>
                        <small className="text-muted">
                            (Size must be smaller than or equal to 10 MB)
                        </small>
                    </div>
                    <div className="mb-3">
                       <input 
                            type="file" 
                            className="form-control" 
                            accept="application/pdf"
                            key={file ? file.name : "empty"}
                            onChange={(e) => {
                                const selectedFile = e.target.files[0];
                                if (selectedFile) {
                                    setFile(selectedFile);
                                }
                            }}
                        />
                    </div>
                    <button 
                        className="btn btn-primary w-100 py-2" 
                        style={{ borderRadius: "8px", fontWeight: "600" }}
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? "Processing..." : "Update Brochure"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VoucherAdmin;