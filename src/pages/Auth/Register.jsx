import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const OTP_FLOW = "register";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [step, setStep] = useState("register"); // register | otp
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [regEmail, setRegEmail] = useState("");

  // Resend OTP cooldown
  const [resendCountdown, setResendCountdown] = useState(0);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // tick countdown resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => {
      setResendCountdown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/v1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        setUserId(data.userId);
        setRegEmail(data.email || form.email);
        setStep("otp");
        setResendCountdown(60); // cho gửi lại sau 60s
        showToast(
          data.message || "Vui lòng nhập mã OTP để xác thực",
          "success"
        );
      } else {
        showToast(data.message || "Đăng ký thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/v1/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp, type: OTP_FLOW }),
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        showToast("Xác thực thành công, sẽ chuyển về trang chủ...", "success");
        setTimeout(() => navigate("/"), 3000);
      } else {
        showToast(data.message || "Xác thực thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    try {
      const payload = { userId, email: regEmail, type: OTP_FLOW };
      const res = await fetch("http://localhost:5000/api/v1/user/resendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        showToast("Đã gửi lại OTP, vui lòng kiểm tra email", "success");
        setResendCountdown(60);
      } else {
        showToast(data.message || "Không thể gửi lại OTP", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === "register" && (
          <>
            <h2>Đăng ký</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              <button type="submit" className="auth-btn">
                Đăng ký
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h2>Xác thực OTP</h2>
            <p className="otp-hint">
              Mã OTP đã gửi đến <b>{regEmail}</b>, có hiệu lực trong 5 phút.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>Nhập mã OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP"
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Xác thực OTP
              </button>
            </form>

            <button
              type="button"
              className="auth-btn secondary"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              title={
                resendCountdown > 0 ? `Vui lòng đợi ${resendCountdown}s` : ""
              }
            >
              {resendCountdown > 0
                ? `Gửi lại OTP (${resendCountdown}s)`
                : "Gửi lại OTP"}
            </button>
          </>
        )}
      </div>

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type === "error" ? "error" : "success"}`}
          >
            <span className="toast-icon">
              {toast.type === "error" ? "⚠️" : "✅"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Register;
