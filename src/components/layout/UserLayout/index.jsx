import { Outlet, NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./UserLayout.css";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/default-avatar.png");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/user/profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserAvatar(data?.avatar || "/default-avatar.png");
        }
      } catch {}
    };
    fetchAvatar();
  }, []);

  const menuItems = [
    { label: "Thông tin cá nhân", path: "/user/profile" },
    { label: "Lịch sử giao dịch", path: "/user/transactions" },
    { label: "Bài viết cá nhân", path: "/user/posts" },
    { label: "Tour yêu thích", path: "/user/favorites" },
    { label: "Mã giảm giá", path: "/user/coupons" },
    { label: "Liên hệ hỗ trợ", path: "/user/support" },
    { label: "Chế độ tối", path: "/user/dark-mode" },
    { label: "Về trang chủ", path: "/" },
  ];

  return (
    <div className="user-layout">
      {/* Desktop + tablet sidebar */}
      <aside className="user-sidebar desktop-tablet">
        <div className="user-sidebar-avatar">
          <img src={userAvatar} alt="avatar" />
        </div>
        <nav>
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button className="menu-btn" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <img src={userAvatar} alt="avatar" className="mobile-avatar" />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <aside className="user-sidebar-mobile">
          <div className="user-sidebar-avatar">
            <img src={userAvatar} alt="avatar" />
          </div>
          <nav>
            {menuItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
