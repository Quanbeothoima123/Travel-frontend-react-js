import React, { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import "./TourTerms.css";

const TourTerms = ({ terms }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [height, setHeight] = useState("auto");
  const contentRef = useRef(null);

  const filteredTerms = (terms || [])
    .filter((term) => term.description && term.description.trim() !== "")
    .sort((a, b) => a.index - b.index);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
    }
  }, [activeTab, filteredTerms]);

  const getIcon = (iconName) => {
    return FaIcons[iconName] || FaIcons.FaRegFileAlt;
  };

  if (filteredTerms.length === 0) return null;

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
              <span>{term.termId.title}</span>
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
