// components/FriendsTabs/FriendCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCommentDots,
  FaEllipsisV,
  FaUser,
  FaUserTimes,
} from "react-icons/fa";
import ConfirmModal from "../../../admin/components/common/ConfirmModal";
import "./FriendCard.css";

const FriendCard = ({ friend, onUnfriend, onViewProfile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = friend.customName || friend.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleUnfriendClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const handleConfirmUnfriend = () => {
    onUnfriend(friend._id);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="friends-card">
        <div className="friends-card-content">
          {/* Avatar */}
          <div className="friends-card-avatar-wrapper">
            {friend.avatar ? (
              <img
                src={friend.avatar}
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
            <p className="friends-card-username">@{friend.userName}</p>
          </div>

          {/* Actions */}
          <div className="friends-card-actions">
            {/* ✅ Thay button bằng Link */}
            <Link
              to={`/user/chat?userId=${friend._id}`}
              className="friends-btn-message"
              title="Nhắn tin"
            >
              <FaCommentDots />
            </Link>

            <div className="friends-card-menu-wrapper">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="friends-btn-more"
              >
                <FaEllipsisV />
              </button>

              {showMenu && (
                <>
                  <div
                    className="friends-menu-backdrop"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="friends-card-menu">
                    <button
                      onClick={() => {
                        onViewProfile(friend._id);
                        setShowMenu(false);
                      }}
                      className="friends-menu-item"
                    >
                      <FaUser />
                      Xem trang cá nhân
                    </button>
                    <button
                      onClick={handleUnfriendClick}
                      className="friends-menu-item friends-menu-item-danger"
                    >
                      <FaUserTimes />
                      Hủy kết bạn
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmUnfriend}
        title="Hủy kết bạn"
        message={`Bạn có chắc muốn hủy kết bạn với ${displayName}?`}
      />
    </>
  );
};

export default FriendCard;
