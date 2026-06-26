import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ExhibitorDetails = () => {
    const [exhibitors, setExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
    if (!state?.id) {
        setLoading(false);
        return;
    }
    axios
        .get(`${API_BASE_URL}/api/exhibitors/${state.id}`)
        .then((res) => {
        setExhibitors([...(res.data || [])]);
        })
        .catch((err) => {
        console.error("Error fetching exhibitors", err);
        })
        .finally(() => setLoading(false));
    }, [state]);

    return (
        <div className="container mt-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="fw-bold mb-3">Additional Exhibitors</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Back
          </button>
        </div>
        {loading ? (
            <p>Loading...</p>
        ) : exhibitors.length === 0 ? (
            <p className="text-muted">No exhibitors added</p>
        ) : (
                exhibitors.map((ex, index) => (
                <div key={index} className="card mb-3 shadow-sm border-0">
                    <div className="card-body">
                    <h5 className="fw-semibold text-decoration-underline mb-3">
                        Exhibitor {index + 1}
                    </h5>
                    <div className="row mb-2">
                        <div className="col-md-3 fw-bold text-dark">Name:</div>
                        <div className="col-md-9">{ex.name || "—"}</div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-md-3 fw-bold text-dark">Mobile:</div>
                        <div className="col-md-9">{ex.mobile || "—"}</div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-md-3 fw-bold text-dark">Email:</div>
                        <div className="col-md-9">{ex.email || "—"}</div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 fw-bold text-dark">Company:</div>
                        <div className="col-md-9">{ex.company || "—"}</div>
                    </div>
                    </div>
                </div>
                ))
            )}
        </div>
    );
};

export default ExhibitorDetails;