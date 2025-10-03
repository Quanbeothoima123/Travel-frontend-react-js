import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import GalleryItemCard from "../../components/common/GalleryItemCard";
import GalleryCategoryTreeSelect from "../../components/common/DropDownTreeSearch/GalleryCategoryTreeSelect";
import PaginationV2 from "../../components/common/Pagination_V2";
import { FaSearch, FaSlidersH, FaTimes } from "react-icons/fa";
import "./GalleryPage.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12,
  });

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [tempFilters, setTempFilters] = useState({
    ...filters,
    galleryCategory: null, // Để hiển thị trong dropdown
  });

  const isFetching = useRef(false);

  // ✅ Dùng useCallback để tránh warning react-hooks/exhaustive-deps
  const fetchGalleries = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        keyword: filters.keyword,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // ✅ Gọi API khác nhau tùy có categorySlug hay không
      let url;
      if (categorySlug) {
        url = `${API_BASE}/api/v1/gallery/by-category/${categorySlug}?${params}`;
      } else {
        url = `${API_BASE}/api/v1/gallery/getAll?${params}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setGalleries(data.data || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 12,
          }
        );

        // ✅ Lưu thông tin category hiện tại
        if (data.category) {
          setCurrentCategory(data.category);
          setTempFilters((prev) => ({
            ...prev,
            galleryCategory: data.category,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [categorySlug, filters, pagination.currentPage, pagination.limit]);

  // ✅ Fetch galleries khi categorySlug, filters hoặc page thay đổi
  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleApplyFilters = () => {
    // ✅ Cập nhật URL khi thay đổi category
    if (tempFilters.galleryCategory?.slug) {
      // Nếu chọn category mới -> navigate đến URL mới
      const params = new URLSearchParams();
      if (tempFilters.keyword) params.set("keyword", tempFilters.keyword);
      if (tempFilters.sortBy !== "createdAt")
        params.set("sortBy", tempFilters.sortBy);
      if (tempFilters.sortOrder !== "desc")
        params.set("sortOrder", tempFilters.sortOrder);

      const queryString = params.toString();
      navigate(
        `/gallery/${tempFilters.galleryCategory.slug}${
          queryString ? `?${queryString}` : ""
        }`
      );
    } else {
      // Không có category -> về trang tất cả galleries
      const params = new URLSearchParams();
      if (tempFilters.keyword) params.set("keyword", tempFilters.keyword);
      if (tempFilters.sortBy !== "createdAt")
        params.set("sortBy", tempFilters.sortBy);
      if (tempFilters.sortOrder !== "desc")
        params.set("sortOrder", tempFilters.sortOrder);

      const queryString = params.toString();
      navigate(`/gallery/all${queryString ? `?${queryString}` : ""}`);
    }

    // ✅ Cập nhật filters (không bao gồm galleryCategory vì đã ở trong URL)
    setFilters({
      keyword: tempFilters.keyword,
      sortBy: tempFilters.sortBy,
      sortOrder: tempFilters.sortOrder,
    });

    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: "",
      galleryCategory: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setTempFilters(defaultFilters);
    setFilters({
      keyword: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    // ✅ Navigate về trang tất cả
    navigate("/gallery/all");
  };

  return (
    <div className="gp-container">
      {/* Header */}
      <div className="gp-header">
        <div className="gp-header-inner">
          <div className="gp-header-content">
            <div className="gp-header-text">
              <h1 className="gp-title">
                {currentCategory?.title || "Tất Cả Bộ Sưu Tập"}
              </h1>
              <p className="gp-subtitle">
                Khám phá {pagination.totalItems} bộ sưu tập tuyệt đẹp
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="gp-btn-filter-toggle"
            >
              <FaSlidersH className="gp-icon" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="gp-filters-panel">
          <div className="gp-filters-inner">
            <div className="gp-filters-header">
              <h3 className="gp-filters-title">Bộ lọc tìm kiếm</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="gp-btn-close"
              >
                <FaTimes className="gp-icon" />
              </button>
            </div>

            <div className="gp-filters-grid">
              {/* Search */}
              <div className="gp-filter-group">
                <label className="gp-filter-label">Tìm kiếm</label>
                <div className="gp-search-wrapper">
                  <FaSearch className="gp-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={tempFilters.keyword}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        keyword: e.target.value,
                      }))
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleApplyFilters()
                    }
                    className="gp-search-input"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="gp-filter-group">
                <label className="gp-filter-label">Danh mục</label>
                <GalleryCategoryTreeSelect
                  value={tempFilters.galleryCategory}
                  onChange={(val) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      galleryCategory: val,
                    }))
                  }
                  placeholder="Chọn danh mục..."
                />
              </div>

              {/* Sort By */}
              <div className="gp-filter-group">
                <label className="gp-filter-label">Sắp xếp theo</label>
                <select
                  value={tempFilters.sortBy}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value,
                    }))
                  }
                  className="gp-filter-select"
                >
                  <option value="createdAt">Mới nhất</option>
                  <option value="views">Xem nhiều nhất</option>
                  <option value="likes">Yêu thích nhất</option>
                  <option value="shares">Chia sẻ nhiều nhất</option>
                  <option value="title">Tên A-Z</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="gp-filter-group">
                <label className="gp-filter-label">Thứ tự</label>
                <select
                  value={tempFilters.sortOrder}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  className="gp-filter-select"
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>
            </div>

            <div className="gp-filters-actions">
              <button onClick={handleApplyFilters} className="gp-btn-apply">
                Áp dụng
              </button>
              <button onClick={handleResetFilters} className="gp-btn-reset">
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="gp-content">
        <div className="gp-content-inner">
          {loading ? (
            <div className="gp-loading">
              <div className="gp-spinner"></div>
            </div>
          ) : galleries.length === 0 ? (
            <div className="gp-empty">
              <div className="gp-empty-icon">🖼️</div>
              <h3 className="gp-empty-title">Không tìm thấy bộ sưu tập nào</h3>
              <p className="gp-empty-description">
                Thử điều chỉnh bộ lọc để xem thêm kết quả
              </p>
            </div>
          ) : (
            <>
              <div className="gp-gallery-grid">
                {galleries.map((gallery) => (
                  <GalleryItemCard key={gallery._id} item={gallery} />
                ))}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
