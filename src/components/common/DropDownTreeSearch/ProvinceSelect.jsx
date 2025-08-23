// src/components/booking/ProvinceSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tree-dropdown.css";

export default function ProvinceSelect({
  value, // { code, name_with_type } | null
  onChange, // (prov) => void
  placeholder = "Chọn tỉnh/thành phố…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/province", {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) setProvinces(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return provinces;
    return provinces.filter((p) =>
      p.name_with_type?.toLowerCase().includes(needle)
    );
  }, [provinces, q]);

  const pick = (p) => {
    onChange?.(p);
    setOpen(false);
  };

  return (
    <div className="tdp-field" ref={ref}>
      <div
        className={`tdp-control ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`tdp-placeholder ${value ? "has-value" : ""}`}>
          {value ? value.name_with_type : placeholder}
        </span>
        <span className="tdp-caret">▾</span>
      </div>
      {open && (
        <div className="tdp-menu">
          <div className="tdp-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tỉnh/thành…"
            />
          </div>
          <div className="tdp-list">
            {loading ? (
              <div className="tdp-empty">Đang tải…</div>
            ) : filtered.length === 0 ? (
              <div className="tdp-empty">Không có tỉnh/thành phù hợp</div>
            ) : (
              <ul className="tdp-flat">
                {filtered.map((p) => (
                  <li key={p.code}>
                    <button
                      type="button"
                      className="tdp-label"
                      onClick={() => pick(p)}
                      title={p.name_with_type}
                    >
                      {p.name_with_type}
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
