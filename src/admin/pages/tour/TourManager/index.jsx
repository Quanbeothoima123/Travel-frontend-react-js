import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import "./TourManager.css";
import { useToast } from "../../../../contexts/ToastContext";

const TOP_CONFIG = {
  TOUR_LIST: "http://localhost:5000/api/v1/admin/tours/tour",
  TOUR_BULK_UPDATE: "http://localhost:5000/api/v1/admin/tour/bulk-update",
  TOUR_SINGLE_UPDATE: "http://localhost:5000/api/v1/admin/tours/tour",
  CATEGORY_TREE_FETCH:
    "http://localhost:5000/api/v1/admin/tour-categories?tree=true",
};

export default function TourManager() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // --- URL Search Params ---
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [category, setCategory] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("active") === "true"
      ? true
      : searchParams.get("active") === "false"
      ? false
      : null
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // --- đồng bộ state -> URL ---
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (category && category._id) params.categoryId = category._id;
    if (sort) params.sort = sort;
    if (statusFilter !== null) params.active = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [searchQuery, sort, statusFilter, page, setSearchParams, category]);

  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sort, category, statusFilter, page, limit]);

  async function fetchTours() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (category && category._id) params.set("categoryId", category._id);
      if (statusFilter === true) params.set("active", "true");
      if (statusFilter === false) params.set("active", "false");
      if (sort) params.set("sort", sort);
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`${TOP_CONFIG.TOUR_LIST}?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setTours(data.data);
        setPagination(
          data.pagination || { total: 0, totalPages: 1, currentPage: 1 }
        );

        const posMap = {};
        data.data.forEach((t) => {
          posMap[t._id] = typeof t.position === "number" ? t.position : 0;
        });
        // reset positions + selected
        setSelectedIds(new Set());
        setPositions(posMap);
      } else {
        console.warn("fetchTours: unexpected response", data);
        setTours([]);
        setPagination({ total: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (e) {
      console.error("fetchTours error", e);
      showToast("Lỗi khi lấy danh sách tour", "error");
    } finally {
      setLoading(false);
    }
  }

  // selection & edits
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [positions, setPositions] = useState({});
  const [setStatusForUpdate, setSetStatusForUpdate] = useState("no_change");

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      setSearchQuery(searchInput.trim());
    }
  };

  const SORT_OPTIONS = [
    { value: "", label: "Mặc định" },
    { value: "price_desc", label: "Giá giảm dần" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "position_desc", label: "Vị trí giảm dần" },
    { value: "position_asc", label: "Vị trí tăng dần" },
    { value: "discount_desc", label: "Giảm giá giảm dần" },
    { value: "discount_asc", label: "Giảm giá tăng dần" },
    { value: "title_asc", label: "Tên A → Z" },
    { value: "title_desc", label: "Tên Z → A" },
  ];

  function toggleSelect(id) {
    setSelectedIds((s) => {
      const copy = new Set(s);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === tours.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tours.map((t) => t._id)));
    }
  }

  function onChangePosition(id, value) {
    setPositions((p) => ({ ...p, [id]: value }));
  }

  async function patchSingle(id, payload) {
    try {
      const res = await fetch(`${TOP_CONFIG.TOUR_SINGLE_UPDATE}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      console.error("patchSingle error", e);
      return false;
    }
  }

  async function handleBulkUpdate() {
    if (selectedIds.size === 0) {
      showToast("Hãy chọn ít nhất 1 tour bằng checkbox.", "error");
      return;
    }

    const ids = Array.from(selectedIds);
    const setObj = {};
    if (setStatusForUpdate === "active") setObj.active = true;
    if (setStatusForUpdate === "inactive") setObj.active = false;

    const positionsPayload = ids.map((id) => ({
      id,
      position: Number(positions[id] ?? 0),
    }));

    if (Object.keys(setObj).length === 0 && positionsPayload.length === 0) {
      showToast("Không có gì để cập nhật.", "error");
      return;
    }

    try {
      const bulkRes = await fetch(TOP_CONFIG.TOUR_BULK_UPDATE, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, set: setObj, positions: positionsPayload }),
      });

      if (bulkRes.ok) {
        showToast("Cập nhật thành công (bulk).", "success");
        await fetchTours();
        return;
      }
    } catch (e) {
      console.warn("bulk-update lỗi, fallback sang single updates", e);
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const payload = {};
        if (setObj.hasOwnProperty("active")) payload.active = setObj.active;
        if (positions[id] !== undefined)
          payload.position = Number(positions[id]);
        if (Object.keys(payload).length === 0) return true;
        return await patchSingle(id, payload);
      })
    );

    if (results.every(Boolean)) {
      showToast("Cập nhật thành công.", "success");
      await fetchTours();
    } else {
      showToast("Có lỗi khi cập nhật một số tour.", "error");
    }
  }

  async function handleToggleActiveOne(id, newActive) {
    setTours((t) =>
      t.map((x) => (x._id === id ? { ...x, active: newActive } : x))
    );
    const ok = await patchSingle(id, { active: newActive });
    if (!ok) {
      showToast("Không thể cập nhật trạng thái. Thử load lại trang.", "error");
      await fetchTours();
    }
  }

  const formatVND = (v) =>
    typeof v === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : v;

  const allSelected = selectedIds.size > 0 && selectedIds.size === tours.length;

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tour này?")) return;

    try {
      const res = await fetch(`${TOP_CONFIG.TOUR_SINGLE_UPDATE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        showToast("Xóa tour thành công.", "success");
        await fetchTours();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Xóa thất bại.", "error");
      }
    } catch (e) {
      console.error("delete error", e);
      showToast("Lỗi khi xóa tour.", "error");
    }
  }

  return (
    <div className="tm-wrap">
      {/* Bộ lọc trên cùng */}
      <div className="tm-top-controls">
        <div className="tm-left-controls">
          <div className="tm-search">
            <input
              placeholder="Tìm tour theo tên — bấm Enter để tìm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
          </div>
          <div className="tm-sort">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="tm-category">
            <CategoryTreeSelect
              fetchUrl={TOP_CONFIG.CATEGORY_TREE_FETCH}
              value={category}
              onChange={(node) => {
                setPage(1);
                setCategory(node);
              }}
              placeholder="Lọc theo danh mục…"
            />
          </div>
          <div className="tm-status-filter">
            <label>
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === null}
                onChange={() => {
                  setPage(1);
                  setStatusFilter(null);
                }}
              />{" "}
              Tất cả
            </label>
            <label>
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === true}
                onChange={() => {
                  setPage(1);
                  setStatusFilter(true);
                }}
              />
              Hoạt động
            </label>
            <label>
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === false}
                onChange={() => {
                  setPage(1);
                  setStatusFilter(false);
                }}
              />{" "}
              Không hoạt động
            </label>
          </div>
        </div>
        <div className="tm-right-controls">
          <Link to="/admin/tours/create" className="tm-add-btn">
            <FaPlusCircle /> Thêm mới tour
          </Link>
        </div>
      </div>

      {/* Action bar */}
      <div className="tm-action-bar">
        <div className="tm-action-left">
          <label>
            Đặt trạng thái cập nhật:
            <select
              value={setStatusForUpdate}
              onChange={(e) => setSetStatusForUpdate(e.target.value)}
            >
              <option value="no_change">Không thay đổi</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </label>
          <button className="tm-update-btn" onClick={handleBulkUpdate}>
            Cập nhật (cho các mục đã chọn)
          </button>
        </div>
        <div className="tm-action-right">
          <button onClick={fetchTours} className="tm-refresh">
            Cập nhật danh sách
          </button>
        </div>
      </div>

      {/* Bảng tour */}
      <div className="tm-table-wrap">
        {loading ? (
          <div className="tm-loading">Đang tải...</div>
        ) : (
          <>
            <table className="tm-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>STT</th>
                  <th>ẢNH</th>
                  <th>TÊN TOUR</th>
                  <th>TRẠNG THÁI</th>
                  <th>GIÁ TOUR</th>
                  <th>GIẢM GIÁ</th>
                  <th>GIÁ SAU GIẢM</th>
                  <th>DANH MỤC</th>
                  <th>VỊ TRÍ</th>
                  <th>LOẠI TOUR</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {tours.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ textAlign: "center", padding: "30px 0" }}
                    >
                      Không có tour
                    </td>
                  </tr>
                ) : (
                  tours.map((t, idx) => {
                    const isSelected = selectedIds.has(t._id);
                    const catTitle =
                      (t.categoryId &&
                        (t.categoryId.title || t.categoryId.name)) ||
                      t.categoryTitle ||
                      "—";
                    // --- TÍNH GIÁ SAU KHI GIẢM ---
                    const pricesNum =
                      typeof t.prices === "number"
                        ? t.prices
                        : Number(t.prices) || 0;
                    const discountPct = Number(t.discount) || 0;
                    const discountedPrice =
                      pricesNum > 0
                        ? pricesNum * (1 - discountPct / 100)
                        : null;
                    return (
                      <tr
                        key={t._id}
                        className={isSelected ? "selected-row" : ""}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(t._id)}
                          />
                        </td>
                        <td>{(page - 1) * limit + idx + 1}</td>
                        <td>
                          {t.thumbnail ? (
                            <img
                              className="tm-thumb"
                              src={t.thumbnail}
                              alt={t.title}
                            />
                          ) : (
                            <div className="tm-thumb-placeholder">Ảnh</div>
                          )}
                        </td>
                        <td>
                          <div className="tm-title">{t.title}</div>
                          <div className="tm-subinfo">
                            Slug: {t.slug || "—"} • Seats: {t.seats ?? "—"}
                          </div>
                        </td>
                        <td>
                          <label className="tm-switch">
                            <input
                              type="checkbox"
                              checked={!!t.active}
                              onChange={(e) =>
                                handleToggleActiveOne(t._id, e.target.checked)
                              }
                            />
                            <span className="tm-slider" />
                          </label>
                        </td>
                        <td>{formatVND(t.prices)}</td>
                        <td>{t.discount ? `${t.discount}%` : "—"}</td>
                        <td>
                          {discountedPrice
                            ? formatVND(Math.round(discountedPrice))
                            : "—"}
                        </td>
                        <td>{catTitle}</td>
                        <td>
                          <input
                            type="number"
                            value={positions[t._id] ?? 0}
                            onChange={(e) =>
                              onChangePosition(t._id, e.target.value)
                            }
                            className="tm-pos-input"
                          />
                        </td>
                        <td>
                          {t.type === "domestic"
                            ? "Trong nước"
                            : t.type === "aboard"
                            ? "Nước ngoài"
                            : "—"}
                        </td>
                        <td className="tm-actions">
                          <Link
                            to={`/admin/tours/detail/${t._id}`}
                            className="tm-action-link"
                          >
                            Chi tiết
                          </Link>
                          <Link
                            to={`/tours/edit/${t._id}`}
                            className="tm-action-link"
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="tm-action-delete"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="tm-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                « Trước
              </button>
              <span>
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau »
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
