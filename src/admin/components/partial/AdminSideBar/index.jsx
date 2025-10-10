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
  FaCog,
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
        title: "Quản lý Tour",
        icon: FaMapMarkedAlt,
        children: [
          {
            id: "tour-category",
            title: "Danh mục Tour",
            path: "/admin/tour-categories",
          },
          { id: "tour", title: "Danh sách Tour", path: "/admin/tours" },
        ],
      },
      {
        id: "services",
        title: "Dịch vụ",
        icon: FaConciergeBell,
        children: [
          {
            id: "service-category",
            title: "Danh mục dịch vụ",
            path: "/admin/service-category",
          },
          {
            id: "service-list",
            title: "Dịch vụ",
            path: "/admin/service-list",
          },
        ],
      },
      {
        id: "news",
        title: "Tin tức",
        icon: FaNewspaper,
        children: [
          {
            id: "news-category",
            title: "Danh mục tin tức",
            path: "/admin/news-category",
          },
          { id: "news-list", title: "Tin tức", path: "/admin/news" },
        ],
      },
      {
        id: "gallery",
        title: "Quản lí bộ sưu tập",
        icon: FaImages,
        children: [
          {
            id: "gallery-category",
            title: "Danh mục sưu tập",
            path: "/admin/gallery-category",
          },
          {
            id: "gallery",
            title: "Bộ sưu tập",
            path: "/admin/gallery",
          },
        ],
      },
      {
        id: "about",
        title: "Giới thiệu",
        icon: FaInfoCircle,
        children: [
          {
            id: "about-page",
            title: "Travel Group Việt Nam",
            path: "/admin/about-us",
          },
          {
            id: "recruitment",
            title: "Tuyển dụng",
            path: "/admin/recruitment",
          },
        ],
      },
      {
        id: "config",
        title: "Cấu hình",
        icon: FaCog,
        children: [
          {
            id: "config-basic",
            title: "Cấu hình cơ bản",
            path: "/admin/config-basic",
          },
          {
            id: "config-advanced",
            title: "Cấu hình nâng cao",
            path: "/admin/config-advanced",
          },
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
