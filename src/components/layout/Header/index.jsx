import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaCaretDown,
  FaUserEdit,
  FaHistory,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import Sidebar from "../Sidebar";
import { useAuth } from "../../../contexts/AuthContext";
import "./Header.css";

// Render menu đệ quy
const MenuItem = ({ item, depth = 0, basePath }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const linkTo = `/${basePath}/${item.slug}`;

  if (!hasChildren) {
    return depth === 0 ? (
      <li className="nav-item">
        <Link className="nav-link" to={linkTo}>
          {item.title}
        </Link>
      </li>
    ) : (
      <li>
        <Link className="dropdown-item" to={linkTo}>
          {item.title}
        </Link>
      </li>
    );
  }

  return depth === 0 ? (
    <li className="nav-item dropdown">
      <Link className="nav-link dropdown-toggle" to={linkTo}>
        {item.title}
      </Link>
      <ul className="dropdown-menu">
        {item.children.map((child) => (
          <MenuItem
            key={child._id}
            item={child}
            depth={depth + 1}
            basePath={basePath}
          />
        ))}
      </ul>
    </li>
  ) : (
    <li className="dropdown-submenu">
      <Link className="dropdown-item dropdown-toggle" to={linkTo}>
        {item.title}
        <span className="submenu-caret">›</span>
      </Link>
      <ul className="dropdown-menu">
        {item.children.map((child) => (
          <MenuItem
            key={child._id}
            item={child}
            depth={depth + 1}
            basePath={basePath}
          />
        ))}
      </ul>
    </li>
  );
};

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const { user, loading, logout } = useAuth();

  // trạng thái mở/đóng dropdown user
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Fetch menu
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const endpoints = {
          home: {
            url: "http://localhost:5000/api/v1/homePage",
            basePath: "homePage",
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

        // ghép basePath vào data
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

  // đóng dropdown khi click ra ngoài hoặc nhấn ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleToggleUserMenu = () => setIsUserMenuOpen((s) => !s);
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <img
              src="/assets/images/logo.jpg"
              alt="Vietnam Travel Group"
              className="logo"
            />
          </Link>

          {/* Hamburger mobile */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>

          {/* Menu desktop */}
          <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
            <ul className="navbar-nav">
              {menuData.map((item) => (
                <MenuItem key={item._id} item={item} basePath={item.basePath} />
              ))}
            </ul>
          </div>

          {/* Auth section */}
          <div className="auth-section d-none d-lg-flex">
            {loading ? null : !user ? (
              <>
                <Link to="/login" className="auth-btn-header me-2">
                  Đăng nhập
                </Link>
                <Link to="/register" className="auth-btn-header">
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
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={handleToggleUserMenu}
                >
                  <FaUser className="avatar" />
                  <span className="user-name">
                    Chào, {user.fullName || user.name}
                  </span>
                  <FaCaretDown className="caret" />
                </button>

                <div className="user-menu" role="menu">
                  <Link
                    to="/"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaUserEdit />
                    <span>Thông tin cá nhân</span>
                  </Link>
                  <Link
                    to="/"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaHistory />
                    <span>Lịch sử giao dịch</span>
                  </Link>
                  <button
                    className="menu-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

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
