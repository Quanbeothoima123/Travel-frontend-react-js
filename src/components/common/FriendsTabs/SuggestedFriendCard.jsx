// components/FriendsTabs/SuggestedFriendCard.jsx
import React, { useState } from "react";
import { FaUserPlus, FaEye } from "react-icons/fa";
import FriendRequestModal from "./FriendRequestModal";
import "./FriendCard.css";

const SuggestedFriendCard = ({ user, onAddFriend, onViewProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const displayName = user.customName || user.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleAddFriendClick = () => {
    setShowModal(true);
  };

  const handleSendRequest = async (message) => {
    console.log("Message to send:", message); // Debug log
    setIsLoading(true);
    try {
      await onAddFriend(user._id, message);
      setShowModal(false);
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="friends-card">
        <div className="friends-card-content">
          {/* Avatar */}
          <div className="friends-card-avatar-wrapper">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="friends-card-avatar-img"
              />
            ) : (
              <div className="friends-card-avatar-placeholder">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="friends-card-info">
            <h4 className="friends-card-name">{displayName}</h4>
            <p className="friends-card-username">@{user.userName}</p>
          </div>

          {/* Actions */}
          <div className="friends-card-actions">
            <button
              onClick={handleAddFriendClick}
              className="friends-btn-add"
              disabled={isLoading}
              title="Thêm bạn bè"
            >
              <FaUserPlus />
              Kết bạn
            </button>
            <button
              onClick={() => onViewProfile(user._id)}
              className="friends-btn-view-profile"
              title="Xem trang cá nhân"
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>

      <FriendRequestModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSend={handleSendRequest}
        userName={displayName}
        isLoading={isLoading}
      />
    </>
  );
};

export default SuggestedFriendCard;
