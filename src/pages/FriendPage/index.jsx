// pages/FriendsPage/FriendsPage.jsx
import React, { useState, useEffect } from "react";
import SetupModal from "../../components/common/SetupModal";
import TabHeader from "../../components/common/FriendsTabs/TabHeader";
import FriendsList from "../../components/common/FriendsTabs/FriendsList";
import FilterPanelFriend from "../../components/common/FilterPanelFriend";
import "./FriendsPage.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const FriendsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [filters, setFilters] = useState({
    userName: "",
    province: "",
    ward: "",
    birthYear: "",
    sex: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/user/profile`, {
        credentials: "include", // Gửi cookie authToken
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);

      // Kiểm tra có userName chưa
      if (!userData.userName) {
        setNeedsSetup(true);
      }
    } catch (error) {
      console.error("Load user profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    loadUserProfile(); // Reload để lấy data mới nhất
  };

  const handleResetFilters = () => {
    setFilters({
      userName: "",
      province: "",
      ward: "",
      birthYear: "",
      sex: "",
    });
  };

  if (loading) {
    return (
      <div className="friends-page">
        <div className="friends-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      {needsSetup && <SetupModal onComplete={handleSetupComplete} />}

      {!needsSetup && user && (
        <>
          <div className="friends-header">
            <h1 className="friends-page-title">Bạn bè</h1>
          </div>

          <TabHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              friends: user.friends?.length || 0,
              received: user.friendRequestsReceived?.length || 0,
              sent: user.friendRequestsSent?.length || 0,
              blocked: user.blockedUsers?.length || 0,
            }}
          />

          <FilterPanelFriend
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />

          <FriendsList
            user={user}
            activeTab={activeTab}
            filters={filters}
            onDataChange={loadUserProfile}
          />
        </>
      )}
    </div>
  );
};

export default FriendsPage;
