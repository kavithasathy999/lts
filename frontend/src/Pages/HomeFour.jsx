import React,{useEffect}  from 'react';
import { useLocation } from 'react-router-dom';
import HeaderFour from '../Components/Header/HeaderFour'
import BannerFour from '../Components/Banner/BannerFour'
import WhyParticipate from "../Components/Brand/WhyParticipate";
import WhoShouldExhibit from '../Components/Guide/WhoShouldExhibit'
import ExpoDetails from '../Components/Guide/ExpoDetails';
import FooterThree from '../Components/Footer/FooterThree'
import ScrollToTop from '../Components/ScrollToTop'
// import AboutOne from '../Components/About/AboutOne'
import Sponsors from '../Components/Category/Sponsors';
import VoucherFloat from '../Components/Tour/VoucherFloat';

function HomeFour() {
    const location = useLocation();
    useEffect(() => {
    if (location.hash) {
        setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
        }, 100); 
    }
    }, [location]);

    return (
        <div>
            <HeaderFour />
            <BannerFour />
            <Sponsors />
            {/* <WhyParticipate /> */}
            <WhoShouldExhibit />
            <ExpoDetails />
            <FooterThree />
            <ScrollToTop />
            <VoucherFloat />
        </div>
    )
}

export default HomeFour
