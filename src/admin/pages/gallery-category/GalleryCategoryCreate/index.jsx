import React, { useState, useEffect } from "react";
import { FaSpinner, FaCheck, FaTimes, FaTags } from "react-icons/fa";
import GalleryCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/GalleryCategoryTreeSelect";
import "./GalleryCategoryCreate.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function GalleryCategoryCreate({
  apiUrl = `${API_BASE}/api/v1/admin/gallery-category/create`,
  onCreated = null,
}) {
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
    <div className="gcac-wrap">
      <form className="gcac-form" onSubmit={handleSubmit}>
        <div className="gcac-row">
          <label className="gcac-label">
            <FaTags /> Tiêu đề
          </label>
          <input
            className="gcac-input"
            placeholder="Ví dụ: Hình ảnh đẹp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="gcac-row">
          <label className="gcac-label">Danh mục cha</label>
          <GalleryCategoryTreeSelect
            value={parentNode ? { title: parentNode.title } : null}
            onChange={(node) => setParentNode(node)}
            fetchUrl={`${API_BASE}/api/v1/admin/gallery-category/getAll?tree=true`}
            placeholder="Chọn danh mục cha (nếu có)…"
            noDataText="Chưa có danh mục"
          />
        </div>

        <div className="gcac-row gcac-row-inline">
          <label className="gcac-label">Kích hoạt</label>
          <div className="gcac-switch" onClick={() => setActive((a) => !a)}>
            <div className={`gcac-toggle ${active ? "on" : "off"}`}>
              {active ? <FaCheck /> : <FaTimes />}
            </div>
            <span className="gcac-flag">{active ? "Đang bật" : "Đã tắt"}</span>
          </div>
        </div>

        <div className="gcac-actions">
          <button className="gcac-submit" type="submit" disabled={submitting}>
            {submitting ? <FaSpinner className="spin" /> : "Tạo"}
          </button>
        </div>

        {(message || error) && (
          <div className={`gcac-notice ${error ? "err" : "ok"}`}>
            {error ? <FaTimes /> : <FaCheck />} {error || message}
          </div>
        )}
      </form>
    </div>
  );
}
