import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import "./Sidebar.css";

const SidebarItem = ({ item, pathname, parentBasePath = "" }) => {
  const hasChildren = item.children && item.children.length > 0;

  // Xác định đường dẫn đầy đủ
  let linkTo = "/";
  if (parentBasePath && item.slug) {
    linkTo = `/${parentBasePath}/${item.slug}`;
  } else if (parentBasePath && !item.slug) {
    linkTo = `/${parentBasePath}`;
  } else if (item.slug) {
    linkTo = `/${item.slug}`;
  }

  // Active nếu URL hiện tại khớp hoặc nằm trong subtree
  const isActive =
    pathname === linkTo || (hasChildren && pathname.startsWith(linkTo));

  const [isOpen, setIsOpen] = useState(isActive);

  // Khi pathname thay đổi, tự mở node nếu active
  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [pathname, isActive]);

  return (
    <li
      className={`sidebar-item ${hasChildren ? "has-children" : ""} ${
        isActive ? "active" : ""
      } ${isOpen ? "open" : ""}`}
    >
      <div
        className="sidebar-link"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <Link to={linkTo}>{item.title}</Link>
        {hasChildren && (
          <span className="toggle-icon">
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="sidebar-submenu">
          {item.children.map((child) => (
            <SidebarItem
              key={child._id}
              item={child}
              pathname={pathname}
              parentBasePath={parentBasePath}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ menuItems, isOpen, onToggle }) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onToggle}>
        &times;
      </button>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <SidebarItem
            key={item._id}
            item={item}
            pathname={pathname}
            parentBasePath={item.basePath || ""}
          />
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
