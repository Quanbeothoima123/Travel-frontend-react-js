import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaBirthdayCake,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
} from "react-icons/fa";
import ProvinceSelect from "../DropDownTreeSearch/ProvinceSelect";
import WardSelect from "../DropDownTreeSearch/WardSelect";
import ImageUploader from "../../../admin/pages/tour/TourCreate/ImageUploader";
import "./UserProfile.css";
import { useToast } from "../../../contexts/ToastContext";
import LoadingModal from "../../../admin/components/common/LoadingModal";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    refetchUserData();
  }, []);

  const refetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
        credentials: "include",
      });
      const data = res.ok ? await res.json() : null;
      setUser(data || null);
    } catch {
      showToast("Không thể tải thông tin người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Cập nhật thất bại", "error");
        return;
      }

      if (data && (data._id || data.id || data.email)) {
        setUser(data); // server trả user object
      } else {
        await refetchUserData(); // server chỉ trả message
      }

      showToast("Cập nhật thành công", "success");
    } catch (err) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="upf-loading">Đang tải...</div>;

  return (
    <div className="upf-container">
      {/* Upload Loading Modal */}
      <LoadingModal
        open={uploadLoading}
        message="Đang tải ảnh lên..."
        icon="FaCloudUploadAlt"
      />
      <div className="upf-card">
        <h2>Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit} className="upf-form">
          <div className="upf-avatar-section">
            <ImageUploader
              onUpload={(url) => setUser({ ...user, avatar: url })}
              onUploadStart={() => setUploadLoading(true)}
              onUploadEnd={() => setUploadLoading(false)}
              multiple={false}
            />
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="upf-avatar-preview"
            />
          </div>

          <div className="upf-form-grid">
            <div className="upf-form-group">
              <label>
                <FaUser /> Họ & Tên
              </label>
              <input
                type="text"
                value={user?.fullName || ""}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              />
            </div>

            <div className="upf-form-group">
              <label>
                <FaBirthdayCake /> Ngày sinh
              </label>
              <input
                type="date"
                value={user?.birthDay?.slice(0, 10) || ""}
                onChange={(e) => setUser({ ...user, birthDay: e.target.value })}
              />
            </div>

            <div className="upf-form-group">
              <label>
                <FaVenusMars /> Giới tính
              </label>
              <select
                value={user?.sex || ""}
                onChange={(e) => setUser({ ...user, sex: e.target.value })}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="upf-form-group">
              <label>
                <FaPhone /> Số điện thoại
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>

            <div className="upf-form-group">
              <label>
                <FaMapMarkerAlt /> Địa chỉ
              </label>
              <input
                type="text"
                value={user?.address || ""}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
              />
            </div>

            <div className="upf-form-group">
              <label>Tỉnh/Thành phố</label>
              <ProvinceSelect
                value={user?.province}
                onChange={(p) =>
                  setUser((prev) => ({ ...prev, province: p, ward: null }))
                }
              />
            </div>

            <div className="upf-form-group">
              <label>Phường/Xã</label>
              <WardSelect
                provinceCode={user?.province?.code}
                value={user?.ward}
                onChange={(w) => setUser((prev) => ({ ...prev, ward: w }))}
              />
            </div>
          </div>

          <div className="upf-actions">
            <button type="submit" className="upf-btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
