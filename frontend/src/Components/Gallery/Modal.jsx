import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, closeModal, imageSrc }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setVisible(true), 10);
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${visible ? "show" : ""}`} onClick={closeModal}>
            <div className={`modal-content ${visible ? "active" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>×</button>
                <img src={imageSrc} alt="Modal content" className="modal-image" />
            </div>
        </div>
    );
};

export default Modal;
