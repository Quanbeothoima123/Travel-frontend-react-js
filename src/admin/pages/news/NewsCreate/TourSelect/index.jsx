import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./TourSelect.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

export default function TourSelect({
  value = [],
  onChange,
  placeholder = "Chọn tour liên quan...",
  multiple = true,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
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
        const res = await fetch(
          `${API_BASE}/api/v1/admin/tours/get-id-title?limit=100`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (mounted) setTours(data.tours || []);
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
    if (!needle) return tours;
    return tours.filter(
      (tour) =>
        tour.title?.toLowerCase().includes(needle) ||
        tour.code?.toLowerCase().includes(needle)
    );
  }, [tours, q]);

  const selectedTours = useMemo(() => {
    if (!multiple) return value ? [value] : [];
    return Array.isArray(value) ? value : [];
  }, [value, multiple]);

  const isSelected = (tour) => {
    if (multiple) {
      return selectedTours.some(
        (selected) => selected._id === tour._id || selected === tour._id
      );
    }
    return value?._id === tour._id || value === tour._id;
  };

  const pick = (tour) => {
    if (multiple) {
      const isCurrentlySelected = isSelected(tour);
      let newSelection;

      if (isCurrentlySelected) {
        newSelection = selectedTours.filter(
          (selected) => (selected._id || selected) !== tour._id
        );
      } else {
        newSelection = [...selectedTours, tour];
      }

      onChange?.(newSelection);
    } else {
      onChange?.(tour);
      setOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedTours.length === 0) return placeholder;
      if (selectedTours.length === 1) {
        const tour = selectedTours[0];
        return tour.title || `Tour ${tour._id || tour}`;
      }
      return `Đã chọn ${selectedTours.length} tour`;
    }
    return value ? value.title || `Tour ${value._id || value}` : placeholder;
  };

  const removeSelected = (tourToRemove, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (multiple) {
      const newSelection = selectedTours.filter(
        (selected) =>
          (selected._id || selected) !== (tourToRemove._id || tourToRemove)
      );
      onChange?.(newSelection);
    } else {
      onChange?.(null);
    }
  };

  const renderTourThumbnail = (tour) => {
    const thumbnailUrl =
      tour.thumbnail ||
      tour.image ||
      tour.images?.[0] ||
      "/default-tour-thumb.jpg";

    return (
      <img
        src={thumbnailUrl}
        alt={tour.title}
        className="ts-tour-thumbnail"
        onError={(e) => {
          e.target.src = "/default-tour-thumb.jpg";
        }}
      />
    );
  };

  return (
    <div className="ts-field" ref={ref}>
      <div
        className={`ts-control ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`ts-placeholder ${
            selectedTours.length > 0 || value ? "has-value" : ""
          }`}
        >
          {getDisplayText()}
        </span>
        <span className="ts-caret">▾</span>
      </div>

      {multiple && selectedTours.length > 0 && (
        <div className="ts-selected-items">
          {selectedTours.map((tour, index) => (
            <div key={tour._id || tour || index} className="ts-selected-item">
              <Link
                to={`/admin/tours/detail/${tour._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ts-tour-link"
              >
                {renderTourThumbnail(tour)}
                <span className="ts-tour-name">
                  {tour.title || `Tour ${tour._id || tour}`}
                </span>
              </Link>
              <button
                type="button"
                className="ts-remove-btn"
                onClick={(e) => removeSelected(tour, e)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="ts-menu">
          <div className="ts-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tour theo tên hoặc mã..."
            />
          </div>

          <div className="ts-list">
            {loading ? (
              <div className="ts-empty">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="ts-empty">Không có tour phù hợp</div>
            ) : (
              <ul className="ts-flat">
                {filtered.map((tour) => (
                  <li
                    key={tour._id}
                    className={isSelected(tour) ? "selected" : ""}
                  >
                    <button
                      type="button"
                      className="ts-label"
                      onClick={() => pick(tour)}
                      title={tour.title}
                    >
                      <div className="ts-tour-info">
                        <span className="ts-tour-title">{tour.title}</span>
                        {tour.code && (
                          <span className="ts-tour-code">#{tour.code}</span>
                        )}
                        {isSelected(tour) && (
                          <span className="ts-selected-indicator">✓</span>
                        )}
                      </div>
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
