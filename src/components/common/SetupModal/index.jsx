// components/SetupModal/SetupModal.jsx
import React, { useState } from "react";
import "./SetupModal.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const SetupModal = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    userName: "",
    customName: "",
    isAnonymous: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/user/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      onComplete(result);
    } catch (err) {
      setError("Không thể kết nối server");
      setLoading(false);
    }
  };

  return (
    <div className="friends-setup-overlay">
      <div className="friends-setup-modal">
        <div className="friends-setup-header">
          <div className="friends-setup-icon">🎉</div>
          <h2 className="friends-setup-title">Thiết lập tài khoản</h2>
          <p className="friends-setup-subtitle">
            Vui lòng hoàn thiện thông tin để sử dụng tính năng Bạn bè
          </p>
        </div>

        <form onSubmit={handleSubmit} className="friends-setup-form">
          {/* Username */}
          <div className="friends-setup-field">
            <label htmlFor="userName" className="friends-setup-label">
              Tên tài khoản <span className="friends-setup-required">*</span>
            </label>
            <input
              id="userName"
              type="text"
              value={formData.userName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  userName: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, ""),
                }))
              }
              placeholder="vd: john_doe"
              minLength={3}
              maxLength={20}
              required
              className="friends-setup-input"
            />
            <small className="friends-setup-hint">
              Chỉ chứa chữ thường, số và dấu gạch dưới
            </small>
          </div>

          {/* Custom Name */}
          <div className="friends-setup-field">
            <label htmlFor="customName" className="friends-setup-label">
              Tên hiển thị (không bắt buộc)
            </label>
            <input
              id="customName"
              type="text"
              value={formData.customName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customName: e.target.value,
                }))
              }
              placeholder="Tên bạn muốn người khác thấy"
              maxLength={50}
              className="friends-setup-input"
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="friends-setup-checkbox-wrapper">
            <label className="friends-setup-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAnonymous: e.target.checked,
                  }))
                }
                className="friends-setup-checkbox"
              />
              <div>
                <span className="friends-setup-checkbox-text">
                  Chế độ ẩn danh
                </span>
                <p className="friends-setup-hint">
                  Nếu bật, bạn sẽ không xuất hiện trong tìm kiếm công khai
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && <div className="friends-setup-error">⚠️ {error}</div>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.userName}
            className="friends-setup-submit"
          >
            {loading ? "Đang lưu..." : "Hoàn tất"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
