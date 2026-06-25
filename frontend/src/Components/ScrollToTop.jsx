import React, { useEffect, useState } from "react";

function ScrollToTop() {
    const [progress, setProgress] = useState(307.919);
    const [visible, setVisible] = useState(false);
    const pathLength = 307.919;
    useEffect(() => {
        const updateProgress = () => {
            const scroll = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progressValue = pathLength - (scroll * pathLength) / height;
            setProgress(progressValue);
            setVisible(scroll > 50);
        };

        window.addEventListener("scroll", updateProgress);
        return () => {
            window.removeEventListener("scroll", updateProgress);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <div
                className={`scroll-top ${visible ? "show" : ""}`}
                onClick={scrollToTop}
                style={{ cursor: "pointer" }}
            >
                <svg
                    className="progress-circle svg-content"
                    width="100%"
                    height="100%"
                    viewBox="0 0 3012 3012"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    >
                    <path d="M256 0C114.836 0 0 114.836 0 256c0 45.63 12.076 88.267 34.977 125.055L0 512l131.518-34.907C168.732 499.924 211.37 512 256 512c141.164 0 256-114.836 256-256S397.164 0 256 0zm131.946 372.73c-5.307 14.83-30.962 28.516-42.66 30.09-11.71 1.572-25.76.76-41.63-2.78-35.13-7.92-68.8-27.03-98.58-56.81-29.78-29.78-48.9-63.45-56.83-98.58-3.55-15.87-4.35-29.91-2.78-41.62 1.57-11.69 15.26-37.36 30.09-42.66 14.83-5.31 32.27-8.05 50.47-7.77 18.2.28 33.49 4.21 46.79 8.36 12.59 4.04 25.01 9.42 36.92 16.08 2.78 1.55 5.36 3.17 7.97 4.84 1.92 1.28 3.97 2.61 6.04 3.99 1.52.99 2.99 1.96 4.55 3.01 1.84 1.29 3.58 2.58 5.44 3.92.33.25.63.49.94.73 1.18.93 2.36 1.85 3.56 2.81 3.1 2.47 6.21 4.95 9.28 7.44 4.2 3.38 8.33 6.81 12.47 10.24 2.38 1.97 4.68 3.96 7.01 5.95 4.71 3.97 9.3 7.99 13.83 12.03 3.91 3.58 7.67 7.2 11.43 10.84 2.67 2.6 5.37 5.18 8.07 7.79 1.26 1.21 2.57 2.41 3.82 3.63.93.91 1.83 1.86 2.77 2.76 1.64 1.59 3.18 3.19 4.79 4.79 1.21 1.19 2.43 2.36 3.66 3.54 3.63 3.5 7.23 7.02 10.88 10.53 1.37 1.33 2.76 2.66 4.15 3.99 2.73 2.59 5.5 5.19 8.24 7.79 2.28 2.17 4.53 4.37 6.78 6.57 1.09 1.07 2.15 2.17 3.23 3.24.28.28.53.57.81.85 3.92 3.93 7.78 7.93 11.67 11.9 2.72 2.77 5.46 5.51 8.19 8.28 1.21 1.23 2.48 2.44 3.69 3.67 3.13 3.15 6.27 6.3 9.44 9.42 1.21 1.2 2.37 2.44 3.6 3.64.64.63 1.25 1.29 1.91 1.91 2.61 2.58 5.25 5.14 7.87 7.72 1.68 1.64 3.37 3.27 5.05 4.92 1.77 1.73 3.49 3.49 5.28 5.2 1.62 1.61 3.27 3.17 4.88 4.78 1.47 1.46 2.94 2.92 4.4 4.38 1.73 1.71 3.41 3.37 5.11 5.06 1.51 1.51 3.03 3.01 4.53 4.53 1.4 1.39 2.78 2.79 4.16 4.18 1.72 1.73 3.45 3.48 5.16 5.19 1.3 1.31 2.61 2.61 3.91 3.92 1.56 1.56 3.11 3.12 4.66 4.68 1.2 1.21 2.39 2.39 3.59 3.61 2.84 2.86 5.69 5.72 8.53 8.54" />
                    </svg>
            </div>
            <div
                className={`scroll-top ${visible ? "show" : ""}`}
                onClick={scrollToTop}
                style={{ cursor: "pointer" }}
            >
                <svg
                    className="progress-circle svg-content"
                    width="100%"
                    height="100%"
                    viewBox="-1 -1 102 102"
                >
                    <path
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                        style={{
                            transition: "stroke-dashoffset 10ms linear",
                            strokeDasharray: `${pathLength}, ${pathLength}`,
                            strokeDashoffset: progress,
                        }}
                    ></path>
                </svg>
            </div>   
        </>
    );
}

export default ScrollToTop;
