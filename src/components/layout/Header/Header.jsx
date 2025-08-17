import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../Sidebar/Sidebar";
import "./Header.css";

const staticMenuItems = [
  { _id: "1", title: "Trang chủ", slug: "", children: [] },
  { _id: "3", title: "Dịch vụ", slug: "dich-vu", children: [] },
  { _id: "4", title: "Tin tức", slug: "tin-tuc", children: [] },
  { _id: "5", title: "Thư viện", slug: "thu-vien", children: [] },
  { _id: "6", title: "Liên hệ", slug: "lien-he", children: [] },
  { _id: "7", title: "Giới thiệu", slug: "gioi-thieu", children: [] },
];

/**
 * Đệ quy render menu nhiều cấp
 * depth = 0: item top-level trên navbar
 * depth >= 1: item nằm trong dropdown
 */
const MenuItem = ({ item, depth = 0 }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  // Leaf item
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

  // Node có children
  return depth === 0 ? (
    // Top-level: dùng .dropdown
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
    // Cấp sâu: dùng .dropdown-submenu (tự định nghĩa)
    <li className="dropdown-submenu">
      <Link
        className="dropdown-item dropdown-toggle"
        to={`/${item.slug}`}
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {item.title}
        <span className="submenu-caret" aria-hidden>
          ›
        </span>
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
  const [tourData, setTourData] = useState(null);

  useEffect(() => {
    const fetchTourCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/tourCategory");
        const data = await res.json();
        setTourData(data);
      } catch (e) {
        console.error("Error fetching tour categories:", e);
      }
    };
    fetchTourCategories();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  // Chèn “Tour du lịch” (giả định là phần tử đầu tiên từ API)
  const menuItems = tourData
    ? [...staticMenuItems, tourData[0]]
    : staticMenuItems;

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
              {menuItems.map((item) => (
                <MenuItem key={item._id} item={item} />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar mobile (bạn đã có) */}
      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
    </header>
  );
};

export default Header;
