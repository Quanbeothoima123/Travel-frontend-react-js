import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewsDetail from "../../components/common/NewsDetail";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const NewsDetailPage = () => {
  const { newsSlug } = useParams();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch news detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/api/v1/news/detail/${newsSlug}`
        );

        if (!response.ok) {
          throw new Error("Không tìm thấy bài viết");
        }

        const data = await response.json();
        console.log("data" + data);
        setNewsData(data.data);
        console.log(newsData);
        // Update document head
        updateDocumentHead(data.data);

        // Update view count
        await updateViewCount(data.data._id);
      } catch (err) {
        setError(err.message);
        // Set default title on error
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
      document.title = "Trang chủ"; // Or your default title
    };
  }, []);

  // Update view count
  const updateViewCount = async (newsId) => {
    try {
      await fetch(`${API_BASE}/api/v1/news/update-views/${newsId}`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Error updating view count:", err);
    }
  };

  return (
    <div className="news-detail-page">
      <NewsDetail
        newsData={newsData}
        loading={loading}
        error={error}
        relatedTours={newsData?.relatedTourIds || []}
      />
    </div>
  );
};

export default NewsDetailPage;
