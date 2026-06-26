import React from 'react';

const WhyParticipate = () => {
  const benefits = [
    {
      title: "Target Audience",
      bg: "/assets/img/whyparticipate/gray-rag-dolls-targets.jpg"
    },
    {
      title: "Market Services",
      bg: "/assets/img/whyparticipate/19238.jpg"
    },
    {
      title: "Global Authority",
      bg: "/assets/img/whyparticipate/business-people-working-data-project.jpg"
    },
    {
      title: "Allied Networking",
      bg: "/assets/img/whyparticipate/66204.jpg"
    },
    {
      title: "Growth & ROI",
      bg: "/assets/img/whyparticipate/3921114.jpg"
    },
    {
      title: "Live Showcase",
      bg: "/assets/img/whyparticipate/57309.jpg"
    }
  ];

  const sectionStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.88)), url('/assets/img/bg/whyparticipate_bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: "'Montserrat', sans-serif"
  };

  return (
    <section id="why" className="expo-feature-section py-5" style={sectionStyle}>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap');
      </style>
      <div className="container py-5">
        <div className="row mb-2 align-items-center">
          <div className="col-lg-7">
            <h2 className="display-4 fw-extrabold mb-0">Why <span style={{color: "#593983"}}>Participate?</span></h2>
          </div>
          <div className="col-lg-5">
            <p className="lead mt-3 mt-lg-0 border-start-custom ps-4 text-dark fw-semibold">
              Unlock unprecedented growth by positioning your brand at the center of the travel world.
            </p>
          </div>
        </div>
        <div className="row g-5" style={{cursor:"pointer"}}>
          {benefits.map((item, index) => (
            <div className="col-md-3 col-lg-4" key={index}>
              <div 
                className="premium-card"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.55)), url(${item.bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255, 255, 255, 0.6)',
                    zIndex: 0
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 className="h4 fw-semibold mb-3">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyParticipate;


