import React from "react";
import CategoryTreeSelect from "../DropDownTreeSearch/CategoryTreeSelect";
import DepartPlaceDropDownSearch from "../DepartPlaceDropDownSearch";
import "./InvoiceSearchFilterUser.css";

// Tour type options
const tourTypeOptions = [
  { value: "", label: "Tất cả loại tour (không lọc)" },
  { value: "aboard", label: "Nước ngoài" },
  { value: "domestic", label: "Trong nước" },
];

// Payment type options
const paymentTypeOptions = [
  { value: "", label: "Tất cả phương thức (không lọc)" },
  { value: "cash", label: "Tiền mặt" },
  { value: "momo", label: "MoMo" },
  { value: "bank_transfer", label: "Chuyển khoản" },
];

// Status options
const statusOptions = [
  { value: "", label: "Tất cả trạng thái (không lọc)" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "canceled", label: "Đã hủy" },
];

const InvoiceSearchFilterUser = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
}) => {
  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleDateChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handlePriceChange = (field, value) => {
    const numValue = value === "" ? "" : Number(value);
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  const handleCategoryChange = (category) => {
    onFiltersChange({
      ...filters,
      categoryId: category ? category._id : null,
    });
  };

  const handleDepartPlaceChange = (departPlaceId) => {
    onFiltersChange({
      ...filters,
      departPlaceId,
    });
  };

  const handleReset = () => {
    onReset();
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString("vi-VN") : "";
  };

  const parsePrice = (priceStr) => {
    return priceStr.replace(/[^\d]/g, "");
  };

  return (
    <div className="isu-invoice-search-filter">
      <div className="isu-filter-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button
          type="button"
          className="isu-btn-reset"
          onClick={handleReset}
          disabled={isLoading}
        >
          Đặt lại
        </button>
      </div>

      <div className="isu-filter-content">
        {/* Search Input */}
        <div className="isu-filter-row">
          <div className="isu-filter-group isu-full-width">
            <label className="isu-filter-label">Tìm kiếm</label>
            <input
              type="text"
              className="isu-filter-input"
              placeholder="Tìm theo mã hóa đơn, tên, email..."
              value={filters.search || ""}
              onChange={(e) => handleInputChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* Search Tour Input */}
        <div className="isu-filter-row">
          <div className="isu-filter-group isu-full-width">
            <label className="isu-filter-label">Tìm kiếm tour</label>
            <input
              type="text"
              className="isu-filter-input"
              placeholder="Tìm theo tên tour..."
              value={filters.searchTour || ""}
              onChange={(e) => handleInputChange("searchTour", e.target.value)}
            />
          </div>
        </div>

        {/* Category and Depart Place */}
        <div className="isu-filter-row">
          <div className="isu-filter-group">
            <label className="isu-filter-label">Danh mục tour</label>
            <CategoryTreeSelect
              value={filters.categoryId ? { _id: filters.categoryId } : null}
              onChange={handleCategoryChange}
              placeholder="Chọn danh mục tour"
            />
          </div>

          <div className="isu-filter-group">
            <DepartPlaceDropDownSearch
              handleChangeValue={handleDepartPlaceChange}
              defaultValue={
                filters.departPlaceId ? { value: filters.departPlaceId } : null
              }
            />
          </div>
        </div>

        {/* Tour Type and Status */}
        <div className="isu-filter-row">
          <div className="isu-filter-group">
            <label className="isu-filter-label">Loại tour</label>
            <select
              className="isu-filter-input"
              value={filters.tourType || ""}
              onChange={(e) => handleInputChange("tourType", e.target.value)}
            >
              {tourTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="isu-filter-group">
            <label className="isu-filter-label">Trạng thái</label>
            <select
              className="isu-filter-input"
              value={filters.status || ""}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Type */}
        <div className="isu-filter-row">
          <div className="isu-filter-group">
            <label className="isu-filter-label">Phương thức thanh toán</label>
            <select
              className="isu-filter-input"
              value={filters.typeOfPayment || ""}
              onChange={(e) =>
                handleInputChange("typeOfPayment", e.target.value)
              }
            >
              {paymentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="isu-filter-row">
          <div className="isu-filter-group">
            <label className="isu-filter-label">Giá từ (VNĐ)</label>
            <input
              type="text"
              className="isu-filter-input isu-price-input"
              placeholder="0"
              value={formatPrice(filters.minPrice)}
              onChange={(e) =>
                handlePriceChange("minPrice", parsePrice(e.target.value))
              }
            />
          </div>

          <div className="isu-filter-group">
            <label className="isu-filter-label">Giá đến (VNĐ)</label>
            <input
              type="text"
              className="isu-filter-input isu-price-input"
              placeholder="0"
              value={formatPrice(filters.maxPrice)}
              onChange={(e) =>
                handlePriceChange("maxPrice", parsePrice(e.target.value))
              }
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="isu-filter-row">
          <div className="isu-filter-group">
            <label className="isu-filter-label">Từ ngày</label>
            <input
              type="date"
              className="isu-filter-input"
              value={filters.startDate || ""}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </div>

          <div className="isu-filter-group">
            <label className="isu-filter-label">Đến ngày</label>
            <input
              type="date"
              className="isu-filter-input"
              value={filters.endDate || ""}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="isu-filter-actions">
          <button
            type="button"
            className="isu-btn-search isu-primary"
            onClick={onSearch}
            disabled={isLoading}
          >
            {isLoading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSearchFilterUser;
