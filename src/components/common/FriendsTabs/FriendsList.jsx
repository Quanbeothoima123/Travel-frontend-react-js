// components/FriendsTabs/FriendsList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Dùng Link thay vì navigate
import FriendCard from "./FriendCard";
import RequestCard from "./RequestCard";
import BlockedCard from "./BlockedCard";
import SuggestedFriendCard from "./SuggestedFriendCard";
import "./FriendsList.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const FriendsList = ({ activeTab, filters, onDataChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setData([]);
  }, [activeTab, filters]);

  useEffect(() => {
    loadData();
  }, [activeTab, filters, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...filters,
      });

      switch (activeTab) {
        case "friends":
          endpoint = `/api/v1/user/friends?${queryParams}`;
          break;
        case "suggestions":
          endpoint = `/api/v1/user/friends/suggestions?${queryParams}`;
          break;
        case "received":
          endpoint = `/api/v1/user/friend-requests/received?${queryParams}`;
          break;
        case "sent":
          endpoint = `/api/v1/user/friend-requests/sent?${queryParams}`;
          break;
        case "blocked":
          endpoint = `/api/v1/user/blocked?${queryParams}`;
          break;
        default:
          return;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (page === 1) {
        setData(result.data.items);
      } else {
        setData((prev) => [...prev, ...result.data.items]);
      }

      setHasMore(result.data.nextPageExists);
    } catch (error) {
      console.error("❌ Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    console.log("👤 View profile:", userId);
    // TODO: Implement profile navigation
    // window.location.href = `/profile/${userId}`;
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

      if (!response.ok) throw new Error("Unfriend failed");

      setData((prev) => prev.filter((item) => item._id !== friendId));
      onDataChange?.();
      alert("Đã hủy kết bạn thành công!");
    } catch (error) {
      console.error("❌ Unfriend error:", error);
      alert("Không thể hủy kết bạn");
    }
  };

  const handleAcceptRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (!response.ok) throw new Error("Accept failed");

      setData((prev) => prev.filter((item) => item._id !== fromUserId));
      onDataChange?.();
      alert("Đã chấp nhận lời mời kết bạn!");
    } catch (error) {
      console.error("❌ Accept request error:", error);
      alert("Không thể chấp nhận lời mời");
    }
  };

  const handleRejectRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (!response.ok) throw new Error("Reject failed");

      setData((prev) => prev.filter((item) => item._id !== fromUserId));
      onDataChange?.();
    } catch (error) {
      console.error("❌ Reject request error:", error);
      alert("Không thể từ chối lời mời");
    }
  };

  const handleCancelRequest = async (toUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/cancel`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ toUserId }),
        }
      );

      if (!response.ok) throw new Error("Cancel failed");

      setData((prev) => prev.filter((item) => item._id !== toUserId));
      onDataChange?.();
    } catch (error) {
      console.error("❌ Cancel request error:", error);
      alert("Không thể hủy lời mời");
    }
  };

  const handleUnblock = async (targetUserId) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/user/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) throw new Error("Unblock failed");

      setData((prev) => prev.filter((item) => item._id !== targetUserId));
      onDataChange?.();
      alert("Đã bỏ chặn thành công!");
    } catch (error) {
      console.error("❌ Unblock error:", error);
      alert("Không thể bỏ chặn");
    }
  };

  const handleAddFriend = async (userId, message) => {
    try {
      const requestBody = {
        toUserId: userId,
        message: message || undefined,
      };

      const response = await fetch(
        `${API_BASE}/api/v1/user/friend-requests/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Send request failed");
      }

      setData((prev) => prev.filter((item) => item._id !== userId));
      onDataChange?.();
      alert("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("❌ Add friend error:", error);
      alert(error.message || "Không thể gửi lời mời kết bạn");
    }
  };

  const renderCard = (item) => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendCard
            key={item._id}
            friend={item}
            onUnfriend={handleUnfriend}
            onViewProfile={handleViewProfile}
          />
        );
      case "suggestions":
        return (
          <SuggestedFriendCard
            key={item._id}
            user={item}
            onAddFriend={handleAddFriend}
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

  if (loading && page === 1) {
    return <div className="friends-list-loading">Đang tải...</div>;
  }

  if (!loading && data.length === 0) {
    const emptyMessages = {
      friends: "Bạn chưa có bạn bè nào",
      suggestions: "Không có gợi ý kết bạn",
      received: "Không có lời mời kết bạn nào",
      sent: "Bạn chưa gửi lời mời nào",
      blocked: "Bạn chưa chặn ai",
    };

    return (
      <div className="friends-list-empty">
        {emptyMessages[activeTab] || "Không có dữ liệu"}
      </div>
    );
  }

  return (
    <div className="friends-list">
      <div className="friends-list-grid">
        {data.map((item) => renderCard(item))}
      </div>

      {hasMore && (
        <div className="friends-list-load-more">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="friends-btn-load-more"
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
