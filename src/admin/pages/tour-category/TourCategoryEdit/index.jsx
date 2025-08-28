// src/pages/admin/tour-categories/TourCategoryUpdate.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner, FaCheck, FaTimes, FaTags, FaLink } from "react-icons/fa";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import "./TourCategoryUpdate.css";

export default function TourCategoryUpdate({
  apiUrl = "http://localhost:5000/api/v1/tour-categories?tree=true",
  onUpdated = null,
}) {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentNode, setParentNode] = useState(null);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch dữ liệu cũ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/detail/${id}`);
        const data = await res.json();
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setParentNode(data.parent || null);
        setActive(data.active ?? true);
      } catch (err) {
        setError("Không thể tải dữ liệu danh mục");
      }
    };
    fetchData();
  }, [id, apiUrl]);

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
      const res = await fetch(`${apiUrl}/update/${id}`, {
        method: "PATCH", // ✅ patch
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
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
    <div className="tcat-wrap">
      <form className="tcat-form" onSubmit={handleSubmit}>
        <div className="tcat-row">
          <label className="tcat-label">
            <FaTags /> Tiêu đề
          </label>
          <input
            className="tcat-input"
            placeholder="Ví dụ: Du lịch Đà Lạt"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="tcat-row">
          <label className="tcat-label">
            <FaLink /> Slug
          </label>
          <input
            className="tcat-input-slug"
            placeholder="Ví dụ: du-lich-da-lat"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            maxLength={160}
            required
          />
        </div>

        <div className="tcat-row">
          <label className="tcat-label">Danh mục cha</label>
          <CategoryTreeSelect
            value={
              parentNode
                ? { _id: parentNode._id, title: parentNode.title }
                : null
            }
            onChange={(node) => setParentNode(node)}
            fetchUrl="http://localhost:5000/api/v1/tour-categories?tree=true"
            placeholder="Chọn danh mục cha (nếu có)…"
            noDataText="Chưa có danh mục"
          />
        </div>

        <div className="tcat-row tcat-row-inline">
          <label className="tcat-label">Kích hoạt</label>
          <div className="tcat-switch" onClick={() => setActive((a) => !a)}>
            <div className={`tcat-toggle ${active ? "on" : "off"}`}>
              {active ? <FaCheck /> : <FaTimes />}
            </div>
            <span className="tcat-flag">{active ? "Đang bật" : "Đã tắt"}</span>
          </div>
        </div>

        <div className="tcat-actions">
          <button className="tcat-submit" type="submit" disabled={submitting}>
            {submitting ? <FaSpinner className="spin" /> : "Cập nhật"}
          </button>
        </div>

        {(message || error) && (
          <div className={`tcat-notice ${error ? "err" : "ok"}`}>
            {error ? <FaTimes /> : <FaCheck />} {error || message}
          </div>
        )}
      </form>
    </div>
  );
}
