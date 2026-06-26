import React, { useEffect, useState } from "react";
import axios from "axios";

function VoucherFloat() {
    const [visible, setVisible] = useState(false);
    const [voucherUrl, setVoucherUrl] = useState("");

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/voucher-link`);
                if (response.data && response.data.url) {
                    setVoucherUrl(response.data.url);
                }
            } catch (error) {
                if (error.response && error.response.status !== 404) {
                    console.error("Error fetching voucher link:", error);
                }
            }
        };
        fetchVoucher();
        const handleScroll = () => {
            setVisible(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const downloadVoucher = () => {
        if (!voucherUrl) {
            console.warn("Voucher URL not available yet.");
            return;
        }
        const link = document.createElement("a");
        link.href = voucherUrl;
        link.download = "Golden-Travels.pdf";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            id="fixed-voucher-cta"
            className={`voucher-float ${visible ? "show" : ""}`}
            onClick={downloadVoucher}
            style={{cursor: "pointer"}}
        >
            <i className="fas fa-download"></i>
            <span className="v-text"></span>
        </div>
        
    );
}

export default VoucherFloat;