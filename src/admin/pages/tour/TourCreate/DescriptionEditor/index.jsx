import React, { useState, useEffect } from "react";
import TinyEditor from "../../TinyEditor";
import ImageUploader from "../ImageUploader";
import ImageLoadingModal from "../../../../../admin/components/common/ImageLoadingModal";
import "./DescriptionEditor.css";

const DescriptionEditor = ({ descriptions, setDescriptions }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(false);

  // trạng thái nhập link cho ngày đang active
  const [linkMode, setLinkMode] = useState(false);
  const [linkInput, setLinkInput] = useState("");

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

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    updateDay(activeDay, "image", linkInput.trim());
    setLinkMode(false);
    setLinkInput("");
  };

  const handleRemoveImage = () => {
    updateDay(activeDay, "image", "");
    setLinkMode(false);
    setLinkInput("");
  };

  // reset form nhập link khi đổi tab ngày
  useEffect(() => {
    setLinkMode(false);
    setLinkInput("");
  }, [activeDay]);

  const hasImage = Boolean(safeDescriptions[activeDay]?.image);

  return (
    <div className="description-editor">
      <h4>Mô tả lịch trình</h4>

      {/* Tabs */}
      <div className="day-tabs">
        {safeDescriptions.map((_, i) => (
          <div key={i} className="day-tab-wrapper">
            <button
              type="button"
              className={`day-tab ${activeDay === i ? "active" : ""}`}
              onClick={() => setActiveDay(i)}
            >
              Ngày {i + 1}
            </button>
            {safeDescriptions.length > 1 && (
              <button
                type="button"
                className="remove-day-btn"
                onClick={() => removeDay(i)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-day-btn" onClick={addDay}>
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

          {/* Nếu CHƯA có ảnh: hiển thị 2 lựa chọn Upload | Link */}
          {!hasImage && (
            <div className="thumbnail-options">
              <div className="upload-option">
                <ImageUploader
                  onUpload={(url) => updateDay(activeDay, "image", url)}
                  onUploadStart={() => setLoading(true)}
                  onUploadEnd={() => setLoading(false)}
                  disabled={Boolean(linkMode)}
                />
              </div>

              <div className="link-option">
                {!linkMode ? (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setLinkMode(true)}
                  >
                    Dùng link ảnh
                  </button>
                ) : (
                  <div className="link-input-wrapper">
                    <input
                      type="text"
                      placeholder="Dán link ảnh vào đây..."
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="add-link-btn"
                      onClick={handleAddLink}
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      className="cancel-link-btn"
                      onClick={() => {
                        setLinkMode(false);
                        setLinkInput("");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && <ImageLoadingModal />}

          {/* Nếu ĐÃ có ảnh: hiển thị preview + nút xóa */}
          {hasImage && (
            <div className="preview">
              <img
                src={safeDescriptions[activeDay].image}
                alt={`day-${activeDay + 1}`}
                className="thumbnail-preview"
              />
              <button
                type="button"
                className="remove-btn"
                onClick={handleRemoveImage}
              >
                ✕
              </button>
            </div>
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
