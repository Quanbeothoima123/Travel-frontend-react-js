// SearchBar.jsx
import React from "react";
import "./SearchBarTourCategory.css";
import { Link } from "react-router-dom";

const SearchBarTourCategory = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onFindLatestUpdated,
  onFindLatestCreated,
  onToggleCollapse,
}) => {
  return (
    <div className="sbtc-container">
      {/* Thanh tìm kiếm */}
      <div className="sbtc-search">
        <span className="sbtc-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sbtc-input"
        />
      </div>

      {/* Bộ lọc trạng thái */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="sbtc-select"
      >
        <option value="all">Tất cả</option>
        <option value="active">Đang hoạt động</option>
        <option value="inactive">Ngừng hoạt động</option>
      </select>

      {/* Các nút chức năng */}
      <div className="sbtc-actions">
        <button onClick={onFindLatestUpdated} className="sbtc-btn">
          ⟳ Cập nhật mới nhất
        </button>
        <button onClick={onFindLatestCreated} className="sbtc-btn">
          ⟳ Thêm mới nhất
        </button>
        <button onClick={onToggleCollapse} className="sbtc-btn">
          ⬆ Thu gọn cây
        </button>
        <Link
          to={`/admin/tour-categories/create`}
          className="sbtc-btn sbtc-btn-add"
        >
          ➕ Thêm danh mục
        </Link>
      </div>
    </div>
  );
};

export default SearchBarTourCategory;
