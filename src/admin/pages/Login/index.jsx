import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaPlane } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import "./Login.css";

// Cat Animation Component
const CatAnimation = ({ isWatching, isHiding, isPeeking }) => {
  return (
    <div className="cat-container">
      <div className="cat-outer-circle"></div>

      {/* Cat face */}
      <div className="cat-face">
        {/* Ears */}
        <div className="cat-ear cat-ear-left"></div>
        <div className="cat-ear cat-ear-right"></div>

        {/* Inner ears */}
        <div className="cat-inner-ear cat-inner-ear-left"></div>
        <div className="cat-inner-ear cat-inner-ear-right"></div>

        {/* Eyes */}
        <div className="cat-eyes">
          {isHiding ? (
            <>
              <div className="cat-eye-closed"></div>
              <div className="cat-eye-closed"></div>
            </>
          ) : isPeeking ? (
            <>
              <div className="cat-eye cat-eye-peeking">
                <div className="cat-pupil"></div>
              </div>
              <div className="cat-eye cat-eye-peeking">
                <div className="cat-pupil"></div>
              </div>
            </>
          ) : (
            <>
              <div
                className={`cat-eye cat-eye-open ${
                  isWatching ? "cat-eye-watching" : ""
                }`}
              >
                <div className="cat-pupil"></div>
              </div>
              <div
                className={`cat-eye cat-eye-open ${
                  isWatching ? "cat-eye-watching" : ""
                }`}
              >
                <div className="cat-pupil"></div>
              </div>
            </>
          )}
        </div>

        {/* Nose */}
        <div className="cat-nose"></div>

        {/* Mouth */}
        <div className="cat-mouth">
          <div className="cat-mouth-center"></div>
          <div className="cat-mouth-left"></div>
          <div className="cat-mouth-right"></div>
        </div>

        {/* Whiskers */}
        <div className="cat-whisker cat-whisker-1"></div>
        <div className="cat-whisker cat-whisker-2"></div>
        <div className="cat-whisker cat-whisker-3"></div>
        <div className="cat-whisker cat-whisker-4"></div>
      </div>
    </div>
  );
};

// Main Login Component
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const { showToast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v1/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // 👈 QUAN TRỌNG: cho phép nhận cookie
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Đăng nhập thành công!", "success");
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        window.location.href = "/admin/tours";
      } else {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      showToast(err.message || "Đăng nhập thất bại", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine cat state
  const getCatState = () => {
    if (focusedField === "password" && !showPassword) {
      return { isHiding: true, isWatching: false, isPeeking: false };
    } else if (focusedField === "password" && showPassword) {
      return { isPeeking: true, isWatching: false, isHiding: false };
    } else if (focusedField === "email" || formData.email) {
      return { isWatching: true, isHiding: false, isPeeking: false };
    }
    return { isWatching: false, isHiding: false, isPeeking: false };
  };

  const catState = getCatState();

  return (
    <div className="login-container">
      {/* Background elements */}
      <div className="background-elements">
        <FaPlane className="floating-plane plane-1" />
        <FaPlane className="floating-plane plane-2" />
        <FaPlane className="floating-plane plane-3" />

        <div className="floating-cloud cloud-1"></div>
        <div className="floating-cloud cloud-2"></div>
        <div className="floating-cloud cloud-3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="header-title">
            <FaPlane className="header-icon" />
            <h1 className="header-text">Travel Admin</h1>
          </div>
          <p className="header-subtitle">
            Đăng nhập để quản lý hệ thống du lịch
          </p>
        </div>

        {/* Cat Animation */}
        <CatAnimation {...catState} />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className="form-input"
                placeholder="Nhập tên đăng nhập..."
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                className="form-input password-input"
                placeholder="Nhập mật khẩu..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" className="checkbox" />
              <span className="checkbox-label">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                Đang đăng nhập...
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            © 2025 Travel Admin System. Được bảo vệ bởi chú mèo canh gác 🐱
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="decorative-dot dot-1"></div>
      <div className="decorative-dot dot-2"></div>
      <div className="decorative-dot dot-3"></div>
    </div>
  );
};

export default AdminLogin;
