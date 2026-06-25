import React, { useEffect, useRef, useState } from "react";
import { FaUsers, FaBuilding } from "react-icons/fa";

function ExpoDetails() {
  const sectionRef = useRef(null);
  const [visitors, setVisitors] = useState(0);
  const [exhibitors, setExhibitors] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let vCount = 0;
          let eCount = 0;
          const vInterval = setInterval(() => {
            vCount += 100;
            if (vCount >= 1000) { vCount = 1000; clearInterval(vInterval); }
            setVisitors(vCount);
          }, 80);
          const eInterval = setInterval(() => {
            eCount += 1;
            if (eCount >= 83) { eCount = 83; clearInterval(eInterval); }
            setExhibitors(eCount);
          }, 10);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="expodetails" ref={sectionRef} className="premium-expo-container">
      <style>
        {`
          @media (max-width: 1024px) {
            .content-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .btn-holder {
              display: flex;
              justify-content: center;
              width: 100%;
            }
          }
        `}
      </style>
      <div className="container py-5">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="premium-title">Event Details</h2>
            <p className="premium-lead text-dark">
              Everything you need to know about the premier Travel Event experience
            </p>
          </div>
        </div>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="content-wrapper">
              <h3 className="section-heading">Luxury Travel Show Event</h3>
              <p className="text-content text-dark mt-4">
                The Luxury Travel Show Event brings together <strong>leading travel companies</strong>, 
                tourism boards, and hospitality brands under one roof for an unparalleled 
                networking experience.
              </p>
              <p className="text-content text-dark">
                Explore exciting travel packages, discover new destinations, and interact 
                with industry professionals shaping the future.
              </p>
              
              <div className="btn-holder mt-5">
                <a href="/registrationForm" className="btn-premium-gold">
                  Exhibitor Registration
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="stats-stack">
              <div className="glass-card">
                <div className="stat-icon-box">
                  <FaUsers color="#593983" aria-label="visitors" />
                </div>
                <div className="stat-text">
                  <h4 className="stat-number">{visitors.toLocaleString()}+</h4>
                  <p className="stat-label">Visitors</p>
                </div>
              </div>
              <div className="glass-card highlighted">
                <div className="stat-icon-box">
                  <FaBuilding color="#593983" aria-label="exhibitors" />
                </div>
                <div className="stat-text">
                  <h4 className="stat-number">{exhibitors}+</h4>
                  <p className="stat-label">Travel Exhibitors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExpoDetails;