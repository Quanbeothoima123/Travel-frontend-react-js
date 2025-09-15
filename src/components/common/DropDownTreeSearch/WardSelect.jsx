// src/components/booking/WardSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tree-dropdown.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function WardSelect({
  provinceCode, // code của province đã chọn
  value, // { code, name_with_type } | null
  onChange, // (ward) => void
  placeholder = "Chọn phường/xã…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
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
      if (!provinceCode) {
        setWards([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/wards/${provinceCode}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) setWards(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [provinceCode]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return wards;
    return wards.filter((w) =>
      w.name_with_type?.toLowerCase().includes(needle)
    );
  }, [wards, q]);

  const pick = (w) => {
    onChange?.(w);
    setOpen(false);
  };

  const disabled = !provinceCode;

  return (
    <div className={`tdp-field ${disabled ? "is-disabled" : ""}`} ref={ref}>
      <div
        className={`tdp-control ${open ? "is-open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={`tdp-placeholder ${value ? "has-value" : ""}`}>
          {value ? value.name_with_type : placeholder}
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
              placeholder="Tìm phường/xã…"
            />
          </div>
          <div className="tdp-list">
            {loading ? (
              <div className="tdp-empty">Đang tải…</div>
            ) : filtered.length === 0 ? (
              <div className="tdp-empty">Không có phường/xã phù hợp</div>
            ) : (
              <ul className="tdp-flat">
                {filtered.map((w) => (
                  <li key={w.code}>
                    <button
                      type="button"
                      className="tdp-label"
                      onClick={() => pick(w)}
                      title={w.name_with_type}
                    >
                      {w.name_with_type}
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
