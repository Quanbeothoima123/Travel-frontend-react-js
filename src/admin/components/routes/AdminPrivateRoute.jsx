import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function AdminPrivateRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/checkAuth`, {
          credentials: "include", // 👈 để gửi cookie
        });
        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <div>Đang kiểm tra phiên đăng nhập...</div>; // hoặc spinner
  }

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
