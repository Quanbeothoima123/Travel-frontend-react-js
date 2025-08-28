import React, { useState } from "react";
import TinyEditor from "../../TinyEditor";
import ImageUploader from "../ImageUploader";
import "./DescriptionEditor.css";

const DescriptionEditor = ({ travelTimes, descriptions, setDescriptions }) => {
  const [activeDay, setActiveDay] = useState(0);

  // Nếu descriptions chưa có thì khởi tạo đúng theo travelTimes
  const safeDescriptions =
    descriptions && descriptions.length > 0
      ? descriptions
      : travelTimes.map((t, i) => ({
          day: i + 1,
          title: "",
          image: "",
          description: "",
        }));

  const updateDay = (index, field, value) => {
    const updated = [...safeDescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setDescriptions(updated);
  };

  return (
    <div className="description-editor">
      <h4>Mô tả lịch trình</h4>

      {/* Tabs */}
      <div className="day-tabs">
        {safeDescriptions.map((_, i) => (
          <button
            key={i}
            className={`day-tab ${activeDay === i ? "active" : ""}`}
            onClick={() => setActiveDay(i)}
          >
            Ngày {i + 1}
          </button>
        ))}
      </div>

      {/* Nội dung theo ngày */}
      <div className="day-editor">
        {/* Tiêu đề ngày */}
        <div className="title-section">
          <p>Tiêu đề</p>
          <input
            type="text"
            value={safeDescriptions[activeDay]?.title || ""}
            onChange={(e) => updateDay(activeDay, "title", e.target.value)}
          />
        </div>

        {/* Ảnh */}
        <div className="thumbnail-section">
          <p>Ảnh</p>
          <ImageUploader
            onUpload={(url) => updateDay(activeDay, "image", url)}
          />
          {safeDescriptions[activeDay]?.image && (
            <img
              src={safeDescriptions[activeDay].image}
              alt="day"
              className="thumbnail-preview"
            />
          )}
        </div>

        {/* Mô tả */}
        <div className="description-section">
          <p>Mô tả</p>
          <TinyEditor
            value={safeDescriptions[activeDay]?.description || ""}
            onChange={(val) => updateDay(activeDay, "description", val)}
          />
        </div>
      </div>
    </div>
  );
};

export default DescriptionEditor;
