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

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const MenuItem = ({ item, depth = 0, basePath, pathname }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  let linkTo = "/";
  if (basePath && item.slug) linkTo = `/${basePath}/${item.slug}`;
  else if (basePath && !item.slug) linkTo = `/${basePath}`;

  const isActive =
    depth === 0 &&
    (pathname === linkTo || pathname.startsWith(`/${basePath}/`));

  return (
    <li
      className={`hd-header__menu-item ${
        hasChildren ? "hd-header__menu-item--has-children" : ""
      } ${isActive ? "hd-header__menu-item--active" : ""}`}
    >
      <Link to={linkTo} className="hd-header__menu-link">
        {item.title}
        {hasChildren &&
          (depth === 0 ? (
            <FaCaretDown className="hd-header__icon-caret" />
          ) : (
            <FaAngleRight className="hd-header__icon-caret" />
          ))}
      </Link>
      {hasChildren && (
        <ul className="hd-header__submenu">
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
          home: { url: `${API_BASE}/api/v1/homePage`, basePath: "" },
          tour: {
            url: `${API_BASE}/api/v1/admin/tour-categories/get-all-category?tree=true`,
            basePath: "search/tours",
          },
          service: { url: `${API_BASE}/api/v1/service`, basePath: "service" },
          news: { url: `${API_BASE}/api/v1/news`, basePath: "news" },
          library: { url: `${API_BASE}/api/v1/library`, basePath: "gallery" },
          contact: { url: `${API_BASE}/api/v1/contact`, basePath: "contact" },
          about: { url: `${API_BASE}/api/v1/info`, basePath: "info" },
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

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

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
    <header className="hd-header">
      <div className="hd-header__inner container">
        {/* Logo */}
        <div className="hd-header__logo">
          <Link to="/">
            <img
              src="/assets/images/logo.jpg"
              alt="Logo"
              className="hd-header__logo-img"
            />
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="hd-header__menu-toggle hd-header__mobile-only"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        {/* Menu desktop */}
        <nav className="hd-header__nav hd-header__desktop-only">
          <ul className="hd-header__menu">
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

        {/* Auth */}
        <div className="hd-header__auth">
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
              className={`hd-header__user-dropdown ${
                isUserMenuOpen ? "hd-header__user-dropdown--open" : ""
              }`}
            >
              <button
                className="hd-header__user-toggle"
                type="button"
                onClick={handleToggleUserMenu}
              >
                <FaUser className="hd-header__avatar" />
                <span className="hd-header__user-name">
                  {user.fullName || user.name}
                </span>
                <FaCaretDown className="hd-header__caret" />
              </button>
              <div className="hd-header__user-menu">
                <Link
                  to="/user/profile"
                  className="hd-header__user-menu-item"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FaUserEdit />
                  <span>Thông tin cá nhân</span>
                </Link>
                <Link
                  to="/"
                  className="hd-header__user-menu-item hd-header__user-menu-item--danger"
                  onClick={handleLogout}
                >
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
