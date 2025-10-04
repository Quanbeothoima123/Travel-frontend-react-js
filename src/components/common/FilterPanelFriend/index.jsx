// components/FilterPanelFriend/index.jsx
import React, { useState } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import "./FilterPanelFriend.css";

const FilterPanelFriend = ({ filters, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="friends-filter-panel">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="friends-filter-toggle"
      >
        <FaSearch />
        <span className="friends-filter-toggle-text">Bộ lọc</span>
        <FaChevronDown
          className={`friends-filter-chevron ${
            isOpen ? "friends-filter-chevron-open" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="friends-filter-content">
          <input
            type="text"
            placeholder="Tìm theo tên tài khoản..."
            value={filters.userName}
            onChange={(e) => onChange({ ...filters, userName: e.target.value })}
            className="friends-filter-input"
          />

          <div className="friends-filter-row">
            <input
              type="text"
              placeholder="Tỉnh/Thành"
              value={filters.province}
              onChange={(e) =>
                onChange({ ...filters, province: e.target.value })
              }
              className="friends-filter-input"
            />
            <input
              type="text"
              placeholder="Quận/Huyện"
              value={filters.ward}
              onChange={(e) => onChange({ ...filters, ward: e.target.value })}
              className="friends-filter-input"
            />
          </div>

          <div className="friends-filter-row">
            <input
              type="number"
              placeholder="Năm sinh"
              value={filters.birthYear}
              onChange={(e) =>
                onChange({ ...filters, birthYear: e.target.value })
              }
              className="friends-filter-input"
            />
            <select
              value={filters.sex}
              onChange={(e) => onChange({ ...filters, sex: e.target.value })}
              className="friends-filter-select"
            >
              <option value="">Giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <button onClick={onReset} className="friends-filter-reset">
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanelFriend;
