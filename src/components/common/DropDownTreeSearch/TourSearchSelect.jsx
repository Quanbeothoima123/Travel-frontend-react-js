// src/components/booking/TourSearchSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tree-dropdown.css";

export default function TourSearchSelect({
  categorySlug, // slug category đã chọn
  value, // { slug, title } | null
  onChange, // (tour) => void
  fetchBase = "http://localhost:5000/api/v1/tour-list-by-category", // + /:slug
  placeholder = "Chọn tour…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const ref = useRef(null);

  // đóng khi click ngoài
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // fetch khi categorySlug đổi
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!categorySlug) {
        setTours([]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`${fetchBase}/${categorySlug}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) setTours(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [categorySlug, fetchBase]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tours;
    return tours.filter((t) => t.title?.toLowerCase().includes(needle));
  }, [tours, q]);

  const pick = (t) => {
    onChange?.(t);
    setOpen(false);
  };

  const disabled = !categorySlug;

  return (
    <div className={`tdp-field ${disabled ? "is-disabled" : ""}`} ref={ref}>
      <div
        className={`tdp-control ${open ? "is-open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={`tdp-placeholder ${value ? "has-value" : ""}`}>
          {value ? value.title : placeholder}
        </span>
        <span className="tdp-caret">▾</span>
      </div>

      {open && !disabled && (
        <div className="tdp-menu">
          <div className="tdp-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tour…"
            />
          </div>
          <div className="tdp-list">
            {loading ? (
              <div className="tdp-empty">Đang tải…</div>
            ) : filtered.length === 0 ? (
              <div className="tdp-empty">Không có tour phù hợp</div>
            ) : (
              <ul className="tdp-flat">
                {filtered.map((t) => (
                  <li key={t.slug}>
                    <button
                      type="button"
                      className="tdp-label"
                      onClick={() => pick(t)}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
