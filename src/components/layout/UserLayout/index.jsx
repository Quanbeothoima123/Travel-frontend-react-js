import { Outlet, NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./UserLayout.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/default-avatar.png");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
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
    { label: "Lịch sử đặt tour", path: "/user/transactions_tour" },
    {
      label: "Lịch sử sử dụng dịch vụ khác",
      path: "/user/transactions_service",
    },
    { label: "Bạn bè", path: "/user/friends" },
    { label: "Tải video khoảng khắc", path: "/user/upload/videos" },
    { label: "Bài viết cá nhân", path: "/user/posts" },
    { label: "Tour yêu thích", path: "/user/favorites" },
    { label: "Mã giảm giá", path: "/user/coupons" },
    { label: "Liên hệ hỗ trợ", path: "/user/support" },
    { label: "Chế độ tối", path: "/user/dark-mode" },
    { label: "Về trang chủ", path: "/" },
  ];

  return (
    <div className="ul-layout">
      {/* Desktop sidebar */}
      <aside className="ul-sidebar ul-sidebar--desktop" aria-hidden="false">
        <div className="ul-sidebar__avatar">
          <img src={userAvatar} alt="avatar" />
        </div>
        <nav className="ul-sidebar__nav">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "ul-sidebar__link ul-sidebar__link--active"
                  : "ul-sidebar__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile topbar */}
      <div className="ul-topbar">
        <button
          className="ul-topbar__menu-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <img src={userAvatar} alt="avatar" className="ul-topbar__avatar" />
      </div>

      {/* Mobile sidebar (mounted when open for simpler DOM) */}
      {sidebarOpen && (
        <>
          <aside
            className="ul-sidebar ul-sidebar--mobile"
            aria-hidden={!sidebarOpen}
          >
            <button
              className="ul-sidebar__close-mobile"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes />
            </button>

            <div className="ul-sidebar__avatar">
              <img src={userAvatar} alt="avatar" />
            </div>

            <nav className="ul-sidebar__nav">
              {menuItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "ul-sidebar__link ul-sidebar__link--active"
                      : "ul-sidebar__link"
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="ul-overlay" onClick={toggleSidebar} />
        </>
      )}

      <main className="ul-main">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
