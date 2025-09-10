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

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/user/profile", {
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
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) showToast(data?.message || "Cập nhật thất bại", "error");
      setUser(data || user);
      showToast("Cập nhật thành công", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="user-profile container">
      <div className="card profile-card">
        <h2>Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="avatar-section">
            <ImageUploader
              onUpload={(url) => setUser({ ...user, avatar: url })}
            />
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="avatar-preview"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <FaUser /> Họ & Tên
              </label>
              <input
                type="text"
                value={user?.fullName || ""}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                <FaBirthdayCake /> Ngày sinh
              </label>
              <input
                type="date"
                value={user?.birthDay?.slice(0, 10) || ""}
                onChange={(e) => setUser({ ...user, birthDay: e.target.value })}
              />
            </div>
            <div className="form-group">
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
            <div className="form-group">
              <label>
                <FaPhone /> Số điện thoại
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Địa chỉ
              </label>
              <input
                type="text"
                value={user?.address || ""}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tỉnh/Thành phố</label>
              <ProvinceSelect
                value={user?.province}
                onChange={(p) => setUser({ ...user, province: p })}
              />
            </div>
            <div className="form-group">
              <label>Phường/Xã</label>
              <WardSelect
                provinceCode={user?.province}
                value={user?.ward}
                onChange={(w) => setUser({ ...user, ward: w })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
