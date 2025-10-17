import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Ban,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  UserCheck,
  UserX,
  Download,
  Upload,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import PaginationV2 from "../../../../components/common/Pagination_V2";
import "./AdminAccountsManagement.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const AdminAccountsManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
    role_id: "",
    status: "active",
  });

  const STATUS_OPTIONS = [
    { value: "active", label: "Hoạt động", color: "#10b981", icon: UserCheck },
    { value: "inactive", label: "Tạm dừng", color: "#f59e0b", icon: UserX },
    { value: "banned", label: "Cấm", color: "#ef4444", icon: Ban },
  ];

  const SORT_OPTIONS = [
    { value: "createdAt", label: "Ngày tạo" },
    { value: "fullName", label: "Tên" },
    { value: "email", label: "Email" },
    { value: "lastLogin", label: "Lần đăng nhập cuối" },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [
    currentPage,
    limit,
    searchTerm,
    filterRole,
    filterStatus,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/role`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải danh sách vai trò");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole !== "all" && { role: filterRole }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(dateRange.start && { dateStart: dateRange.start }),
        ...(dateRange.end && { dateEnd: dateRange.end }),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/admin/admin-account?${params}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Không thể tải danh sách tài khoản");

      const data = await response.json();
      setAccounts(data.accounts);
      setTotalPages(data.totalPages);
      setTotalAccounts(data.total);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map((acc) => acc._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAccount = (accountId) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  useEffect(() => {
    setSelectAll(
      accounts.length > 0 && selectedAccounts.length === accounts.length
    );
  }, [selectedAccounts, accounts]);

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        fullName: account.fullName,
        email: account.email,
        password: "",
        phone: account.phone || "",
        avatar: account.avatar || "",
        role_id: account.role_id?._id || "",
        status: account.status,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        avatar: "",
        role_id: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editingAccount
        ? `${API_BASE}/api/v1/admin/admin-account/update/${editingAccount._id}`
        : `${API_BASE}/api/v1/admin/admin-account/create`;

      const method = editingAccount ? "PATCH" : "POST";

      // Nếu edit và không đổi password thì bỏ trường password
      const submitData = { ...formData };
      if (editingAccount && !submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Không thể lưu tài khoản");

      setSuccess(
        editingAccount
          ? "Cập nhật tài khoản thành công!"
          : "Tạo tài khoản thành công!"
      );
      setTimeout(() => setSuccess(null), 3000);

      await fetchAccounts();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/admin-account/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Không thể xóa tài khoản");

      setSuccess("Xóa tài khoản thành công!");
      setTimeout(() => setSuccess(null), 3000);

      await fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAccounts.length === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn đổi trạng thái ${
          selectedAccounts.length
        } tài khoản thành "${
          STATUS_OPTIONS.find((s) => s.value === newStatus)?.label
        }"?`
      )
    )
      return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/admin-account/bulk-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountIds: selectedAccounts,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Không thể cập nhật trạng thái");

      setSuccess(
        `Cập nhật trạng thái cho ${selectedAccounts.length} tài khoản thành công!`
      );
      setTimeout(() => setSuccess(null), 3000);

      setSelectedAccounts([]);
      setShowBulkActions(false);
      await fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAccounts.length === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa ${selectedAccounts.length} tài khoản?`
      )
    )
      return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/accounts/bulk-delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountIds: selectedAccounts }),
        }
      );

      if (!response.ok) throw new Error("Không thể xóa tài khoản");

      setSuccess(`Xóa ${selectedAccounts.length} tài khoản thành công!`);
      setTimeout(() => setSuccess(null), 3000);

      setSelectedAccounts([]);
      setShowBulkActions(false);
      await fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setDateRange({ start: "", end: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    if (!statusOption) return null;
    const Icon = statusOption.icon;

    return (
      <span
        className="aam-badge"
        style={{
          backgroundColor: `${statusOption.color}15`,
          color: statusOption.color,
          border: `1px solid ${statusOption.color}30`,
        }}
      >
        <Icon size={14} />
        {statusOption.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="aam-container">
      <div className="aam-header">
        <div>
          <h1 className="aam-title">Quản lý Tài khoản Admin</h1>
          <p className="aam-subtitle">
            Quản lý {totalAccounts} tài khoản quản trị trong hệ thống
          </p>
        </div>
        <div className="aam-header-actions">
          <button
            className="aam-btn aam-btn-secondary"
            onClick={handleResetFilters}
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
          <button
            className="aam-btn aam-btn-primary"
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {error && (
        <div className="aam-alert aam-alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="aam-alert aam-alert-success">
          <Check size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="aam-filters">
        <div className="aam-filters-main">
          <div className="aam-search">
            <Search size={20} className="aam-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="aam-search-input"
            />
          </div>

          <button
            className={`aam-btn aam-btn-filter ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={18} />
            Bộ lọc
            {showFilters && (
              <ChevronDown size={16} style={{ transform: "rotate(180deg)" }} />
            )}
            {!showFilters && <ChevronDown size={16} />}
          </button>
        </div>

        {showFilters && (
          <div className="aam-filters-extended">
            <div className="aam-filter-group">
              <label>Vai trò</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="aam-filter-group">
              <label>Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="aam-filter-group">
              <label>Từ ngày</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>

            <div className="aam-filter-group">
              <label>Đến ngày</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>

            <div className="aam-filter-group">
              <label>Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="aam-filter-group">
              <label>Thứ tự</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedAccounts.length > 0 && (
        <div className="aam-bulk-actions">
          <span className="aam-bulk-count">
            Đã chọn: <strong>{selectedAccounts.length}</strong> tài khoản
          </span>
          <div className="aam-bulk-buttons">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="aam-btn aam-btn-sm"
            >
              Hành động
              <ChevronDown size={14} />
            </button>
            {showBulkActions && (
              <div className="aam-bulk-dropdown">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleBulkStatusChange(status.value)}
                  >
                    Đổi thành: {status.label}
                  </button>
                ))}
                <button onClick={handleBulkDelete} className="aam-bulk-delete">
                  <Trash2 size={14} />
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="aam-loading">Đang tải...</div>}

      {/* Table */}
      <div className="aam-table-wrapper">
        <table className="aam-table">
          <thead>
            <tr>
              <th className="aam-th-checkbox">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Liên hệ</th>
              <th>Trạng thái</th>
              <th>Đăng nhập cuối</th>
              <th>Ngày tạo</th>
              <th className="aam-th-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account._id}>
                <td className="aam-td-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account._id)}
                    onChange={() => handleSelectAccount(account._id)}
                  />
                </td>
                <td>
                  <div className="aam-account-info">
                    <div className="aam-avatar">
                      {account.avatar ? (
                        <img src={account.avatar} alt={account.fullName} />
                      ) : (
                        <span>{account.fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="aam-fullname">{account.fullName}</div>
                      <div className="aam-email">{account.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="aam-role">
                    <Shield size={14} />
                    {account.role_id?.title || "-"}
                  </div>
                </td>
                <td>
                  <div className="aam-contact">
                    {account.phone && (
                      <div className="aam-contact-item">
                        <Phone size={12} />
                        {account.phone}
                      </div>
                    )}
                    <div className="aam-contact-item">
                      <Mail size={12} />
                      {account.email}
                    </div>
                  </div>
                </td>
                <td>{getStatusBadge(account.status)}</td>
                <td className="aam-date">{formatDate(account.lastLogin)}</td>
                <td className="aam-date">{formatDate(account.createdAt)}</td>
                <td className="aam-td-actions">
                  <button
                    className="aam-icon-btn aam-icon-btn-edit"
                    onClick={() => handleOpenModal(account)}
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="aam-icon-btn aam-icon-btn-delete"
                    onClick={() => handleDelete(account._id)}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {accounts.length === 0 && !loading && (
          <div className="aam-empty">
            <Shield size={48} />
            <p>Không tìm thấy tài khoản nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="aam-pagination-wrapper">
          <div className="aam-pagination-info">
            Hiển thị {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, totalAccounts)} trong tổng số{" "}
            {totalAccounts}
          </div>
          <PaginationV2
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
          <div className="aam-limit-selector">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="aam-modal-overlay" onClick={handleCloseModal}>
          <div className="aam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aam-modal-header">
              <h2>
                {editingAccount ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}
              </h2>
              <button className="aam-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="aam-modal-body">
              <div className="aam-form-row">
                <div className="aam-form-group">
                  <label>
                    Họ tên <span className="aam-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nguyễn Văn A"
                    className="aam-input"
                  />
                </div>

                <div className="aam-form-group">
                  <label>
                    Email <span className="aam-required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@example.com"
                    className="aam-input"
                  />
                </div>
              </div>

              <div className="aam-form-row">
                <div className="aam-form-group">
                  <label>
                    Mật khẩu{" "}
                    {editingAccount ? (
                      ""
                    ) : (
                      <span className="aam-required">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingAccount}
                    placeholder={
                      editingAccount ? "Để trống nếu không đổi" : "******"
                    }
                    className="aam-input"
                  />
                  {editingAccount && (
                    <small className="aam-hint">
                      Để trống nếu không muốn thay đổi mật khẩu
                    </small>
                  )}
                </div>

                <div className="aam-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0123456789"
                    className="aam-input"
                  />
                </div>
              </div>

              <div className="aam-form-row">
                <div className="aam-form-group">
                  <label>
                    Vai trò <span className="aam-required">*</span>
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    required
                    className="aam-input"
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aam-form-group">
                  <label>
                    Trạng thái <span className="aam-required">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="aam-input"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="aam-form-group">
                <label>URL Avatar</label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="aam-input"
                />
              </div>

              <div className="aam-modal-footer">
                <button
                  type="button"
                  className="aam-btn aam-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="aam-btn aam-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Đang lưu..."
                    : editingAccount
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountsManagement;
