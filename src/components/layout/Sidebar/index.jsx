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

const Sidebar = ({ menuItems, isOpen, onToggle }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onToggle}>
        &times;
      </button>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <SidebarItem key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
