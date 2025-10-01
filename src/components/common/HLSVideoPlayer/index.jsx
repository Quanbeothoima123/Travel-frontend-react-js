import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import * as FaIcons from "react-icons/fa";
import "./HLSVideoPlayer.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const HLSVideoPlayer = ({ shortId, autoPlay = true, onVideoEnd }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Fetch video URL
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📡 Fetching video URL for shortId: ${shortId}`);
        const response = await fetch(
          `${API_BASE}/api/v1/shorts/video/${shortId}`
        );
        const data = await response.json();

        if (response.ok) {
          console.log(`✅ Video URL received:`, data.playlistUrl);
          setVideoUrl(data.playlistUrl);
        } else {
          console.error(`❌ Failed to fetch video URL:`, data.message);
          setError(data.message || "Không thể tải video");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Lỗi khi tải video");
      } finally {
        setLoading(false);
      }
    };

    if (shortId) {
      fetchVideoUrl();
    }

    return () => {
      if (hlsRef.current) {
        console.log("🧹 Destroying HLS instance on unmount");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [shortId]);

  // Initialize HLS
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const video = videoRef.current;

    console.log(`\n🎬 === INITIALIZING HLS FOR ${shortId} ===`);

    // Cleanup HLS cũ
    if (hlsRef.current) {
      console.log("🧹 Destroying old HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset video state
    video.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);

    if (Hls.isSupported()) {
      console.log("✅ HLS.js is supported");

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        startPosition: 0,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        debug: false,
      });

      hlsRef.current = hls;

      console.log(`📥 Loading source: ${videoUrl}`);
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      // DEBUG: Fragment loading events
      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        console.log(`📦 Loading fragment #${data.frag.sn}: ${data.frag.url}`);
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        console.log(
          `✅ Fragment #${
            data.frag.sn
          } loaded - duration: ${data.frag.duration.toFixed(2)}s`
        );
      });

      hls.on(Hls.Events.FRAG_PARSING_DATA, (event, data) => {
        console.log(
          `🔧 Parsing fragment: PTS ${data.startPTS.toFixed(
            2
          )} - ${data.endPTS.toFixed(2)}`
        );
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ Manifest parsed successfully");
        console.log(`   Levels: ${data.levels.length}`);
        console.log(
          `   First level: ${data.levels[0].width}x${data.levels[0].height}`
        );

        setLoading(false);

        // Đợi loadedmetadata để có duration
        const handleMetadata = () => {
          console.log(`📊 Metadata loaded - Duration: ${video.duration}s`);
          if (video.duration && isFinite(video.duration)) {
            setDuration(video.duration);
          }

          if (autoPlay) {
            video.muted = false;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("✅ Autoplay started with sound");
                  setIsPlaying(true);
                  resetControlsTimeout();
                })
                .catch((err) => {
                  console.warn("⚠️ Autoplay blocked:", err.message);
                  setIsPlaying(false);
                });
            }
          }
        };

        if (video.readyState >= 1) {
          handleMetadata();
        } else {
          video.addEventListener("loadedmetadata", handleMetadata, {
            once: true,
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`❌ HLS Error:`, {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
        });

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("🔄 Network error, retrying...");
              setTimeout(() => {
                hls.startLoad();
              }, 1000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("🔄 Media error, recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.error("💀 Fatal error, destroying HLS");
              setError("Không thể phát video");
              hls.destroy();
              break;
          }
        } else if (data.details === "bufferStalledError") {
          console.warn("⚠️ Buffer stalled, forcing load");
          hls.startLoad();
        } else if (data.details === "bufferSeekOverHole") {
          console.warn("⚠️ Buffer seek over hole, attempting recovery");
          const targetTime = video.currentTime + 0.1;
          if (targetTime < video.duration) {
            video.currentTime = targetTime;
          }
        }
      });

      return () => {
        console.log("🧹 Cleanup HLS on effect cleanup");
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Native HLS support (Safari)");
      video.src = videoUrl;
      video.muted = false;

      const handleCanPlay = () => {
        setLoading(false);
        if (autoPlay) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              resetControlsTimeout();
            })
            .catch((err) => {
              console.warn("Autoplay blocked:", err);
              setIsPlaying(false);
            });
        }
      };

      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    } else {
      console.error("❌ HLS not supported in this browser");
      setError("Trình duyệt không hỗ trợ HLS");
    }
  }, [videoUrl, autoPlay, shortId]);

  // Video event listeners với DEBUG
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        console.log("⏱️ Duration changed:", video.duration);
        setDuration(video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      console.log("📊 Metadata loaded event");
      if (video.duration && isFinite(video.duration)) {
        console.log("   Duration:", video.duration);
        setDuration(video.duration);
      }
    };

    const handleCanPlay = () => {
      console.log("✅ Can play event - readyState:", video.readyState);
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => {
      console.log("▶️ Play event");
      setIsPlaying(true);
      resetControlsTimeout();
    };

    const handlePause = () => {
      console.log("⏸️ Pause event");
      setIsPlaying(false);
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };

    const handleEnded = () => {
      console.log("🏁 Video ended");
      setIsPlaying(false);
      setShowControls(true);

      if (onVideoEnd) {
        onVideoEnd();
      } else {
        setTimeout(() => {
          video.currentTime = 0;
          setCurrentTime(0);
          video.play().catch((err) => {
            console.log("Cannot autoplay on ended:", err);
          });
        }, 1000);
      }
    };

    const handleWaiting = () => {
      console.log("⏳ Video buffering...");
    };

    const handleStalled = () => {
      console.warn("⚠️ Video stalled");
      setTimeout(() => {
        if (video.paused && isPlaying) {
          console.log("🔄 Force reloading after stall");
          if (hlsRef.current) {
            hlsRef.current.startLoad();
          }
        }
      }, 2000);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        console.log(
          `📊 Buffered: ${bufferedEnd.toFixed(1)}s / ${video.duration?.toFixed(
            1
          )}s`
        );
      }
    };

    // DEBUG: Seeking events
    const handleSeeking = () => {
      console.log("🔍 SEEKING START", {
        from: video.currentTime.toFixed(2),
        readyState: video.readyState,
        networkState: video.networkState,
      });
    };

    const handleSeeked = () => {
      console.log("✅ SEEKED SUCCESS", {
        to: video.currentTime.toFixed(2),
        readyState: video.readyState,
      });
    };

    const handleError = (e) => {
      console.error("❌ VIDEO ERROR", {
        error: video.error,
        code: video.error?.code,
        message: video.error?.message,
      });
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };
  }, [onVideoEnd, isPlaying]);

  // Control functions
  const togglePlay = (e) => {
    if (e) e.stopPropagation();

    const video = videoRef.current;
    if (!video) {
      console.error("❌ Video ref not available");
      return;
    }

    console.log("🎮 Toggle play - current paused:", video.paused);

    try {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Play successful");
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("❌ Play failed:", err.message);
              setIsPlaying(false);
            });
        }
      } else {
        video.pause();
        console.log("⏸️ Paused");
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("❌ Toggle play error:", err);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const video = videoRef.current;

    if (!video) return;

    if (video.readyState < 2) {
      console.warn(
        "⚠️ Video not ready for seeking (readyState:",
        video.readyState,
        ")"
      );
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const videoDuration = video.duration;

    if (!videoDuration || isNaN(videoDuration) || !isFinite(videoDuration)) {
      console.warn("⚠️ Invalid duration, cannot seek");
      return;
    }

    const newTime = pos * videoDuration;
    console.log(
      `⏩ Seeking from ${video.currentTime.toFixed(2)}s to ${newTime.toFixed(
        2
      )}s (duration: ${videoDuration.toFixed(2)}s)`
    );

    try {
      video.currentTime = newTime;

      if (hlsRef.current && video.paused) {
        setTimeout(() => {
          if (video.readyState < 3) {
            console.log("🔄 Forcing buffer reload after seek");
            hlsRef.current.startLoad();
          }
        }, 500);
      }
    } catch (err) {
      console.error("❌ Seek error:", err);
    }
  };

  const handleVideoClick = (e) => {
    togglePlay(e);
    resetControlsTimeout();
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="hls-player-container">
        <div className="hls-loading">
          <FaIcons.FaSpinner className="spinner-icon" />
          <p>Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hls-player-container">
        <div className="hls-error">
          <FaIcons.FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hls-player-container" onMouseMove={handleMouseMove}>
      <div className="hls-video-wrapper">
        <video
          ref={videoRef}
          className="hls-video"
          playsInline
          onClick={handleVideoClick}
        />

        {!isPlaying && !loading && (
          <div className="play-overlay" onClick={togglePlay}>
            <FaIcons.FaPlay className="play-icon" />
          </div>
        )}

        <div
          className={`hls-controls ${
            showControls || !isPlaying ? "visible" : ""
          }`}
        >
          {duration > 0 && isFinite(duration) ? (
            <div className="progress-bar" onClick={handleSeek}>
              <div
                className="progress-filled"
                style={{
                  width: `${(currentTime / duration) * 100}%`,
                }}
              />
            </div>
          ) : (
            <div className="progress-bar-placeholder">
              <div className="progress-indeterminate" />
            </div>
          )}

          <div className="controls-bottom">
            <button
              className="control-btn"
              onClick={togglePlay}
              disabled={loading}
            >
              {isPlaying ? <FaIcons.FaPause /> : <FaIcons.FaPlay />}
            </button>

            <span className="time-display">
              {duration > 0 && isFinite(duration)
                ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                : "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HLSVideoPlayer;
