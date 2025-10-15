// src/contexts/AdminContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/checkAuth`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAdmin({
          id: data.admin.id,
          fullName: data.admin.fullName || "Admin Support",
          email: data.admin.email,
          avatar: data.admin.avatar || null,
          role: data.admin.role,
        });
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error("Fetch admin info error:", error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      setAdmin(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        setAdmin,
        logout,
        refreshAdmin: fetchAdminInfo,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
