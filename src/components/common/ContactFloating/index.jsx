import React, { useState, useEffect } from "react";
import "./ContactFloating.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const ContactFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactItems, setContactItems] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/admin/site-config`, {
          credentials: "include",
        });

        if (response.ok) {
          const config = await response.json();

          // Kiểm tra xem contact floating có enabled không
          if (!config.contactFloatingEnabled) {
            setIsEnabled(false);
            return;
          }

          setIsEnabled(true);

          // Xử lý danh sách items từ API
          const items = [];

          // 1. Thêm số điện thoại đầu tiên (nếu có)
          if (config.headquartersPhone && config.headquartersPhone.length > 0) {
            items.push({
              id: "phone",
              icon:
                config.contactFloatingItems?.find((item) => item.id === "phone")
                  ?.icon || "/assets/images/phone.png",
              alt: "Hotline",
              label: `Hotline\n${config.headquartersPhone[0]}`,
              link: `tel:${config.headquartersPhone[0]}`,
              order: -1, // Đặt order âm để luôn hiện đầu tiên
              isActive: true,
            });
          }

          // 2. Thêm các contact floating items từ config
          if (
            config.contactFloatingItems &&
            config.contactFloatingItems.length > 0
          ) {
            config.contactFloatingItems.forEach((item) => {
              // Bỏ qua item phone vì đã xử lý ở trên
              if (item.isActive && item.id !== "phone") {
                items.push({
                  id: item.id,
                  icon: item.icon || "/assets/images/default-icon.png",
                  alt: item.alt || item.label || item.id,
                  label: item.label || item.id,
                  link: item.link || "",
                  order: item.order || 0,
                  isActive: item.isActive,
                });
              }
            });
          }

          // 3. Thêm các social media items
          if (config.socialMedia && config.socialMedia.length > 0) {
            config.socialMedia.forEach((social) => {
              if (social.isActive && social.url) {
                // Tìm xem đã có trong contactFloatingItems chưa để tránh trùng
                const existingItem = items.find(
                  (item) =>
                    item.link === social.url || item.id === social.platform
                );

                if (!existingItem) {
                  items.push({
                    id: social.platform,
                    icon: social.icon || "/assets/images/default-icon.png",
                    alt: social.platform,
                    label:
                      social.platform.charAt(0).toUpperCase() +
                      social.platform.slice(1),
                    link: social.url,
                    order: social.order + 100, // Thêm 100 để social media luôn ở sau contactFloatingItems
                    isActive: social.isActive,
                  });
                }
              }
            });
          }

          // Sắp xếp theo order
          items.sort((a, b) => a.order - b.order);

          setContactItems(items);
        }
      } catch (error) {
        console.error("Không thể tải cấu hình contact floating:", error);
        setIsEnabled(false);
      }
    };

    fetchConfig();
  }, []);

  const handleClick = (link) => {
    if (link) {
      // Kiểm tra xem có phải link điện thoại không
      if (link.startsWith("tel:")) {
        window.location.href = link;
      } else {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Không hiển thị nếu disabled hoặc không có items
  if (!isEnabled || contactItems.length === 0) {
    return null;
  }

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
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="cfb-item-icon"
                  onError={(e) => {
                    // Fallback nếu ảnh lỗi
                    e.target.src = "/assets/images/default-icon.png";
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactFloating;
