import React from "https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js";

const BannerComponent = ({ imageLink }) => {
  return (
    <div style={{ width: "100vw", overflow: "hidden" }}>
      <img
        src={imageLink}
        alt="banner"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
};

export default BannerComponent;
