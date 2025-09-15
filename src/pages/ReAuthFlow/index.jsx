import React, { useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import "./ReAuthFlow.css";

const ReAuthFlow = () => {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=info
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  // B1: gửi email reAuth
  const handleReAuth = async () => {
    if (!email) return showToast("Vui lòng nhập email", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/reAuth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setUserId(data.userId);
        setStep(2);
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Lỗi khi reAuth", "error");
      }
    } catch {
      showToast("Lỗi server", "error");
    } finally {
      setLoading(false);
    }
  };

  // B2: resend OTP
  const handleResendOtp = async () => {
    if (!userId || !email) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/resendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, type: "register" }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message + "Tự động quay về trang chủ", "success");
        navigate("/");
      } else {
        showToast(data.message || "Không thể gửi lại OTP", "error");
      }
    } catch {
      showToast("Lỗi server", "error");
    }
  };

  // B3: nhập fullName + password
  const handleReInfo = async () => {
    if (!fullName || !password)
      return showToast("Vui lòng nhập đầy đủ thông tin", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/reInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fullName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success");
        setStep(1); // reset lại flow
        setEmail("");
        setOtp("");
        setFullName("");
        setPassword("");
      } else {
        showToast(data.message || "Lỗi khi cập nhật thông tin", "error");
      }
    } catch {
      showToast("Lỗi server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="re-auth-full">
      <div className="reauth-container">
        {step === 1 && (
          <>
            <h2>Xác thực lại thông tin</h2>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="reauth-input"
            />
            <button
              onClick={handleReAuth}
              disabled={loading}
              className="reauth-btn primary"
            >
              {loading ? "Đang xử lý..." : "Gửi mã OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Nhập mã OTP</h2>
            <input
              type="text"
              placeholder="Mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="reauth-input"
            />
            <button
              onClick={() => {
                setStep(3);
                showToast("Vui lòng nhập thông tin tài khoản", "success");
              }}
              className="reauth-btn primary"
            >
              Xác nhận OTP
            </button>

            <button onClick={handleResendOtp} className="reauth-btn secondary">
              Gửi lại mã OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Hoàn tất thông tin</h2>
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="reauth-input"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="reauth-input"
            />
            <button
              onClick={handleReInfo}
              disabled={loading}
              className="reauth-btn primary"
            >
              {loading ? "Đang xử lý..." : "Xác nhận thông tin"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReAuthFlow;
