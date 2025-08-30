import React, { useRef } from "react";

const ImageUploader = ({
  onUpload, // callback khi upload xong
  onUploadStart, // callback khi bắt đầu upload
  onUploadEnd, // callback khi kết thúc upload
  multiple = false, // có thể upload nhiều ảnh
}) => {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    if (!files.length) return;

    if (onUploadStart) onUploadStart(); // báo bắt đầu upload

    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD}/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    if (multiple) {
      onUpload(uploadedUrls);
    } else {
      onUpload(uploadedUrls[0]);
    }

    if (onUploadEnd) onUploadEnd(); // báo kết thúc upload
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
        multiple={multiple}
      />
      <button type="button" onClick={() => fileInputRef.current.click()}>
        {multiple ? "Chọn ảnh" : "Chọn thumbnail"}
      </button>
    </div>
  );
};

export default ImageUploader;
