// src/pages/news/NewsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SearchBox from "../../components/common/SearchBox";
import NewsCategoryTreeSelect from "../../components/common/DropDownTreeSearch/NewsCategoryTreeSelect";
import NewsCard from "../../components/common/NewsCard";
import Pagination from "../../components/common/Pagination";
import "./NewsPage.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

export default function NewsPage() {
  const { newsCategorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState("");
  const [selectedNewsCategory, setSelectedNewsCategory] = useState(null);
  const [selectedTourCategory, setSelectedTourCategory] = useState(null);
  const [selectedRelatedTour, setSelectedRelatedTour] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [eventDateFrom, setEventDateFrom] = useState("");
  const [eventDateTo, setEventDateTo] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [allRelatedTours, setAllRelatedTours] = useState([]);

  // News types từ schema
  const newsTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "news", label: "Tin tức" },
    { value: "guide", label: "Cẩm nang" },
    { value: "review", label: "Đánh giá" },
    { value: "event", label: "Sự kiện" },
    { value: "promotion", label: "Khuyến mãi" },
  ];

  // Language options
  const languageOptions = [
    { value: "", label: "Tất cả ngôn ngữ" },
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "Tiếng Anh" },
  ];

  // Sort options
  const sortOptions = [
    { value: "", label: "Mặc định" },
    { value: "publishedAt-desc", label: "Mới nhất" },
    { value: "publishedAt-asc", label: "Cũ nhất" },
    { value: "title-asc", label: "Tiêu đề A-Z" },
    { value: "title-desc", label: "Tiêu đề Z-A" },
    { value: "views-desc", label: "Xem nhiều nhất" },
    { value: "likes-desc", label: "Yêu thích nhất" },
    { value: "eventDate-desc", label: "Sự kiện gần nhất" },
  ];

  // Sắp xếp news
  const sortNews = (news, sortBy) => {
    if (!sortBy) return news;

    const sorted = [...news];
    switch (sortBy) {
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "publishedAt-desc":
        return sorted.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
      case "publishedAt-asc":
        return sorted.sort(
          (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
        );
      case "views-desc":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "likes-desc":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "eventDate-desc":
        return sorted.sort((a, b) => {
          if (!a.eventDate && !b.eventDate) return 0;
          if (!a.eventDate) return 1;
          if (!b.eventDate) return -1;
          return new Date(b.eventDate) - new Date(a.eventDate);
        });
      default:
        return sorted;
    }
  };

  // Tải dữ liệu cho bộ lọc các tour liên quan
  useEffect(() => {
    const fetchRelatedTours = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/tours/get-id-title?limit=100`,
        );
        const data = await res.json();
        setAllRelatedTours(data.tours || []);
      } catch (err) {
        console.error("Lỗi fetch related tours:", err);
      }
    };
    fetchRelatedTours();
  }, []);

  // Fetch selectedNewsCategory theo slug ban đầu
  useEffect(() => {
    const fetchNewsCategory = async () => {
      if (!newsCategorySlug || newsCategorySlug === "all") return;
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/news-category/get-news-category-by-slug/${newsCategorySlug}`
        );
        const data = await res.json();
        setSelectedNewsCategory(data.data);
      } catch (err) {
        console.error("Lỗi fetch news category:", err);
      }
    };
    fetchNewsCategory();
  }, [newsCategorySlug]);

  // Fetch news mỗi khi thay đổi params
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const q = params.get("q") || "";
        const type = params.get("type") || "";
        const language = params.get("language") || "";
        const eventFrom = params.get("eventDateFrom") || "";
        const eventTo = params.get("eventDateTo") || "";
        const relatedTour = params.get("relatedTour") || "";
        const tourCategory = params.get("tourCategory") || "";
        const sort = params.get("sort") || "";

        setQuery(q);
        setSelectedType(type);
        setSelectedLanguage(language);
        setEventDateFrom(eventFrom);
        setEventDateTo(eventTo);
        setSelectedRelatedTour(relatedTour);

        // Set tour category từ relatedTour nếu có
        if (relatedTour && !selectedTourCategory) {
          const tour = allRelatedTours.find((t) => t._id === relatedTour);
          if (tour) {
            setSelectedTourCategory(tour.categoryId);
          }
        }

        setSortBy(sort);

        // Tạo URL cho API advanced search
        const searchParams = new URLSearchParams();
        if (q) searchParams.set("q", q);
        if (type) searchParams.set("type", type);
        if (language) searchParams.set("language", language);
        if (eventFrom) searchParams.set("eventDateFrom", eventFrom);
        if (eventTo) searchParams.set("eventDateTo", eventTo);
        if (relatedTour) searchParams.set("relatedTour", relatedTour);
        if (sort) searchParams.set("sort", sort);
        searchParams.set("page", page);

        const categorySlug = newsCategorySlug || "all";
        const url = `${API_BASE}/api/v1/news/advanced-search/${categorySlug}?${searchParams.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi fetch news:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsCategorySlug, page, location.search]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedType) params.set("type", selectedType);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (eventDateFrom) params.set("eventDateFrom", eventDateFrom);
    if (eventDateTo) params.set("eventDateTo", eventDateTo);
    if (selectedTourCategory?.slug)
      params.set("tourCategory", selectedTourCategory.slug);
    if (sortBy) params.set("sort", sortBy);

    const targetCategorySlug =
      selectedNewsCategory?.slug || newsCategorySlug || "all";

    navigate(`/news/${targetCategorySlug}?${params.toString()}`);
  };

  // Clear filters
  const clearFilters = () => {
    setQuery("");
    setSelectedNewsCategory(null);
    setSelectedTourCategory(null);
    setSelectedType("");
    setSelectedLanguage("");
    setEventDateFrom("");
    setEventDateTo("");
    setSortBy("");
    setPage(1);
    navigate(`/news/tin-tuc`);
  };

  return (
    <div className="np-news-page">
      <div className="np-page-header">
        <h1>Tin tức & Bài viết</h1>
        <p>Cập nhật những thông tin, cẩm nang và bài viết mới nhất</p>
      </div>

      {/* Search & Filter Section */}
      <div className="np-search-filter-section">
        <div className="np-search-container">
          {/* Main Search */}
          <div className="np-main-search">
            <SearchBox
              setQuery={setQuery}
              initialValue={query}
              placeholder="Tìm kiếm tin tức, bài viết..."
            />
          </div>

          {/* Filter Row 1 */}
          <div className="np-filters-row">
            {/* News Category */}
            <div className="np-filter-item">
              <label className="np-filter-label">Danh mục tin tức</label>
              <NewsCategoryTreeSelect
                value={selectedNewsCategory}
                onChange={(node) => setSelectedNewsCategory(node)}
                fetchUrl={`${API_BASE}/api/v1/admin/news-category/getAll?tree=true`}
                placeholder="Chọn danh mục tin tức..."
                noDataText="Không có danh mục"
              />
            </div>

            {/* Tour liên quan */}
            <div className="np-filter-item">
              <label className="np-filter-label">Tour liên quan</label>
              <select
                className="np-select"
                value={selectedRelatedTour}
                onChange={(e) => setSelectedRelatedTour(e.target.value)}
              >
                <option value="">Tất cả tour</option>
                {allRelatedTours.map((tour) => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title}
                  </option>
                ))}
              </select>
            </div>

            {/* News Type */}
            <div className="np-filter-item">
              <label className="np-filter-label">Loại bài viết</label>
              <select
                className="np-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {newsTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="np-filter-item">
              <label className="np-filter-label">Ngôn ngữ</label>
              <select
                className="np-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Row 2 */}
          <div className="np-filters-row">
            {/* Event Date From */}
            <div className="np-filter-item">
              <label className="np-filter-label">Sự kiện từ ngày</label>
              <input
                type="date"
                className="np-select"
                value={eventDateFrom}
                onChange={(e) => setEventDateFrom(e.target.value)}
              />
            </div>

            {/* Event Date To */}
            <div className="np-filter-item">
              <label className="np-filter-label">Đến ngày</label>
              <input
                type="date"
                className="np-select"
                value={eventDateTo}
                onChange={(e) => setEventDateTo(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="np-filter-item">
              <label className="np-filter-label">Sắp xếp</label>
              <select
                className="np-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="np-filter-actions">
              <button className="np-search-btn" onClick={handleSearch}>
                Tìm kiếm
              </button>
              <button className="np-clear-btn" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News List Section */}
      <div className="np-news-list-section">
        <div className="np-results-info">
          <span className="np-results-count">
            {loading ? "Đang tải..." : `${news.length} kết quả`}
          </span>
        </div>

        <div className="np-news-list">
          {loading ? (
            <p className="np-loading">Đang tải tin tức...</p>
          ) : news.length > 0 ? (
            sortNews(news, sortBy).map((newsItem, index) => (
              <NewsCard
                key={newsItem._id}
                data={newsItem}
                thumbnailPosition={index % 2 === 0 ? "top" : "bottom"}
              />
            ))
          ) : (
            <div className="np-no-news">
              <h3>Không tìm thấy tin tức nào</h3>
              <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
