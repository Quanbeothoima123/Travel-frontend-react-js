import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
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

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        // Bạn thay link fetch thực tế vào đây
        const endpoints = {
          home: "http://localhost:5000/api/v1/homePage",
          tour: "http://localhost:5000/api/v1/tour",
          service: "http://localhost:5000/api/v1/service",
          news: "http://localhost:5000/api/v1/news",
          library: "http://localhost:5000/api/v1/library",
          contact: "http://localhost:5000/api/v1/contact",
          about: "http://localhost:5000/api/v1/info",
        };

        // Promise.all fetch tất cả
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

        // Giữ đúng thứ tự danh mục
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

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
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
        </div>
      </nav>

      {/* Sidebar mobile */}
      <Sidebar
        menuItems={menuData}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
    </header>
  );
};

export default Header;
