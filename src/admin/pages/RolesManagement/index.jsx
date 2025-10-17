import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Shield,
  Users,
  ChevronRight,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import "./RolesManagement.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const RolesManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleStats, setRoleStats] = useState({});
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [expandedRestrictedRole, setExpandedRestrictedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    description: "",
    permissions: [],
  });

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
    fetchRoles();
    fetchPermissions();
    fetchRoleStats();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/role`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải danh sách vai trò");
      const data = await response.json();
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/permission`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải danh sách permissions");
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchRoleStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/role/stats`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải thống kê vai trò");
      const data = await response.json();

      const statsMap = {};
      data.forEach((stat) => {
        statsMap[stat.roleId] = stat.accountCount;
      });
      setRoleStats(statsMap);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = roles.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.description &&
            r.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchTerm, roles]);

  const handleOpenModal = (role = null) => {
    // KHỞI TẠO TẤT CẢ CATEGORIES MỞ RỘNG
    const expandedState = {};
    MODULE_CATEGORIES.forEach((cat) => {
      expandedState[cat.name] = true;
    });
    setExpandedCategories(expandedState);

    if (role) {
      setEditingRole(role);
      setFormData({
        title: role.title,
        value: role.value,
        description: role.description || "",
        permissions: role.permissions || [],
      });
    } else {
      setEditingRole(null);
      setFormData({
        title: "",
        value: "",
        description: "",
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setExpandedCategories({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "title") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      setFormData((prev) => ({ ...prev, value: slug }));
    }
  };

  const handlePermissionToggle = (permissionName) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName];
      return { ...prev, permissions: perms };
    });
  };

  const handleSelectAllInCategory = (category) => {
    const categoryPerms = permissions
      .filter((p) => category.modules.includes(p.module))
      .map((p) => p.name);

    const allSelected = categoryPerms.every((p) =>
      formData.permissions.includes(p)
    );

    setFormData((prev) => {
      let newPerms;
      if (allSelected) {
        newPerms = prev.permissions.filter((p) => !categoryPerms.includes(p));
      } else {
        newPerms = [...new Set([...prev.permissions, ...categoryPerms])];
      }
      return { ...prev, permissions: newPerms };
    });
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editingRole
        ? `${API_BASE}/api/v1/admin/role/update/${editingRole._id}`
        : `${API_BASE}/api/v1/admin/role/create`;

      const method = editingRole ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Không thể lưu vai trò");

      await fetchRoles();
      await fetchRoleStats();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const accountCount = roleStats[id] || 0;

    if (accountCount > 0) {
      alert(
        `Không thể xóa vai trò này vì có ${accountCount} tài khoản đang sử dụng!`
      );
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa vai trò này?")) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/role/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Không thể xóa vai trò");
      await fetchRoles();
      await fetchRoleStats();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissionCount = (role) => {
    return role.permissions ? role.permissions.length : 0;
  };

  const getRoleAccountCount = (roleId) => {
    return roleStats[roleId] || 0;
  };

  const getRestrictedPermissions = (role) => {
    const rolePermissions = role.permissions || [];
    return permissions.filter((p) => !rolePermissions.includes(p.name));
  };

  const groupPermissionsByCategory = () => {
    return MODULE_CATEGORIES.map((cat) => ({
      ...cat,
      permissions: permissions.filter((p) => cat.modules.includes(p.module)),
    })).filter((cat) => cat.permissions.length > 0);
  };

  const isCategoryFullySelected = (category) => {
    const categoryPerms = permissions
      .filter((p) => category.modules.includes(p.module))
      .map((p) => p.name);
    return (
      categoryPerms.length > 0 &&
      categoryPerms.every((p) => formData.permissions.includes(p))
    );
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <div>
          <h1 className="rm-title">Quản lý Vai trò</h1>
          <p className="rm-subtitle">
            Tạo và quản lý các vai trò quản trị trong hệ thống
          </p>
        </div>
        <button
          className="rm-btn rm-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Thêm Vai trò
        </button>
      </div>

      {error && (
        <div className="rm-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="rm-search-wrapper">
        <div className="rm-search">
          <Search size={20} className="rm-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rm-search-input"
          />
        </div>
        <div className="rm-stats">
          <span className="rm-stat-item">
            <Shield size={16} />
            Tổng: <strong>{roles.length}</strong> vai trò
          </span>
        </div>
      </div>

      {loading && <div className="rm-loading">Đang tải...</div>}

      <div className="rm-grid">
        {filteredRoles.map((role) => {
          const accountCount = getRoleAccountCount(role._id);
          const restrictedCount = getRestrictedPermissions(role).length;

          return (
            <div key={role._id} className="rm-card">
              <div className="rm-card-header">
                <div className="rm-card-icon">
                  <Shield size={24} />
                </div>
                <div className="rm-card-title">
                  <h3>{role.title}</h3>
                  <code className="rm-card-value">{role.value}</code>
                </div>
              </div>

              <p className="rm-card-desc">
                {role.description || "Không có mô tả"}
              </p>

              <div className="rm-card-stats">
                <div className="rm-stat">
                  <Shield size={16} />
                  <span>{getRolePermissionCount(role)} quyền</span>
                </div>
                <div className="rm-stat">
                  <Users size={16} />
                  <span>{accountCount} tài khoản</span>
                </div>
              </div>

              <div className="rm-card-permissions">
                <button
                  className="rm-expand-btn"
                  onClick={() =>
                    setExpandedRole(expandedRole === role._id ? null : role._id)
                  }
                >
                  <ChevronRight
                    size={16}
                    style={{
                      transform:
                        expandedRole === role._id
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                  Xem quyền hạn
                </button>

                {expandedRole === role._id && (
                  <div className="rm-permissions-list">
                    {role.permissions && role.permissions.length > 0 ? (
                      <ul>
                        {role.permissions.map((perm) => {
                          const permObj = permissions.find(
                            (p) => p.name === perm
                          );
                          return (
                            <li key={perm}>
                              <Check size={14} />
                              {permObj ? permObj.displayName : perm}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="rm-no-permissions">Chưa có quyền nào</p>
                    )}
                  </div>
                )}

                <button
                  className="rm-expand-btn rm-expand-btn-restricted"
                  onClick={() =>
                    setExpandedRestrictedRole(
                      expandedRestrictedRole === role._id ? null : role._id
                    )
                  }
                >
                  <ChevronRight
                    size={16}
                    style={{
                      transform:
                        expandedRestrictedRole === role._id
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                  Quyền bị hạn chế
                  <span className="rm-restricted-count">{restrictedCount}</span>
                </button>

                {expandedRestrictedRole === role._id && (
                  <div className="rm-permissions-list rm-permissions-list-restricted">
                    {restrictedCount > 0 ? (
                      <ul>
                        {getRestrictedPermissions(role).map((perm) => (
                          <li key={perm._id}>
                            <X size={14} />
                            {perm.displayName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rm-no-permissions">
                        Không có quyền bị hạn chế (Full quyền)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rm-card-actions">
                <button
                  className="rm-btn rm-btn-edit"
                  onClick={() => handleOpenModal(role)}
                >
                  <Edit2 size={16} />
                  Sửa
                </button>
                <button
                  className="rm-btn rm-btn-delete"
                  onClick={() => handleDelete(role._id)}
                  disabled={accountCount > 0}
                  title={
                    accountCount > 0
                      ? `Không thể xóa vì có ${accountCount} tài khoản đang sử dụng`
                      : "Xóa vai trò"
                  }
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          );
        })}

        {filteredRoles.length === 0 && !loading && (
          <div className="rm-empty">
            <Shield size={48} className="rm-empty-icon" />
            <p>Không tìm thấy vai trò nào</p>
            <button
              className="rm-btn rm-btn-primary"
              onClick={() => handleOpenModal()}
            >
              <Plus size={18} />
              Tạo vai trò đầu tiên
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="rm-modal-overlay" onClick={handleCloseModal}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>{editingRole ? "Chỉnh sửa Vai trò" : "Thêm Vai trò mới"}</h2>
              <button className="rm-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rm-modal-body">
              <div className="rm-form-section">
                <h4 className="rm-section-title">Thông tin cơ bản</h4>

                <div className="rm-form-group">
                  <label>
                    Tên vai trò <span className="rm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Super Admin, Manager, Staff..."
                    className="rm-input"
                  />
                </div>

                <div className="rm-form-group">
                  <label>
                    Giá trị (slug) <span className="rm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    required
                    placeholder="super-admin, manager, staff..."
                    className="rm-input"
                  />
                  <small className="rm-hint">Tự động tạo từ tên vai trò</small>
                </div>

                <div className="rm-form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả vai trò và phạm vi quyền hạn..."
                    className="rm-input rm-textarea"
                    rows="3"
                  />
                </div>
              </div>

              <div className="rm-form-section">
                <div className="rm-section-header">
                  <h4 className="rm-section-title">Phân quyền</h4>
                  <span className="rm-permission-count">
                    Đã chọn: <strong>{formData.permissions.length}</strong>{" "}
                    quyền
                  </span>
                </div>

                <div className="rm-permissions-grid">
                  {groupPermissionsByCategory().map((category) => {
                    const isExpanded =
                      expandedCategories[category.name] === true;
                    const isFullySelected = isCategoryFullySelected(category);

                    return (
                      <div
                        key={category.name}
                        className="rm-permission-category"
                      >
                        <div className="rm-category-header">
                          <button
                            type="button"
                            className="rm-category-toggle"
                            onClick={() => toggleCategory(category.name)}
                          >
                            <ChevronDown
                              size={16}
                              style={{
                                transform: isExpanded
                                  ? "rotate(0deg)"
                                  : "rotate(-90deg)",
                                transition: "transform 0.2s",
                              }}
                            />
                            <span>{category.name}</span>
                            <span className="rm-category-badge">
                              {category.permissions.length}
                            </span>
                          </button>
                          <label className="rm-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isFullySelected}
                              onChange={() =>
                                handleSelectAllInCategory(category)
                              }
                            />
                            <span>Chọn tất cả</span>
                          </label>
                        </div>

                        {isExpanded && (
                          <div className="rm-permission-list">
                            {category.permissions.map((perm) => (
                              <label
                                key={perm._id}
                                className="rm-permission-item"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes(
                                    perm.name
                                  )}
                                  onChange={() =>
                                    handlePermissionToggle(perm.name)
                                  }
                                />
                                <div className="rm-permission-info">
                                  <span className="rm-permission-name">
                                    {perm.displayName}
                                  </span>
                                  <code className="rm-permission-code">
                                    {perm.name}
                                  </code>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rm-modal-footer">
                <button
                  type="button"
                  className="rm-btn rm-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rm-btn rm-btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading
                    ? "Đang lưu..."
                    : editingRole
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

export default RolesManagement;
