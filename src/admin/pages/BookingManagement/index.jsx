// BookingManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Eye,
  Printer,
  XCircle,
  CheckCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  Package,
} from "lucide-react";
import CategoryTreeSelect from "../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import SimpleSelect from "../../../components/common/DropDownTreeSearch/SimpleSelect";
import DepartPlaceDropDownSearch from "../../../components/common/DepartPlaceDropDownSearch";
import PaginationV2 from "../../../components/common/Pagination_V2";
import "./BookingManagement.css";

const API_BASE =
  process.env.REACT_APP_DOMAIN_BACKEND || "http://localhost:3000";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    invoiceCode: "",
    userId: "",
    tourTitle: "",
    categoryId: null,
    departPlaceId: "",
    typeOfPayment: "",
    status: "",
    tourStatus: "",
    fromDate: "",
    toDate: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0 });
  const [showFilters, setShowFilters] = useState(true);

  // Fetch bookings
  const fetchBookings = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", 20);

        Object.entries(filters).forEach(([key, val]) => {
          if (val && val !== "") {
            if (key === "categoryId" && val._id) {
              params.append(key, val._id);
            } else if (typeof val === "object") {
              // Skip other objects
            } else {
              params.append(key, val);
            }
          }
        });

        const res = await fetch(`${API_BASE}/api/v1/admin/invoice?${params}`, {
          credentials: "include",
        });
        const data = await res.json();

        setBookings(data.invoices || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalBookings: data.totalBookings || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, fetchBookings]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      invoiceCode: "",
      userId: "",
      tourTitle: "",
      categoryId: null,
      departPlaceId: "",
      typeOfPayment: "",
      status: "",
      tourStatus: "",
      fromDate: "",
      toDate: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setCurrentPage(1);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const statusLabels = {
    pending: { label: "Chờ xử lý", color: "#ff9800", bg: "#fff3e0" },
    paid: { label: "Đã thanh toán", color: "#4caf50", bg: "#e8f5e9" },
    canceled: { label: "Đã hủy", color: "#f44336", bg: "#ffebee" },
    refunded: { label: "Đã hoàn tiền", color: "#9c27b0", bg: "#f3e5f5" },
  };

  const tourStatusLabels = {
    "not-started": { label: "Chưa bắt đầu", color: "#2196f3", bg: "#e3f2fd" },
    "on-tour": { label: "Đang diễn ra", color: "#ff9800", bg: "#fff3e0" },
    completed: { label: "Hoàn thành", color: "#4caf50", bg: "#e8f5e9" },
    "no-show": { label: "Vắng mặt", color: "#f44336", bg: "#ffebee" },
  };

  const paymentLabels = {
    cash: "Tiền mặt",
    "bank-transfer": "Chuyển khoản",
    "credit-card": "Thẻ tín dụng",
    momo: "MoMo",
    zalopay: "ZaloPay",
  };

  const handleViewDetail = (id) => {
    console.log("View detail:", id);
    // Navigate to detail page
  };

  const handlePrint = (id) => {
    console.log("Print invoice:", id);
    // Print invoice
  };

  const handleCancel = (id) => {
    console.log("Cancel booking:", id);
    // Cancel booking
  };

  return (
    <div className="bkm-container">
      <div className="bkm-header">
        <h1 className="bkm-title">
          <Package className="bkm-title-icon" />
          Quản lý đặt Tour
        </h1>
      </div>

      {/* Stats */}
      <div className="bkm-stats">
        <div className="bkm-stat-card bkm-stat-card--revenue">
          <div className="bkm-stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="bkm-stat-content">
            <div className="bkm-stat-label">Tổng doanh thu</div>
            <div className="bkm-stat-value">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
        </div>
        <div className="bkm-stat-card bkm-stat-card--bookings">
          <div className="bkm-stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="bkm-stat-content">
            <div className="bkm-stat-label">Tổng số booking</div>
            <div className="bkm-stat-value">{stats.totalBookings}</div>
          </div>
        </div>
        <div className="bkm-stat-card bkm-stat-card--average">
          <div className="bkm-stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="bkm-stat-content">
            <div className="bkm-stat-label">Giá trị trung bình</div>
            <div className="bkm-stat-value">
              {stats.totalBookings > 0
                ? formatCurrency(stats.totalRevenue / stats.totalBookings)
                : formatCurrency(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bkm-filters-wrapper">
        <div className="bkm-filters-header">
          <h3 className="bkm-filters-title">
            <Filter size={18} />
            Bộ lọc và tìm kiếm
          </h3>
          <button
            className="bkm-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
        </div>

        {showFilters && (
          <div className="bkm-filters-content">
            <div className="bkm-filters-grid">
              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <Search size={16} />
                  Mã hóa đơn
                </label>
                <input
                  type="text"
                  placeholder="VD: INV001"
                  value={filters.invoiceCode}
                  onChange={(e) =>
                    handleFilterChange("invoiceCode", e.target.value)
                  }
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <User size={16} />
                  ID khách hàng
                </label>
                <input
                  type="text"
                  placeholder="User ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <Search size={16} />
                  Tên tour
                </label>
                <input
                  type="text"
                  placeholder="Tìm tour..."
                  value={filters.tourTitle}
                  onChange={(e) =>
                    handleFilterChange("tourTitle", e.target.value)
                  }
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <Package size={16} />
                  Danh mục tour
                </label>
                <CategoryTreeSelect
                  value={filters.categoryId}
                  onChange={(cat) => handleFilterChange("categoryId", cat)}
                  placeholder="Chọn danh mục"
                />
              </div>

              <div className="bkm-filter-item">
                <DepartPlaceDropDownSearch
                  handleChangeValue={(value) =>
                    handleFilterChange("departPlaceId", value)
                  }
                  placeholder="-- Chọn điểm khởi hành --"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <CreditCard size={16} />
                  PT thanh toán
                </label>
                <SimpleSelect
                  value={filters.typeOfPayment}
                  onChange={(val) => handleFilterChange("typeOfPayment", val)}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "cash", label: "Tiền mặt" },
                    { value: "bank-transfer", label: "Chuyển khoản" },
                    { value: "credit-card", label: "Thẻ tín dụng" },
                    { value: "momo", label: "MoMo" },
                    { value: "zalopay", label: "ZaloPay" },
                  ]}
                  placeholder="Chọn PT thanh toán"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <CheckCircle size={16} />
                  Trạng thái thanh toán
                </label>
                <SimpleSelect
                  value={filters.status}
                  onChange={(val) => handleFilterChange("status", val)}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "pending", label: "Chờ xử lý" },
                    { value: "paid", label: "Đã thanh toán" },
                    { value: "canceled", label: "Đã hủy" },
                    { value: "refunded", label: "Đã hoàn tiền" },
                  ]}
                  placeholder="Chọn trạng thái"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <MapPin size={16} />
                  Trạng thái tour
                </label>
                <SimpleSelect
                  value={filters.tourStatus}
                  onChange={(val) => handleFilterChange("tourStatus", val)}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "not-started", label: "Chưa bắt đầu" },
                    { value: "on-tour", label: "Đang diễn ra" },
                    { value: "completed", label: "Hoàn thành" },
                    { value: "no-show", label: "Vắng mặt" },
                  ]}
                  placeholder="Chọn trạng thái tour"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <Calendar size={16} />
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    handleFilterChange("fromDate", e.target.value)
                  }
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <Calendar size={16} />
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <DollarSign size={16} />
                  Giá từ
                </label>
                <input
                  type="number"
                  placeholder="VND"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <DollarSign size={16} />
                  Giá đến
                </label>
                <input
                  type="number"
                  placeholder="VND"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="bkm-input"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <TrendingUp size={16} />
                  Sắp xếp theo
                </label>
                <SimpleSelect
                  value={filters.sortBy}
                  onChange={(val) => handleFilterChange("sortBy", val)}
                  options={[
                    { value: "createdAt", label: "Thời gian đặt" },
                    { value: "totalPrice", label: "Giá tour" },
                    { value: "departureDate", label: "Ngày khởi hành" },
                  ]}
                  placeholder="Chọn sắp xếp"
                />
              </div>

              <div className="bkm-filter-item">
                <label className="bkm-label">
                  <TrendingUp size={16} />
                  Thứ tự
                </label>
                <SimpleSelect
                  value={filters.sortOrder}
                  onChange={(val) => handleFilterChange("sortOrder", val)}
                  options={[
                    { value: "desc", label: "Giảm dần" },
                    { value: "asc", label: "Tăng dần" },
                  ]}
                  placeholder="Chọn thứ tự"
                />
              </div>
            </div>

            <div className="bkm-filters-actions">
              <button
                onClick={() => fetchBookings(1)}
                className="bkm-btn bkm-btn--primary"
              >
                <Search size={18} />
                Áp dụng
              </button>
              <button
                onClick={handleReset}
                className="bkm-btn bkm-btn--secondary"
              >
                <RefreshCw size={18} />
                Đặt lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bkm-table-wrapper">
        {loading ? (
          <div className="bkm-loading">
            <RefreshCw className="bkm-loading-icon" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bkm-empty">
            <Package size={48} />
            <p>Không tìm thấy booking nào</p>
          </div>
        ) : (
          <>
            <div className="bkm-table-scroll">
              <table className="bkm-table">
                <thead className="bkm-table-head">
                  <tr>
                    <th>STT</th>
                    <th>Mã HĐ</th>
                    <th>Tên tour</th>
                    <th>Điểm KH</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Ngày KH</th>
                    <th>SL ghế</th>
                    <th>Tổng tiền</th>
                    <th>PT thanh toán</th>
                    <th>TT thanh toán</th>
                    <th>TT tour</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody className="bkm-table-body">
                  {bookings.map((booking, idx) => (
                    <tr key={booking._id} className="bkm-table-row">
                      <td className="bkm-td-center">
                        {(currentPage - 1) * 20 + idx + 1}
                      </td>
                      <td className="bkm-td-code">{booking.invoiceCode}</td>
                      <td className="bkm-td-tour">
                        {booking.tourId?.title || "—"}
                      </td>
                      <td className="bkm-td-depart">
                        <span className="bkm-depart-badge">
                          <MapPin size={12} />
                          {booking.tourId?.departPlaceId?.name || "—"}
                        </span>
                      </td>
                      <td className="bkm-td-customer">
                        <div className="bkm-customer-info">
                          <div className="bkm-customer-name">
                            <User size={14} />
                            {booking.nameOfUser}
                          </div>
                          <div className="bkm-customer-phone">
                            <Phone size={12} />
                            {booking.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="bkm-td-date">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="bkm-td-date">
                        {formatDate(booking.departureDate)}
                      </td>
                      <td className="bkm-td-center bkm-td-seats">
                        {booking.totalPeople}
                      </td>
                      <td className="bkm-td-price">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="bkm-td-center">
                        <span className="bkm-payment-badge">
                          <CreditCard size={14} />
                          {paymentLabels[booking.typeOfPayment] ||
                            booking.typeOfPayment}
                        </span>
                      </td>
                      <td className="bkm-td-center">
                        <span
                          className="bkm-status-badge"
                          style={{
                            color: statusLabels[booking.status]?.color,
                            backgroundColor: statusLabels[booking.status]?.bg,
                          }}
                        >
                          {statusLabels[booking.status]?.label ||
                            booking.status}
                        </span>
                      </td>
                      <td className="bkm-td-center">
                        <span
                          className="bkm-status-badge"
                          style={{
                            color: tourStatusLabels[booking.tourStatus]?.color,
                            backgroundColor:
                              tourStatusLabels[booking.tourStatus]?.bg,
                          }}
                        >
                          {tourStatusLabels[booking.tourStatus]?.label ||
                            booking.tourStatus}
                        </span>
                      </td>
                      <td className="bkm-td-actions">
                        <div className="bkm-actions">
                          <button
                            className="bkm-action-btn bkm-action-btn--view"
                            onClick={() => handleViewDetail(booking._id)}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="bkm-action-btn bkm-action-btn--print"
                            onClick={() => handlePrint(booking._id)}
                            title="In hóa đơn"
                          >
                            <Printer size={16} />
                          </button>
                          {booking.status === "pending" && (
                            <button
                              className="bkm-action-btn bkm-action-btn--cancel"
                              onClick={() => handleCancel(booking._id)}
                              title="Hủy booking"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bkm-pagination-wrapper">
              <div className="bkm-pagination-info">
                Hiển thị {(currentPage - 1) * 20 + 1} -{" "}
                {Math.min(currentPage * 20, totalItems)} trong tổng số{" "}
                {totalItems} kết quả
              </div>
              <PaginationV2
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
