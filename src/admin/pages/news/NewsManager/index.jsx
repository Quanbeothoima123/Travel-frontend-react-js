import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PaginationV2 from "../../../../components/common/Pagination_V2";
import NewsCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/NewsCategoryTreeSelect";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import "./NewsManager.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const NewsManager = () => {
  const [newsData, setNewsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    newsId: null,
    title: "",
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    authorType: "",
    authorId: "",
    type: "",
    language: "",
    newsCategoryId: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Data for dropdowns
  const [authors, setAuthors] = useState({
    admin: [],
    user: [],
  });

  // Selected category for tree select
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load data functions
  const loadNewsData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await fetch(
        `${API_BASE}/api/v1/admin/news/manager?` + new URLSearchParams(params),
        {
          credentials: "include",
        }
      );
      const result = await response.json();

      if (result.success) {
        setNewsData(result.data);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      console.error("Error loading news:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  const loadAuthors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/news/authors`);
      const result = await response.json();
      if (result.success) {
        setAuthors(result.data);
      }
    } catch (error) {
      console.error("Error loading authors:", error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  // Load data when filters or pagination change
  useEffect(() => {
    loadNewsData();
  }, [loadNewsData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleFilterChange("newsCategoryId", category ? category._id : "");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      handleFilterChange("search", e.target.value || filters.search);
    } else {
      setFilters((prev) => ({ ...prev, search: e.target.value }));
    }
  };

  const handleSort = (sortBy) => {
    const newOrder =
      filters.sortBy === sortBy && filters.sortOrder === "desc"
        ? "asc"
        : "desc";
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: newOrder,
    }));
  };

  const handleDateRangeReset = () => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: "",
      dateTo: "",
    }));
  };

  const handleDelete = async (id) => {
    const newsItem = newsData.find((news) => news._id === id);
    setConfirmModal({
      isOpen: true,
      newsId: id,
      title: newsItem ? newsItem.title : "tin tức này",
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/news/delete/${confirmModal.newsId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await response.json();

      if (result.success) {
        alert("Xóa tin tức thành công");
        loadNewsData();
      } else {
        alert(result.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Có lỗi xảy ra khi xóa tin tức");
    } finally {
      setConfirmModal({
        isOpen: false,
        newsId: null,
        title: "",
      });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({
      isOpen: false,
      newsId: null,
      title: "",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      published: {
        text: "Đã xuất bản",
        class: "new-manager__badge--published",
      },
      draft: { text: "Bản nháp", class: "new-manager__badge--draft" },
      archived: { text: "Lưu trữ", class: "new-manager__badge--archived" },
    };
    return (
      statusMap[status] || {
        text: status,
        class: "new-manager__badge--default",
      }
    );
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      news: "Tin tức",
      guide: "Hướng dẫn",
      review: "Đánh giá",
      event: "Sự kiện",
      promotion: "Khuyến mãi",
    };
    return typeMap[type] || type;
  };

  const getSortIcon = (field) => {
    if (filters.sortBy === field) {
      return filters.sortOrder === "desc" ? " ↓" : " ↑";
    }
    return "";
  };

  // Get today for quick filters
  const today = new Date().toISOString().split("T")[0];

  const handleQuickDateFilter = (days) => {
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setFilters((prev) => ({
      ...prev,
      dateFrom: fromDate,
      dateTo: today,
    }));
  };

  return (
    <div className="new-manager">
      <div className="new-manager__header">
        <h1 className="new-manager__title">Quản lý tin tức</h1>
        <Link to="/admin/news/create" className="new-manager__create-btn">
          <i className="fas fa-plus"></i>
          Tạo tin tức mới
        </Link>
      </div>

      {/* Filters Section */}
      <div className="new-manager__filters">
        <div className="new-manager__filters-row">
          {/* Search */}
          <div className="new-manager__filter-group">
            <label>Tìm kiếm:</label>
            <div className="new-manager__search">
              <input
                type="text"
                placeholder="Tìm theo tên bài viết hoặc tác giả..."
                value={filters.search}
                onChange={handleSearch}
                onKeyPress={handleSearch}
                className="new-manager__search-input"
              />
              <button
                onClick={handleSearch}
                className="new-manager__search-btn"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="new-manager__filter-group">
            <label>Trạng thái:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="new-manager__select"
            >
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          {/* News Category Tree Select */}
          <div className="new-manager__filter-group">
            <label>Danh mục tin tức:</label>
            <NewsCategoryTreeSelect
              value={selectedCategory}
              onChange={handleCategorySelect}
              fetchUrl={`${API_BASE}/api/v1/admin/news-category/getAll?tree=true`}
              placeholder="Chọn danh mục tin tức"
              noDataText="Không có danh mục tin tức"
            />
          </div>

          {/* Type Filter */}
          <div className="new-manager__filter-group">
            <label>Loại:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="new-manager__select"
            >
              <option value="">Tất cả</option>
              <option value="news">Tin tức</option>
              <option value="guide">Hướng dẫn</option>
              <option value="review">Đánh giá</option>
              <option value="event">Sự kiện</option>
              <option value="promotion">Khuyến mãi</option>
            </select>
          </div>
        </div>

        <div className="new-manager__filters-row">
          {/* Date Range Filter */}
          <div className="new-manager__filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="new-manager__select"
            />
          </div>

          <div className="new-manager__filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="new-manager__select"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="new-manager__filter-group">
            <label>Lọc nhanh:</label>
            <div className="new-manager__quick-filters">
              <button
                type="button"
                onClick={() => handleQuickDateFilter(7)}
                className="new-manager__quick-filter-btn"
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => handleQuickDateFilter(30)}
                className="new-manager__quick-filter-btn"
              >
                30 ngày
              </button>
              <button
                type="button"
                onClick={handleDateRangeReset}
                className="new-manager__quick-filter-btn new-manager__quick-filter-btn--reset"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Language Filter */}
          <div className="new-manager__filter-group">
            <label>Ngôn ngữ:</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange("language", e.target.value)}
              className="new-manager__select"
            >
              <option value="">Tất cả</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="new-manager__filters-row">
          {/* Author Type Filter */}
          <div className="new-manager__filter-group">
            <label>Loại tác giả:</label>
            <select
              value={filters.authorType}
              onChange={(e) => {
                handleFilterChange("authorType", e.target.value);
                handleFilterChange("authorId", "");
              }}
              className="new-manager__select"
            >
              <option value="">Tất cả</option>
              <option value="admin">Quản trị viên</option>
              <option value="user">Người dùng</option>
            </select>
          </div>

          {/* Specific Author Filter */}
          {filters.authorType && (
            <div className="new-manager__filter-group">
              <label>Tác giả:</label>
              <select
                value={filters.authorId}
                onChange={(e) => handleFilterChange("authorId", e.target.value)}
                className="new-manager__select"
              >
                <option value="">
                  Tất cả{" "}
                  {filters.authorType === "admin"
                    ? "quản trị viên"
                    : "người dùng"}
                </option>
                {authors[filters.authorType]?.map((author) => (
                  <option key={author._id} value={author._id}>
                    {author.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort */}
          <div className="new-manager__filter-group">
            <label>Sắp xếp theo:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="new-manager__select"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="views">Lượt xem</option>
              <option value="likes">Lượt thích</option>
              <option value="shares">Lượt chia sẻ</option>
              <option value="commentCount">Số bình luận</option>
            </select>
          </div>

          <div className="new-manager__filter-group">
            <label>Thứ tự:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="new-manager__select"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="new-manager__info">
        <span>
          Hiển thị {newsData.length} / {totalCount} tin tức
          {(filters.dateFrom || filters.dateTo) && (
            <span className="new-manager__date-filter-info">
              {filters.dateFrom &&
                ` (từ ${new Date(filters.dateFrom).toLocaleDateString(
                  "vi-VN"
                )})`}
              {filters.dateTo &&
                ` (đến ${new Date(filters.dateTo).toLocaleDateString(
                  "vi-VN"
                )})`}
            </span>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="new-manager__table-container">
        {loading ? (
          <div className="new-manager__loading">Đang tải...</div>
        ) : (
          <table className="new-manager__table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Bài viết & Tác giả</th>
                <th>Trạng thái</th>
                <th
                  className="new-manager__sortable"
                  onClick={() => handleSort("views")}
                >
                  Lượt xem{getSortIcon("views")}
                </th>
                <th
                  className="new-manager__sortable"
                  onClick={() => handleSort("commentCount")}
                >
                  Bình luận{getSortIcon("commentCount")}
                </th>
                <th
                  className="new-manager__sortable"
                  onClick={() => handleSort("createdAt")}
                >
                  Ngày tạo{getSortIcon("createdAt")}
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {newsData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="new-manager__empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                newsData.map((news, index) => (
                  <tr key={news._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="new-manager__post-info">
                        <Link
                          to={`/admin/news/${news._id}`}
                          className="new-manager__post-link"
                        >
                          <img
                            src={
                              news.thumbnail ||
                              "https://via.placeholder.com/80x60/ccc/666?text=No+Image"
                            }
                            alt={news.title}
                            className="new-manager__thumbnail"
                          />
                          <div className="new-manager__post-details">
                            <h4 className="new-manager__post-title">
                              {news.title}
                            </h4>
                            <div className="new-manager__author">
                              <img
                                src={
                                  news.authorInfo?.avatar ||
                                  "https://via.placeholder.com/24x24/ccc/666?text=A"
                                }
                                alt={news.authorInfo?.fullName}
                                className="new-manager__author-avatar"
                              />
                              <span>{news.authorInfo?.fullName}</span>
                              <span className="new-manager__author-type">
                                (
                                {news.author?.type === "admin"
                                  ? "Admin"
                                  : "User"}
                                )
                              </span>
                            </div>
                            <div className="new-manager__post-meta">
                              <span className="new-manager__type-badge">
                                {getTypeBadge(news.type)}
                              </span>
                              <span className="new-manager__language">
                                {news.language === "vi" ? "VI" : "EN"}
                              </span>
                              {news.categoryInfo && (
                                <span className="new-manager__category">
                                  {news.categoryInfo.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`new-manager__badge ${
                          getStatusBadge(news.status).class
                        }`}
                      >
                        {getStatusBadge(news.status).text}
                      </span>
                    </td>
                    <td>
                      <div className="new-manager__stats">
                        <div>{news.views || 0}</div>
                        <small>
                          {news.likes || 0} likes | {news.shares || 0} shares
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="new-manager__stats">
                        <div className="new-manager__comment-count">
                          {news.commentCount || 0}
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(news.createdAt)}</td>
                    <td>
                      <div className="new-manager__actions">
                        <Link
                          to={`/admin/news/detail/${news._id}`}
                          className="new-manager__action-btn new-manager__action-btn--view"
                          title="Chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <Link
                          to={`/admin/news/edit/${news._id}`}
                          className="new-manager__action-btn new-manager__action-btn--edit"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(news._id)}
                          className="new-manager__action-btn new-manager__action-btn--delete"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="new-manager__pagination">
          <PaginationV2
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Xác nhận xóa tin tức"
        message={`Bạn có chắc chắn muốn xóa tin tức "${confirmModal.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default NewsManager;
