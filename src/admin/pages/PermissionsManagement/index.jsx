import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Eye,
  FileEdit,
  Shield,
  MapPin,
  Newspaper,
  Image,
  Headphones,
  Info,
  Settings,
  Bell,
  Users,
  Tag,
  AlertCircle,
} from "lucide-react";
import "./PermissionsManagement.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const PermissionsManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    module: "",
    action: "view",
    description: "",
    order: 0,
  });

  // Hardcode modules dựa theo sidebar của Travel System
  const MODULES = [
    { value: "dashboard", label: "Dashboard", icon: Shield },

    // Tour Management
    { value: "tour-category", label: "Danh mục Tour", icon: Tag },
    { value: "tours", label: "Danh sách Tour", icon: MapPin },
    { value: "booking-tour", label: "Quản lý đặt Tour", icon: Bell },

    // Services
    { value: "service-category", label: "Danh mục dịch vụ", icon: Tag },
    { value: "services", label: "Dịch vụ", icon: Bell },

    // News
    { value: "news-category", label: "Danh mục tin tức", icon: Tag },
    { value: "news", label: "Tin tức", icon: Newspaper },

    // Gallery
    { value: "gallery-category", label: "Danh mục sưu tập", icon: Tag },
    { value: "gallery", label: "Bộ sưu tập", icon: Image },

    // Support
    { value: "support", label: "Hỗ trợ khách hàng", icon: Headphones },

    // About
    { value: "about-us", label: "Giới thiệu công ty", icon: Info },
    { value: "recruitment", label: "Tuyển dụng", icon: Users },

    // Config
    { value: "config-basic", label: "Cấu hình cơ bản", icon: Settings },
    { value: "config-advanced", label: "Cấu hình nâng cao", icon: Settings },

    // System
    { value: "roles", label: "Vai trò", icon: Shield },
    { value: "accounts", label: "Tài khoản Admin", icon: Users },
  ];

  const ACTIONS = [
    { value: "view", label: "Xem", icon: Eye, color: "#10b981" },
    { value: "create", label: "Thêm mới", icon: Plus, color: "#3b82f6" },
    { value: "edit", label: "Chỉnh sửa", icon: FileEdit, color: "#f59e0b" },
    { value: "delete", label: "Xóa", icon: Trash2, color: "#ef4444" },
    {
      value: "manage",
      label: "Quản lý toàn bộ",
      icon: Shield,
      color: "#8b5cf6",
    },
  ];

  // Module Categories để group trong UI
  const MODULE_CATEGORIES = [
    { name: "Dashboard", modules: ["dashboard"] },
    {
      name: "Quản lý Tour",
      modules: ["tour-category", "tours", "booking-tour"],
    },
    { name: "Dịch vụ", modules: ["service-category", "services"] },
    { name: "Tin tức", modules: ["news-category", "news"] },
    { name: "Bộ sưu tập", modules: ["gallery-category", "gallery"] },
    {
      name: "Hỗ trợ & Giới thiệu",
      modules: ["support", "about-us", "recruitment"],
    },
    { name: "Cấu hình hệ thống", modules: ["config-basic", "config-advanced"] },
    { name: "Phân quyền", modules: ["roles", "accounts"] },
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/permission`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải danh sách permissions");
      const data = await response.json();
      setPermissions(data);
      setFilteredPermissions(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = permissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedModule !== "all") {
      filtered = filtered.filter((p) => p.module === selectedModule);
    }

    setFilteredPermissions(filtered);
  }, [searchTerm, selectedModule, permissions]);

  const handleOpenModal = (permission = null) => {
    if (permission) {
      setEditingPermission(permission);
      setFormData({
        name: permission.name,
        displayName: permission.displayName,
        module: permission.module,
        action: permission.action,
        description: permission.description || "",
        order: permission.order || 0,
      });
    } else {
      setEditingPermission(null);
      setFormData({
        name: "",
        displayName: "",
        module: "",
        action: "view",
        description: "",
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto generate name khi chọn module và action
    if (name === "module" || name === "action") {
      const module = name === "module" ? value : formData.module;
      const action = name === "action" ? value : formData.action;
      if (module && action) {
        setFormData((prev) => ({
          ...prev,
          name: `${module}_${action}`,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editingPermission
        ? `${API_BASE}/api/v1/admin/permission/update/${editingPermission._id}`
        : `${API_BASE}/api/v1/admin/permission/create`;

      const method = editingPermission ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Không thể lưu permission");

      await fetchPermissions();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa quyền này?")) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/permission/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Không thể xóa permission");
      await fetchPermissions();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getModuleInfo = (moduleValue) => {
    return (
      MODULES.find((m) => m.value === moduleValue) || {
        label: moduleValue,
        icon: Shield,
      }
    );
  };

  const getActionInfo = (actionValue) => {
    return (
      ACTIONS.find((a) => a.value === actionValue) || {
        label: actionValue,
        icon: Eye,
        color: "#666",
      }
    );
  };

  // Group permissions by category
  const getCategorizedPermissions = () => {
    return MODULE_CATEGORIES.map((category) => {
      const categoryPerms = filteredPermissions.filter((p) =>
        category.modules.includes(p.module)
      );

      const groupedByModule = categoryPerms.reduce((acc, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      }, {});

      return {
        categoryName: category.name,
        modules: groupedByModule,
        totalCount: categoryPerms.length,
      };
    }).filter((cat) => cat.totalCount > 0);
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div>
          <h1 className="pm-title">Quản lý Permissions</h1>
          <p className="pm-subtitle">
            Quản lý các quyền truy cập hệ thống du lịch
          </p>
        </div>
        <button
          className="pm-btn pm-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Thêm Permission
        </button>
      </div>

      {error && (
        <div className="pm-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="pm-filters">
        <div className="pm-search">
          <Search size={20} className="pm-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm permission theo tên, module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pm-search-input"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="pm-select"
        >
          <option value="all">Tất cả module ({permissions.length})</option>
          {MODULE_CATEGORIES.map((cat) => (
            <optgroup key={cat.name} label={cat.name}>
              {cat.modules.map((moduleVal) => {
                const moduleInfo = MODULES.find((m) => m.value === moduleVal);
                const count = permissions.filter(
                  (p) => p.module === moduleVal
                ).length;
                return (
                  <option key={moduleVal} value={moduleVal}>
                    {moduleInfo?.label || moduleVal} ({count})
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
      </div>

      {loading && <div className="pm-loading">Đang tải...</div>}

      <div className="pm-content">
        {getCategorizedPermissions().map((category) => (
          <div key={category.categoryName} className="pm-category-section">
            <h2 className="pm-category-title">
              {category.categoryName}
              <span className="pm-category-count">
                {category.totalCount} quyền
              </span>
            </h2>

            {Object.entries(category.modules).map(([module, perms]) => {
              const moduleInfo = getModuleInfo(module);
              const ModuleIcon = moduleInfo.icon;

              return (
                <div key={module} className="pm-module-group">
                  <div className="pm-module-header">
                    <div className="pm-module-title-wrapper">
                      <ModuleIcon size={20} className="pm-module-icon" />
                      <h3 className="pm-module-title">{moduleInfo.label}</h3>
                      <span className="pm-module-count">{perms.length}</span>
                    </div>
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-table">
                      <thead>
                        <tr>
                          <th>Tên hiển thị</th>
                          <th>Tên kỹ thuật</th>
                          <th>Hành động</th>
                          <th>Mô tả</th>
                          <th>Thứ tự</th>
                          <th className="pm-table-actions-header">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perms
                          .sort((a, b) => a.order - b.order)
                          .map((perm) => {
                            const actionInfo = getActionInfo(perm.action);
                            const ActionIcon = actionInfo.icon;

                            return (
                              <tr key={perm._id}>
                                <td className="pm-table-main">
                                  {perm.displayName}
                                </td>
                                <td>
                                  <code className="pm-code">{perm.name}</code>
                                </td>
                                <td>
                                  <span
                                    className="pm-badge"
                                    style={{
                                      backgroundColor: `${actionInfo.color}15`,
                                      color: actionInfo.color,
                                      border: `1px solid ${actionInfo.color}30`,
                                    }}
                                  >
                                    <ActionIcon size={14} />
                                    {actionInfo.label}
                                  </span>
                                </td>
                                <td className="pm-table-desc">
                                  {perm.description || "-"}
                                </td>
                                <td className="pm-table-order">{perm.order}</td>
                                <td className="pm-table-actions">
                                  <button
                                    className="pm-icon-btn pm-icon-btn-edit"
                                    onClick={() => handleOpenModal(perm)}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    className="pm-icon-btn pm-icon-btn-delete"
                                    onClick={() => handleDelete(perm._id)}
                                    title="Xóa"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {filteredPermissions.length === 0 && !loading && (
          <div className="pm-empty">
            <Shield size={48} className="pm-empty-icon" />
            <p>Không tìm thấy permission nào</p>
            <button
              className="pm-btn pm-btn-primary"
              onClick={() => handleOpenModal()}
            >
              <Plus size={18} />
              Tạo permission đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="pm-modal-overlay" onClick={handleCloseModal}>
          <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h2>
                {editingPermission
                  ? "Chỉnh sửa Permission"
                  : "Thêm Permission mới"}
              </h2>
              <button className="pm-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="pm-modal-body">
              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label>
                    Module <span className="pm-required">*</span>
                  </label>
                  <select
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    required
                    className="pm-input"
                  >
                    <option value="">-- Chọn module --</option>
                    {MODULE_CATEGORIES.map((cat) => (
                      <optgroup key={cat.name} label={cat.name}>
                        {cat.modules.map((moduleVal) => {
                          const moduleInfo = MODULES.find(
                            (m) => m.value === moduleVal
                          );
                          return (
                            <option key={moduleVal} value={moduleVal}>
                              {moduleInfo?.label || moduleVal}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="pm-form-group">
                  <label>
                    Hành động <span className="pm-required">*</span>
                  </label>
                  <select
                    name="action"
                    value={formData.action}
                    onChange={handleChange}
                    required
                    className="pm-input"
                  >
                    {ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pm-form-group">
                <label>
                  Tên kỹ thuật <span className="pm-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="tours_view"
                  className="pm-input"
                />
                <small className="pm-hint">
                  Tự động tạo từ module + action (ví dụ: tours_view)
                </small>
              </div>

              <div className="pm-form-group">
                <label>
                  Tên hiển thị <span className="pm-required">*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  placeholder="Xem danh sách tour"
                  className="pm-input"
                />
              </div>

              <div className="pm-form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về quyền này..."
                  className="pm-input pm-textarea"
                  rows="3"
                />
              </div>

              <div className="pm-form-group">
                <label>Thứ tự</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="0"
                  className="pm-input"
                  min="0"
                />
                <small className="pm-hint">
                  Thứ tự hiển thị trong danh sách (số càng nhỏ càng ưu tiên)
                </small>
              </div>

              <div className="pm-modal-footer">
                <button
                  type="button"
                  className="pm-btn pm-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="pm-btn pm-btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading
                    ? "Đang lưu..."
                    : editingPermission
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

export default PermissionsManagement;
