// components/admin/NewsDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NewsDetail.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/api/v1/admin/news/detail/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setNews(result.data);
      } else {
        setError(result.message || "Không thể tải dữ liệu");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (
      window.confirm(
        `Bạn có chắc muốn đổi trạng thái thành "${getStatusText(newStatus)}"?`
      )
    ) {
      try {
        setStatusUpdating(true);

        const response = await fetch(
          `${API_BASE}/api/v1/admin/news/update-status/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setNews((prev) => ({
            ...prev,
            status: newStatus,
            publishedAt: result.data.publishedAt || prev.publishedAt,
          }));
          alert("Cập nhật trạng thái thành công!");
        } else {
          alert("Lỗi: " + result.message);
        }
      } catch (err) {
        alert("Lỗi khi cập nhật trạng thái");
        console.error("Error updating status:", err);
      } finally {
        setStatusUpdating(false);
      }
    }
  };

  const handleDeleteNews = async () => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        const response = await fetch(
          `${API_BASE}/api/admin/news/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          alert("Xóa bài viết thành công!");
          navigate("/admin/news");
        } else {
          alert("Lỗi: " + result.message);
        }
      } catch (err) {
        alert("Lỗi khi xóa bài viết");
        console.error("Error deleting news:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      published: "#28a745",
      draft: "#ffc107",
      archived: "#6c757d",
    };
    return colors[status] || "#007bff";
  };

  const getStatusText = (status) => {
    const texts = {
      published: "Đã xuất bản",
      draft: "Bản nháp",
      archived: "Đã lưu trữ",
    };
    return texts[status] || status;
  };

  const getTypeText = (type) => {
    const types = {
      news: "Tin tức",
      guide: "Hướng dẫn",
      review: "Đánh giá",
      event: "Sự kiện",
      promotion: "Khuyến mãi",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="admin-news-detail-container">
        <div className="admin-news-detail-loading">
          <div className="admin-news-detail-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-news-detail-container">
        <div className="admin-news-detail-error">
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate("/admin/news")}
            className="admin-news-detail-btn-back"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="admin-news-detail-container">
        <div className="admin-news-detail-error">
          <h3>Không tìm thấy bài viết</h3>
          <button
            onClick={() => navigate("/admin/news")}
            className="admin-news-detail-btn-back"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-news-detail-container">
      {/* Header */}
      <div className="admin-news-detail-header">
        <div className="admin-news-detail-header-top">
          <button
            onClick={() => navigate("/admin/news")}
            className="admin-news-detail-btn-back"
          >
            ← Quay lại
          </button>

          <div className="admin-news-detail-actions">
            <button
              onClick={() => navigate(`/admin/news/edit/${id}`)}
              className="admin-news-detail-btn-edit"
            >
              Chỉnh sửa
            </button>

            <select
              value={news.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="admin-news-detail-status-select"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
              <option value="archived">Lưu trữ</option>
            </select>

            <button
              onClick={handleDeleteNews}
              className="admin-news-detail-btn-delete"
            >
              Xóa
            </button>
          </div>
        </div>

        <h1 className="admin-news-detail-title">{news.title}</h1>

        <div className="admin-news-detail-meta">
          <div className="admin-news-detail-meta-item">
            <span className="admin-news-detail-meta-label">Trạng thái:</span>
            <span
              className="admin-news-detail-status"
              style={{ backgroundColor: getStatusColor(news.status) }}
            >
              {getStatusText(news.status)}
            </span>
          </div>

          <div className="admin-news-detail-meta-item">
            <span className="admin-news-detail-meta-label">Loại:</span>
            <span className="admin-news-detail-type">
              {getTypeText(news.type)}
            </span>
          </div>

          <div className="admin-news-detail-meta-item">
            <span className="admin-news-detail-meta-label">Ngôn ngữ:</span>
            <span className="admin-news-detail-language">
              {news.language === "vi" ? "Tiếng Việt" : "English"}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-news-detail-body">
        {/* Main Content */}
        <div className="admin-news-detail-main">
          {/* Thumbnail */}
          {news.thumbnail && (
            <div className="admin-news-detail-thumbnail">
              <img src={news.thumbnail} alt={news.title} />
            </div>
          )}

          {/* Excerpt */}
          {news.excerpt && (
            <div className="admin-news-detail-excerpt">
              <h3>Tóm tắt</h3>
              <p>{news.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div className="admin-news-detail-content">
            <h3>Nội dung bài viết</h3>
            <div
              className="admin-news-detail-content-body"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="admin-news-detail-tags">
              <h3>Tags</h3>
              <div className="admin-news-detail-tags-list">
                {news.tags.map((tag, index) => (
                  <span key={index} className="admin-news-detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Highlight Images */}
          {news.highlightImages && news.highlightImages.length > 0 && (
            <div className="admin-news-detail-gallery">
              <h3>Hình ảnh nổi bật</h3>
              <div className="admin-news-detail-gallery-grid">
                {news.highlightImages.map((image, index) => (
                  <img key={index} src={image} alt={`Highlight ${index + 1}`} />
                ))}
              </div>
            </div>
          )}

          {/* Related Tours */}
          {news.relatedTourIds && news.relatedTourIds.length > 0 && (
            <div className="admin-news-detail-related-tours">
              <h3>Tour liên quan</h3>
              <div className="admin-news-detail-tours-grid">
                {news.relatedTourIds.map((tour) => (
                  <div key={tour._id} className="admin-news-detail-tour-item">
                    {tour.thumbnail && (
                      <img src={tour.thumbnail} alt={tour.title} />
                    )}
                    <div className="admin-news-detail-tour-info">
                      <h4>{tour.title}</h4>
                      <p className="admin-news-detail-tour-price">
                        {tour.prices?.toLocaleString("vi-VN")} VNĐ
                        {tour.discount > 0 && (
                          <span className="admin-news-detail-tour-discount">
                            -{tour.discount}%
                          </span>
                        )}
                      </p>
                      <p className="admin-news-detail-tour-seats">
                        Còn {tour.seats} chỗ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="admin-news-detail-sidebar">
          {/* Engagement Stats */}
          <div className="admin-news-detail-info-card">
            <h3>Thống kê tương tác</h3>

            <div className="admin-news-detail-stats">
              <div className="admin-news-detail-stat-item">
                <span className="admin-news-detail-stat-number">
                  {news.views || 0}
                </span>
                <span className="admin-news-detail-stat-label">Lượt xem</span>
              </div>

              <div className="admin-news-detail-stat-item">
                <span className="admin-news-detail-stat-number">
                  {news.likes || 0}
                </span>
                <span className="admin-news-detail-stat-label">Lượt thích</span>
              </div>

              <div className="admin-news-detail-stat-item">
                <span className="admin-news-detail-stat-number">
                  {news.saves || 0}
                </span>
                <span className="admin-news-detail-stat-label">Lượt lưu</span>
              </div>

              <div className="admin-news-detail-stat-item">
                <span className="admin-news-detail-stat-number">
                  {news.shares || 0}
                </span>
                <span className="admin-news-detail-stat-label">
                  Lượt chia sẻ
                </span>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="admin-news-detail-info-card">
            <h3>Thông tin cơ bản</h3>

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">ID:</span>
              <span className="admin-news-detail-info-value">{news._id}</span>
            </div>

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">Slug:</span>
              <span className="admin-news-detail-info-value">{news.slug}</span>
            </div>

            {news.eventDate && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">
                  Ngày sự kiện:
                </span>
                <span className="admin-news-detail-info-value">
                  {formatDate(news.eventDate)}
                </span>
              </div>
            )}

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">Tạo lúc:</span>
              <span className="admin-news-detail-info-value">
                {formatDate(news.createdAt)}
              </span>
            </div>

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">
                Cập nhật lúc:
              </span>
              <span className="admin-news-detail-info-value">
                {formatDate(news.updatedAt)}
              </span>
            </div>

            {news.publishedAt && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">
                  Xuất bản lúc:
                </span>
                <span className="admin-news-detail-info-value">
                  {formatDate(news.publishedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="admin-news-detail-info-card">
            <h3>Danh mục</h3>

            {news.newsCategoryId && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">
                  Danh mục tin:
                </span>
                <span className="admin-news-detail-info-value">
                  {news.newsCategoryId.title}
                </span>
              </div>
            )}

            {news.categoryId && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">
                  Danh mục tour:
                </span>
                <span className="admin-news-detail-info-value">
                  {news.categoryId.title}
                </span>
              </div>
            )}

            {news.destinationIds && news.destinationIds.length > 0 && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">Điểm đến:</span>
                <div className="admin-news-detail-destinations">
                  {news.destinationIds.map((destination) => (
                    <span
                      key={destination._id}
                      className="admin-news-detail-destination"
                    >
                      {destination.name_with_type || destination.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author Info */}
          {news.authorInfo && (
            <div className="admin-news-detail-info-card">
              <h3>Thông tin tác giả</h3>

              <div className="admin-news-detail-author">
                {news.authorInfo.avatar && (
                  <img
                    src={news.authorInfo.avatar}
                    alt={news.authorInfo.fullName}
                    className="admin-news-detail-author-avatar"
                  />
                )}

                <div className="admin-news-detail-author-info">
                  <p className="admin-news-detail-author-name">
                    {news.authorInfo.fullName}
                  </p>
                  <p className="admin-news-detail-author-email">
                    {news.authorInfo.email}
                  </p>
                  <p className="admin-news-detail-author-type">
                    {news.authorInfo.type === "admin"
                      ? "Quản trị viên"
                      : "Người dùng"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEO Info */}
          <div className="admin-news-detail-info-card">
            <h3>Thông tin SEO</h3>

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">Meta Title:</span>
              <span className="admin-news-detail-info-value">
                {news.metaTitle || "Chưa có"}
              </span>
            </div>

            <div className="admin-news-detail-info-item">
              <span className="admin-news-detail-info-label">
                Meta Description:
              </span>
              <span className="admin-news-detail-info-value">
                {news.metaDescription || "Chưa có"}
              </span>
            </div>

            {news.metaKeywords && news.metaKeywords.length > 0 && (
              <div className="admin-news-detail-info-item">
                <span className="admin-news-detail-info-label">
                  Meta Keywords:
                </span>
                <div className="admin-news-detail-keywords">
                  {news.metaKeywords.map((keyword, index) => (
                    <span key={index} className="admin-news-detail-keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
