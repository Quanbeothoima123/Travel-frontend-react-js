import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSideBar.css";
import {
  FaChevronDown,
  FaConciergeBell,
  FaImages,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaNewspaper,
  FaTachometerAlt,
  FaUserCircle,
} from "react-icons/fa";

const DefaultIcon = FaUserCircle;

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  // ====== MENU DATA ======
  const menuItems = useMemo(
    () => [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: FaTachometerAlt,
        path: "/admin/dashboard",
      },
      {
        id: "tour",
        title: "Tour Management",
        icon: FaMapMarkedAlt,
        children: [
          {
            id: "tour-categories",
            title: "Tour Categories",
            path: "/admin/tour-categories",
          },
          { id: "tour-list", title: "Tour List", path: "/admin/tours" },
        ],
      },
      {
        id: "services",
        title: "Services",
        icon: FaConciergeBell,
        children: [
          {
            id: "service-categories",
            title: "Service Categories",
            path: "/admin/service-categories",
          },
          {
            id: "service-list",
            title: "Service List",
            path: "/admin/service-list",
          },
        ],
      },
      {
        id: "news",
        title: "News",
        icon: FaNewspaper,
        children: [
          {
            id: "news-categories",
            title: "News Categories",
            path: "/admin/news-category",
          },
          { id: "news-list", title: "News List", path: "/admin/news-list" },
        ],
      },
      {
        id: "gallery",
        title: "Gallery",
        icon: FaImages,
        children: [
          {
            id: "gallery-categories",
            title: "Gallery Categories",
            path: "/admin/gallery-categories",
          },
          {
            id: "gallery-list",
            title: "Gallery List",
            path: "/admin/gallery-list",
          },
        ],
      },
      {
        id: "about",
        title: "About",
        icon: FaInfoCircle,
        children: [
          {
            id: "about-categories",
            title: "About Categories",
            path: "/admin/about-categories",
          },
          { id: "about-list", title: "About List", path: "/admin/about-list" },
        ],
      },
    ],
    []
  );

  // mở sẵn group chứa route hiện tại
  const [openIds, setOpenIds] = useState(new Set());
  useEffect(() => {
    const current = location.pathname;
    const withCurrent = new Set(openIds);
    menuItems.forEach((it) => {
      if (it.children && it.children.some((c) => c.path === current)) {
        withCurrent.add(it.id);
      }
    });
    setOpenIds(withCurrent);
  }, [location.pathname, menuItems]);

  const toggle = (id) => {
    const copy = new Set(openIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setOpenIds(copy);
  };

  const closeMobileAfterClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="as-scroll">
          <div className="as-logo">Quản trị viên</div>

          <nav className="as-nav">
            {menuItems.map((item) => {
              const Icon = item.icon || DefaultIcon;
              const activeParent = openIds.has(item.id);
              const hasChildren = !!item.children?.length;
              const isActiveLeaf = location.pathname === item.path;

              // NEW: cha có con active
              const isActiveParentByChild =
                hasChildren &&
                item.children.some((c) => location.pathname === c.path);

              return (
                <div key={item.id} className="as-group">
                  {hasChildren ? (
                    <button
                      className={`as-item 
                        ${isActiveParentByChild ? "active" : ""} 
                        ${activeParent ? "open" : ""}`}
                      onClick={() => toggle(item.id)}
                    >
                      <span className="as-item-left">
                        <Icon className="as-icon" />
                        <span className="as-text">{item.title}</span>
                      </span>
                      <FaChevronDown
                        className={`as-caret ${activeParent ? "rotate" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      className={`as-item ${isActiveLeaf ? "current" : ""}`}
                      to={item.path}
                      onClick={closeMobileAfterClick}
                    >
                      <span className="as-item-left">
                        <Icon className="as-icon" />
                        <span className="as-text">{item.title}</span>
                      </span>
                    </Link>
                  )}

                  {/* Sub menu */}
                  {hasChildren && (
                    <div className={`as-sub ${activeParent ? "open" : ""}`}>
                      <div className="as-sub-inner">
                        {item.children.map((c) => {
                          const current = location.pathname === c.path;
                          return (
                            <Link
                              key={c.id}
                              to={c.path}
                              onClick={closeMobileAfterClick}
                              className={`as-sub-item ${
                                current ? "current" : ""
                              }`}
                            >
                              <span className="as-bullet" />
                              <span className="as-sub-text">{c.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* overlay khi mobile mở sidebar */}
      <div
        className={`admin-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />
    </>
  );
}
