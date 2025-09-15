import React, { useState } from "react";
import ImageUploader from "../ImageUploader";
import LoadingModal from "../../../../../admin/components/common/LoadingModal";
import "./ThumbnailUploader.css";

const ThumbnailUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [linkMode, setLinkMode] = useState(false); // đang chọn nhập link ảnh hay không
  const [linkInput, setLinkInput] = useState("");

  const handleAddLink = () => {
    if (linkInput.trim() !== "") {
      onChange(linkInput.trim());
      setLinkMode(false);
      setLinkInput("");
    }
  };

  const handleRemove = () => {
    onChange("");
    setLinkMode(false);
    setLinkInput("");
  };

  return (
    <div className="thumbnail-uploader">
      <h4>Ảnh bìa(Dùng ảnh upload thiết bị hoặc dán link ảnh)</h4>

      {/* Nếu chưa có ảnh thì hiển thị 2 lựa chọn */}
      {!value && (
        <div className="thumbnail-options">
          <div className="upload-option">
            <ImageUploader
              onUpload={onChange}
              onUploadStart={() => setLoading(true)}
              onUploadEnd={() => setLoading(false)}
              disabled={Boolean(linkMode)} // disable khi đang nhập link
            />
          </div>

          <div className="link-option">
            {!linkMode ? (
              <button className="link-btn" onClick={() => setLinkMode(true)}>
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
                <button className="add-link-btn" onClick={handleAddLink}>
                  Thêm
                </button>
                <button
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

      <LoadingModal open={loading} message="Đang gửi email..." icon="FaImage" />

      {/* Preview ảnh */}
      {value && (
        <div className="preview">
          <img src={value} alt="thumbnail" />
          <button className="remove-btn" onClick={handleRemove}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUploader;
