import React, { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  CheckCircle,
  Shield,
  Eye,
  Plus,
  FileEdit,
  Trash2,
} from "lucide-react";
import "./RolePermissionsAssignment.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const RolePermissionsAssignment = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionsMatrix, setPermissionsMatrix] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Module categories
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

  const ACTION_ICONS = {
    view: Eye,
    create: Plus,
    edit: FileEdit,
    delete: Trash2,
    manage: Shield,
  };

  const ACTION_COLORS = {
    view: "#10b981",
    create: "#3b82f6",
    edit: "#f59e0b",
    delete: "#ef4444",
    manage: "#8b5cf6",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/role`, { credentials: "include" }),
        fetch(`${API_BASE}/api/v1/admin/permission`, {
          credentials: "include",
        }),
      ]);

      if (!rolesRes.ok || !permsRes.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      setRoles(rolesData);
      setPermissions(permsData);

      const matrix = {};
      rolesData.forEach((role) => {
        matrix[role._id] = role.permissions || [];
      });
      setPermissionsMatrix(matrix);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (roleId, permissionName) => {
    setPermissionsMatrix((prev) => {
      const rolePerms = prev[roleId] || [];
      const newPerms = rolePerms.includes(permissionName)
        ? rolePerms.filter((p) => p !== permissionName)
        : [...rolePerms, permissionName];

      return { ...prev, [roleId]: newPerms };
    });
    setHasChanges(true);
  };

  const handleToggleAllInModule = (roleId, module) => {
    const modulePerms = permissions
      .filter((p) => p.module === module)
      .map((p) => p.name);

    const rolePerms = permissionsMatrix[roleId] || [];
    const allSelected = modulePerms.every((p) => rolePerms.includes(p));

    setPermissionsMatrix((prev) => {
      const newPerms = allSelected
        ? rolePerms.filter((p) => !modulePerms.includes(p))
        : [...new Set([...rolePerms, ...modulePerms])];

      return { ...prev, [roleId]: newPerms };
    });
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const rolesData = roles.map((role) => ({
        roleId: role._id,
        permissions: permissionsMatrix[role._id] || [],
      }));

      const response = await fetch(
        `${API_BASE}/api/v1/admin/role/update-permissions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roles: rolesData }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Không thể cập nhật phân quyền");

      setSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    return MODULE_CATEGORIES.map((cat) => ({
      ...cat,
      modules: cat.modules
        .map((module) => ({
          module,
          permissions: permissions.filter((p) => p.module === module),
        }))
        .filter((m) => m.permissions.length > 0),
    })).filter((cat) => cat.modules.length > 0);
  };

  const isModuleFullySelected = (roleId, module) => {
    const modulePerms = permissions
      .filter((p) => p.module === module)
      .map((p) => p.name);
    const rolePerms = permissionsMatrix[roleId] || [];
    return (
      modulePerms.length > 0 && modulePerms.every((p) => rolePerms.includes(p))
    );
  };

  const ActionIcon = ({ action }) => {
    const Icon = ACTION_ICONS[action] || Eye;
    return <Icon size={14} style={{ color: ACTION_COLORS[action] }} />;
  };

  return (
    <div className="rpa-container">
      <div className="rpa-header">
        <div>
          <h1 className="rpa-title">Phân quyền theo Vai trò</h1>
          <p className="rpa-subtitle">
            Quản lý quyền truy cập cho từng vai trò trong hệ thống
          </p>
        </div>
        <button
          className="rpa-btn rpa-btn-primary"
          onClick={handleSubmit}
          disabled={!hasChanges || loading}
        >
          <Save size={20} />
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {error && (
        <div className="rpa-alert rpa-alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rpa-alert rpa-alert-success">
          <CheckCircle size={20} />
          <span>Cập nhật phân quyền thành công!</span>
        </div>
      )}

      {hasChanges && !loading && (
        <div className="rpa-alert rpa-alert-warning">
          <AlertCircle size={20} />
          <span>
            Bạn có thay đổi chưa lưu. Nhấn "Lưu thay đổi" để cập nhật.
          </span>
        </div>
      )}

      {loading && permissions.length === 0 && (
        <div className="rpa-loading">Đang tải dữ liệu...</div>
      )}

      {roles.length === 0 && !loading && (
        <div className="rpa-empty">
          <Shield size={48} />
          <p>Chưa có vai trò nào. Vui lòng tạo vai trò trước.</p>
        </div>
      )}

      {roles.length > 0 && permissions.length > 0 && (
        <div className="rpa-content">
          {getPermissionsByCategory().map((category) => (
            <div key={category.name} className="rpa-category">
              <h2 className="rpa-category-title">{category.name}</h2>

              {category.modules.map(({ module, permissions: modulePerms }) => (
                <div key={module} className="rpa-module-section">
                  <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                      <thead>
                        <tr>
                          <th className="rpa-th-permission">
                            {permissions.find((p) => p.module === module)
                              ?.module || module}
                          </th>
                          {roles.map((role) => (
                            <th key={role._id} className="rpa-th-role">
                              <div className="rpa-role-header">
                                <span className="rpa-role-name">
                                  {role.title}
                                </span>
                                <label className="rpa-select-all">
                                  <input
                                    type="checkbox"
                                    checked={isModuleFullySelected(
                                      role._id,
                                      module
                                    )}
                                    onChange={() =>
                                      handleToggleAllInModule(role._id, module)
                                    }
                                  />
                                  <span>Tất cả</span>
                                </label>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modulePerms.map((perm) => (
                          <tr key={perm._id}>
                            <td className="rpa-td-permission">
                              <div className="rpa-permission-info">
                                <ActionIcon action={perm.action} />
                                <span>{perm.displayName}</span>
                              </div>
                            </td>
                            {roles.map((role) => {
                              const isChecked = (
                                permissionsMatrix[role._id] || []
                              ).includes(perm.name);
                              return (
                                <td key={role._id} className="rpa-td-checkbox">
                                  <label className="rpa-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() =>
                                        handleTogglePermission(
                                          role._id,
                                          perm.name
                                        )
                                      }
                                    />
                                    <span className="rpa-checkmark"></span>
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Summary Section */}
          <div className="rpa-summary">
            <h3 className="rpa-summary-title">Tổng quan phân quyền</h3>
            <div className="rpa-summary-grid">
              {roles.map((role) => {
                const permCount = (permissionsMatrix[role._id] || []).length;
                const percentage = (
                  (permCount / permissions.length) *
                  100
                ).toFixed(0);

                return (
                  <div key={role._id} className="rpa-summary-card">
                    <div className="rpa-summary-header">
                      <Shield size={20} />
                      <h4>{role.title}</h4>
                    </div>
                    <div className="rpa-summary-stats">
                      <span className="rpa-summary-count">{permCount}</span>
                      <span className="rpa-summary-total">
                        / {permissions.length} quyền
                      </span>
                    </div>
                    <div className="rpa-summary-percentage">
                      {percentage}% quyền hạn
                    </div>
                    <div className="rpa-summary-bar">
                      <div
                        className="rpa-summary-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsAssignment;
