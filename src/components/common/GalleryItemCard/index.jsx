import React from "react";
import { Link } from "react-router-dom";
import { FaEye, FaHeart, FaShareAlt, FaImage, FaVideo } from "react-icons/fa";
import "./GalleryItemCard.css";

const GalleryItemCard = ({ item }) => {
  // Cắt mô tả ngắn nếu quá dài
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "Chưa có mô tả";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Đếm số lượng ảnh và video
  const imageCount = item.images?.length || 0;
  const videoCount = item.videos?.length || 0;
  console.log(item.slug);

  return (
    <Link to={`/gallery/detail/${item.slug || item._id}`} className="gic-card">
      {/* Thumbnail Container */}
      <div className="gic-thumbnail-wrapper">
        <img
          src={item.thumbnail || "/placeholder.jpg"}
          alt={item.title}
          className="gic-thumbnail"
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />

        {/* Overlay gradient */}
        <div className="gic-overlay"></div>

        {/* Media Count Badge */}
        <div className="gic-badges-top">
          {imageCount > 0 && (
            <div className="gic-badge gic-badge-image">
              <FaImage className="gic-badge-icon" />
              <span>{imageCount}</span>
            </div>
          )}
          {videoCount > 0 && (
            <div className="gic-badge gic-badge-video">
              <FaVideo className="gic-badge-icon" />
              <span>{videoCount}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        {item.galleryCategory?.title && (
          <div className="gic-category-badge">{item.galleryCategory.title}</div>
        )}
      </div>

      {/* Content */}
      <div className="gic-content">
        {/* Title */}
        <h3 className="gic-title">{item.title || "Chưa có tiêu đề"}</h3>

        {/* Short Description */}
        <p className="gic-description">
          {truncateDescription(item.shortDescription)}
        </p>

        {/* Stats */}
        <div className="gic-stats">
          <div className="gic-stats-left">
            {/* Views */}
            <div className="gic-stat-item gic-stat-views">
              <FaEye className="gic-stat-icon" />
              <span className="gic-stat-value">
                {item.views?.toLocaleString() || 0}
              </span>
            </div>

            {/* Likes */}
            <div className="gic-stat-item gic-stat-likes">
              <FaHeart className="gic-stat-icon" />
              <span className="gic-stat-value">
                {item.likes?.toLocaleString() || 0}
              </span>
            </div>

            {/* Shares */}
            <div className="gic-stat-item gic-stat-shares">
              <FaShareAlt className="gic-stat-icon" />
              <span className="gic-stat-value">
                {item.shares?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* View Details Arrow */}
          <div className="gic-view-more">Xem →</div>
        </div>

        {/* Tour Info (if exists) */}
        {item.tour?.title && (
          <div className="gic-tour-info">
            <span className="gic-tour-label">Tour:</span>
            <span className="gic-tour-title">{item.tour.title}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default GalleryItemCard;
