// SearchBar.jsx
import React from "react";
import "./SearchBarNewsCategory.css";
import { Link } from "react-router-dom";
const SearchBarNewsCategory = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onFindLatestUpdated,
  onFindLatestCreated,
  onToggleCollapse,
  onAddCategory,
}) => {
  return (
    <div className="sbnc-container">
      {/* Thanh tìm kiếm */}
      <div className="sbnc-search">
        <span className="sbnc-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sbnc-input"
        />
      </div>

      {/* Bộ lọc trạng thái */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="sbnc-select"
      >
        <option value="all">Tất cả</option>
        <option value="active">Đang hoạt động</option>
        <option value="inactive">Ngừng hoạt động</option>
      </select>

      {/* Các nút chức năng */}
      <div className="sbnc-actions">
        <button onClick={onFindLatestUpdated} className="sbnc-btn">
          ⟳ Cập nhật mới nhất
        </button>
        <button onClick={onFindLatestCreated} className="sbnc-btn">
          ⟳ Thêm mới nhất
        </button>
        <Link
          to={`/admin/news-category/create`}
          className="sbnc-btn sbnc-btn-add"
        >
          ➕ Thêm danh mục
        </Link>
      </div>
    </div>
  );
};

export default SearchBarNewsCategory;
