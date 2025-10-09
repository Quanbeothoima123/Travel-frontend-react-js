import React, { useState } from "react";
import "./ContactFloating.css";

const ContactFloating = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactItems = [
    {
      id: "phone",
      icon: "/assets/images/phone.png", // hoặc .gif
      alt: "Hotline",
      label: "Hotline 1\n0373089951",
      link: "tel:0373089951",
    },
    {
      id: "messenger",
      icon: "/assets/images/messenger.gif",
      alt: "Messenger",
      label: "Trực tuyến\nMessenger",
      link: "", // Để trống như yêu cầu
    },
    {
      id: "zalo",
      icon: "/assets/images/zalo.png",
      alt: "Zalo",
      label: "Trực tuyến\nChat Zalo",
      link: "", // Để trống như yêu cầu
    },
    {
      id: "whatsapp",
      icon: "/assets/images/whatsapp.png",
      alt: "WhatsApp",
      label: "WhatsApp",
      link: "", // Để trống như yêu cầu
    },
  ];

  const handleClick = (link) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="cfb-contact-floating">
      <div
        className={`cfb-contact-wrapper ${isOpen ? "cfb-open" : ""}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Main Toggle Button */}
        <button className="cfb-main-btn" aria-label="Contact options">
          <svg
            className="cfb-main-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>

        {/* Contact Items */}
        <div className="cfb-items-container">
          {contactItems.map((item, index) => (
            <div
              key={item.id}
              className="cfb-item"
              style={{ "--item-index": index }}
              onClick={() => handleClick(item.link)}
            >
              <div className="cfb-item-label">
                {item.label.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <button
                className={`cfb-item-btn cfb-item-${item.id}`}
                aria-label={item.alt}
              >
                <img src={item.icon} alt={item.alt} className="cfb-item-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactFloating;
