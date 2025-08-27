import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../../partial/AdminHeader";
import AdminSidebar from "../../partial/AdminSideBar";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ======= FAKE DATA: notifications & messages (theo yêu cầu) =======
  const notifications = [
    {
      id: 1,
      title: "New tour booking",
      message: "A new tour has been booked",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Service updated",
      message: "Hotel service updated",
      time: "10 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "System backup",
      message: "Daily backup completed",
      time: "1 hour ago",
      unread: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      message: "Question about pricing",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Jane Smith",
      message: "Hotel inquiry",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Mike Johnson",
      message: "Feedback on tour",
      time: "2 hours ago",
      unread: false,
    },
  ];

  return (
    <div className="admin-layout">
      <AdminHeader
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        notifications={notifications}
        messages={messages}
      />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        {/* dùng {children} nếu bạn truyền vào trực tiếp; còn Outlet nếu dùng react-router */}
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
