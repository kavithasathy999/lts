<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AboutOne() {
    const [videoUrl, setVideoUrl] = useState('');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const fetchVideo = () => {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/video`)
                .then(res => setVideoUrl(res.data.videoUrl))
                .catch(err => console.error("Video fetch error:", err));
        };
        fetchVideo();

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Responsiveness
    const isMobile = windowWidth <= 667;
    const isTablet = windowWidth <= 1024 && windowWidth > 667;
    const isStacked = windowWidth <= 1024; 
    const itemStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: '30px',
        gap: isMobile ? '15px' : '20px'
    };

    const imgStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    return (
        <div 
            className="about-area" 
            id="aboutus" 
            style={{ 
                backgroundColor: '#ffffff', 
                padding: '100px 0 0px 0',
                margin: "40px 0px" 
            }} 
        >
            <div className="container">
                <div className="row align-items-center"> 
                    {/* LEFT SIDE CONTENT */}
                    <div className="col-lg-6 col-12">
                        <div className="left-content">
                            <div className="title-area" style={{ textAlign: isStacked ? 'center' : 'left' }}>
                                <span className="sub-title">Let’s Go Together</span>
                                <h2 className="sec-title">Plan Your Trip With us</h2>
                                <p className="sec-text">
                                    The Luxury Travel Show Expo brings together leading travel companies,
                                    tourism boards, tour operators, hospitality brands, travel technology providers
                                    in one roof.
                                </p>
                            </div>
                            <div className="about-item-wrap">          
                                <div className="about-item" style={itemStyle}>
                                    <div className="about-item_img" style={imgStyle}>
                                        <img src="/assets/img/icon/map3.svg" alt="Map Icon" />
                                    </div>
                                    <div className="about-item_content">
                                        <h5 className="box-title">Exclusive Trip</h5>
                                        <p className="sec-text">
                                            This expo is designed to create networking opportunities,
                                            business partnerships, and direct customer engagement.
                                        </p>
                                    </div>
                                </div>
                                <div className="about-item" style={itemStyle}>
                                    <div className="about-item_img" style={imgStyle}>
                                        <img src="/assets/img/icon/guide.svg" alt="Guide Icon" />
                                    </div>
                                    <div className="about-item_content">
                                        <h5 className="box-title">Professional Guide</h5>
                                        <p className="sec-text">
                                            Visitors can explore exciting holiday packages,
                                            discover new destinations and connect with travel brands.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE VIDEO */}
                    <div className="col-lg-6 col-12">
                        <div 
                            className="stats-stack" 
                            style={{ 
                                marginTop: isStacked ? '40px' : '0',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            {videoUrl ? (
                                <video 
                                    autoPlay 
                                    loop 
                                    muted 
                                    controls 
                                    className="about-video" 
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: isTablet ? '80%' : '100%', // Slight shrink on tablet for aesthetics
                                        borderRadius: '15px', 
                                        display: 'block' 
                                    }}
                                >
                                    <source src={videoUrl} type="video/mp4" />
                                </video>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '15px', width: '100%' }}>
                                    <p>Loading video...</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AboutOne;
=======
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function AboutOne() {
//     const [videoUrl, setVideoUrl] = useState('');
//     const [windowWidth, setWindowWidth] = useState(window.innerWidth);

//     useEffect(() => {
//         const fetchVideo = () => {
//             axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/video`)
//                 .then(res => setVideoUrl(res.data.videoUrl))
//                 .catch(err => console.error("Video fetch error:", err));
//         };
//         fetchVideo();

//         const handleResize = () => {
//             setWindowWidth(window.innerWidth);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     // Responsiveness
//     const isMobile = windowWidth <= 667;
//     const isTablet = windowWidth <= 1024 && windowWidth > 667;
//     const isStacked = windowWidth <= 1024; 
//     const itemStyle = {
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         alignItems: isMobile ? 'center' : 'flex-start',
//         textAlign: isMobile ? 'center' : 'left',
//         marginBottom: '30px',
//         gap: isMobile ? '15px' : '20px'
//     };

//     const imgStyle = {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center'
//     };

//     return (
//         <div 
//             className="about-area" 
//             id="aboutus" 
//             style={{ 
//                 backgroundColor: '#ffffff', 
//                 padding: '100px 0 0px 0',
//                 margin: "40px 0px" 
//             }} 
//         >
//             <div className="container">
//                 <div className="row align-items-center"> 
//                     {/* LEFT SIDE CONTENT */}
//                     <div className="col-lg-6 col-12">
//                         <div className="left-content">
//                             <div className="title-area" style={{ textAlign: isStacked ? 'center' : 'left' }}>
//                                 <span className="sub-title">Let’s Go Together</span>
//                                 <h2 className="sec-title">Plan Your Trip With us</h2>
//                                 <p className="sec-text">
//                                     The Luxury Travel Show Expo brings together leading travel companies,
//                                     tourism boards, tour operators, hospitality brands, travel technology providers
//                                     in one roof.
//                                 </p>
//                             </div>
//                             <div className="about-item-wrap">          
//                                 <div className="about-item" style={itemStyle}>
//                                     <div className="about-item_img" style={imgStyle}>
//                                         <img src="/assets/img/icon/map3.svg" alt="Map Icon" />
//                                     </div>
//                                     <div className="about-item_content">
//                                         <h5 className="box-title">Exclusive Trip</h5>
//                                         <p className="sec-text">
//                                             This expo is designed to create networking opportunities,
//                                             business partnerships, and direct customer engagement.
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="about-item" style={itemStyle}>
//                                     <div className="about-item_img" style={imgStyle}>
//                                         <img src="/assets/img/icon/guide.svg" alt="Guide Icon" />
//                                     </div>
//                                     <div className="about-item_content">
//                                         <h5 className="box-title">Professional Guide</h5>
//                                         <p className="sec-text">
//                                             Visitors can explore exciting holiday packages,
//                                             discover new destinations and connect with travel brands.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* RIGHT SIDE VIDEO */}
//                     <div className="col-lg-6 col-12">
//                         <div 
//                             className="stats-stack" 
//                             style={{ 
//                                 marginTop: isStacked ? '40px' : '0',
//                                 width: '100%',
//                                 display: 'flex',
//                                 justifyContent: 'center'
//                             }}
//                         >
//                             {videoUrl ? (
//                                 <video 
//                                     autoPlay 
//                                     loop 
//                                     muted 
//                                     controls 
//                                     className="about-video" 
//                                     style={{ 
//                                         width: '100%', 
//                                         maxWidth: isTablet ? '80%' : '100%', // Slight shrink on tablet for aesthetics
//                                         borderRadius: '15px', 
//                                         display: 'block' 
//                                     }}
//                                 >
//                                     <source src={videoUrl} type="video/mp4" />
//                                 </video>
//                             ) : (
//                                 <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '15px', width: '100%' }}>
//                                     <p>Loading video...</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AboutOne;
>>>>>>> d55a94553745be2f08e26fa4ad92b7873675eb61
