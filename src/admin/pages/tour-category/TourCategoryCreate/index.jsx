import React, { useState, useEffect } from "react";
import { FaSpinner, FaCheck, FaTimes, FaTags } from "react-icons/fa";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import "./TourCategoryCreate.css";

export default function TourCategoryCreate({
  apiUrl = `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/admin/tour-categories/create`,
  onCreated = null,
}) {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const [title, setTitle] = useState("");
  const [parentNode, setParentNode] = useState(null);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

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
    const body = {
      title: title.trim(),
      parentId: parentNode?._id || null,
      active: !!active,
    };

    try {
      setSubmitting(true);
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || data?.error || "Lỗi server");
      setMessage("Tạo danh mục thành công!");
      setTitle("");
      setParentNode(null);
      setActive(true);
      onCreated?.(data);
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
          <label className="tcat-label">Danh mục cha</label>
          <CategoryTreeSelect
            value={parentNode ? { title: parentNode.title } : null}
            onChange={(node) => setParentNode(node)}
            fetchUrl={`${API_BASE}/api/v1/admin/tour-categories/get-all-category?tree=true`}
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
            {submitting ? <FaSpinner className="spin" /> : "Tạo"}
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
