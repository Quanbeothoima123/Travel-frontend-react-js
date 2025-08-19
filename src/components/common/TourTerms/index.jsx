import React, { useState, useRef, useEffect } from "react";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import "./TourTerms.css";

// map tên sang component
const iconsMap = {
  FaBan: FaBan,
  FaCheckCircle: FaCheckCircle,
};

const TourTerms = ({ terms }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [height, setHeight] = useState("auto");
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
    }
  }, [activeTab, terms]);

  return (
    <div className="tour-terms">
      <div className="tab-buttons">
        {terms
          .sort((a, b) => a.index - b.index)
          .map((term, index) => {
            const Icon = iconsMap[term.termId.icon]; // lấy component từ tên
            return (
              <button
                key={term.termId._id}
                className={activeTab === index ? "active" : ""}
                onClick={() => setActiveTab(index)}
              >
                {Icon && <Icon className="tab-icon" />}
                {term.termId.title}
              </button>
            );
          })}
      </div>

      <div className="tab-content-wrapper" style={{ maxHeight: height }}>
        <div
          ref={contentRef}
          className="tab-content"
          dangerouslySetInnerHTML={{
            __html: terms.sort((a, b) => a.index - b.index)[activeTab]
              .description,
          }}
        />
      </div>
    </div>
  );
};

export default TourTerms;
