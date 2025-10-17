import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import "./UserManagement.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/user/statistics`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
        gender: genderFilter !== "all" ? genderFilter : "",
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetch(
        `${API_BASE}/api/v1/admin/user/list?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách người dùng");
      }

      const data = await response.json();

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
      setSelectAll(false);
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [currentPage, searchTerm, statusFilter, genderFilter, sortBy, sortOrder]);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedUsers.length === 0) {
      alert("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn thay đổi trạng thái ${selectedUsers.length} người dùng?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/user/bulk-update-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: selectedUsers,
            status: newStatus,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      alert("Cập nhật trạng thái thành công");
      fetchUsers();
      fetchStatistics();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Handle single user status change
  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (
      !window.confirm(`Bạn có chắc muốn thay đổi trạng thái người dùng này?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/user/update-status/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      alert("Cập nhật trạng thái thành công");
      fetchUsers();
      fetchStatistics();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // View user detail
  const handleViewDetail = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/user/detail/${userId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin chi tiết");
      }

      const data = await response.json();
      setSelectedUserDetail(data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: "Hoạt động", class: "um-status-active" },
      inactive: { label: "Không hoạt động", class: "um-status-inactive" },
      banned: { label: "Đã khóa", class: "um-status-banned" },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`um-status-badge ${config.class}`}>{config.label}</span>
    );
  };

  // Get gender label
  const getGenderLabel = (gender) => {
    const genderMap = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return genderMap[gender] || "N/A";
  };

  // Statistics cards
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-icon-users">
            <Users size={24} />
          </div>
          <div className="um-stat-content">
            <div className="um-stat-value">{statistics.totalUsers || 0}</div>
            <div className="um-stat-label">Tổng người dùng</div>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-icon-active">
            <CheckCircle size={24} />
          </div>
          <div className="um-stat-content">
            <div className="um-stat-value">{statistics.activeUsers || 0}</div>
            <div className="um-stat-label">Đang hoạt động</div>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-icon-revenue">
            <DollarSign size={24} />
          </div>
          <div className="um-stat-content">
            <div className="um-stat-value">
              {formatCurrency(statistics.totalRevenue || 0)}
            </div>
            <div className="um-stat-label">Tổng doanh thu</div>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-icon-bookings">
            <ShoppingCart size={24} />
          </div>
          <div className="um-stat-content">
            <div className="um-stat-value">{statistics.totalBookings || 0}</div>
            <div className="um-stat-label">Tổng booking</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="um-container">
      {/* Header */}
      <div className="um-header">
        <div>
          <h1 className="um-title">Quản lý người dùng</h1>
          <p className="um-subtitle">
            Tổng số: <span className="um-highlight">{totalUsers}</span> người
            dùng
          </p>
        </div>
      </div>

      {/* Statistics */}
      {renderStatistics()}

      {/* Filters */}
      <div className="um-filters">
        {/* Search */}
        <div className="um-search-wrapper">
          <Search className="um-search-icon" size={20} />
          <input
            type="text"
            className="um-search-input"
            placeholder="Tìm kiếm theo email, username, số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Filter */}
        <div className="um-filter-group">
          <Filter size={18} />
          <select
            className="um-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="banned">Đã khóa</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="um-filter-group">
          <Filter size={18} />
          <select
            className="um-select"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Sort */}
        <div className="um-filter-group">
          <ArrowUpDown size={18} />
          <select
            className="um-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="totalSpent">Tổng chi tiêu</option>
            <option value="totalBookings">Số lượng booking</option>
            <option value="fullName">Họ tên</option>
          </select>
          <button
            className="um-sort-order-btn"
            onClick={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="um-bulk-actions">
          <span className="um-bulk-text">
            Đã chọn: <strong>{selectedUsers.length}</strong> người dùng
          </span>
          <div className="um-bulk-buttons">
            <button
              className="um-bulk-btn um-bulk-btn-active"
              onClick={() => handleBulkStatusChange("active")}
            >
              Kích hoạt
            </button>
            <button
              className="um-bulk-btn um-bulk-btn-inactive"
              onClick={() => handleBulkStatusChange("inactive")}
            >
              Vô hiệu hóa
            </button>
            <button
              className="um-bulk-btn um-bulk-btn-ban"
              onClick={() => handleBulkStatusChange("banned")}
            >
              Khóa tài khoản
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="um-table-wrapper">
        {loading ? (
          <div className="um-loading">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="um-error">Lỗi: {error}</div>
        ) : users.length === 0 ? (
          <div className="um-empty">Không tìm thấy người dùng nào</div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th className="um-th-checkbox">
                  <input
                    type="checkbox"
                    className="um-checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="um-th">Ảnh đại diện</th>
                <th
                  className="um-th um-th-sortable"
                  onClick={() => handleSort("fullName")}
                >
                  Họ tên{" "}
                  {sortBy === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="um-th">Email</th>
                <th className="um-th">Số điện thoại</th>
                <th
                  className="um-th um-th-sortable"
                  onClick={() => handleSort("totalSpent")}
                >
                  Tổng chi tiêu{" "}
                  {sortBy === "totalSpent" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="um-th">Giới tính</th>
                <th className="um-th">Trạng thái</th>
                <th className="um-th">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="um-tr">
                  <td className="um-td-checkbox">
                    <input
                      type="checkbox"
                      className="um-checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td className="um-td">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.fullName
                        )}&background=random`
                      }
                      alt={user.fullName}
                      className="um-avatar"
                    />
                  </td>
                  <td className="um-td">
                    <div className="um-user-info">
                      <div className="um-fullname">{user.fullName}</div>
                      <div className="um-username">@{user.userName}</div>
                    </div>
                  </td>
                  <td className="um-td">{user.email}</td>
                  <td className="um-td">{user.phone}</td>
                  <td className="um-td">
                    <div className="um-spent-info">
                      <div className="um-spent-amount">
                        {formatCurrency(user.totalSpent || 0)}
                      </div>
                      <div className="um-spent-bookings">
                        {user.totalBookings || 0} booking
                      </div>
                    </div>
                  </td>
                  <td className="um-td">{getGenderLabel(user.sex)}</td>
                  <td className="um-td">{getStatusBadge(user.status)}</td>
                  <td className="um-td">
                    <div className="um-actions">
                      <button
                        className="um-action-btn um-btn-view"
                        onClick={() => handleViewDetail(user._id)}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="um-action-btn um-btn-edit"
                        onClick={() =>
                          (window.location.href = `/admin/users/edit/${user._id}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      {user.status === "active" ? (
                        <button
                          className="um-action-btn um-btn-ban"
                          onClick={() =>
                            handleUpdateUserStatus(user._id, "banned")
                          }
                          title="Khóa tài khoản"
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button
                          className="um-action-btn um-btn-activate"
                          onClick={() =>
                            handleUpdateUserStatus(user._id, "active")
                          }
                          title="Kích hoạt"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="um-pagination-wrapper">
          <div className="um-pagination">
            <button
              className="um-page-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`um-page-btn ${
                      currentPage === pageNum ? "um-page-active" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return (
                  <span key={pageNum} className="um-page-dots">
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              className="um-page-btn"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUserDetail && (
        <div
          className="um-modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h2 className="um-modal-title">Chi tiết người dùng</h2>
              <button
                className="um-modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="um-modal-body">
              <div className="um-detail-section">
                <img
                  src={
                    selectedUserDetail.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedUserDetail.fullName
                    )}&background=random&size=200`
                  }
                  alt={selectedUserDetail.fullName}
                  className="um-detail-avatar"
                />
                <h3 className="um-detail-name">
                  {selectedUserDetail.fullName}
                </h3>
                <p className="um-detail-username">
                  @{selectedUserDetail.userName}
                </p>
                {getStatusBadge(selectedUserDetail.status)}
              </div>

              <div className="um-detail-grid">
                <div className="um-detail-item">
                  <span className="um-detail-label">Email:</span>
                  <span className="um-detail-value">
                    {selectedUserDetail.email}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Số điện thoại:</span>
                  <span className="um-detail-value">
                    {selectedUserDetail.phone}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Giới tính:</span>
                  <span className="um-detail-value">
                    {getGenderLabel(selectedUserDetail.sex)}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Ngày sinh:</span>
                  <span className="um-detail-value">
                    {selectedUserDetail.birthDay
                      ? formatDate(selectedUserDetail.birthDay)
                      : "N/A"}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Địa chỉ:</span>
                  <span className="um-detail-value">
                    {selectedUserDetail.address || "N/A"}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Ngày tạo:</span>
                  <span className="um-detail-value">
                    {formatDate(selectedUserDetail.createdAt)}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Tổng chi tiêu:</span>
                  <span className="um-detail-value um-highlight">
                    {formatCurrency(selectedUserDetail.totalSpent || 0)}
                  </span>
                </div>
                <div className="um-detail-item">
                  <span className="um-detail-label">Số lượng booking:</span>
                  <span className="um-detail-value">
                    {selectedUserDetail.totalBookings || 0}
                  </span>
                </div>
              </div>

              {selectedUserDetail.recentBookings &&
                selectedUserDetail.recentBookings.length > 0 && (
                  <div className="um-detail-bookings">
                    <h4 className="um-detail-subtitle">Booking gần đây</h4>
                    <div className="um-bookings-list">
                      {selectedUserDetail.recentBookings.map((booking) => (
                        <div key={booking._id} className="um-booking-item">
                          <div className="um-booking-info">
                            <span className="um-booking-code">
                              {booking.invoiceCode}
                            </span>
                            <span className="um-booking-date">
                              {formatDate(booking.createdAt)}
                            </span>
                          </div>
                          <span className="um-booking-price">
                            {formatCurrency(booking.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
