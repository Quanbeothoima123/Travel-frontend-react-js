import React from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaEye,
  FaHeart,
  FaBookmark,
  FaShare,
  FaTags,
  FaUser,
} from "react-icons/fa";
import SimpleTOCWrapper from "../../../components/common/SimpleTOCWrapper";
import ScrollToTopButton from "../../../components/common/ScrollToTopButton";
import "./NewsDetail.css";

const NewsDetail = ({
  newsData,
  loading,
  error,
  relatedTours,
  likedStatus,
  savedStatus,
  onLikeToggle,
  onSaveToggle,
  onShare,
}) => {
  // Handle like
  const handleLike = async () => {
    try {
      if (onLikeToggle) {
        await onLikeToggle(!likedStatus);
      }
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (onSaveToggle) {
        await onSaveToggle(!savedStatus);
      }
    } catch (err) {
      console.error("Error saving article:", err);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: newsData.title,
          text: newsData.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép liên kết!");
      }
      onShare();
    } catch (err) {
      console.error("Error sharing:", err);
      // Fallback: try to copy to clipboard manually
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Đã sao chép liên kết!");
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
        alert("Không thể chia sẻ hoặc sao chép liên kết");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get type label
  const getTypeLabel = (type) => {
    const labels = {
      news: "Tin tức",
      guide: "Cẩm nang",
      review: "Đánh giá",
      event: "Sự kiện",
      promotion: "Khuyến mãi",
    };
    return labels[type] || "Bài viết";
  };

  if (loading) {
    return (
      <div className="nd-container">
        <div className="nd-loading">
          <div className="nd-loading-spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nd-container">
        <div className="nd-error">
          <h2>Không thể tải bài viết</h2>
          <p>{error}</p>
          <Link to="/news/tin-tuc" className="nd-back-btn">
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="nd-container">
        <div className="nd-error">
          <h2>Không tìm thấy bài viết</h2>
          <Link to="/news" className="nd-back-btn">
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nd-container">
      <div className="nd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/news/tin-tuc">Tin tức</Link>
        <span>/</span>
        <span>{newsData.title}</span>
      </div>

      <article className="nd-article">
        {/* Article Header */}
        <header className="nd-header">
          <div className="nd-type-badge">{getTypeLabel(newsData.type)}</div>
          <h1 className="nd-title">{newsData.title}</h1>

          {newsData.excerpt && <p className="nd-excerpt">{newsData.excerpt}</p>}

          <div className="nd-meta">
            <div className="nd-meta-item">
              <FaCalendarAlt />
              <span>
                {formatDate(newsData.publishedAt || newsData.createdAt)}
              </span>
            </div>
            <div className="nd-meta-item">
              <FaEye />
              <span>{newsData.views || 0} lượt xem</span>
            </div>
            <div className="nd-meta-item">
              <FaHeart />
              <span>{newsData.likes || 0} lượt thích</span>
            </div>
            <div className="nd-meta-item">
              <FaHeart />
              <span>{newsData.shares || 0} lượt chia sẻ</span>
            </div>
            {newsData.author && (
              <div className="nd-meta-item">
                <FaUser />
                <span>
                  Tác giả:{" "}
                  {newsData.author.type === "admin"
                    ? "Quản trị viên"
                    : "Người dùng"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="nd-actions">
            <button
              className={`nd-action-btn ${likedStatus ? "liked" : ""}`}
              onClick={handleLike}
            >
              <FaHeart />
              <span>{likedStatus ? "Đã thích" : "Thích"}</span>
            </button>
            <button
              className={`nd-action-btn ${savedStatus ? "saved" : ""}`}
              onClick={handleSave}
            >
              <FaBookmark />
              <span>{savedStatus ? "Đã lưu" : "Lưu"}</span>
            </button>
            <button className="nd-action-btn" onClick={handleShare}>
              <FaShare />
              <span>Chia sẻ</span>
            </button>
          </div>
        </header>

        {/* Thumbnail */}
        {newsData.thumbnail && (
          <div className="nd-thumbnail">
            <img src={newsData.thumbnail} alt={newsData.title} />
          </div>
        )}

        {/* Content với SimpleTOCWrapper */}
        <div className="nd-content-wrapper">
          <SimpleTOCWrapper
            htmlContent={newsData.content}
            tocOptions={{
              tocTitle: "Mục lục",
              smoothScroll: true,
              includeNumbers: false,
            }}
            className="nd-simple-toc"
          />

          {/* Additional content bên dưới */}
          <div className="nd-additional-content">
            {/* Tags */}
            {newsData.tags && newsData.tags.length > 0 && (
              <div className="nd-tags">
                <h3>
                  <FaTags /> Từ khóa
                </h3>
                <div className="nd-tags-list">
                  {newsData.tags.map((tag, index) => (
                    <span key={index} className="nd-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tours */}
            {relatedTours && relatedTours.length > 0 && (
              <div className="nd-related-tours">
                <h3>Tour liên quan</h3>
                <div className="nd-tours-grid">
                  {relatedTours.map((tour) => (
                    <Link
                      key={tour._id}
                      to={`/tours/${tour.slug}`}
                      className="nd-tour-card"
                    >
                      {tour.thumbnail && (
                        <img src={tour.thumbnail} alt={tour.title} />
                      )}
                      <div className="nd-tour-info">
                        <h4>{tour.title}</h4>
                        {tour.price && (
                          <p className="nd-tour-price">
                            Từ {tour.price.toLocaleString("vi-VN")} VND
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="nd-comments">
          <h3>Bình luận</h3>
          <div className="nd-comments-placeholder">
            <p>Tính năng bình luận sẽ được phát triển trong tương lai.</p>
          </div>
        </div>
      </article>

      {/* Scroll to Top Button - Riêng biệt */}
      <ScrollToTopButton />
    </div>
  );
};

export default NewsDetail;
