import React, { createContext, useContext, useEffect, useState } from "react";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // chặn nháy UI khi chưa xác định

  const refresh = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data); // data nên là { _id, fullName, email, ... }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(); // lấy user từ cookie khi app khởi động
  }, []);

  const login = async (payload) => {
    const res = await fetch(`${API_BASE}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // Backend của bạn trả { code, message, ... }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.code !== 200) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    // Rất quan trọng: gọi lại /me để đồng bộ user vào context
    await refresh();
    return true;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
