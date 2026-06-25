import React from "react";
import HeaderFour from "../Components/Header/HeaderFour";
import FooterThree from "../Components/Footer/FooterThree";
import { useNavigate } from "react-router-dom";

function ThankYou() {
  const montserratStyle = {
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: "#fcfcfc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };
  const navigate = useNavigate();

  return (
    <div style={montserratStyle}>
      <HeaderFour />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5" style={{marginTop: "70px"}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" 
                  style={{ width: "90px", height: "90px", border: "1px solid #eee" }}
                >
                  <span style={{ fontSize: "2rem", color: "#593983" }}>✦</span>
                </div>
              </div>
              <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: "15px" }}>
                <span 
                  className="text-uppercase mb-3 d-block" 
                  style={{ letterSpacing: "5px", fontSize: "0.75rem", color: "#593983", fontWeight: "700" }}
                >
                  Registration Pending
                </span>             
                <h1 className="fw-light mb-4" style={{ color: "#000000", fontSize: "2.5rem" }}> Thank you for registering the <br />
                  <span style={{ fontWeight: "700" }}>
                    <span style={{ color: "#593983" }}>Luxury Travel Show</span>
                  </span>
                </h1>
                <div 
                  className="mx-auto mb-4" 
                  style={{ width: "50px", height: "3px", backgroundColor: "#593983" }}
                ></div>
                <p className="lead text-dark mb-2 px-md-5" style={{ lineHeight: "2", fontSize: "1.1rem", fontWeight: "400" }}>
                  Your request has been successfully submitted and is currently under review. Our committee will evaluate the details and get back to you via email shortly.
                </p>
              </div>
                <button
                  onClick={() => navigate("/")}
                  className="btn mt-4"
                  style={{
                    backgroundColor: "#593983",
                    color: "#fff",
                    padding: "12px 30px",
                    borderRadius: "30px",
                    fontWeight: "600",
                    border: "none",
                  }}
                >
                  Go to Home Page
                </button>
                <p className="mt-4 text-muted small" style={{ letterSpacing: "1px", fontWeight: "400" }}>
                  Expected response time: Within 24 business hours
                </p>
            </div>
          </div>
        </div>
      </main>
      <FooterThree />
    </div>
  );
}

export default ThankYou;