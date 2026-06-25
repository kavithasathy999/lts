import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

function BannerFour() {
  const [data, setData] = useState({
    slides: [],
    eventInfo: {}
  });
  const navigate=useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/banner`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (window.location.hash === "#hero") {
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        setTimeout(() => {
          heroSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="banner-four position-relative" id="hero" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {data.slides.length > 0 && (
        <Swiper
          className="banner-four-swiper"
          style={{ 
            width: "100%", 
            margin: "0", 
            padding: "0" 
          }}
          key={data.slides.length}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 3500 }}
          loop={true}
          speed={3000}
        >
          {data.slides.map((img) => (
            <SwiperSlide key={img.id}>
              <div
                className="hero-inner"
              >
                <img className="banner-four-image" src={img.image} alt={data.eventInfo?.title || "Luxury Travel Show"} />
                <div className="banner-four-overlay"></div>
                <div className="banner-four-content">
                <h3
                  className="banner-four-subtitle"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",    
                    fontWeight: "400",
                  }}
                >
                  Welcome To Our
                </h3>
                <h1
                  className="banner-four-title"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: "700",
                  }}
                >
                  {data.eventInfo?.title || ""}
                </h1>
                <div className="banner-four-actions">
                  <button className="bannerpage-btn primary" onClick={() => navigate('/registrationForm')} style={{fontWeight:"700"}}>
                    Exhibitor Registration
                  </button>
                  <button className='visitor-btn primary' onClick={() => navigate('/forvisitors')} style={{fontWeight:"700"}}>
                    Visitor Registration
                  </button>
                </div>
                </div>
                <HeroCard event={data.eventInfo} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}

const HeroCard = ({ event }) => {
  return (
    <div className="hero-card-custom">
      <span className="hero-inline-item">
        <i className="fa-solid fa-location-dot"></i>
        {event.location}
      </span>
      <span className="hero-inline-item">
        <i className="fa-solid fa-calendar"></i>
        {event.date}
      </span>
      <span className="hero-inline-item">
        <i className="fa-solid fa-clock"></i>
        {event.time}
      </span>
    </div>
  );
};

export default BannerFour;
