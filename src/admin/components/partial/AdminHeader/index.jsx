import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";
import "./AdminHeader.css";

const useOutsideClose = (refs, onClose) => {
  useEffect(() => {
    const handler = (e) => {
      const clickedInside = refs.some(
        (r) => r.current && r.current.contains(e.target)
      );
      if (!clickedInside) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs, onClose]);
};

export default function AdminHeader({
  onToggleSidebar,
  notifications = [],
  messages = [],
  user = { name: "Admin", email: "admin@example.com" },
}) {
  const [open, setOpen] = useState({ msg: false, noti: false, user: false });

  const msgRef = useRef(null);
  const notiRef = useRef(null);
  const userRef = useRef(null);

  useOutsideClose([msgRef, notiRef, userRef], () =>
    setOpen({ msg: false, noti: false, user: false })
  );

  const unreadMsgs = messages.filter((m) => m.unread).length;
  const unreadNoti = notifications.filter((n) => n.unread).length;

  return (
    <header className="admin-header">
      <div className="ah-left">
        <button
          className="ah-icon-btn"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        <Link to="/admin/dashboard" className="ah-brand">
          Trang quản trị
        </Link>
      </div>

      <div className="ah-right">
        {/* MESSAGES */}
        <div className="ah-dd-wrapper" ref={msgRef}>
          <button
            className={`ah-icon-btn ${open.msg ? "active" : ""}`}
            onClick={() =>
              setOpen((s) => ({ ...s, msg: !s.msg, noti: false, user: false }))
            }
            aria-label="Messages"
          >
            <FaEnvelope />
            {unreadMsgs > 0 && <span className="ah-badge">{unreadMsgs}</span>}
          </button>
          <div className={`ah-dropdown ${open.msg ? "open" : ""}`}>
            <div className="ah-dd-title">Tin nhắn</div>
            <ul className="ah-dd-list">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`ah-dd-item ${m.unread ? "unread" : ""}`}
                >
                  <div className="ah-dd-item-title">{m.sender}</div>
                  <div className="ah-dd-item-desc">{m.message}</div>
                  <div className="ah-dd-item-meta">{m.time}</div>
                </li>
              ))}
            </ul>
            <Link className="ah-dd-footer" to="/admin/messages">
              Xem tất cả
            </Link>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="ah-dd-wrapper" ref={notiRef}>
          <button
            className={`ah-icon-btn ${open.noti ? "active" : ""}`}
            onClick={() =>
              setOpen((s) => ({ ...s, noti: !s.noti, msg: false, user: false }))
            }
            aria-label="Notifications"
          >
            <FaBell />
            {unreadNoti > 0 && <span className="ah-badge">{unreadNoti}</span>}
          </button>
          <div className={`ah-dropdown ${open.noti ? "open" : ""}`}>
            <div className="ah-dd-title">Thông báo</div>
            <ul className="ah-dd-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`ah-dd-item ${n.unread ? "unread" : ""}`}
                >
                  <div className="ah-dd-item-title">{n.title}</div>
                  <div className="ah-dd-item-desc">{n.message}</div>
                  <div className="ah-dd-item-meta">{n.time}</div>
                </li>
              ))}
            </ul>
            <Link className="ah-dd-footer" to="/admin/notifications">
              Xem tất cả
            </Link>
          </div>
        </div>

        {/* USER */}
        <div className="ah-dd-wrapper" ref={userRef}>
          <button
            className={`ah-user-btn ${open.user ? "active" : ""}`}
            onClick={() =>
              setOpen((s) => ({ ...s, user: !s.user, msg: false, noti: false }))
            }
          >
            <FaUserCircle className="ah-avatar" />
            <span className="ah-user-name">{user.name}</span>
            <FaChevronDown
              className={`ah-caret ${open.user ? "rotate" : ""}`}
            />
          </button>
          <div className={`ah-dropdown ${open.user ? "open" : ""}`}>
            <div className="ah-dd-user">
              <FaUserCircle className="ah-avatar lg" />
              <div>
                <div className="ah-dd-item-title">{user.name}</div>
                <div className="ah-dd-item-desc">{user.email}</div>
              </div>
            </div>
            <ul className="ah-dd-list compact">
              <li className="ah-dd-link">
                <Link to="/admin/profile">Hồ sơ</Link>
              </li>
              <li className="ah-dd-link">
                <Link to="/admin/settings">Cài đặt</Link>
              </li>
              <li className="ah-dd-link danger">
                <button onClick={() => alert("Logged out!")}>Đăng xuất</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
