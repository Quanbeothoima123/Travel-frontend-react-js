import React, { useState, useEffect, useRef, useCallback } from "react";
import HLSVideoPlayer from "../../components/common/HLSVideoPlayer";
import * as FaIcons from "react-icons/fa";
import "./Shorts.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const playerRefsMap = useRef({}); // Track player components

  // Load shorts từ API
  const loadShorts = useCallback(
    async (pageNum) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/v1/shorts/getShorts?page=${pageNum}&limit=5`
        );
        const data = await response.json();

        console.log("API Response:", data);

        if (response.ok) {
          if (data.shorts.length === 0) {
            setHasMore(false);
          } else {
            setShorts((prev) => {
              const existingIds = new Set(prev.map((s) => s._id));
              const newShorts = data.shorts.filter(
                (s) => !existingIds.has(s._id)
              );
              console.log("Added new shorts:", newShorts.length);
              return [...prev, ...newShorts];
            });
            setPage(pageNum + 1);
          }
        }
      } catch (error) {
        console.error("Error loading shorts:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore]
  );

  // Load shorts ban đầu
  useEffect(() => {
    loadShorts(1);
  }, []);

  // Scroll handler với debounce tốt hơn
  const handleScroll = useCallback(
    (direction) => {
      if (isScrollingRef.current) {
        console.log("⚠️ Scroll blocked - already scrolling");
        return;
      }

      const newIndex =
        direction === "down"
          ? Math.min(currentIndex + 1, shorts.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (newIndex !== currentIndex) {
        console.log(`📱 Scrolling ${direction}: ${currentIndex} → ${newIndex}`);

        isScrollingRef.current = true;
        setCurrentIndex(newIndex);

        // Scroll to video
        const videoElement = document.getElementById(`short-${newIndex}`);
        if (videoElement) {
          videoElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Unlock scroll sau 1 giây
        setTimeout(() => {
          isScrollingRef.current = false;
          console.log("✅ Scroll unlocked");
        }, 1000);

        // Load thêm video khi gần hết
        if (newIndex >= shorts.length - 2 && hasMore && !loading) {
          console.log("📥 Loading more shorts...");
          loadShorts(page);
        }
      }
    },
    [currentIndex, shorts.length, hasMore, loading, page, loadShorts]
  );

  // Wheel event handler với throttle
  useEffect(() => {
    let wheelTimeout = null;

    const handleWheel = (e) => {
      e.preventDefault();

      // Throttle wheel events
      if (wheelTimeout) return;

      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 300);

      if (e.deltaY > 0) {
        handleScroll("down");
      } else if (e.deltaY < 0) {
        handleScroll("up");
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
        if (wheelTimeout) clearTimeout(wheelTimeout);
      };
    }
  }, [handleScroll]);

  // Touch events for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
    setTouchStartTime(Date.now());
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const diff = touchStart - touchEnd;
    const timeDiff = touchEndTime - touchStartTime;

    // Chỉ xử lý swipe nhanh (< 500ms) và đủ dài (> 50px)
    if (Math.abs(diff) > 50 && timeDiff < 500) {
      if (diff > 0) {
        handleScroll("down");
      } else {
        handleScroll("up");
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScroll("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScroll("up");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleScroll]);

  if (shorts.length === 0 && !loading) {
    return (
      <div className="shorts-container">
        <div className="shorts-empty">
          <FaIcons.FaVideo size={64} />
          <h2>Chưa có video nào</h2>
          <p>Hãy upload video đầu tiên!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="shorts-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {shorts.map((short, index) => {
        // Chỉ render video ở vị trí hiện tại và 1 video trước/sau
        const shouldRenderVideo = Math.abs(index - currentIndex) <= 1;
        const isActive = index === currentIndex;

        return (
          <div
            key={short._id}
            id={`short-${index}`}
            className={`short-item ${isActive ? "active" : ""}`}
          >
            <div className="short-video">
              {shouldRenderVideo ? (
                <HLSVideoPlayer
                  shortId={short._id}
                  autoPlay={isActive}
                  onVideoEnd={() => {
                    console.log("🏁 Video ended, scrolling to next");
                    handleScroll("down");
                  }}
                />
              ) : (
                <div className="video-placeholder">
                  <FaIcons.FaPlay size={48} />
                </div>
              )}
            </div>

            <div className="short-info-overlay">
              <div className="short-bottom-info">
                <div className="short-details">
                  <h3 className="short-title">{short.title}</h3>
                  {short.description && (
                    <p className="short-description">{short.description}</p>
                  )}

                  {short.tags && short.tags.length > 0 && (
                    <div className="short-tags">
                      {short.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {short.placeName && (
                    <div className="short-location">
                      <FaIcons.FaMapMarkerAlt />
                      <span>{short.placeName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="short-actions">
                <button className="action-btn" title="Yêu thích">
                  <FaIcons.FaHeart />
                  <span>{short.likes || 0}</span>
                </button>

                <button className="action-btn" title="Bình luận">
                  <FaIcons.FaComment />
                  <span>0</span>
                </button>

                <button className="action-btn" title="Chia sẻ">
                  <FaIcons.FaShare />
                  <span>{short.shares || 0}</span>
                </button>

                <button className="action-btn" title="Lưu">
                  <FaIcons.FaBookmark />
                </button>
              </div>
            </div>

            {isActive && (
              <div className="scroll-hints">
                {index > 0 && (
                  <div
                    className="hint hint-up"
                    onClick={() => handleScroll("up")}
                  >
                    <FaIcons.FaChevronUp />
                  </div>
                )}
                {index < shorts.length - 1 && (
                  <div
                    className="hint hint-down"
                    onClick={() => handleScroll("down")}
                  >
                    <FaIcons.FaChevronDown />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="shorts-loading">
          <FaIcons.FaSpinner className="spinner" />
          <p>Đang tải thêm video...</p>
        </div>
      )}

      <div className="video-counter">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  );
};

export default Shorts;
