// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const SidebarItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={`sidebar-item ${hasChildren && isOpen ? "open" : ""}`}>
      <div
        className="sidebar-link"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <Link to={`/${item.slug}`}>{item.title}</Link>
        {hasChildren && (
          <span className="toggle-icon">{isOpen ? "−" : "+"}</span>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="sidebar-submenu">
          {item.children.map((child) => (
            <SidebarItem key={child._id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ menuItems, isOpen, onToggle, user, handleLogout }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onToggle}>
        &times;
      </button>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <SidebarItem key={item._id} item={item} />
        ))}

        <hr />

        {/* Auth section */}
        {!user ? (
          <>
            <li className="sidebar-item">
              <Link to="/login" className="sidebar-auth-link">
                Đăng nhập
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/register" className="sidebar-auth-link">
                Đăng ký
              </Link>
            </li>
          </>
        ) : (
          <li className="sidebar-item">
            <span className="sidebar-user">Xin chào, {user.name}</span>
            <button className="sidebar-auth-link logout" onClick={handleLogout}>
              Thoát
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
