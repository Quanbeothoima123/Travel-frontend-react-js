import React from "react";
import "./Toast.css";

const Toast = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === "error" ? "error" : "success"}`}
        >
          <span className="toast-icon">
            {toast.type === "error" ? "⚠️" : "✅"}
          </span>
          <span className="toast-message">{toast.message}</span>

          {/* Progress bar */}
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
};

export default Toast;
