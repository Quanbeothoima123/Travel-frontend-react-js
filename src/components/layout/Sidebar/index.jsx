import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import "./Sidebar.css";

const SidebarItem = ({ item, pathname, parentBasePath = "" }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  let linkTo = "/";
  if (parentBasePath && item.slug) linkTo = `/${parentBasePath}/${item.slug}`;
  else if (parentBasePath && !item.slug) linkTo = `/${parentBasePath}`;
  else if (item.slug) linkTo = `/${item.slug}`;

  const isActive =
    pathname === linkTo || (hasChildren && pathname.startsWith(linkTo));

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive, pathname]);

  return (
    <li
      className={[
        "sb-sidebar__item",
        hasChildren ? "sb-sidebar__item--has-children" : "",
        isActive ? "sb-sidebar__item--active" : "",
        isOpen ? "sb-sidebar__item--open" : "",
      ].join(" ")}
    >
      <div className="sb-sidebar__row">
        <Link
          to={linkTo}
          className="sb-sidebar__link"
          onClick={() => {
            /* link navigates normally */
          }}
        >
          <span className="sb-sidebar__link-title">{item.title}</span>
        </Link>

        {hasChildren && (
          <button
            type="button"
            className="sb-sidebar__toggle"
            aria-expanded={isOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((s) => !s);
            }}
          >
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="sb-sidebar__submenu">
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

const Sidebar = ({ menuItems = [], isOpen, onToggle }) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      className={`sb-sidebar ${isOpen ? "sb-sidebar--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        className="sb-sidebar__close"
        aria-label="Close sidebar"
        onClick={onToggle}
      >
        &times;
      </button>

      <nav className="sb-sidebar__nav" aria-label="Primary">
        <ul className="sb-sidebar__menu">
          {menuItems.map((item) => (
            <SidebarItem
              key={item._id}
              item={item}
              pathname={pathname}
              parentBasePath={item.basePath || ""}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
