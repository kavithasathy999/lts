import React from 'react';

const WhoShouldExhibit = () => {
  const categories = [
    "Destination Management Companies", "Tourism Brands", "Tourism Boards",
    "Airlines", "Hotels & Resorts", "Cruise Companies",
    "Adventure Tourism Companies", "Travel Technology Providers",
    "Visa & Travel Assistance Companies", "Travel Agencies"
  ];

  return (
    <section id="exhibit" className="who-exhibit-section">
      <div className="mesh-gradient-bg"></div>
      <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center py-5"> 
          <div className="col-lg-5 mb-5 mb-lg-0">
            <h6 className="eyebrow fw-bold text-uppercase mb-3" style={{color: "#c084fc", letterSpacing: '3px'}}>
              Exhibitor Profiles
            </h6>
            <h2 className="display-4 fw-extrabold mb-4 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Who Can <br/>
              <span className="text-gradient-bright">Participate?</span>
            </h2>
            <p className="lead text-white mb-4 fw-medium" style={{ lineHeight: '1.8' }}>
              Our event brings together the most influential players in the global travel ecosystem. 
              From boutique agencies to international airlines, this is where the industry meets.
            </p>
          </div>

          <div className="col-lg-6 offset-lg-1">
            <div className="category-list">
              {categories.map((category, index) => (
                <div className="category-item d-flex align-items-center" key={index}>
                  <span className="category-number">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                  <div className="category-line"></div>
                  <span className="category-name">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoShouldExhibit;

