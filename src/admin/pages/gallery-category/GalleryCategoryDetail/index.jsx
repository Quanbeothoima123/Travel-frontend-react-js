import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import "./GalleryCategoryDetail.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const GalleryCategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/admin/gallery-category/detail/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setCategory(data);
      } catch (error) {
        console.error("Lỗi fetch category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) return <div className="category-detail">Đang tải...</div>;
  if (!category)
    return <div className="category-detail">Không tìm thấy dữ liệu</div>;

  return (
    <div className="category-detail">
      <div className="header-actions">
        <Link to="/admin/gallery-category" className="btn back-btn">
          <FaArrowLeft /> Quay lại
        </Link>
        <Link
          to={`/admin/gallery-category/edit/${id}`}
          className="btn edit-btn"
        >
          <FaEdit /> Cập nhật
        </Link>
      </div>

      <h2>Chi tiết danh mục tin tức</h2>
      <div className="detail-card">
        <div className="detail-row">
          <span className="label">Tên danh mục:</span>
          <span>{category.title || "Chưa có thông tin"}</span>
        </div>

        <div className="detail-row">
          <span className="label">Slug:</span>
          <span>{category.slug || "Chưa có thông tin"}</span>
        </div>

        <div className="detail-row">
          <span className="label">Danh mục cha:</span>
          <span>{category.parent?.title || "Chưa có thông tin"}</span>
        </div>

        <div className="detail-row">
          <span className="label">Trạng thái:</span>
          <span className={category.active ? "active" : "inactive"}>
            {category.active ? "Đang hoạt động" : "Ngừng hoạt động"}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Xóa mềm:</span>
          <span>{category.deleted ? "Đã xóa" : "Chưa xóa"}</span>
        </div>

        <div className="detail-row">
          <span className="label">Ngày tạo:</span>
          <span>
            {category.createdAt
              ? new Date(category.createdAt).toLocaleString()
              : "Chưa có thông tin"}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Ngày cập nhật:</span>
          <span>
            {category.updatedAt
              ? new Date(category.updatedAt).toLocaleString()
              : "Chưa có thông tin"}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Ngày xóa:</span>
          <span>
            {category.deletedAt
              ? new Date(category.deletedAt).toLocaleString()
              : "Chưa có thông tin"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GalleryCategoryDetail;
