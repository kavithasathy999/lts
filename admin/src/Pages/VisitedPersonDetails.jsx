import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function VisitedPersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/visitor/${id}`)
      .then((res) => setVisitor(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!visitor) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-3">Visitor Details</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Back
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <tbody>
              <tr>
                <td className="fw-semibold ps-4 bg-light" style={{ width: "30%" }}>Exhibitor Company</td>
                <td className="ps-4">{visitor.company_name}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Contact Person</td>
                <td className="ps-4">{visitor.first_name}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Email Address</td>
                <td className="text-primary ps-4">{visitor.email}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Mobile Number</td>
                <td className="ps-4">{visitor.mobile_number}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Designation</td>
                <td className="ps-4">{visitor.designation || "—"}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Country</td>
                <td className="ps-4">{visitor.country}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">State</td>
                <td className="ps-4">{visitor.state}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">City</td>
                <td className="ps-4">{visitor.city}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Pincode</td>
                <td className="ps-4">{visitor.pincode}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Address Line 1</td>
                <td className="ps-4">{visitor.address1}</td>
              </tr>
              <tr>
                <td className="fw-semibold ps-4 bg-light">Address Line 2 (Optional)</td>
                <td className="ps-4">{visitor.address2 || "—"}</td>
              </tr>
                <tr>
                  <th className="fw-semibold ps-4 bg-light">Visitor Business Card</th>
                   <td>
                    {visitor.file_path ? (
                    visitor.file_name?.match(/\.(jpeg|jpg|png)$/i) ? (
                        <img
                        src={`${API_BASE_URL}/${visitor.file_path}`}
                        alt="Uploaded"
                        style={{ width: "380px", height: "280px", borderRadius: "6px", cursor: "pointer" }}
                        onClick={() =>
                            setPreviewImage(`${API_BASE_URL}/${visitor.file_path}`)
                        }
                        />
                    ) : visitor.file_name?.match(/\.pdf$/i) ? (
                        <iframe
                        src={`${API_BASE_URL}/${visitor.file_path}`}
                        title="PDF Preview"
                        style={{ width: "380px", height: "280px", border: "none" }}
                        />
                    ) : (
                        <a
                        href={`${API_BASE_URL}/${visitor.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        {visitor.file_name}
                        </a>
                    )
                    ) : "-"}
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VisitedPersonDetails;