import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../../../../contexts/ToastContext";
import LoadingModal from "../../../components/common/LoadingModal";
import "./GalleryDetail.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGalleryDetail();
  }, [id]);

  const fetchGalleryDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/admin/gallery/detail/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success && data.data) {
        setGallery(data.data);
      } else {
        showToast(data.message || "Không thể tải thông tin gallery", "error");
        navigate("/admin/gallery");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      showToast("Có lỗi xảy ra khi tải thông tin gallery", "error");
      navigate("/admin/gallery");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getYouTubeEmbedUrl = (iframeOrUrl) => {
    if (!iframeOrUrl) return "";

    // Nếu là mã iframe HTML, parse ra src
    if (iframeOrUrl.includes("<iframe")) {
      const srcMatch = iframeOrUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    // Nếu là URL thuần, xử lý convert sang embed
    let videoId = "";

    if (iframeOrUrl.includes("youtube.com/watch?v=")) {
      videoId = iframeOrUrl.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (iframeOrUrl.includes("youtu.be/")) {
      videoId = iframeOrUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (iframeOrUrl.includes("youtube.com/embed/")) {
      return iframeOrUrl;
    }

    return iframeOrUrl;
  };

  if (loading) {
    return (
      <LoadingModal
        open={true}
        message="Đang tải thông tin gallery..."
        icon="FaSpinner"
      />
    );
  }

  if (!gallery) {
    return <div className="gallery-detail-error">Không tìm thấy gallery</div>;
  }

  return (
    <div className="gallery-detail-container">
      <div className="gallery-detail-header">
        <button className="btn-back" onClick={() => navigate("/admin/gallery")}>
          ← Quay lại
        </button>
        <div className="gallery-detail-actions">
          <button
            className="btn-edit"
            onClick={() => navigate(`/admin/gallery/edit/${id}`)}
          >
            ✏️ Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Banner Thumbnail */}
      <div className="gallery-detail-banner">
        <img src={gallery.thumbnail} alt={gallery.title} />
        <div className="gallery-detail-banner-overlay">
          <h1>{gallery.title}</h1>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="gallery-detail-content">
        <div className="gallery-detail-sidebar">
          {/* Thống kê */}
          <div className="gallery-detail-stats">
            <div className="stat-item">
              <span className="stat-icon">👁️</span>
              <div>
                <div className="stat-value">{gallery.views || 0}</div>
                <div className="stat-label">Lượt xem</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <div>
                <div className="stat-value">{gallery.likes || 0}</div>
                <div className="stat-label">Lượt thích</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔗</span>
              <div>
                <div className="stat-value">{gallery.shares || 0}</div>
                <div className="stat-label">Chia sẻ</div>
              </div>
            </div>
          </div>

          {/* Danh mục */}
          <div className="gallery-detail-card">
            <h3>📂 Phân loại</h3>
            <div className="info-group">
              <label>Danh mục Gallery:</label>
              <span className="badge badge-primary">
                {gallery.galleryCategory?.title || "Chưa phân loại"}
              </span>
            </div>
            {gallery.tourCategory && (
              <div className="info-group">
                <label>Danh mục Tour:</label>
                <span className="badge badge-secondary">
                  {gallery.tourCategory.title}
                </span>
              </div>
            )}
            {gallery.tour && (
              <div className="info-group">
                <label>Tour liên kết:</label>
                <Link
                  to={`/admin/tour/${gallery.tour._id}`}
                  className="badge badge-success"
                >
                  {gallery.tour.title}
                </Link>
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="gallery-detail-card">
            <h3>⚙️ Trạng thái</h3>
            <div className="info-group">
              <label>Trạng thái:</label>
              <span
                className={`status-badge ${
                  gallery.active ? "active" : "inactive"
                }`}
              >
                {gallery.active ? "✓ Hoạt động" : "✕ Không hoạt động"}
              </span>
            </div>
          </div>

          {/* Người tạo/cập nhật */}
          <div className="gallery-detail-card">
            <h3>👤 Thông tin tác giả</h3>
            {gallery.createdBy && (
              <div className="info-group">
                <label>Người tạo:</label>
                <div>
                  <div className="author-name">
                    {gallery.createdBy._id?.fullName ||
                      gallery.createdBy._id?.username ||
                      "N/A"}
                  </div>
                  <div className="author-time">
                    {formatDate(gallery.createdBy.time)}
                  </div>
                </div>
              </div>
            )}
            {gallery.updatedBy && gallery.updatedBy._id && (
              <div className="info-group">
                <label>Cập nhật lần cuối:</label>
                <div>
                  <div className="author-name">
                    {gallery.updatedBy._id.fullName ||
                      gallery.updatedBy._id.username}
                  </div>
                  <div className="author-time">
                    {formatDate(gallery.updatedBy.time)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="gallery-detail-main">
          {/* Mô tả */}
          {gallery.shortDescription && (
            <div className="gallery-detail-section">
              <h2>📝 Mô tả ngắn</h2>
              <p className="short-description">{gallery.shortDescription}</p>
            </div>
          )}

          {gallery.longDescription && (
            <div className="gallery-detail-section">
              <h2>📄 Mô tả chi tiết</h2>
              <p className="long-description">{gallery.longDescription}</p>
            </div>
          )}

          {/* Tags */}
          {gallery.tags && gallery.tags.length > 0 && (
            <div className="gallery-detail-section">
              <h2>🏷️ Tags</h2>
              <div className="tags-list">
                {gallery.tags.map((tag, idx) => (
                  <span key={idx} className="tag-item">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thư viện ảnh */}
          {gallery.images && gallery.images.length > 0 && (
            <div className="gallery-detail-section">
              <h2>🖼️ Thư viện ảnh ({gallery.images.length})</h2>
              <div className="images-grid">
                {gallery.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="image-item"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img.url} alt={img.title || `Image ${idx + 1}`} />
                    {img.title && (
                      <div className="image-caption">{img.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {gallery.videos && gallery.videos.length > 0 && (
            <div className="gallery-detail-section">
              <h2>🎥 Videos ({gallery.videos.length})</h2>
              <div className="videos-grid">
                {gallery.videos.map((vid, idx) => (
                  <div key={idx} className="video-item">
                    <div className="video-wrapper">
                      <iframe
                        src={getYouTubeEmbedUrl(vid.url)}
                        title={vid.title || `Video ${idx + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {vid.title && (
                      <div className="video-caption">{vid.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal xem ảnh full */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage.url} alt={selectedImage.title} />
            {selectedImage.title && (
              <div className="image-modal-caption">{selectedImage.title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDetail;
