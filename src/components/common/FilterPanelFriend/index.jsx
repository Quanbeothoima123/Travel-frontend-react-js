// components/FilterPanelFriend/index.jsx
import React, { useState } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import ProvinceSelect from "../../common/DropDownTreeSearch/ProvinceSelect";
import WardSelect from "../../common/DropDownTreeSearch/WardSelect";
import "./FilterPanelFriend.css";

const FilterPanelFriend = ({ filters, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  // State để lưu province và ward object đầy đủ
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setSelectedWard(null); // Reset ward khi đổi province

    // Gửi code lên parent
    onChange({
      ...filters,
      province: province?.code || "",
      ward: "", // Reset ward filter
    });
  };

  const handleWardChange = (ward) => {
    setSelectedWard(ward);

    // Gửi code lên parent
    onChange({
      ...filters,
      ward: ward?.code || "",
    });
  };

  const handleReset = () => {
    setSelectedProvince(null);
    setSelectedWard(null);
    onReset();
  };

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
          {/* Tìm theo tên */}
          <div className="friends-filter-field">
            <label className="friends-filter-label">Tên tài khoản</label>
            <input
              type="text"
              placeholder="Tìm theo tên tài khoản..."
              value={filters.userName}
              onChange={(e) =>
                onChange({ ...filters, userName: e.target.value })
              }
              className="friends-filter-input"
            />
          </div>

          {/* Province và Ward */}
          <div className="friends-filter-row">
            <div className="friends-filter-field">
              <label className="friends-filter-label">Tỉnh/Thành phố</label>
              <ProvinceSelect
                value={selectedProvince}
                onChange={handleProvinceChange}
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>

            <div className="friends-filter-field">
              <label className="friends-filter-label">Phường/Xã</label>
              <WardSelect
                provinceCode={selectedProvince?.code}
                value={selectedWard}
                onChange={handleWardChange}
                placeholder="Chọn phường/xã"
              />
            </div>
          </div>

          {/* Năm sinh và Giới tính */}
          <div className="friends-filter-row">
            <div className="friends-filter-field">
              <label className="friends-filter-label">Năm sinh</label>
              <input
                type="number"
                placeholder="VD: 1990"
                value={filters.birthYear}
                onChange={(e) =>
                  onChange({ ...filters, birthYear: e.target.value })
                }
                className="friends-filter-input"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="friends-filter-field">
              <label className="friends-filter-label">Giới tính</label>
              <select
                value={filters.sex}
                onChange={(e) => onChange({ ...filters, sex: e.target.value })}
                className="friends-filter-select"
              >
                <option value="">Tất cả</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          <button onClick={handleReset} className="friends-filter-reset">
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanelFriend;
