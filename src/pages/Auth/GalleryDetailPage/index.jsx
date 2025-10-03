import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaEye,
  FaHeart,
  FaShareAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaFolder,
  FaCalendar,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
} from "react-icons/fa";
import "./GalleryDetailPage.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryDetailPage = () => {
  const { slug } = useParams();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const viewCountedRef = useRef(false);

  useEffect(() => {
    fetchGalleryDetail();
  }, [slug]);

  useEffect(() => {
    // ✅ Chỉ tăng view 1 lần duy nhất
    if (gallery && !viewCountedRef.current) {
      handleIncrementView();
      viewCountedRef.current = true;
    }
  }, [gallery]);

  const fetchGalleryDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/gallery/detail/${slug}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setGallery(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementView = async () => {
    if (!gallery?._id) return;
    try {
      await fetch(`${API_BASE}/api/v1/gallery/view/${gallery._id}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/gallery/like/${gallery._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        setGallery((prev) => ({ ...prev, likes: data.likes }));
        setLiked(true);
      }
    } catch (error) {
      console.error("Error liking gallery:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: gallery.title,
          text: gallery.shortDescription,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link đã được sao chép!");
      }

      await fetch(`${API_BASE}/api/v1/gallery/share/${gallery._id}`, {
        method: "POST",
        credentials: "include",
      });
      setGallery((prev) => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    setZoomLevel(1); // Reset zoom khi mở
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setZoomLevel(1); // Reset zoom khi đóng
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === gallery.images.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1); // Reset zoom khi chuyển ảnh
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? gallery.images.length - 1 : prev - 1
    );
    setZoomLevel(1); // Reset zoom khi chuyển ảnh
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyPress = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showLightbox, gallery]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="gdp-loading">
        <div className="gdp-spinner"></div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="gdp-not-found">
        <h2>Không tìm thấy bộ sưu tập</h2>
        <Link to="/gallery/all" className="gdp-back-link">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="gdp-container">
      {/* Header */}
      <div className="gdp-header">
        <div className="gdp-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/gallery/all">Gallery</Link>
          {gallery.galleryCategory && (
            <>
              <span>/</span>
              <Link to={`/gallery/${gallery.galleryCategory.slug}`}>
                {gallery.galleryCategory.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span>{gallery.title}</span>
        </div>

        <h1 className="gdp-title">{gallery.title}</h1>

        {gallery.shortDescription && (
          <p className="gdp-subtitle">{gallery.shortDescription}</p>
        )}

        {/* Meta Info */}
        <div className="gdp-meta">
          {gallery.tour && (
            <div className="gdp-meta-item">
              <FaMapMarkerAlt />
              <Link to={`/tour/${gallery.tour.slug}`}>
                {gallery.tour.title}
              </Link>
            </div>
          )}
          {gallery.galleryCategory && (
            <div className="gdp-meta-item">
              <FaFolder />
              <span>{gallery.galleryCategory.title}</span>
            </div>
          )}
          <div className="gdp-meta-item">
            <FaCalendar />
            <span>{formatDate(gallery.createdAt)}</span>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="gdp-actions">
          <div className="gdp-stats">
            <span>
              <FaEye /> {gallery.views || 0}
            </span>
            <span>
              <FaHeart /> {gallery.likes || 0}
            </span>
            <span>
              <FaShareAlt /> {gallery.shares || 0}
            </span>
          </div>

          <div className="gdp-buttons">
            <button
              onClick={handleLike}
              className={`gdp-btn gdp-btn-like ${liked ? "liked" : ""}`}
              disabled={liked}
            >
              <FaHeart /> {liked ? "Đã thích" : "Yêu thích"}
            </button>
            <button onClick={handleShare} className="gdp-btn gdp-btn-share">
              <FaShareAlt /> Chia sẻ
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="gdp-content">
        {/* Images Section */}
        {gallery.images && gallery.images.length > 0 && (
          <section className="gdp-section">
            <h2 className="gdp-section-title">
              Hình ảnh ({gallery.images.length})
            </h2>
            <div className="gdp-images-grid">
              {gallery.images.map((image, index) => (
                <div
                  key={index}
                  className="gdp-image-item"
                  onClick={() => openLightbox(index)}
                >
                  <img src={image.url} alt={image.title || gallery.title} />
                  {image.title && (
                    <div className="gdp-image-overlay">
                      <span>{image.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {gallery.longDescription && (
          <section className="gdp-section">
            <h2 className="gdp-section-title">Mô tả chi tiết</h2>
            <div
              className="gdp-description"
              dangerouslySetInnerHTML={{ __html: gallery.longDescription }}
            />
          </section>
        )}

        {/* Videos Section */}
        {gallery.videos && gallery.videos.length > 0 && (
          <section className="gdp-section">
            <h2 className="gdp-section-title">
              Video ({gallery.videos.length})
            </h2>
            <div className="gdp-videos-grid">
              {gallery.videos.map((video, index) => (
                <div key={index} className="gdp-video-item">
                  {video.title && (
                    <h3 className="gdp-video-title">{video.title}</h3>
                  )}
                  <div className="gdp-video-wrapper">
                    <iframe
                      src={getYouTubeEmbedUrl(video.url)}
                      title={video.title || `Video ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {gallery.tags && gallery.tags.length > 0 && (
          <section className="gdp-section">
            <h2 className="gdp-section-title">Tags</h2>
            <div className="gdp-tags">
              {gallery.tags.map((tag, index) => (
                <span key={index} className="gdp-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && gallery.images && (
        <div className="gdp-lightbox" onClick={closeLightbox}>
          <button className="gdp-lightbox-close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          <button
            className="gdp-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <FaChevronLeft />
          </button>

          <button
            className="gdp-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <FaChevronRight />
          </button>

          {/* Zoom Controls */}
          <div
            className="gdp-lightbox-zoom-controls"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleZoomOut} title="Zoom Out (-)">
              <FaSearchMinus />
            </button>
            <button onClick={handleResetZoom} title="Reset Zoom (0)">
              <FaExpand />
            </button>
            <button onClick={handleZoomIn} title="Zoom In (+)">
              <FaSearchPlus />
            </button>
            <span className="gdp-zoom-level">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div
            className="gdp-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gdp-lightbox-image-wrapper">
              <img
                src={gallery.images[currentImageIndex]?.url}
                alt={gallery.images[currentImageIndex]?.title || gallery.title}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.3s ease",
                  cursor: zoomLevel > 1 ? "move" : "default",
                }}
              />
            </div>
            {gallery.images[currentImageIndex]?.title && (
              <div className="gdp-lightbox-caption">
                {gallery.images[currentImageIndex].title}
              </div>
            )}
            <div className="gdp-lightbox-counter">
              {currentImageIndex + 1} / {gallery.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDetailPage;
