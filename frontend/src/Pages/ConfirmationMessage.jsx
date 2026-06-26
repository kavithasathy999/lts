import React from "react";

function ConfirmationMessage() {
  return (
    <div>
      <div className="container text-center mb-5" style={{marginTop: "120px"}}>
        <div className="card shadow p-4">
          <h3 className="mb-3">Registration Successfull</h3>
          <p>
            Thank you for registering for the <b>Luxury Travel Show</b>
          </p>
          <p>
            Our backend team will review your request and contact you shortly
            for stall booking confirmation and further details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationMessage;