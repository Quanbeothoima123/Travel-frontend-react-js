// src/pages/admin/tour-categories/TourCategoryUpdate.jsx
import React, { useState, useEffect } from "react";
import { createSlug } from "../../../../utils/slugify";
import { useParams } from "react-router-dom";
import { FaSpinner, FaCheck, FaTimes, FaTags, FaLink } from "react-icons/fa";
import NewsCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/NewsCategoryTreeSelect";
import "./NewsCategoryEdit.css";
import { useToast } from "../../../../contexts/ToastContext";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function NewsCategoryEdit({ onUpdated = null }) {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentNode, setParentNode] = useState(null);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  // Fetch dữ liệu chi tiết danh mục
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/admin/news-category/detail/${id}`
        );
        const data = await res.json();
        if (!res.ok)
          showToast(data?.message || "Không thể tải dữ liệu", "error");
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setParentNode(data.parent || null);
        setActive(data.active ?? true);
      } catch (err) {
        showToast("Không thể tải dữ liệu danh mục", "error");
      }
    };
    fetchData();
  }, [id]);

  // Reset message/error sau vài giây
  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề danh mục.");
      return;
    }
    if (!slug.trim()) {
      setError("Vui lòng nhập slug.");
      return;
    }

    const body = {
      title: title.trim(),
      slug: slug.trim(),
      parentId: parentNode?._id || null,
      active: !!active,
    };

    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_BASE}/api/v1/admin/news-category/update/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || data?.error || "Lỗi server");
      setMessage("Cập nhật danh mục thành công!");
      onUpdated?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ncae-wrap">
      <form className="ncae-form" onSubmit={handleSubmit}>
        <div className="ncae-row">
          <label className="ncae-label">
            <FaTags /> Tiêu đề
          </label>
          <input
            className="ncae-input"
            placeholder="Ví dụ: Du lịch Đà Lạt"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="ncae-row">
          <label className="ncae-label">
            <FaLink /> Slug
          </label>
          <div className="ncae-slug-wrap">
            <input
              className="ncae-input-slug"
              placeholder="Ví dụ: du-lich-da-lat"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={160}
              required
            />
            <button
              type="button"
              className="ncae-auto-btn"
              onClick={() => setSlug(createSlug(title))}
            >
              Lấy tự động
            </button>
          </div>
        </div>

        <div className="ncae-row">
          <label className="ncae-label">Danh mục cha</label>
          <NewsCategoryTreeSelect
            value={
              parentNode
                ? { _id: parentNode._id, title: parentNode.title }
                : null
            }
            onChange={(node) => setParentNode(node)}
            fetchUrl={`${API_BASE}/api/v1/admin/news-category/getAll?tree=true`}
            placeholder="Chọn danh mục cha (nếu có)…"
            noDataText="Chưa có danh mục"
          />
        </div>

        <div className="ncae-row ncae-row-inline">
          <label className="ncae-label">Kích hoạt</label>
          <div className="ncae-switch" onClick={() => setActive((a) => !a)}>
            <div className={`ncae-toggle ${active ? "on" : "off"}`}>
              {active ? <FaCheck /> : <FaTimes />}
            </div>
            <span className="ncae-flag">{active ? "Đang bật" : "Đã tắt"}</span>
          </div>
        </div>

        <div className="ncae-actions">
          <button className="ncae-submit" type="submit" disabled={submitting}>
            {submitting ? <FaSpinner className="spin" /> : "Cập nhật"}
          </button>
        </div>

        {(message || error) && (
          <div className={`ncae-notice ${error ? "err" : "ok"}`}>
            {error ? <FaTimes /> : <FaCheck />} {error || message}
          </div>
        )}
      </form>
    </div>
  );
}
