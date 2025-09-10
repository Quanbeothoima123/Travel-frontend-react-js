import React from "react";
import "./Toast.css";

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type} ${toast.exiting ? "exiting" : ""}`}
          onAnimationEnd={() => {
            if (toast.exiting) {
              removeToast(toast.id);
            }
          }}
        >
          <span className="toast-icon">
            {toast.type === "error" ? "⚠️" : "✅"}
          </span>
          <span className="toast-message">{toast.message}</span>

          {/* Progress bar */}
          {!toast.exiting && <div className="toast-progress" />}
        </div>
      ))}
    </div>
  );
};

export default Toast;
