import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../Gallery/Modal';

function FooterThree() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    const openModal = (imageSrc, event) => {
        event.preventDefault(); 
        setModalImage(imageSrc);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const navigate = useNavigate();
    return (
        <footer className="footer-wrapper bg-theme footer-layout4 shape-mockup-wrap">
            <div className="widget-area">
                <div className="container">                 
                    <div className="row justify-content-between">
                        <div className="col-12 col-md-12 col-lg-3 col-xl-3">
                            <div className="widget footer-widget">
                                <div className="th-widget-about">
                                    <div className="col-auto">
                                        <div className="header-logo">
                                            <a
                                            href="#hero"
                                            className="logo-link"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById("hero")?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start"
                                                });
                                            }}
                                            >
                                            <img src="/assets/img/normal/logo152.png" alt="Luxury Travel Show" />
                                            <p className="text-white" style={{fontFamily: "'Montserrat', sans-serif"}}><span style={{ fontFamily: "'Montserrat', sans-serif", color: "#FFD700" }}>Luxury</span> Travel Show</p>
                                            </a>
                                        </div>
                                    </div>
                                    <div className='mt-30'>
                                        <p className="about-text" style={{fontFamily: "'Montserrat', sans-serif", fontSize: "16px"}}>
                                           Connecting global travel brands, opportunities through an interactive platform.
                                           Creating travel connections through interactive and inspiring experiences.
                                        </p>
                                    </div>                                  
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 col-lg-2 col-xl-auto">
                            <div className="widget widget_nav_menu footer-widget">
                                <h3 className="widget_title">Quick Links</h3>
                                <div className="menu-all-pages-container">
                                    <ul className="menu">                                      
                                        <li>
                                            <a
                                            href="/registrationForm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate("/registrationForm");
                                            }}
                                            >
                                            Exhibitor Registration
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                            href="/forvisitors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate("/forvisitors");
                                            }}
                                            >
                                            Visitor Registration
                                            </a>
                                        </li>                                 
                                        <li>
                                            <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                            }}
                                            >
                                            Stall Map
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 col-xl-auto">
                            <div className="widget footer-widget">
                                <h3 className="widget_title">Address</h3>
                                <div className="th-widget-contact">
                                    <div className="info-box_text" style={{ alignItems: 'flex-start' }}>
                                        <div className="icon" style={{ marginTop: '4px' }}>
                                            <img src="/assets/img/icon/location-dot.svg" alt="img" />
                                        </div>
                                        <div className="details">
                                            <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: "16px", color: "#ffffff", lineHeight: "1.6" }}>
                                                Hotel Merlis,<br />
                                                Goldwins, Avinashi Road,<br />
                                                Coimbatore - 641014.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 col-lg-4 col-xl-auto">
                            <div className="widget footer-widget">
                                <h3 className="widget_title">Contact No</h3>
                                <div className="th-widget-contact">
                                    <div className="info-box_text" style={{ alignItems: 'flex-start' }}>
                                        <div className="icon" style={{ marginTop: '4px' }}>
                                            <img src="/assets/img/icon/phone.svg" alt="img" />
                                        </div>
                                        <div className="details">
                                            {[
                                                { tel: "+919894013338", text: "+91 98940 13338" },
                                                { tel: "+919244449449", text: "+91 92444 49449" },
                                                { tel: "+919789355283", text: "+91 97893 55283" },
                                                { tel: "+919894269360", text: "+91 98942 69360" },
                                                { tel: "+919994459099", text: "+91 99944 59099" },
                                                { tel: "+919843199699", text: "+91 98431 99699" },
                                                { tel: "+919894733996", text: "+91 98947 33996" }
                                            ].map((phone, idx) => (
                                                <p key={idx} style={{ margin: "0 0 5px 0" }}>
                                                    <a
                                                        href={`tel:${phone.tel}`}
                                                        className="info-box_link"
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        {phone.text}
                                                    </a>
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="info-box_text" style={{ alignItems: 'center', marginTop: '15px' }}>
                                        <div className="icon">
                                            <img src="/assets/img/icon/envelope.svg" alt="img" />
                                        </div>
                                        <div className="details" style={{ marginTop: '0px' }}>
                                            <p style={{ margin: 0 }}>
                                                <a
                                                    href="mailto:events@taac.org.in"
                                                    className="info-box_link"
                                                    style={{ color: "inherit", textDecoration: "none" }}
                                                >
                                                    events@taac.org.in
                                                </a>
                                            </p>               
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright-wrap">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-md-6 col-12 text-md-start text-center mb-2 mb-md-0">
                            <p className="copyright-text">
                            Copyright 2026{" "}
                            <a
                                href="#hero"
                                onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("hero")?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                                }}
                            >
                                Luxury Travel Show
                            </a>
                            . All Rights Reserved. 
                            </p>
                        </div>
                        <div className="col-md-6 col-12 text-md-end text-center">
                            <p className="copyright-text">
                            Developed by{" "}
                            <a
                                href="https://saitechnosolutions.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Saitechno Solutions
                            </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="shape-mockup jump d-none d-xxl-block"
                style={{ top: '15%', left: '0%' }}
            >
                <img src="/assets/img/shape/footer4-shape.png" alt="shape" />
            </div>
            <div
                className="shape-mockup d-none d-xxl-block"
                style={{ top: '30%', right: '0%' }}
            >
                <img src="/assets/img/shape/footer4-shape2.png" alt="shape" />
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal} imageSrc={modalImage} />
        </footer>
    )
}

export default FooterThree
