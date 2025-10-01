import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import Toast from "../components/common/Toast/index";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    // Clear timeout nếu có
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    // Trigger slideOut animation trước khi remove
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, removing: true } : toast
      )
    );

    // Remove sau khi animation kết thúc (300ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add toast ngay lập tức
      const newToast = {
        id,
        message,
        type,
        removing: false,
      };

      setToasts((prev) => {
        const newToasts = [...prev, newToast];
        return newToasts;
      });

      // Set timeout để auto-remove sau 5 giây
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, 5000);

      timeoutsRef.current.set(id, timeoutId);

      // Debug log
    },
    [removeToast]
  );

  // Cleanup when unmount
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <Toast toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
