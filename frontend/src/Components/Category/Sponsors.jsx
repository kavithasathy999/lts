import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";

function Sponsors() {
  const [eventSponsors, setEventSponsors] = useState([]);
  const [associateSponsors, setAssociateSponsors] = useState([]);
  const [ourSponsors, setOurSponsors] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const apiBase = process.env.REACT_APP_API_BASE_URL || "";
    const fetchSafeData = async (endpoint, setter) => {
      try {
        const res = await axios.get(`${apiBase}${endpoint}`);
        const data = res.data.sponsors || [];
        const validated = await Promise.all(
          data.map((sp) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = sp.imageUrl;
              img.onload = () => resolve(sp);
              img.onerror = () => resolve(null);
            });
          })
        );
        setter(validated.filter(Boolean));
      } catch (err) {
        console.error("API Error:", err);
      }
    };
    fetchSafeData("/api/sponsors/event", setEventSponsors);
    fetchSafeData("/api/sponsors/associate", setAssociateSponsors);
    fetchSafeData("/api/sponsors/our", setOurSponsors);
  }, []);

  // Continuous slow-motion conveyor belt — professional style
  const sliderSettings = {
    modules: [Autoplay, FreeMode],
    loop: true,
    speed: 4000,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      stopOnLastSlide: false,
    },
    freeMode: {
      enabled: true,
      momentum: false,
    },
    spaceBetween: 16,
    breakpoints: {
      0: { slidesPerView: 1 },
      480: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 6 },
    },
  };

  // <6 brands → centered static flex | ≥6 brands → auto-sliding Swiper
  const SponsorSlider = ({ sponsors }) => {
    const swiperRef = useRef(null);

    // Fewer than 6: show centered static cards (no slider needed)
    if (sponsors.length < 6) {
      return (
        <div className="sp-centered-grid">
          {sponsors.map((sp) => (
            <div key={sp.id} className="sp-logo-box">
              <img src={sp.imageUrl} className="sp-img" alt="Sponsor" crossOrigin="anonymous" />
            </div>
          ))}
        </div>
      );
    }

    // 6 or more: continuous auto-sliding Swiper
    return (
      <div
        onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.autoplay?.start()}
      >
        <Swiper
          {...sliderSettings}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
        >
          {sponsors.map((sp) => (
            <SwiperSlide key={sp.id}>
              <div className="sp-logo-box">
                <img
                  src={sp.imageUrl}
                  className="sp-img"
                  alt="Sponsor"
                  crossOrigin="anonymous"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  return (
    <div className="sponsors-wrapper mt-4">
      <style>{`
        .sponsors-wrapper {
          width: 100%;
          padding: 0 8px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Centered static layout for <6 brands */
        .sp-centered-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        .sp-centered-grid .sp-logo-box {
          width: 240px;
          flex-shrink: 0;
        }

        /* Card styles — same as before */
        .sp-logo-box {
          width: 100%;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 12px;
          padding: 18px 22px;
          transition: transform 0.25s;
        }
        .sp-logo-box:hover {
          transform: translateY(-3px);
        }
        .sp-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 767px) {
          .sp-logo-box {
            height: 130px;
            border-radius: 10px;
            padding: 12px 16px;
          }
          h2 { font-size: 1.5rem !important; margin-bottom: 10px !important; }
        }
      `}</style>

      {eventSponsors.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 className="text-center mb-2">Title Sponsor</h2>
          <SponsorSlider sponsors={eventSponsors} />
        </section>
      )}

      {associateSponsors.length > 0 && (
        <section className="mb-5">
          <h2 className="text-center mb-2 oursponsors">Co-Sponsors</h2>
          <SponsorSlider sponsors={associateSponsors} />
        </section>
      )}

      {ourSponsors.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 className="text-center mb-2">Supported By</h2>
          <SponsorSlider sponsors={ourSponsors} />
        </section>
      )}
    </div>
  );
}

export default Sponsors;
