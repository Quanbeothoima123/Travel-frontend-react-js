import React, { useState } from "react";
import "./TagsInput.css";
import LoadingModal from "../../../../components/common/LoadingModal";
import { generateTagsLocal } from "../../../../../utils/tagGenerator";
import { useToast } from "../../../../../contexts/ToastContext";
const TagsInput = ({ tags, setTags, title }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { showToast } = useToast();
  const addTag = (e) => {
    e.preventDefault();
    if (input.trim() !== "" && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Gọi AI trước, fallback local nếu lỗi
  const generateAutoTags = async () => {
    if (!title) {
      showToast("Bạn cần nhập tên tour trước khi tạo tag", "error");
      return;
    }
    setLoadingMessage("Đang tiến hành tạo tag thông minh...");
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/tours/generate-tags-ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }
      );

      let data = await res.json();
      let newTags = [];

      if (data.success && Array.isArray(data.tags)) {
        newTags = data.tags;
      } else {
        // fallback local
        newTags = generateTagsLocal(title);
      }

      // Gộp tags cũ + mới, xóa trùng
      const merged = [...new Set([...tags, ...newTags])];
      setTags(merged);
    } catch (err) {
      console.error("Auto tag error:", err);
      // fallback local
      const newTags = generateTagsLocal(title);
      const merged = [...new Set([...tags, ...newTags])];
      setTags(merged);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tags-input">
      <h4>Thẻ Tags</h4>
      <div className="tag-list">
        {tags.map((tag, idx) => (
          <span key={idx} className="tag-item">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="tag-add">
        <input
          type="text"
          placeholder="Nhập tag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(e);
            }
          }}
        />
        <button type="button" onClick={addTag}>
          + Thêm
        </button>
        <button type="button" className="btn-auto" onClick={generateAutoTags}>
          ⚡ Tạo tự động
        </button>
        <button type="button" className="btn-clear" onClick={() => setTags([])}>
          🗑 Clear
        </button>
      </div>

      {/* Modal loading khi gọi AI */}
      <LoadingModal open={loading} message={loadingMessage} />
    </div>
  );
};

export default TagsInput;
