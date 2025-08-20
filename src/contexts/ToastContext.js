import React, { createContext, useContext, useState } from "react";
import Toast from "../components/common/Toast/index";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast UI luôn được render global */}
      <Toast toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
