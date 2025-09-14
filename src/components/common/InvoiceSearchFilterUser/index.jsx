import React from "react";
import Select from "react-select";
import CategoryTreeSelect from "../DropDownTreeSearch/CategoryTreeSelect";
import DepartPlaceDropDownSearch from "../DepartPlaceDropDownSearch";
import StatusDropDown from "../StatusDropDown";
import "./InvoiceSearchFilterUser.css";

// Tour type options
const tourTypeOptions = [
  { value: "aboard", label: "Nước ngoài" },
  { value: "domestic", label: "Trong nước" },
];

// Payment type options
const paymentTypeOptions = [
  { value: "cash", label: "Tiền mặt" },
  { value: "momo", label: "MoMo" },
  { value: "bank_transfer", label: "Chuyển khoản" },
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
    // Convert to number if not empty
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

  const handleStatusChange = (status) => {
    onFiltersChange({
      ...filters,
      status,
    });
  };

  const handleTourTypeChange = (selectedOption) => {
    onFiltersChange({
      ...filters,
      tourType: selectedOption ? selectedOption.value : null,
    });
  };

  const handlePaymentTypeChange = (selectedOption) => {
    onFiltersChange({
      ...filters,
      typeOfPayment: selectedOption ? selectedOption.value : null,
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
    <div className="invoice-search-filter">
      <div className="filter-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button
          type="button"
          className="btn-reset"
          onClick={handleReset}
          disabled={isLoading}
        >
          Đặt lại
        </button>
      </div>

      <div className="filter-content">
        {/* Search Input */}
        <div className="filter-row">
          <div className="filter-group full-width">
            <label className="filter-label">Tìm kiếm</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Tìm theo mã hóa đơn, tên, email..."
              value={filters.search || ""}
              onChange={(e) => handleInputChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* Search Tour Input */}
        <div className="filter-row">
          <div className="filter-group full-width">
            <label className="filter-label">Tìm kiếm tour</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Tìm theo tên tour..."
              value={filters.searchTour || ""}
              onChange={(e) => handleInputChange("searchTour", e.target.value)}
            />
          </div>
        </div>

        {/* Category and Depart Place */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Danh mục tour</label>
            <CategoryTreeSelect
              value={filters.categoryId ? { _id: filters.categoryId } : null}
              onChange={handleCategoryChange}
              placeholder="Chọn danh mục tour"
            />
          </div>

          <div className="filter-group">
            <DepartPlaceDropDownSearch
              handleChangeValue={handleDepartPlaceChange}
              defaultValue={
                filters.departPlaceId ? { value: filters.departPlaceId } : null
              }
            />
          </div>
        </div>

        {/* Tour Type and Status */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Loại tour</label>
            <Select
              className="filter-select"
              classNamePrefix="tour-type"
              options={tourTypeOptions}
              value={
                tourTypeOptions.find(
                  (option) => option.value === filters.tourType
                ) || null
              }
              onChange={handleTourTypeChange}
              isClearable
              placeholder="Chọn loại tour"
            />
          </div>

          <div className="filter-group">
            <StatusDropDown
              handleChangeValue={handleStatusChange}
              defaultValue={filters.status ? { value: filters.status } : null}
            />
          </div>
        </div>

        {/* Payment Type */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Phương thức thanh toán</label>
            <Select
              className="filter-select"
              classNamePrefix="payment-type"
              options={paymentTypeOptions}
              value={
                paymentTypeOptions.find(
                  (option) => option.value === filters.typeOfPayment
                ) || null
              }
              onChange={handlePaymentTypeChange}
              isClearable
              placeholder="Chọn phương thức thanh toán"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Giá từ (VNĐ)</label>
            <input
              type="text"
              className="filter-input price-input"
              placeholder="0"
              value={formatPrice(filters.minPrice)}
              onChange={(e) =>
                handlePriceChange("minPrice", parsePrice(e.target.value))
              }
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Giá đến (VNĐ)</label>
            <input
              type="text"
              className="filter-input price-input"
              placeholder="0"
              value={formatPrice(filters.maxPrice)}
              onChange={(e) =>
                handlePriceChange("maxPrice", parsePrice(e.target.value))
              }
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Từ ngày</label>
            <input
              type="date"
              className="filter-input"
              value={filters.startDate || ""}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Đến ngày</label>
            <input
              type="date"
              className="filter-input"
              value={filters.endDate || ""}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button
            type="button"
            className="btn-search primary"
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
