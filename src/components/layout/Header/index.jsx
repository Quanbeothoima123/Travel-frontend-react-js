// src/components/layout/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import Sidebar from "../Sidebar";
import "./Header.css";

// Component render đệ quy menu nhiều cấp
const MenuItem = ({ item, depth = 0 }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  if (!hasChildren) {
    return depth === 0 ? (
      <li className="nav-item">
        <Link className="nav-link" to={`/${item.slug}`}>
          {item.title}
        </Link>
      </li>
    ) : (
      <li>
        <Link className="dropdown-item" to={`/${item.slug}`}>
          {item.title}
        </Link>
      </li>
    );
  }

  return depth === 0 ? (
    <li className="nav-item dropdown">
      <Link
        className="nav-link dropdown-toggle"
        to={`/${item.slug}`}
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {item.title}
      </Link>
      <ul className="dropdown-menu">
        {item.children.map((child) => (
          <MenuItem key={child._id} item={child} depth={depth + 1} />
        ))}
      </ul>
    </li>
  ) : (
    <li className="dropdown-submenu">
      <Link
        className="dropdown-item dropdown-toggle"
        to={`/${item.slug}`}
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {item.title}
        <span className="submenu-caret">›</span>
      </Link>
      <ul className="dropdown-menu">
        {item.children.map((child) => (
          <MenuItem key={child._id} item={child} depth={depth + 1} />
        ))}
      </ul>
    </li>
  );
};

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [user, setUser] = useState(null); // null = chưa đăng nhập

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const endpoints = {
          home: "http://localhost:5000/api/v1/homePage",
          tour: "http://localhost:5000/api/v1/tour",
          service: "http://localhost:5000/api/v1/service",
          news: "http://localhost:5000/api/v1/news",
          library: "http://localhost:5000/api/v1/library",
          contact: "http://localhost:5000/api/v1/contact",
          about: "http://localhost:5000/api/v1/info",
        };

        const [
          homeRes,
          tourRes,
          serviceRes,
          newsRes,
          libraryRes,
          contactRes,
          aboutRes,
        ] = await Promise.all([
          fetch(endpoints.home),
          fetch(endpoints.tour),
          fetch(endpoints.service),
          fetch(endpoints.news),
          fetch(endpoints.library),
          fetch(endpoints.contact),
          fetch(endpoints.about),
        ]);

        const [home, tour, service, news, library, contact, about] =
          await Promise.all([
            homeRes.json(),
            tourRes.json(),
            serviceRes.json(),
            newsRes.json(),
            libraryRes.json(),
            contactRes.json(),
            aboutRes.json(),
          ]);

        const ordered = [
          home[0],
          tour[0],
          service[0],
          news[0],
          library[0],
          contact[0],
          about[0],
        ];

        setMenuData(ordered);
      } catch (e) {
        console.error("Error fetching menus:", e);
      }
    };

    fetchMenus();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  // Giả lập login (sau này thay bằng API thực)
  const handleLogin = () => {
    setUser({ name: "Nguyen Van A" });
  };
  const handleLogout = () => {
    setUser(null);
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

          {/* Hamburger chỉ hiện dưới 1024px */}
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
                <MenuItem key={item._id} item={item} />
              ))}
            </ul>
          </div>
          {/* Auth section */}
          <div className="auth-section d-none d-lg-flex">
            {!user ? (
              <>
                <Link to="/login" className="auth-btn login-btn me-2">
                  <FaUserCircle className="me-1" />
                  Đăng nhập
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  <FaUserCircle className="me-1" />
                  Đăng ký
                </Link>
              </>
            ) : (
              <div className="user-info d-flex align-items-center">
                <FaUserCircle size={22} className="me-2 text-primary" />
                <span className="me-2">{user.name}</span>
                <button onClick={handleLogout} className="auth-btn logout-btn">
                  Thoát
                </button>
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
        user={user} // truyền user
        handleLogout={handleLogout} // truyền hàm logout
      />
    </header>
  );
};

export default Header;
