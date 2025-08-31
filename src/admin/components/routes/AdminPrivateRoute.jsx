import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AdminPrivateRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/admin/checkAuth",
          {
            credentials: "include", // 👈 để gửi cookie
          }
        );
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
