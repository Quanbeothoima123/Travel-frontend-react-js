import React, { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa"; // import toàn bộ icon FA
import "./TourTerms.css";

const TourTerms = ({ terms }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [height, setHeight] = useState("auto");
  const contentRef = useRef(null);

  // Lọc bỏ những mục không có description
  const filteredTerms = (terms || [])
    .filter((term) => term.description && term.description.trim() !== "")
    .sort((a, b) => a.index - b.index);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
    }
  }, [activeTab, filteredTerms]);

  // Hàm lấy icon component từ string
  const getIcon = (iconName) => {
    return FaIcons[iconName] || FaIcons.FaRegFileAlt; // fallback nếu không tồn tại
  };

  if (filteredTerms.length === 0) {
    return null; // Không có term nào hợp lệ thì ẩn luôn
  }

  return (
    <div className="tour-terms">
      <div className="tab-buttons">
        {filteredTerms.map((term, index) => {
          const Icon = getIcon(term.termId.icon);
          return (
            <button
              key={term.termId._id}
              className={activeTab === index ? "active" : ""}
              onClick={() => setActiveTab(index)}
            >
              <Icon className="tab-icon" />
              {term.termId.title}
            </button>
          );
        })}
      </div>

      {filteredTerms[activeTab] && (
        <div className="tab-content-wrapper" style={{ maxHeight: height }}>
          <div
            ref={contentRef}
            className="tab-content"
            dangerouslySetInnerHTML={{
              __html: filteredTerms[activeTab].description,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TourTerms;
