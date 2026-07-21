import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function HeaderFour() {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const navigate=useNavigate();
  const location = useLocation();

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };


  useEffect(() => {
    let lastScroll = 0;
    let scrollTimer;
    const header = document.querySelector(".sticky-wrapper");
    const hero = document.getElementById("hero");
    if (!hero) {
      setIsSticky(true);
    }
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (hero) {
        const heroHeight = hero.offsetHeight;
        if (currentScroll > heroHeight - 80) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
      if (currentScroll > lastScroll) {
        header.classList.remove("header-hide");
      } else {
        header.classList.add("header-hide");
      }
      lastScroll = currentScroll;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        header.classList.remove("header-hide");
      }, 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["hero", "aboutus", "why", "exhibit", "expodetails", "forexhibitors", "forvisitors", "contactus"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(id);
        }
      }
    });
  };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "show" : ""}`} 
        onClick={() => {
          setIsMobileMenuOpen(false);
        }}
      ></div>
      <header className="th-header header-layout1 header-layout2">
        <div className={`sticky-wrapper ${isSticky ? "sticky" : ""} ${activeSection === "hero" ? "hero-active" : ""}`}>
          <div className="menu-area">
            <div className="container th-container">
              <div className="row align-items-center justify-content-between">             
                <div className="col-xl-3 col-auto">
                  <div className="header-logo">
                    <a href="/#hero" className="logo-link" onClick={(e) => handleNavClick(e, "hero")}>
                      <img src="/assets/img/normal/logo152.png" alt="LTS1" />
                    </a>
                  </div>
                </div>
                {/* Navigation - Center aligned on Desktop */}
                <div className="col-xl-6 d-none d-xl-flex justify-content-center">
                  <nav className="main-menu">
                    <ul>
                      <li>
                        <a
                          href="/#hero"
                          onClick={(e) => handleNavClick(e, "hero")}
                          className={activeSection === "hero" ? "active-menu home" : ""}
                        >
                          Home
                        </a>
                      </li>                    
                      <li>
                        <Link 
                          to="/registrationForm"
                          className={location.pathname === "/registrationForm" ? "active-menu section" : ""}
                        >
                          For Exhibitors
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/forvisitors"
                          className={location.pathname === "/forvisitors" ? "active-menu section" : ""}
                        >
                          For Visitors
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
                {/* Right / Hamburger Column */}
                <div className="col-xl-3 col-auto d-flex justify-content-end align-items-center">
                  {/* Hamburger Button: Visible on EVERYTHING below Desktop (1200px) */}
                  <button
                    type="button"
                    className={`th-menu-toggle d-inline-block d-xl-none ${isMobileMenuOpen ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ 
                      background: "#593983", 
                      border: "none", 
                      padding: 0, 
                      outline: "none",
                      cursor: "pointer" 
                    }}
                  >
                    <i className={isMobileMenuOpen ? "far fa-times" : "far fa-bars"}></i>
                  </button>
                </div>
                {/* <div className="col-auto d-none d-xl-block">
                  <div className="header-button">
                    <Link to="/" className="booknow-btn">Book Now</Link>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Slide-out Tablet/Mobile Menu */}
      <div className={`mobile-drawer d-xl-none ${isMobileMenuOpen ? "mobile-drawer--open" : ""}`}>
        <div className="mobile-drawer__inner">
          <div className="mobile-drawer__header">
            <img
              src="/assets/img/normal/logo152.png"
              alt="Logo"
              className="mobile-drawer__logo"
            />
            <button
              className="mobile-drawer__close"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              <i className="far fa-times"></i>
            </button>
          </div>
          <ul className="mobile-drawer__menu">
            <li>
              <a
                href="/#hero"
                onClick={(e) => {
                  handleNavClick(e, "hero");
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </a>
            </li>
            <li>
              <Link
                to="/registrationForm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                For Exhibitors
              </Link>
            </li>
            <li>
              <Link
                to="/forvisitors"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                For Visitors
              </Link>
            </li>
          </ul>
          {/* <div className="mobile-drawer__footer">
            <Link
              to="/registrationForm"
              className="booknow-btn w-100 text-center"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsExhibitorOpen(false);
              }}
            >
              Book Now
            </Link>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default HeaderFour;

