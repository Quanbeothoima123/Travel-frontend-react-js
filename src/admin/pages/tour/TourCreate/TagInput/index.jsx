import React, { useState } from "react";

const TagsInput = ({ tags, setTags }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (input.trim() !== "" && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
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
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <button type="button" onClick={addTag}>
          + Thêm
        </button>
      </div>
    </div>
  );
};

export default TagsInput;
