import React, { useState } from "react";
import ImageUploader from "../ImageUploader";
import ImageLoadingModal from "../../../../../admin/components/common/ImageLoadingModal"; // import component modal
import "./ThumbnailUploader.css";

const ThumbnailUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="thumbnail-uploader">
      <h4>Ảnh bìa</h4>

      <ImageUploader
        onUpload={onChange}
        onUploadStart={() => setLoading(true)}
        onUploadEnd={() => setLoading(false)}
      />

      {loading && <ImageLoadingModal />}

      {value && (
        <div className="preview">
          <img src={value} alt="thumbnail" />
          <button className="remove-btn" onClick={() => onChange("")}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUploader;
