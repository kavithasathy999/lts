import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import HeaderFour from "../Components/Header/HeaderFour";
import FooterThree from "../Components/Footer/FooterThree";
import axios from 'axios';
import ScrollToTop from "../Components/ScrollToTop";
import WhoShouldExhibit from "../Components/Guide/WhoShouldExhibit";
import {toast, ToastContainer} from 'react-toastify';
import PhoneInput from "react-phone-input-2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import ReCAPTCHA from "react-google-recaptcha";

function ForVisitors() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const submitToastId = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    mobileNumber: "",
    designation: "",
    email: "",
    visitorType: "Regular Visitor",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address1: "",
    address2: ""
  });
  const [loadingAction] = useState(false);

  const waitForPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    });

  const [settings, setSettings] = useState({
    event_title: "",
    venue: "",
    event_time: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    if (name === "firstName" || name === "lastName") {
      filteredValue = value.replace(/[^A-Za-z\s]/g, "");
    }
    if (name === "companyName") {
      filteredValue = value.replace(/[^A-Za-z\s.&-]/g, "");
    }
    if (name === "city" || name === "state" || name === "country") {
      filteredValue = value.replace(/[^A-Za-z\s]/g, "").slice(0, 50);
    }
    setFormData({
      ...formData,
      [name]: filteredValue
    });
    setErrors({
      ...errors,
      [name]: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!captchaVerified || !recaptchaToken) {
      toast.error("Please verify that you are not a robot.");
      return;
    }
    if (validate()) {
      setLoading(true);
      submitToastId.current = toast.loading("Submitting registration...", {
        closeOnClick: false,
        autoClose: false,
      });

      await waitForPaint();

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (file) {
        formDataToSend.append("file", file);
      }
      formDataToSend.append("recaptchaToken", recaptchaToken);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/visitors/register`, {
          method: "POST",
          body: formDataToSend,
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          toast.update(submitToastId.current, {
            render: "Registration submitted successfully!",
            type: "success",
            isLoading: false,
            autoClose: 1000,
          });
          setRegistered(true);
        } else {
          toast.update(submitToastId.current, {
            render: data.error || "Registration failed",
            type: "error",
            isLoading: false,
            autoClose: 1500,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Connection Error:", error);
        toast.update(submitToastId.current, {
          render: error.name === "AbortError" ? "Submission is taking too long. Please try again." : "Could not connect to server",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setErrors({}); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formRef = useRef(null);

  useEffect(() => {
    if (registered) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [registered]);

  const validate = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const companyRegex = /^[A-Za-z0-9\s.&-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = "Only alphabets allowed";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Only alphabets allowed";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (!companyRegex.test(formData.companyName)) {
      newErrors.companyName = "Invalid company name";
    }
    if (!isValidPhone(formData.mobileNumber)) {
      newErrors.mobileNumber = "Enter valid mobile number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (!nameRegex.test(formData.country)) {
      newErrors.country = "Only alphabets allowed";
    } else if (formData.country.length > 50) {
      newErrors.country = "Country cannot exceed 50 characters";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    } else if (!nameRegex.test(formData.state)) {
      newErrors.state = "Only alphabets allowed";
    } else if (formData.state.length > 50) {
      newErrors.state = "State cannot exceed 50 characters";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (!nameRegex.test(formData.city)) {
      newErrors.city = "Only alphabets allowed";
    } else if (formData.city.length > 50) {
      newErrors.city = "City cannot exceed 50 characters";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }
    if (!formData.address1.trim()) {
      newErrors.address1 = "Address Line 1 is required";
    }
    if (!file) {
      newErrors.file = "File is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const isValidPhone = (phone) => {
    if (!phone) return false;
    try {
      const cleaned = phone.replace(/\s/g, "");
      const phoneNumber = parsePhoneNumberFromString(cleaned);
      return phoneNumber ? phoneNumber.isValid() : false;
    } catch {
      return false;
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/visitor-settings`);
      if (res.data && res.data.event_title) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Setup required: Please fill in event details.");
    }
  };

  if (registered) {
    const successPageStyle = {
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: "#fcfcfc",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <div style={successPageStyle}>
        <HeaderFour />
        <ToastContainer position="top-right" autoClose={1500} />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5" style={{ marginTop: "70px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm"
                    style={{ width: "90px", height: "90px", border: "1px solid #eee" }}
                  >
                    <span style={{ fontSize: "2rem", color: "#593983" }}>{"\u2726"}</span>
                  </div>
                </div>
                <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: "15px" }}>
                  <span
                    className="text-uppercase mb-3 d-block"
                    style={{ letterSpacing: "5px", fontSize: "0.75rem", color: "#593983", fontWeight: "700" }}
                  >
                    Registration Pending
                  </span>
                  <h1 className="fw-light mb-4" style={{ color: "#000000", fontSize: "2.5rem" }}>
                    Thank you for registering the <br />
                    <span style={{ fontWeight: "700", color: "#593983" }}>Luxury Travel Show</span>
                  </h1>
                  <div
                    className="mx-auto mb-4"
                    style={{ width: "50px", height: "3px", backgroundColor: "#593983" }}
                  ></div>
                  <p className="lead text-dark mb-2 px-md-5" style={{ lineHeight: "2", fontSize: "1.1rem", fontWeight: "400" }}>
                    Thank you for your submission. Your request is currently under review, and our team will contact you via email once the evaluation is complete. We look forward to welcoming you to the event.
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
              </div>
            </div>
          </div>
        </main>
        <FooterThree />
      </div>
    );
  }

  return (
    <section className="for-visitors-page">
      <HeaderFour />
      <ToastContainer position="top-right" autoClose={1500} />
      <section className="our-visitors-section py-2">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="visitor-image-wrapper">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/visitors/visitorimage.jpg`}
                  alt="Travel Event Visitors"
                  className="img-fluid rounded-4 shadow-lg"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3 visitors-title">
                Luxury Travel Show 2026
              </h2>
              <p className="text-dark visitors-text">
                We Travel Agent Association of Coimbatore happy to invite you  for the trade visitor registration for our  2nd Edition of Luxury Travel Show – 2026 to be held on 01st August 2026 at Hotel Merlis , Avinashi Road, Goldwins , Coimbatore- 641014 .
              </p>
              <p className="text-dark visitors-text">
              Visit and explore the Luxury B2B travel show at LTS 2026. Meet more than 85 Plus exhibitors from more than 10 countries and Major Indian States & Union Territories ensuring a remarkable networking and business experience with the best in the travel Industry.
              </p>
              <p className="text-dark visitors-text">
                Trade visitor registration 
              </p>
             
              <div className="mt-4 d-flex justify-content-center justify-content-lg-start">
                <span className="visitor-badge">
                     Do Not Miss Out !!!!
                </span>
            </div>
            </div>
          </div>
        </div>
      </section>
      {/* <WhoShouldExhibit /> */}

      <section className="registration-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="registration-card p-3 p-sm-4 p-md-5" ref={formRef}>
                <h2 
                  className="text-center mb-5 fw-bold" 
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif", 
                    color: "#593983", 
                    fontSize: "2.2rem",
                    letterSpacing: "-1px"
                  }}
                >
                  Trade Visitor Registration
                </h2>              
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label-custom">First Name <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={formData.firstName}
                          className="form-control-custom" 
                          placeholder="e.g. John"
                          onChange={handleInputChange}
                        />
                      {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-custom">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={formData.lastName}
                          className="form-control-custom" 
                          placeholder="e.g. Doe"
                          onChange={handleInputChange}
                        />
                      {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-custom">Company Name <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                      <input 
                        type="text" 
                        name="companyName" 
                        value={formData.companyName}
                        className="form-control-custom" 
                        placeholder="Enter Organization"
                        onChange={handleInputChange}
                      />
                      {errors.companyName && <small className="text-danger">{errors.companyName}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-custom">Mobile Number <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                        <PhoneInput
                          country={"in"}
                          value={formData.mobileNumber}
                          onChange={(value, data) => {
                          const dialCode = data.dialCode;
                          let numericValue = value.replace(/\D/g, "");
                          let numberOnly = numericValue.startsWith(dialCode)
                            ? numericValue.slice(dialCode.length)
                            : numericValue;
                          const formattedNumber = `+${dialCode} ${numberOnly}`;
                          setFormData({ 
                            ...formData, 
                            mobileNumber: formattedNumber 
                          });
                          setErrors({ ...errors, mobileNumber: "" });
                        }}
                        prefix="+"
                        enableSearch={false}
                        countryCodeEditable={false}   
                        disableDropdown={false}       
                        inputClass="form-control-custom"
                        containerClass="w-100"
                        inputStyle={{
                          width: "100%",
                          height: "52px",
                          borderRadius: "10px",
                          backgroundColor: "#f9f9f9",
                          border: "1px solid #e0e0e0"
                        }}
                        buttonStyle={{
                          border: "none",
                          background: "transparent"
                        }}
                      />
                      {errors.mobileNumber && (
                        <small className="text-danger">{errors.mobileNumber}</small>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label-custom">Designation <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        className="form-control-custom"
                        placeholder="e.g. Manager"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) {
                            setFormData({
                              ...formData,
                              designation: value
                            });
                            setErrors({
                              ...errors,
                              designation: ""
                            });
                          } else {
                            setErrors({
                              ...errors,
                              designation: "Only alphabets are allowed"
                            });
                          }
                        }}
                      />
                      {errors.designation && (
                        <small className="text-danger">{errors.designation}</small>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label-custom">Mail Id <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        className="form-control-custom" 
                        placeholder="john@example.com"
                        onChange={handleInputChange}
                      />
                      {errors.email && <small className="text-danger">{errors.email}</small>}
                    </div>

                    <div className="col-12">
                      <label className="form-label-custom">Address Line 1 <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                      <input
                        type="text"
                        name="address1"
                        value={formData.address1}
                        className="form-control-custom"
                        placeholder="Street / Area"
                        onChange={handleInputChange}
                      />
                      {errors.address1 && <small className="text-danger">{errors.address1}</small>}
                    </div>

                    <div className="col-12">
                      <label className="form-label-custom">Address Line 2 (optional)</label>
                      <input
                        type="text"
                        name="address2"
                        value={formData.address2}
                        className="form-control-custom"
                        placeholder="Apartment, Suite, etc."
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* CITY - First field */}
                    <div className="col-md-6">
                      <label className="form-label-custom">
                        City <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        className="form-control-custom"
                        placeholder="Enter City"
                        onChange={handleInputChange}
                        maxLength={50}
                      />
                      {errors.city && <small className="text-danger">{errors.city}</small>}
                    </div>

                    {/* STATE - Second field */}
                    <div className="col-md-6">
                      <label className="form-label-custom">
                        State <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        className="form-control-custom"
                        placeholder="Enter State"
                        onChange={handleInputChange}
                        maxLength={50}
                      />
                      {errors.state && <small className="text-danger">{errors.state}</small>}
                    </div>

                    {/* COUNTRY - Third field */}
                    <div className="col-md-6">
                      <label className="form-label-custom">
                        Country <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        className="form-control-custom"
                        placeholder="Enter Country"
                        onChange={handleInputChange}
                        maxLength={50}
                      />
                      {errors.country && <small className="text-danger">{errors.country}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label-custom">Pincode <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span></label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        className="form-control-custom"
                        placeholder="Enter Pincode"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); 
                          setFormData({
                            ...formData,
                            pincode: value,
                          });
                        }}
                      />
                      {errors.pincode && <small className="text-danger">{errors.pincode}</small>}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-uppercase text-dark">
                        Upload Business Card <span className="text-danger" style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1" }}>*</span>
                      </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".png,.jpg,.jpeg,.pdf"
                      className="form-control-custom"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
                          if (!allowedTypes.includes(selectedFile.type)) {
                            toast.error("Only PNG, JPG, JPEG or PDF allowed");
                            return;
                          }
                          setFile(selectedFile);
                          setErrors({ ...errors, file: "" });
                        }
                      }}
                    />
                    {errors.file && <small className="text-danger">{errors.file}</small>}
                  </div>

                  {/* ── Google reCAPTCHA ── */}
                  <div className="col-12 mt-3 d-flex justify-content-start">
                    <div className="recaptcha-responsive-container" style={{ overflow: "hidden", maxWidth: "100%" }}>
                      <ReCAPTCHA
                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                        onChange={(token) => {
                          if (token) {
                            setCaptchaVerified(true);
                            setRecaptchaToken(token);
                          } else {
                            setCaptchaVerified(false);
                            setRecaptchaToken("");
                          }
                        }}
                      />
                    </div>
                  </div>

                    <div className="col-12 mt-5">
                      <button 
                        type="submit" 
                        className="btn w-100 register-btn-impressive" 
                        disabled={loading}
                        aria-busy={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Please wait...
                          </>
                        ) : (
                          "Register Now"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterThree />
      <ScrollToTop />
    </section>
  );
}

export default ForVisitors;
