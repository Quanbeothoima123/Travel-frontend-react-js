import React, { useState } from "react";
import TinyEditor from "../../TinyEditor";
import ImageUploader from "../ImageUploader";
import "./DescriptionEditor.css";

const DescriptionEditor = ({ descriptions, setDescriptions }) => {
  const [activeDay, setActiveDay] = useState(0);

  const safeDescriptions =
    descriptions && descriptions.length > 0
      ? descriptions
      : [{ day: 1, title: "", image: "", description: "" }];

  const updateDay = (index, field, value) => {
    const updated = [...safeDescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setDescriptions(updated);
  };

  const addDay = () => {
    const updated = [
      ...safeDescriptions,
      {
        day: safeDescriptions.length + 1,
        title: "",
        image: "",
        description: "",
      },
    ];
    setDescriptions(updated);
    setActiveDay(updated.length - 1);
  };

  const removeDay = (index) => {
    if (safeDescriptions.length === 1) return; // không xóa hết
    const updated = safeDescriptions
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, day: i + 1 })); // cập nhật số ngày
    setDescriptions(updated);
    setActiveDay(index === 0 ? 0 : index - 1);
  };

  return (
    <div className="description-editor">
      <h4>Mô tả lịch trình</h4>

      {/* Tabs */}
      <div className="day-tabs">
        {safeDescriptions.map((_, i) => (
          <div key={i} className="day-tab-wrapper">
            <button
              className={`day-tab ${activeDay === i ? "active" : ""}`}
              onClick={() => setActiveDay(i)}
            >
              Ngày {i + 1}
            </button>
            {safeDescriptions.length > 1 && (
              <button className="remove-day-btn" onClick={() => removeDay(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button className="add-day-btn" onClick={addDay}>
          + Thêm ngày
        </button>
      </div>

      {/* Nội dung theo ngày */}
      <div className="day-editor">
        <div className="title-section">
          <p>Tiêu đề</p>
          <input
            type="text"
            value={safeDescriptions[activeDay]?.title || ""}
            onChange={(e) => updateDay(activeDay, "title", e.target.value)}
          />
        </div>

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
