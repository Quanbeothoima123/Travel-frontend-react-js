import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../../../contexts/ToastContext";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import GalleryCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/GalleryCategoryTreeSelect";
import TourSearchSelect from "../../../../components/common/DropDownTreeSearch/TourSearchSelect";
import PaginationV2 from "../../../../components/common/Pagination_V2";
import LoadingModal from "../../../components/common/LoadingModal";
import "./GalleryManager.css";
import ConfirmModal from "../../../components/common/ConfirmModal";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryManager = () => {
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idGalleryDelete, setIdGalleryDelete] = useState(null);
  const [nameGalleryDelete, setNameGalleryDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Filters
  const [filters, setFilters] = useState({
    keyword: "",
    tour: null,
    tourCategory: null,
    galleryCategory: null,
    sortBy: "createdAt",
    sortOrder: "desc",
    mediaType: "all",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  // ✅ FIX: Chỉ trigger khi cần thiết
  useEffect(() => {
    fetchGalleries();
  }, [pagination.currentPage, filters]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        keyword: filters.keyword,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        mediaType: filters.mediaType,
      });

      if (filters.tour?._id) {
        params.append("tour", filters.tour._id);
      }
      if (filters.tourCategory?._id) {
        params.append("tourCategory", filters.tourCategory._id);
      }
      if (filters.galleryCategory?._id) {
        params.append("galleryCategory", filters.galleryCategory._id);
      }

      const res = await fetch(
        `${API_BASE}/api/v1/admin/gallery/manager?${params}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setGalleries(data.data || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 10,
          }
        );
      } else {
        showToast(data.message || "Không thể tải danh sách gallery", "error");
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
      showToast("Có lỗi xảy ra khi tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    // ✅ FIX: Batch update để tránh double render
    setFilters({ ...tempFilters });
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: "",
      tour: null,
      tourCategory: null,
      galleryCategory: null,
      sortBy: "createdAt",
      sortOrder: "desc",
      mediaType: "all",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/gallery/toggle-active/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        setGalleries((prev) =>
          prev.map((g) => (g._id === id ? { ...g, active: data.active } : g))
        );
      } else {
        showToast(data.message || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/gallery/delete/${idGalleryDelete}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        setConfirmDelete(false);
        setIdGalleryDelete(null);
        setNameGalleryDelete("");
        fetchGalleries();
      } else {
        showToast(data.message || "Có lỗi xảy ra", "error");
        setConfirmDelete(false);
      }
    } catch (error) {
      console.error("Error deleting gallery:", error);
      showToast("Có lỗi xảy ra", "error");
      setConfirmDelete(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const calculateRowNumber = (index) => {
    const currentPage = pagination.currentPage || 1;
    const limit = pagination.limit || 10;
    return (currentPage - 1) * limit + index + 1;
  };

  return (
    <div className="gallery-manager">
      <LoadingModal open={loading} message="Đang xử lý..." icon="FaSpinner" />

      <div className="gm-header">
        <h1>Quản lý Gallery</h1>
        <Link to="/admin/gallery/create" className="gm-btn-create">
          + Tạo Gallery mới
        </Link>
      </div>

      {/* Filters */}
      <div className="gm-filters">
        <div className="gm-filter-row">
          <div className="gm-filter-group">
            <label>Tìm kiếm theo tên</label>
            <input
              type="text"
              placeholder="Nhập tên gallery..."
              value={tempFilters.keyword}
              onChange={(e) =>
                setTempFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
              onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
            />
          </div>

          <div className="gm-filter-group">
            <label>Danh mục Gallery</label>
            <GalleryCategoryTreeSelect
              value={tempFilters.galleryCategory}
              onChange={(val) =>
                setTempFilters((prev) => ({ ...prev, galleryCategory: val }))
              }
              placeholder="Chọn danh mục..."
            />
          </div>

          <div className="gm-filter-group">
            <label>Danh mục Tour</label>
            <CategoryTreeSelect
              value={tempFilters.tourCategory}
              onChange={(val) =>
                setTempFilters((prev) => ({ ...prev, tourCategory: val }))
              }
              placeholder="Chọn danh mục tour..."
            />
          </div>

          <div className="gm-filter-group">
            <label>Tour</label>
            <TourSearchSelect
              categorySlug={tempFilters.tourCategory?.slug}
              value={tempFilters.tour}
              onChange={(val) =>
                setTempFilters((prev) => ({ ...prev, tour: val }))
              }
              placeholder="Chọn tour..."
            />
          </div>
        </div>

        <div className="gm-filter-row">
          <div className="gm-filter-group">
            <label>Loại media</label>
            <select
              value={tempFilters.mediaType}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  mediaType: e.target.value,
                }))
              }
            >
              <option value="all">Tất cả</option>
              <option value="images">Chỉ ảnh</option>
              <option value="videos">Chỉ video</option>
              <option value="both">Cả ảnh và video</option>
            </select>
          </div>

          <div className="gm-filter-group">
            <label>Sắp xếp theo</label>
            <select
              value={tempFilters.sortBy}
              onChange={(e) =>
                setTempFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="views">Lượt xem</option>
              <option value="likes">Lượt thích</option>
              <option value="shares">Lượt chia sẻ</option>
              <option value="title">Tên</option>
            </select>
          </div>

          <div className="gm-filter-group">
            <label>Thứ tự</label>
            <select
              value={tempFilters.sortOrder}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  sortOrder: e.target.value,
                }))
              }
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          <div className="gm-filter-actions">
            <button onClick={handleApplyFilters} className="gm-btn-apply">
              Áp dụng
            </button>
            <button onClick={handleResetFilters} className="gm-btn-reset">
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Results info */}
      <div className="gm-results-info">
        <span>
          Tìm thấy <strong>{pagination.totalItems || 0}</strong> kết quả
        </span>
      </div>

      {/* Table */}
      <div className="gm-table-container">
        <table className="gm-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Gallery</th>
              <th>Ngày tạo</th>
              <th>Người tạo</th>
              <th>Lượt xem</th>
              <th>Lượt thích</th>
              <th>Chia sẻ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {galleries.length === 0 ? (
              <tr>
                <td colSpan="9" className="gm-empty">
                  Không có gallery nào
                </td>
              </tr>
            ) : (
              galleries.map((gallery, idx) => (
                <tr key={gallery._id}>
                  <td>{calculateRowNumber(idx)}</td>
                  <td>
                    <Link
                      to={`/admin/gallery/detail/${gallery._id}`}
                      className="gm-gallery-info"
                    >
                      <img
                        src={gallery.thumbnail || "/placeholder.jpg"}
                        alt={gallery.title}
                        className="gm-thumbnail"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                      <span className="gm-title">{gallery.title || "N/A"}</span>
                    </Link>
                  </td>
                  <td>{formatDate(gallery.createdAt)}</td>
                  <td>{gallery.createdBy?._id?.fullName || "N/A"}</td>
                  <td>{gallery.views || 0}</td>
                  <td>{gallery.likes || 0}</td>
                  <td>{gallery.shares || 0}</td>
                  <td>
                    <label className="gm-switch">
                      <input
                        type="checkbox"
                        checked={gallery.active !== false}
                        onChange={() =>
                          handleToggleActive(gallery._id, gallery.active)
                        }
                      />
                      <span className="gm-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="gm-actions">
                      <Link
                        to={`/admin/gallery/detail/${gallery._id}`}
                        className="gm-btn-action gm-btn-detail"
                        title="Chi tiết"
                      >
                        👁️
                      </Link>
                      <Link
                        to={`/admin/gallery/edit/${gallery._id}`}
                        className="gm-btn-action gm-btn-edit"
                        title="Sửa"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => {
                          setIdGalleryDelete(gallery._id);
                          setConfirmDelete(true);
                          setNameGalleryDelete(gallery.title);
                        }}
                        className="gm-btn-action gm-btn-delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationV2
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      )}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn đồng ý xóa bộ sưu tập ${nameGalleryDelete} chứ?`}
      />
    </div>
  );
};

export default GalleryManager;
