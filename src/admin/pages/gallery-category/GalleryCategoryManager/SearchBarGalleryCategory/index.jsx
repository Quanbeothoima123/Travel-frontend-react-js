// SearchBar.jsx
import React from "react";
import "./SearchBarGalleryCategory.css";
import { Link } from "react-router-dom";
const SearchBarGalleryCategory = ({
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
    <div className="sbgc-container">
      {/* Thanh tìm kiếm */}
      <div className="sbgc-search">
        <span className="sbgc-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sbgc-input"
        />
      </div>

      {/* Bộ lọc trạng thái */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="sbgc-select"
      >
        <option value="all">Tất cả</option>
        <option value="active">Đang hoạt động</option>
        <option value="inactive">Ngừng hoạt động</option>
      </select>

      {/* Các nút chức năng */}
      <div className="sbgc-actions">
        <button onClick={onFindLatestUpdated} className="sbgc-btn">
          ⟳ Cập nhật mới nhất
        </button>
        <button onClick={onFindLatestCreated} className="sbgc-btn">
          ⟳ Thêm mới nhất
        </button>
        <Link
          to={`/admin/gallery-category/create`}
          className="sbgc-btn sbgc-btn-add"
        >
          ➕ Thêm danh mục
        </Link>
      </div>
    </div>
  );
};

export default SearchBarGalleryCategory;
