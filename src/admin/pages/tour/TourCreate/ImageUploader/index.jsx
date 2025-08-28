import React, { useRef } from "react";

const ImageUploader = ({ onUpload }) => {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();

    if (data.secure_url) {
      onUpload(data.secure_url);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />
      <button type="button" onClick={() => fileInputRef.current.click()}>
        Chọn ảnh
      </button>
    </div>
  );
};

export default ImageUploader;
