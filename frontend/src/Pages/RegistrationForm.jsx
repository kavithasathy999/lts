import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderFour from "../Components/Header/HeaderFour";
import FooterThree from "../Components/Footer/FooterThree";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";
import Select from 'react-select';
import { Country, State, City } from "country-state-city";
import ReCAPTCHA from "react-google-recaptcha";
import { FaCircle } from "react-icons/fa";
import ScrollToTop from "../Components/ScrollToTop";
import VoucherFloat from "../Components/Tour/VoucherFloat";

function RegistrationForm() {
  const navigate = useNavigate();
  const [mapUrl, setMapUrl] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStall, setSelectedStall] = useState("");
  const captchaRef = useRef(null);
  const [errors, setErrors] = useState({ exhibitorCompanyName: "", contactPersonName: "" });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const [selectedStallPrice, setSelectedStallPrice] = useState(0);
  const submitToastId = useRef(null);
  const submitInProgressRef = useRef(false);

  const [formData, setFormData] = useState({
    exhibitorCompanyName: "",
    contactPersonName: "",
    mailId: "",
    contactNumber: "",
    gstAvailable: "",
    gstNumber: "",
    numberOfExhibitors: "",
    pincode: "",
    address1: "",
    address2: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "gstNumber" ? value.toUpperCase() : value,
    });
  };
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const isValidGST = (gst) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst);
  const emailValid = isValidEmail(formData.mailId);
  const isValidPhone = (phone) => {
    if (!phone) return false;
    try {
      const cleaned = phone.replace(/\s/g, "");
      const phoneNumber = parsePhoneNumberFromString(cleaned);
      return phoneNumber ? phoneNumber.isValid() : false;
    } catch (err) {
      return false;
    }
  };
  const gstValid = formData.gstAvailable === "no" || isValidGST(formData.gstNumber);
  const countryOptions = Country.getAllCountries().map(c => ({
    value: c.isoCode,
    label: c.name
  }));
  const stateOptions = selectedCountry
  ? State.getStatesOfCountry(selectedCountry.value).map(s => ({
      value: s.isoCode,
      label: s.name
    }))
  : [];
  const cityOptions = selectedState
  ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({
      value: c.name,
      label: c.name
    }))
  : [];

  const allFilled =
    formData.exhibitorCompanyName &&
    formData.contactPersonName &&
    emailValid &&
    isValidPhone(formData.contactNumber) &&
    formData.gstAvailable &&
    (formData.gstAvailable === "no" || formData.gstNumber) &&
    formData.numberOfExhibitors &&
    gstValid &&
    selectedZone &&
    selectedStall && 
    selectedCountry &&
    selectedState &&
    selectedCity &&
    formData.address1 &&   
    captchaValue;

    const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "5px",
      borderColor: "#dee2e6",
      boxShadow: "none",
      minHeight: "54px",
      height: "54px",
      "&:hover": { borderColor: "#512e8e" }
    }),
    valueContainer: (base) => ({
      ...base,
      height: "52px",
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "52px",
    }),
    option: (base, state) => ({
     ...base,
    backgroundColor: state.isSelected ? "#512e8e" : state.isFocused ? "#f3e0ff" : "#fff",
    color: state.isSelected ? "#fff" : "#333",
    cursor: state.isDisabled ? "not-allowed" : "default",
    })
  };

  const handleNext = async (e) => {
    e?.preventDefault();
    if (loadingAction || submitInProgressRef.current) return;

    let newErrors = {};
    if (!formData.exhibitorCompanyName) {
      newErrors.exhibitorCompanyName = "Exhibitor company name is required";
    }
    if (!formData.numberOfExhibitors) {
      newErrors.numberOfExhibitors = "Number of exhibitors is required";
    }
    if (!formData.contactPersonName) {
      newErrors.contactPersonName = "Contact person name is required";
    }
    if (!formData.mailId) {
      newErrors.mailId = "Mail Id is required";
    } else if (!emailValid) {
      newErrors.mailId = "Invalid email";
    }
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!isValidPhone(formData.contactNumber)) {
      newErrors.contactNumber = "Invalid phone number";
    }
    if (!formData.gstAvailable) {
      newErrors.gstAvailable = "Please select GST availability";
    }
    if (
      formData.gstAvailable === "yes" &&
      !formData.gstNumber
    ) {
      newErrors.gstNumber = "GST number is required";
    } else if (
      formData.gstAvailable === "yes" &&
      !isValidGST(formData.gstNumber)
    ) {
      newErrors.gstNumber = "Invalid GST";
    }
    if (!selectedZone) {
      newErrors.selectedZone = "Please select a zone";
    }
    if (!selectedStall) {
      newErrors.selectedStall = "Please select a stall";
    }
    if (!formData.address1) {
      newErrors.address1 = "Address Line 1 is required";
    }
    if (!selectedCountry) {
      newErrors.selectedCountry = "Country is required";
    }
    if (!selectedState) {
      newErrors.selectedState = "State is required";
    }
    if (!selectedCity) {
      newErrors.selectedCity = "City is required";
    }
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    }
    if (!captchaValue) {
      newErrors.captcha = "Please complete captcha";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !captchaValue) {
      return;
    }
    submitInProgressRef.current = true;
    setLoadingAction(true);
    submitToastId.current = toast.loading("Submitting registration...");

    const payload = {
      name: formData.contactPersonName,
      company: formData.exhibitorCompanyName,
      mobile: formData.contactNumber,
      email: formData.mailId,
      gst: formData.gstNumber,
      numberOfExhibitors: formData.numberOfExhibitors,
      zone: selectedZone,
      stall: selectedStall,
      stallPrice: selectedStallPrice,
      country: selectedCountry?.label,
      state: selectedState?.label,
      city: selectedCity?.label,
      pincode: formData.pincode,
      address1: formData.address1,
      address2: formData.address2,
      captcha: captchaValue
    };
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/register`, payload);
      toast.update(submitToastId.current, {
        render: "Registration Submitted!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      setTimeout(() => navigate("/thank-you"), 700);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR RESPONSE:", err.response?.data);
      const errorMsg = err.response?.data?.error;
      let toastMessage = errorMsg || "Error submitting form";
      captchaRef.current?.reset();
      setCaptchaValue(null);
      if (errorMsg === "Stall already booked") {
        toastMessage = "This stall is already booked. Please select another.";
      } else if (errorMsg === "Captcha is required") {
        toastMessage = "Please complete captcha";
      } else if (errorMsg === "Captcha verification failed") {
        toastMessage = "Captcha verification failed. Try again.";
      }
      toast.update(submitToastId.current, {
        render: toastMessage,
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
      setLoadingAction(false);
      submitInProgressRef.current = false;
    }
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/map`)
      .then((res) => setMapUrl(res.data.mapImageUrl))
      .catch((err) => console.log(err));

    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/zones`)
      .then((res) => {
        setZones(res.data);
      })
      .catch((err) => console.log("Zone fetch error:", err));
  }, []);

  const zoneOptions = zones
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map((z) => ({
      value: z.id,
      label: `Zone ${z.name} ${z.stalls.every((s) => s.isBooked) ? "🔴 Full" : ""}`,
      isDisabled: z.stalls.every((s) => s.isBooked)
    }));

  const currentZoneData = zones.find((z) => z.id === selectedZone);
  const stallOptions = currentZoneData?.stalls
    ?.slice()
    .sort((a, b) => parseInt(a.stall_no) - parseInt(b.stall_no))
    .map((s) => ({
      value: s.id,
      label: (
        <>
          Stall {s.stall_no} - ₹{parseInt(s.price || 0)}{" "}
          {s.isBooked ? (
            <>
              <FaCircle color="red" size={20} /> Booked
            </>
          ) : (
            <>
              <FaCircle color="green" size={20} /> Available
            </>
          )}
        </>
      ),
      price: s.price,
      isDisabled: s.isBooked
    }));

    useEffect(() => {
      const handleClickOutside = (event) => {
        const formElement = document.querySelector("form");
        if (formElement && !formElement.contains(event.target)) {
          setErrors({});
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);

  return (
    <>
      <HeaderFour />
      <section className="expo-hero">
        <div className="expo-overlay">
          <div className="container text-center text-white">
            <h1 className="expo-title">
              Showcase Your Brand at the Luxury Travel Show
            </h1>
            <p className="expo-subtitle">
              Connect with global travelers, industry leaders, and premium partners.
              Secure your stall and elevate your presence in the travel industry.
            </p>
          </div>
        </div>
      </section>
      <section className="registration-section">
        <div className="container">
          <div className="row align-items-stretch g-4">
                {/* MAP SIDE */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="shadow-lg p-3 rounded h-100 d-flex flex-column justify-content-between bg-white" style={{ width: "100%" }}>
                        {mapUrl ? (
                            <img
                                src={`${mapUrl}?t=${Date.now()}`}
                                alt="Stall Map"
                                className="img-fluid rounded w-100"
                            />
                        ) : (
                            <p>Loading map...</p>
                        )}
                        <div className="visitor-gallery-container">
                            <div className="visitor-gallery-large-wrapper">
                                <img
                                    src={`${process.env.PUBLIC_URL}/assets/img/visitors/DSC02967.JPG`}
                                    alt="Visitor View 1"
                                    className="img-fluid rounded w-100 h-100"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className="row g-2 visitor-gallery-small-row">
                                <div className="col-6 visitor-gallery-small-wrapper p-0 pe-1">
                                    <img
                                        src={`${process.env.PUBLIC_URL}/assets/img/visitors/DSC02836.JPG`}
                                        alt="Visitor View 2"
                                        className="img-fluid rounded w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <div className="col-6 visitor-gallery-small-wrapper p-0 ps-1">
                                    <img
                                        src={`${process.env.PUBLIC_URL}/assets/img/visitors/DSC02853.JPG`}
                                        alt="Visitor View 3"
                                        className="img-fluid rounded w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 col-md-12 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <div className="bg-white rounded-4 p-4 p-md-5 shadow-lg border h-100" style={{ borderRadius: "5px" }}>
                    <h3 className="text-center mb-4 fw-bold" style={{ color: "#512e8e" }}>
                      Exhibitor Registration
                    </h3>
                    <form className="row g-3" onSubmit={handleNext}>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-uppercase text-dark">
                          Exhibitor Company Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="exhibitorCompanyName"
                          className="form-control"
                          style={{ 
                            height: '52px', 
                            borderRadius: '5px', 
                            borderColor: '#dee2e6',
                            fontFamily: 'Montserrat, sans-serif' 
                          }}
                          value={formData.exhibitorCompanyName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              exhibitorCompanyName: val,
                            });
                            setErrors({
                              ...errors,
                              exhibitorCompanyName: /[0-9]/.test(val)
                                ? "Numbers are not allowed"
                                : "",
                            });
                          }}
                          disabled={loadingAction}
                        />
                        {errors.exhibitorCompanyName && (
                          <small className="text-danger">{errors.exhibitorCompanyName}</small>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-uppercase text-dark">
                          Number of Exhibitors
                        </label>
                        <input
                          type="text"
                          name="numberOfExhibitors"
                          className="form-control"
                          value={formData.numberOfExhibitors}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setFormData({
                                ...formData,
                                numberOfExhibitors: ""
                              });
                              setErrors({
                                ...errors,
                                numberOfExhibitors: ""
                              });
                              return;
                            }
                            if (/^[0-9]+$/.test(value)) {
                              setFormData({
                                ...formData,
                                numberOfExhibitors: value
                              });
                              setErrors({
                                ...errors,
                                numberOfExhibitors: ""
                              });
                            } else {
                              setErrors({
                                ...errors,
                                numberOfExhibitors:
                                  "Alphabets or special characters are not allowed"
                              });
                            }
                          }}
                        />
                        {errors.numberOfExhibitors && (
                          <small className="text-danger">
                            {errors.numberOfExhibitors}
                          </small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-dark">
                          Contact Person Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactPersonName"
                          className="form-control"
                          style={{ 
                            height: '52px', 
                            borderRadius: '5px', 
                            borderColor: '#dee2e6',
                            fontFamily: 'Montserrat, sans-serif' 
                          }}
                          value={formData.contactPersonName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              contactPersonName: val,
                            });
                            setErrors({
                              ...errors,
                              contactPersonName: /[0-9]/.test(val)
                                ? "Numbers are not allowed"
                                : "",
                            });
                          }}
                          disabled={loadingAction}
                        />
                        {errors.contactPersonName && (
                          <small className="text-danger">{errors.contactPersonName}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-dark">
                          Mail Id <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="mailId"
                          className="form-control"
                          style={{ 
                            height: '52px', 
                            borderRadius: '5px', 
                            borderColor: '#dee2e6',
                            fontFamily: 'Montserrat, sans-serif' 
                          }}
                          value={formData.mailId}
                          onChange={handleChange}
                          disabled={loadingAction}
                        />
                        {errors.mailId && (
                          <small className="text-danger">{errors.mailId}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-dark">
                          Contact Number <span className="text-danger">*</span>
                        </label>
                        <PhoneInput
                          country={"in"}
                          value={formData.contactNumber}
                          countryCodeEditable={false}
                          onChange={(value, data) => {
                            const dialCode = data.dialCode;
                            let numericValue = value.replace(/\D/g, "");
                            let numberOnly = numericValue.startsWith(dialCode)
                              ? numericValue.slice(dialCode.length)
                              : numericValue;
                            const formattedNumber = `+${dialCode} ${numberOnly}`;
                            setFormData({
                              ...formData,
                              contactNumber: formattedNumber,
                            });
                            const detectedCountry = {
                              label: data.name,
                              value: data.countryCode.toUpperCase(),
                            };
                            setPhoneCountry(data);
                            setSelectedCountry(detectedCountry);
                          }}
                          disabled={loadingAction}
                          inputProps={{
                            name: "contactNumber",
                            required: true,
                            onKeyDown: (e) => {
                              const input = e.target;
                              const cursorPosition = input.selectionStart;
                              const spaceIndex = input.value.indexOf(" ");
                              if (cursorPosition <= spaceIndex) {
                                e.preventDefault();
                              }
                            }
                          }}
                          inputStyle={{ width: "100%" }}
                        />
                        {errors.contactNumber && (
                          <small className="text-danger">{errors.contactNumber}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase d-block text-dark">
                          GST Available
                        </label>
                        <div className="d-flex gap-4 mt-4 text-dark">
                          <label className="text-dark">
                            <input
                              type="radio"
                              name="gstAvailable"
                              value="yes"
                              checked={formData.gstAvailable === "yes"}
                              onChange={handleChange}
                              disabled={loadingAction}
                            />{" "}
                            Yes
                          </label>
                          <label className="text-dark">
                            <input
                              type="radio"
                              name="gstAvailable"
                              value="no"
                              checked={formData.gstAvailable === "no"}
                              onChange={handleChange}
                              disabled={loadingAction}
                            />{" "}
                            No
                          </label>
                        </div>
                      </div>

                      {formData.gstAvailable === "yes" && (
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-uppercas text-dark">
                            GST Number
                          </label>
                          <input
                            type="text"
                            name="gstNumber"
                            className="form-control"
                            value={formData.gstNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gstNumber: e.target.value.toUpperCase(),
                              })
                            }
                          />
                          {errors.gstNumber && (
                            <small className="text-danger">{errors.gstNumber}</small>
                          )}
                        </div>
                      )}

                      <div className="row g-3"> 
                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Select Zone <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={zoneOptions}
                            placeholder="Zone"
                            value={zoneOptions.find(opt => opt.value === selectedZone)}
                            onChange={(opt) => {
                              setSelectedZone(opt.value);
                              setSelectedStall("");
                            }}
                            isDisabled={loadingAction}
                            menuPlacement="auto"
                            styles={customSelectStyles}
                          />
                          {errors.selectedZone && (
                            <small className="text-danger">{errors.selectedZone}</small>
                          )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Select Stall <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={stallOptions}
                            placeholder="Stall"
                            value={stallOptions?.find(opt => opt.value === selectedStall)}
                            onChange={(opt) => {
                              setSelectedStall(opt.value);
                              setSelectedStallPrice(opt.price);
                            }}
                            isDisabled={!selectedZone || loadingAction}
                            menuPlacement="auto"
                            styles={customSelectStyles}
                          />
                          {errors.selectedStall && (
                            <small className="text-danger">{errors.selectedStall}</small>
                          )}
                          {selectedStallPrice > 0 && (
                            <div className="mt-1 text-success fw-bold" style={{ fontSize: '12px' }}>
                            </div>
                          )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Address Line 1 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="address1"
                            className="form-control"
                            placeholder="Street / Area"
                            value={formData.address1 || ""}
                            onChange={handleChange}
                            disabled={loadingAction}
                            style={{
                              height: "54px",
                              borderRadius: "5px",
                              borderColor: "#dee2e6",
                              padding: "0 12px"
                            }}
                          />
                          {errors.address1 && (
                            <small className="text-danger">{errors.address1}</small>
                          )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Address Line 2 (optional)
                          </label>
                          <input
                            type="text"
                            name="address2"
                            className="form-control"
                            placeholder="Apartment, Suite, etc."
                            value={formData.address2 || ""}
                            onChange={handleChange}
                            disabled={loadingAction}
                            style={{
                              height: "54px",
                              borderRadius: "5px",
                              borderColor: "#dee2e6",
                              padding: "0 12px"
                            }}
                          />
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Country <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={countryOptions}
                            placeholder="Country"
                            value={selectedCountry}
                            onChange={(opt) => {
                              setSelectedCountry(opt); 
                              setSelectedState(null);
                              setSelectedCity("");
                            }}
                            isDisabled={loadingAction}
                            styles={customSelectStyles}
                          />
                          {errors.selectedCountry && (
                            <small className="text-danger">{errors.selectedCountry}</small>
                          )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            State <span className="text-danger">*</span>
                          </label>
                          <Select
                          options={stateOptions}
                          placeholder="Select State"
                          value={selectedState}
                          onChange={(opt) => {
                            if (!opt) {
                              setSelectedState(null);
                              setSelectedCity(null);
                              setFormData({
                                ...formData,
                                state: "",
                                city: ""
                              });
                              return;
                            }
                            setSelectedState(opt);
                            setSelectedCity(null);
                            setFormData({
                              ...formData,
                              state: opt.label,
                              city: ""
                            });
                          }}
                          styles={customSelectStyles}
                        />
                        {errors.selectedState && (
                          <small className="text-danger">{errors.selectedState}</small>
                        )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            City
                          </label>
                          <Select
                            options={cityOptions}
                            placeholder="Select City"
                            value={selectedCity}
                            onChange={(opt) => {
                              if (!opt) {
                                setSelectedCity(null);
                                setFormData({
                                  ...formData,
                                  city: ""
                                });
                                return;
                              }
                              setSelectedCity(opt);
                              setFormData({
                                ...formData,
                                city: opt.label
                              });
                            }}
                            styles={customSelectStyles}
                          />
                          {errors.selectedCity && (
                            <small className="text-danger">{errors.selectedCity}</small>
                          )}
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark">
                            Pincode <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            className="form-control"
                            value={formData.pincode || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); 
                              setFormData({
                                ...formData,
                                pincode: value,
                              });
                            }}
                            disabled={loadingAction}
                            style={{
                              height: "54px",
                              borderRadius: "5px",
                              borderColor: "#dee2e6",
                              padding: "0 12px"
                            }}
                          />
                          {errors.pincode && (
                            <small className="text-danger">{errors.pincode}</small>
                          )}  
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <label className="form-label small fw-bold text-uppercase text-dark d-block">
                            Verification
                          </label>
                          <div className="d-flex justify-content-start">
                            <ReCAPTCHA
                              ref={captchaRef}
                              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                              onChange={(value) => setCaptchaValue(value)}
                              onExpired={() => setCaptchaValue(null)}
                              onErrored={() => setCaptchaValue(null)}
                              size="normal" 
                            />
                          </div>
                        </div>
                      
                        <div className="col-12 text-center mt-4">
                          <button
                            type="submit"
                            className="btn w-100 py-3"
                            style={{
                              background: "linear-gradient(90deg, #512e8e, #7a4bd8)",
                              color: "#fff",
                              borderRadius: "50px",
                            }}
                            disabled={loadingAction}
                          >
                            {loadingAction ? "Please wait..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
      </section>
      <section className="expo-cta">
        <div className="expo-overlay">
          <div className="container text-center text-white">
            <h2 className="expo-title">
              Join the Future of Travel Events
            </h2>
            <p className="expo-subtitle">
              Be part of an exclusive platform where innovation meets opportunity.
              Showcase your services, attract premium clients, and grow globally.
            </p>
          </div>
        </div>
      </section>
      <FooterThree />
      <ToastContainer autoClose={1500} theme="colored" />
      <ScrollToTop />
      <VoucherFloat />
    </>
  );
}
export default RegistrationForm;
