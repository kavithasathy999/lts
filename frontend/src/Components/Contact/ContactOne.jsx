// import React, { useState, useEffect, useRef } from 'react'
// import { toast, ToastContainer } from 'react-toastify';
// import HeaderFour from "../Header/HeaderFour";

// function ContactOne() {
//     const [formData, setFormData] = useState({  name: "", phone: "", email: "", message: "" });
//     const [errors, setErrors] = useState({  name: "", phone: "", email: "", message: "" });
//     const [loading, setLoading] = useState(false);
    
//     const formRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (formRef.current && !formRef.current.contains(event.target)) {
//                 setErrors({  name: "" ,phone: "", email: "", message: "" });
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     const validateName = (value) => {
//         if (!value.trim()) return "Name is required";
//         if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters are allowed";
//         if (value.length < 3) return "Name must be at least 3 characters";
//         return "";
//     };

//     const validatePhone = (value) => {
//         if (!value.trim()) return "Phone number is required";
//         if (!/^\d*$/.test(value)) return "Only numbers are allowed";
//         if (value.length < 6 || value.length > 14) return "Phone must be 6-14 digits";
//         return "";
//     }

//     const validateEmail = (value) => {
//         if (!value.trim()) return "Email address is required";
//         return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? "" : "Invalid email format";
//     }

//     const validateMessage = (value) => {
//         if (!value.trim()) return "Address is required";
//         return "";
//     }

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//         if (name === "name") setErrors(prev => ({ ...prev, name: validateName(value) }));
//         if (name === "phone") setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
//         if (name === "email") setErrors(prev => ({ ...prev, email: validateEmail(value) }));
//         if (name === "message") setErrors(prev => ({ ...prev, message: validateMessage(value) }));
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const nameError = validateName(formData.name);
//         const phoneError = validatePhone(formData.phone);
//         const emailError = validateEmail(formData.email);
//         const messageError = validateMessage(formData.message);
//         setErrors({ name: nameError, phone: phoneError, email: emailError, message: messageError });
//         if (nameError || phoneError || emailError || messageError) return;
//         setLoading(true);
//         try {
//             const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                     name: formData.name,
//                     phone: formData.phone, 
//                     email: formData.email, 
//                     address: formData.message 
//                 }),
//             });
//             if (res.ok) {
//                 toast.success("Message sent successfully"); 
//                 setFormData({ name: "", phone: "", email: "", message: "" });
//                 setErrors({ name: "", phone: "", email: "", message: "" });
//             } else {
//                 toast.error("Failed to send message");
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error('Error sending message');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//         <HeaderFour />
//         <div id="contactus" className="bg-top-center overflow-hidden" style={{ backgroundImage: "url(/assets/img/bg/contact_bg_1.jpg)", backgroundRepeat: "no-repeat" }}>
//             <div className="container">
//                 <div className="row gy-4 justify-content-between align-items-center">
//                     <div className="col-lg-5">
//                         <div className="pt-80 p-lg-0">
//                             <div className="title-area pe-xl-5">
//                                 <span className="sub-title text-white" style={{fontFamily: "'Montserrat', sans-serif", fontSize: "40px"}}>Get in touch</span>
//                                 <h2 className="sec-title text-white" style={{fontFamily: "'Montserrat', sans-serif", fontSize: "48px"}}>Say hello to us</h2>
//                                 <p className="contact-text text-white" style={{fontFamily: "'Montserrat', sans-serif", fontSize: "18px"}}>
//                                     We’love to hear from you. Our friendly team is always here to communicate.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-lg-6 g-0">
//                         <div className="contact-form-area" ref={formRef}>
//                             <form onSubmit={handleSubmit} className="contact-form2 ajax-contact">
//                                 <div className="row">
//                                     <div className="form-group col-12" style={{ position: 'relative', marginBottom: '25px' }}>
//                                         <input
//                                             type="text"
//                                             className={`form-control ${errors.name ? 'input-error' : ''}`}
//                                             name="name"
//                                             placeholder="Your Name"
//                                             value={formData.name}
//                                             onChange={handleChange}
//                                             onKeyDown={(e) => {
//                                                 if (!/[a-zA-Z\s]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
//                                                     e.preventDefault();
//                                                 }
//                                             }}
//                                         />
//                                         <img src="/assets/img/icon/user.svg" alt="" />
//                                         {errors.name && (
//                                             <small 
//                                                 className="text-danger ps-2" 
//                                                 style={{ position: 'absolute', bottom: '-25px', left: 5 }}
//                                             >
//                                                 {errors.name}
//                                             </small>
//                                         )}
//                                     </div>
//                                     <div className="form-group col-12" style={{ position: 'relative', marginBottom: '25px' }}>
//                                         <input
//                                             type="text"
//                                             className={`form-control ${errors.phone ? 'input-error' : ''}`}
//                                             name="phone"
//                                             placeholder="Phone Number"
//                                             value={formData.phone}
//                                             onChange={handleChange}
//                                             onKeyDown={(e) => {
//                                                 if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
//                                                     e.preventDefault();
//                                                 }
//                                             }}
//                                         />
//                                         <img src="/assets/img/icon/user.svg" alt="" />
//                                         {errors.phone && <small className="text-danger ps-2" style={{ position: 'absolute', bottom: '-25px', left: 5 }}>{errors.phone}</small>}
//                                     </div>
//                                     <div className="form-group col-12" style={{ position: 'relative', marginBottom: '25px' }}>
//                                         <input
//                                             type="email"
//                                             className={`form-control ${errors.email ? 'input-error' : ''}`}
//                                             name="email"
//                                             placeholder="Your Mail"
//                                             value={formData.email}
//                                             onChange={handleChange}
//                                         />
//                                         <img src="/assets/img/icon/mail.svg" alt="" />
//                                         {errors.email && <small className="text-danger ps-2" style={{ position: 'absolute', bottom: '-25px', left: 5 }}>{errors.email}</small>}
//                                     </div>
//                                     <div className="form-group col-12" style={{ position: 'relative', marginBottom: '25px' }}>
//                                         <textarea
//                                             name="message"
//                                             cols={30}
//                                             rows={3}
//                                             className={`form-control ${errors.message ? 'input-error' : ''}`}
//                                             placeholder="Address"
//                                             value={formData.message}
//                                             onChange={handleChange}
//                                         />
//                                         <img src="/assets/img/icon/location-dot.svg" alt="img" className='location-icon' />
//                                         {errors.message && <small className="text-danger ps-2" style={{ position: 'absolute', bottom: '-25px', left: 5 }}>{errors.message}</small>}
//                                     </div>
//                                     <div className="form-btn-wrapp">
//                                         <div className="form-btn">
//                                             <button 
//                                                 type="submit"  
//                                                 className="sendmessage-btn" 
//                                                 style={{fontFamily: "'Montserrat', sans-serif", fontSize: "16px"}}
//                                                 disabled={loading}
//                                             >
//                                                 {loading ? "Please wait... ⏳" : <>Send Message <img src="/assets/img/icon/plane3.svg" alt="" /></>}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <ToastContainer autoClose={1500} theme="colored" />
//         </>
//     )
// }

// export default ContactOne;