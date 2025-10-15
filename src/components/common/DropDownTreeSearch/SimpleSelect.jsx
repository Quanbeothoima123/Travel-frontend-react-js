// SimpleSelect.jsx
import React, { useEffect, useState, useRef } from "react";
import "./tree-dropdown.css";

export default function SimpleSelect({
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className="tdp-field" ref={ref}>
      <div
        className={`tdp-control ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`tdp-placeholder ${value ? "has-value" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="tdp-caret">▾</span>
      </div>
      {open && (
        <div className="tdp-menu">
          <div className="tdp-list">
            <ul className="tdp-flat">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className="tdp-label"
                    onClick={() => pick(opt)}
                    title={opt.label}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
