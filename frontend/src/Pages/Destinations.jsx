import React, { useEffect, useState } from "react";
import HeaderFour from "../Components/Header/HeaderFour";
import FooterThree from "../Components/Footer/FooterThree";

const Destinations = () => {
  const [paragraph, setParagraph] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/destination-text`)
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph || ""))
      .catch((err) => {
        console.error("Failed to fetch paragraph:", err);
        setParagraph("");
      });
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/destination-images`)
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch((err) => {
        console.error("Failed to fetch images:", err);
        setImages([]);
      });
  }, []);

  return (
    <div className="destinations-wrapper" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <HeaderFour />
      <div className="container">
        <h2 className="destination-main-title text-center">Destinations</h2>
        <p className="text-dark mt-3 destinationpara">{paragraph}</p>     
        <div style={{marginBottom: "40px"}}>
          <h3 className="destination-section-title text-center">Exciting Places</h3>
          {images.length === 0 && (
            <p className="text-muted text-center py-4">No images uploaded yet.</p>
          )}        
          <div className="row mt-4 mb-4 g-4"> 
            {images.map((img) => (
              <div className="col-md-6 col-lg-4" key={img.id}>
                <div className="premium-card">
                  <div className="card-image-container">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}${img.image_url}`}
                      className="premium-card-img"
                      alt="Destination"
                    />
                    {img.description && (
                      <div className="premium-card-overlay">
                        <div className="overlay-text-box">
                          <p className="description-text">{img.description}</p>
                          <div className="premium-line"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterThree />
    </div>
  );
};

export default Destinations;
