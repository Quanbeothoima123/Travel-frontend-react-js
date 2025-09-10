import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaCaretDown,
  FaAngleRight,
  FaUserEdit,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import Sidebar from "../Sidebar";
import { useAuth } from "../../../contexts/AuthContext";
import "./Header.css";

// MenuItem đệ quy
const MenuItem = ({ item, depth = 0, basePath, pathname }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  // Tạo link chính xác
  let linkTo = "/";
  if (basePath && item.slug) {
    linkTo = `/${basePath}/${item.slug}`;
  } else if (basePath && !item.slug) {
    linkTo = `/${basePath}`;
  }

  // Check active
  const isActive =
    depth === 0 &&
    (pathname === linkTo || pathname.startsWith(`/${basePath}/`));

  return (
    <li
      className={`menu-item ${hasChildren ? "has-children" : ""} ${
        isActive ? "active" : ""
      }`}
    >
      <Link to={linkTo} className="menu-link">
        {item.title}
        {hasChildren &&
          (depth === 0 ? (
            <FaCaretDown className="icon-caret" />
          ) : (
            <FaAngleRight className="icon-caret" />
          ))}
      </Link>
      {hasChildren && (
        <ul className="submenu">
          {item.children.map((child) => (
            <MenuItem
              key={child._id}
              item={child}
              depth={depth + 1}
              basePath={basePath}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const endpoints = {
          home: {
            url: "http://localhost:5000/api/v1/homePage",
            basePath: "",
          },
          tour: {
            url: "http://localhost:5000/api/v1/admin/tour-categories?tree=true",
            basePath: "search/tours",
          },
          service: {
            url: "http://localhost:5000/api/v1/service",
            basePath: "service",
          },
          news: { url: "http://localhost:5000/api/v1/news", basePath: "news" },
          library: {
            url: "http://localhost:5000/api/v1/library",
            basePath: "library",
          },
          contact: {
            url: "http://localhost:5000/api/v1/contact",
            basePath: "contact",
          },
          about: { url: "http://localhost:5000/api/v1/info", basePath: "info" },
        };

        const responses = await Promise.all(
          Object.values(endpoints).map((ep) => fetch(ep.url))
        );
        const data = await Promise.all(responses.map((res) => res.json()));

        const merged = data.map((d, i) => ({
          ...d[0],
          basePath: Object.values(endpoints)[i].basePath,
        }));

        setMenuData(merged);
      } catch (e) {
        console.error("Error fetching menus:", e);
      }
    };
    fetchMenus();
  }, []);

  // Toggle mobile sidebar
  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  // đóng user dropdown khi click ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleToggleUserMenu = () => setIsUserMenuOpen((s) => !s);
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header shadow-sm">
      <div className="container header-inner">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img
              src="/assets/images/logo.jpg"
              alt="Logo"
              className="logo-img"
            />
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="menu-toggle mobile-only"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        {/* Menu desktop */}
        <nav className="main-nav desktop-only">
          <ul className="menu">
            {menuData.map((item) => (
              <MenuItem
                key={item._id}
                item={item}
                basePath={item.basePath}
                pathname={pathname}
              />
            ))}
          </ul>
        </nav>

        {/* Auth section */}
        <div className="auth-section">
          {loading ? null : !user ? (
            <>
              <Link to="/login" className="btn btn-outline-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-outline-sm">
                Đăng ký
              </Link>
            </>
          ) : (
            <div
              ref={userMenuRef}
              className={`user-dropdown ${isUserMenuOpen ? "open" : ""}`}
            >
              <button
                className="user-toggle"
                type="button"
                onClick={handleToggleUserMenu}
              >
                <FaUser className="avatar" />
                <span className="user-name">{user.fullName || user.name}</span>
                <FaCaretDown className="caret" />
              </button>
              <div className="user-menu">
                <Link
                  to="/user/profile"
                  className="menu-item"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FaUserEdit />
                  <span>Thông tin cá nhân</span>
                </Link>
                <Link to="/" className="menu-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Đăng xuất</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar mobile */}
      <Sidebar
        menuItems={menuData}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        user={user}
        handleLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
