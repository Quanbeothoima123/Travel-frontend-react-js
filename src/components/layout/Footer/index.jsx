import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const Footer = () => {
  const [config, setConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/site-config`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Không thể tải cấu hình footer:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setNewsletterMessage("Vui lòng nhập email hợp lệ");
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage("");

    // TODO: Thay thế bằng API endpoint thực tế của bạn
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập API call
      setNewsletterMessage("Đăng ký thành công! Cảm ơn bạn đã quan tâm.");
      setEmail("");
    } catch (error) {
      setNewsletterMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!config) {
    return null; // Hoặc return skeleton loader
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* PHẦN 1: THÔNG TIN CÔNG TY */}
        <div className="footer-grid">
          <div className="footer-column footer-about">
            {config.logoLight && (
              <img
                src={config.logoLight}
                alt={config.companyName}
                className="footer-logo"
              />
            )}
            <h3 className="footer-company-name">{config.companyName}</h3>
            {config.companyDescription && (
              <p className="footer-description">{config.companyDescription}</p>
            )}

            {/* MẠNG XÃ HỘI */}
            {config.socialMedia && config.socialMedia.length > 0 && (
              <div className="footer-social">
                <h4>Kết nối với chúng tôi</h4>
                <div className="footer-social-icons">
                  {config.socialMedia
                    .filter((social) => social.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-icon"
                        title={social.platform}
                      >
                        {social.icon ? (
                          <img src={social.icon} alt={social.platform} />
                        ) : (
                          <span>{social.platform}</span>
                        )}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* PHẦN 2: THÔNG TIN LIÊN HỆ */}
          <div className="footer-column footer-contact">
            <h4 className="footer-title">Thông tin liên hệ</h4>
            <ul className="footer-list">
              {config.headquartersAddress && (
                <li className="footer-list-item">
                  <span className="footer-icon">📍</span>
                  <span>{config.headquartersAddress}</span>
                </li>
              )}
              {config.headquartersPhone &&
                config.headquartersPhone.length > 0 && (
                  <li className="footer-list-item">
                    <span className="footer-icon">📞</span>
                    <div className="footer-phones">
                      {config.headquartersPhone.map((phone, index) => (
                        <a key={index} href={`tel:${phone}`}>
                          {phone}
                        </a>
                      ))}
                    </div>
                  </li>
                )}
              {config.headquartersEmail && (
                <li className="footer-list-item">
                  <span className="footer-icon">✉️</span>
                  <a href={`mailto:${config.headquartersEmail}`}>
                    {config.headquartersEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* PHẦN 3: CHI NHÁNH */}
          {config.branches && config.branches.length > 0 && (
            <div className="footer-column footer-branches">
              <h4 className="footer-title">Chi nhánh</h4>
              <ul className="footer-list">
                {config.branches
                  .sort((a, b) => a.order - b.order)
                  .map((branch, index) => (
                    <li key={index} className="footer-branch-item">
                      <strong>{branch.name}</strong>
                      <p>{branch.address}</p>
                      {branch.phone && branch.phone.length > 0 && (
                        <a href={`tel:${branch.phone[0]}`}>{branch.phone[0]}</a>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* PHẦN 4: LIÊN KẾT NHANH */}
          <div className="footer-column footer-links">
            <h4 className="footer-title">Liên kết nhanh</h4>
            <ul className="footer-list">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/tours">Tours du lịch</Link>
              </li>
              <li>
                <Link to="/about">Về chúng tôi</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li>
                <Link to="/policy">Chính sách & Điều khoản</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* PHẦN 5: NEWSLETTER */}
        {config.newsletterEnabled && (
          <div className="footer-newsletter">
            <div className="footer-newsletter-content">
              <h4>{config.newsletterTitle || "Đăng ký nhận tin khuyến mãi"}</h4>
              <p>Nhận thông tin về các tour du lịch mới và ưu đãi đặc biệt</p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="newsletter-form"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    config.newsletterPlaceholder || "Nhập email của bạn"
                  }
                  disabled={newsletterLoading}
                />
                <button type="submit" disabled={newsletterLoading}>
                  {newsletterLoading ? "Đang gửi..." : "Đăng ký"}
                </button>
              </form>
              {newsletterMessage && (
                <p className="newsletter-message">{newsletterMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* PHẦN 6: THÔNG TIN PHÁP LÝ */}
        <div className="footer-legal">
          <div className="footer-legal-content">
            {config.businessLicenseNumber && (
              <p>
                <strong>GPKD:</strong> {config.businessLicenseNumber} - Cấp bởi:{" "}
                {config.businessLicenseIssuer}
              </p>
            )}
            {config.travelLicenseNumber && (
              <p>
                <strong>{config.travelLicenseType}:</strong>{" "}
                {config.travelLicenseNumber}
              </p>
            )}
          </div>
        </div>

        {/* PHẦN 7: COPYRIGHT */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} {config.companyShortName || config.companyName}. Tất
            cả quyền được bảo lưu.
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Chính sách bảo mật</Link>
            <span>•</span>
            <Link to="/terms">Điều khoản sử dụng</Link>
            <span>•</span>
            <Link to="/sitemap">Sơ đồ trang</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
