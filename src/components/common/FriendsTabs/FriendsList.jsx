// components/FriendsTabs/FriendsList.jsx
import React, { useState, useEffect } from "react";
import FriendCard from "./FriendCard";
import RequestCard from "./RequestCard";
import BlockedCard from "./BlockedCard";
import "./FriendsList.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const FriendsList = ({ user, activeTab, filters, onDataChange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [activeTab, filters]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let data = [];

      // Lấy data từ user profile đã fetch sẵn
      switch (activeTab) {
        case "friends":
          data = user.friends?.map((f) => f.user).filter(Boolean) || [];
          break;
        case "received":
          data =
            user.friendRequestsReceived
              ?.map((r) => ({
                ...r.user,
                message: r.message,
                createdAt: r.createdAt,
              }))
              .filter((r) => r._id) || [];
          break;
        case "sent":
          data =
            user.friendRequestsSent
              ?.map((r) => ({
                ...r.user,
                message: r.message,
                createdAt: r.createdAt,
              }))
              .filter((r) => r._id) || [];
          break;
        case "blocked":
          data =
            user.blockedUsers
              ?.map((b) => ({
                ...b.user,
                reason: b.reason,
                createdAt: b.createdAt,
              }))
              .filter((b) => b._id) || [];
          break;
        default:
          data = [];
      }

      // Apply filters
      let filteredData = data;

      if (filters.userName) {
        filteredData = filteredData.filter(
          (item) =>
            item.userName
              ?.toLowerCase()
              .includes(filters.userName.toLowerCase()) ||
            item.customName
              ?.toLowerCase()
              .includes(filters.userName.toLowerCase())
        );
      }

      setItems(filteredData);
    } catch (error) {
      console.error("Load items error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item) => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendCard
            key={item._id}
            friend={item}
            onMessage={handleMessage}
            onUnfriend={handleUnfriend}
            onViewProfile={handleViewProfile}
          />
        );
      case "received":
        return (
          <RequestCard
            key={item._id}
            request={item}
            type="received"
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onViewProfile={handleViewProfile}
          />
        );
      case "sent":
        return (
          <RequestCard
            key={item._id}
            request={item}
            type="sent"
            onCancel={handleCancelRequest}
            onViewProfile={handleViewProfile}
          />
        );
      case "blocked":
        return (
          <BlockedCard
            key={item._id}
            blocked={item}
            onUnblock={handleUnblock}
            onViewProfile={handleViewProfile}
          />
        );
      default:
        return null;
    }
  };

  // Action handlers
  const handleMessage = (userId) => {
    window.location.href = `/chat/${userId}`;
  };

  const handleViewProfile = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Bạn có chắc muốn hủy kết bạn?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friends/${friendId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        onDataChange();
      }
    } catch (error) {
      console.error("Unfriend error:", error);
    }
  };

  const handleAcceptRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (response.ok) {
        onDataChange();
      }
    } catch (error) {
      console.error("Accept request error:", error);
    }
  };

  const handleRejectRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (response.ok) {
        onDataChange();
      }
    } catch (error) {
      console.error("Reject request error:", error);
    }
  };

  const handleCancelRequest = async (toUserId) => {
    if (!window.confirm("Bạn có chắc muốn hủy lời mời?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/cancel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ toUserId }),
        }
      );

      if (response.ok) {
        onDataChange();
      }
    } catch (error) {
      console.error("Cancel request error:", error);
    }
  };

  const handleUnblock = async (targetUserId) => {
    if (!window.confirm("Bạn có chắc muốn bỏ chặn người này?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/user/unblock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      if (response.ok) {
        onDataChange();
      }
    } catch (error) {
      console.error("Unblock error:", error);
    }
  };

  if (loading && items.length === 0) {
    return <div className="friends-list-loading">Đang tải...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="friends-list-empty">
        <div className="friends-list-empty-icon">📭</div>
        <p className="friends-list-empty-text">
          {activeTab === "friends" && "Chưa có bạn bè nào"}
          {activeTab === "received" && "Chưa có lời mời kết bạn"}
          {activeTab === "sent" && "Chưa gửi lời mời nào"}
          {activeTab === "blocked" && "Chưa chặn ai"}
        </p>
      </div>
    );
  }

  return (
    <div className="friends-list">
      <div className="friends-list-grid">{items.map(renderItem)}</div>
    </div>
  );
};

export default FriendsList;
