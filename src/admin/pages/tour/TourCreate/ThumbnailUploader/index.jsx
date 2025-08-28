import React from "react";
import ImageUploader from "../ImageUploader";

const ThumbnailUploader = ({ value, onChange }) => {
  return (
    <div className="thumbnail-uploader">
      <h4>Ảnh đại diện</h4>
      <ImageUploader onUpload={onChange} />
      {value && (
        <div className="preview" style={{ marginTop: "10px" }}>
          <img src={value} alt="thumbnail" style={{ maxWidth: "200px" }} />
        </div>
      )}
    </div>
  );
};

export default ThumbnailUploader;
