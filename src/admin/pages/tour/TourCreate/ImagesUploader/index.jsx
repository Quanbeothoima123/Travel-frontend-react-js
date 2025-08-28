import React from "react";
import ImageUploader from "../ImageUploader";

const ImagesUploader = ({ images, setImages }) => {
  const handleUpload = (url) => {
    setImages([...images, { url, index: images.length }]);
  };

  const removeImage = (idx) => {
    setImages(
      images.filter((_, i) => i !== idx).map((img, i) => ({ ...img, index: i }))
    );
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const newList = [...images];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    setImages(newList.map((img, i) => ({ ...img, index: i })));
  };

  const moveDown = (idx) => {
    if (idx === images.length - 1) return;
    const newList = [...images];
    [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
    setImages(newList.map((img, i) => ({ ...img, index: i })));
  };

  return (
    <div className="images-uploader">
      <h4>Thư viện ảnh</h4>
      <ImageUploader onUpload={handleUpload} />

      <div
        className="preview-list"
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} style={{ position: "relative" }}>
            <img
              src={img.url}
              alt={`img-${idx}`}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button onClick={() => moveUp(idx)}>↑</button>
              <button onClick={() => moveDown(idx)}>↓</button>
              <button
                onClick={() => removeImage(idx)}
                style={{ background: "red", color: "white" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesUploader;
