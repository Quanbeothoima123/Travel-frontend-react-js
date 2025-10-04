// components/FriendsTabs/TabHeader.jsx
import React from "react";
import { FaUserFriends, FaUserPlus, FaPaperPlane, FaBan } from "react-icons/fa";
import "./TabHeader.css";

const TabHeader = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    {
      id: "friends",
      label: "Bạn bè",
      count: counts.friends,
      icon: <FaUserFriends />,
    },
    {
      id: "received",
      label: "Lời mời đến",
      count: counts.received,
      icon: <FaUserPlus />,
    },
    {
      id: "sent",
      label: "Lời mời đã gửi",
      count: counts.sent,
      icon: <FaPaperPlane />,
    },
    {
      id: "blocked",
      label: "Đã chặn",
      count: counts.blocked,
      icon: <FaBan />,
    },
  ];

  return (
    <div className="friends-tab-header">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`friends-tab-button ${
            activeTab === tab.id ? "friends-tab-active" : ""
          }`}
        >
          <span className="friends-tab-icon">{tab.icon}</span>
          <span className="friends-tab-label">{tab.label}</span>
          {tab.count > 0 && (
            <span className="friends-tab-badge">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabHeader;
