import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewsDetail from "../../components/common/NewsDetail";
import { useToast } from "../../contexts/ToastContext";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const NewsDetailPage = () => {
  const { newsSlug } = useParams();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [countShare, setCountShare] = useState(false);
  const { showToast } = useToast();

  // Update document head manually
  const updateDocumentHead = (data) => {
    if (!data) return;

    // Update title
    document.title = `${data.title} | Tin tức`;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content || "");
    };

    // Basic meta tags
    updateMetaTag(
      "description",
      data.metaDescription || data.excerpt || "Đọc bài viết chi tiết"
    );
    updateMetaTag(
      "keywords",
      data.metaKeywords?.join(", ") || data.tags?.join(", ") || ""
    );

    // Open Graph tags
    updateMetaTag("og:title", data.title, true);
    updateMetaTag(
      "og:description",
      data.excerpt || "Đọc bài viết chi tiết",
      true
    );
    updateMetaTag(
      "og:image",
      data.thumbnail || "/default-news-image.jpg",
      true
    );
    updateMetaTag("og:type", "article", true);
    updateMetaTag("og:url", window.location.href, true);

    if (data.publishedAt) {
      updateMetaTag("article:published_time", data.publishedAt, true);
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", data.title);
    updateMetaTag(
      "twitter:description",
      data.excerpt || "Đọc bài viết chi tiết"
    );
    updateMetaTag("twitter:image", data.thumbnail || "/default-news-image.jpg");

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);

    // JSON-LD Structured Data
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.setAttribute("type", "application/ld+json");
      document.head.appendChild(jsonLd);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title,
      description: data.excerpt,
      image: data.thumbnail,
      author: {
        "@type": "Person",
        name: data.author?.type === "admin" ? "Quản trị viên" : "Tác giả",
      },
      datePublished: data.publishedAt || data.createdAt,
      dateModified: data.updatedAt || data.createdAt,
      publisher: {
        "@type": "Organization",
        name: "Your Website Name",
        logo: {
          "@type": "ImageObject",
          url: "/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
    };

    jsonLd.textContent = JSON.stringify(structuredData);
  };

  // Update view count
  const updateViewCount = async (newsId) => {
    try {
      await fetch(`${API_BASE}/api/v1/news/update-views/${newsId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error updating view count:", err);
    }
  };

  // Load liked status
  const loadStatusLikedForUser = async (newsId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-favorite/getStatusForNews/${newsId}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setLiked(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const { favorite } = await response.json();
      setLiked(!!favorite?._id);
    } catch (error) {
      console.error("Error loading liked status:", error);
      setLiked(false);
    }
  };

  // Load saved status
  const loadStatusSavedForUser = async (newsId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-save/getStatusForNews/${newsId}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSaved(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const { favorite } = await response.json();
      setSaved(!!favorite?._id);
    } catch (error) {
      console.error("Error loading liked status:", error);
      setSaved(false);
    }
  };

  // Fetch news detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/api/v1/news/detail/${newsSlug}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không tìm thấy bài viết");
        }

        const data = await response.json();
        setNewsData(data.data);
        setCountShare(data.data.shares);

        // Update document head
        updateDocumentHead(data.data);

        // Update view count (don't wait for this)
        updateViewCount(data.data._id).catch(console.error);

        // Load liked and saved status (don't wait for these)
        loadStatusLikedForUser(data.data._id).catch(console.error);
        loadStatusSavedForUser(data.data._id).catch(console.error);
      } catch (err) {
        setError(err.message);
        document.title = "Không tìm thấy bài viết | Tin tức";
      } finally {
        setLoading(false);
      }
    };

    if (newsSlug) {
      fetchNewsDetail();
    }
  }, [newsSlug]);

  // Cleanup function to reset document title when component unmounts
  useEffect(() => {
    return () => {
      document.title = "Trang chủ";
    };
  }, []);

  // Handle like toggle
  const handleLikeToggle = async (liked) => {
    if (!newsData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-favorite/${liked ? "add" : "delete"}/${
          newsData._id
        }`,
        {
          method: liked ? "POST" : "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể cập nhật trạng thái yêu thích"
        );
      }

      setLiked(liked);
      setNewsData((prev) => ({
        ...prev,
        likes: liked
          ? (prev.likes || 0) + 1
          : Math.max((prev.likes || 0) - 1, 0),
      }));
      showToast(`Đã ${liked ? "thích" : "bỏ thích"} bài viết`, "success");
    } catch (error) {
      console.error("Error toggling like:", error);
      showToast(
        error.message || "Có lỗi khi cập nhật trạng thái yêu thích",
        "error"
      );
    }
  };

  // Handle save toggle
  const handleSaveToggle = async (saved) => {
    if (!newsData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-save/${saved ? "add" : "delete"}/${
          newsData._id
        }`,
        {
          method: saved ? "POST" : "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể cập nhật trạng thái lưu bài viết"
        );
      }

      setSaved(saved);
      setNewsData((prev) => ({
        ...prev,
        saves: saved
          ? (prev.saves || 0) + 1
          : Math.max((prev.saves || 0) - 1, 0),
      }));
      showToast(`Đã ${saved ? "lưu" : "bỏ lưu"} bài viết`, "success");
    } catch (error) {
      console.error("Error toggling save:", error);
      showToast(
        error.message || "Có lỗi khi cập nhật trạng thái lưu bài viết",
        "error"
      );
    }
  };

  // Handle save toggle
  const handleShare = async () => {
    if (!newsData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-share/add/${newsData._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể chia sẻ bài viết");
      }
      setNewsData((prev) => ({
        ...prev,
        shares: (prev.shares || 0) + 1,
      }));
      showToast(`Đã chia sẻ bài viết`, "success");
    } catch (error) {
      console.error("Lỗi share bài viết:", error);
      showToast(error.message || "Không thể chia sẻ bài viết", "error");
    }
  };

  return (
    <div className="news-detail-page">
      <NewsDetail
        countShare={countShare}
        likedStatus={liked}
        savedStatus={saved}
        newsData={newsData}
        loading={loading}
        error={error}
        relatedTours={newsData?.relatedTourIds || []}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
        onShare={handleShare}
      />
    </div>
  );
};

export default NewsDetailPage;
