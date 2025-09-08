import React, { useEffect, useMemo, useState } from "react";
import TinyEditor from "../../TinyEditor";
import * as FaIcons from "react-icons/fa";
import "./TermEditor.css";

const TermsEditor = ({ terms, setTerms, termOptions }) => {
  const [activeId, setActiveId] = useState(termOptions?.[0]?._id || "");
  const [lastSaved, setLastSaved] = useState(null); // thời gian lưu cuối

  useEffect(() => {
    if (!termOptions?.length) return;
    const stillValid = termOptions.some((t) => t._id === activeId);
    if (!stillValid) {
      setActiveId(termOptions[0]._id);
    }
  }, [termOptions, activeId]);

  // 👉 Tìm index trong terms (dù là object hay id string)
  const findTermIndex = (termId) =>
    terms?.findIndex((t) => {
      const currentId = t.termId?._id || t.termId;
      return String(currentId) === String(termId);
    }) ?? -1;

  const getDescription = (termId) => {
    const idx = findTermIndex(termId);
    return idx >= 0 ? terms[idx].description || "" : "";
  };

  const setDescriptionFor = (termId, description) => {
    const idx = findTermIndex(termId);
    if (idx >= 0) {
      const next = [...terms];
      next[idx] = { ...next[idx], description };
      setTerms(next);
    } else {
      const termObj = termOptions.find((t) => String(t._id) === String(termId));
      if (termObj) {
        setTerms([...(terms || []), { termId: termObj, description }]);
      }
    }
    setLastSaved(new Date()); // cập nhật giờ lưu
  };

  const activeTerm = useMemo(
    () => termOptions?.find((t) => t._id === activeId) || null,
    [termOptions, activeId]
  );

  const getIcon = (iconName) => {
    const Icon = FaIcons[iconName];
    return Icon || FaIcons.FaRegFileAlt;
  };

  const formatTime = (d) => {
    if (!d) return "";
    return d.toLocaleTimeString("vi-VN", { hour12: false });
  };

  // 👉 Hàm đếm từ (loại HTML + space thừa)
  const countWords = (html) => {
    if (!html) return 0;
    const text =
      new DOMParser().parseFromString(html, "text/html").body.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  if (!termOptions || termOptions.length === 0) {
    return (
      <div className="terms-editor">
        <h4>Điều khoản</h4>
        <div className="terms-empty">Chưa có danh sách điều khoản.</div>
      </div>
    );
  }

  return (
    <div className="terms-editor">
      <h4>Điều khoản</h4>

      {/* Tabs */}
      <div className="term-tabs" role="tablist" aria-label="Điều khoản">
        {termOptions.map((t) => {
          const Icon = getIcon(t.icon);
          const isActive = t._id === activeId;
          const desc = getDescription(t._id);
          return (
            <button
              key={t._id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`term-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveId(t._id)}
            >
              <Icon className="term-tab-icon" aria-hidden="true" />
              <span className="term-tab-title">{t.title}</span>
              {desc && <span className="term-badge">{countWords(desc)}</span>}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {activeTerm && (
        <div className="term-panel">
          <div className="term-panel-title">
            {(() => {
              const Icon = getIcon(activeTerm.icon);
              return <Icon className="term-panel-icon" aria-hidden="true" />;
            })()}
            <span>{activeTerm.title}</span>
          </div>

          <TinyEditor
            value={getDescription(activeTerm._id)}
            onChange={(val) => setDescriptionFor(activeTerm._id, val)}
          />

          {/* Footer: đếm từ + thời gian lưu */}
          <div className="term-footer">
            <span>Từ: {countWords(getDescription(activeTerm._id))}</span>
            {lastSaved && (
              <span className="last-saved">
                Đã lưu lúc {formatTime(lastSaved)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsEditor;
