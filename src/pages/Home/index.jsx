import React, { useState, useEffect } from "react";
import TourList from "../../../src/components/common/TourList";
import BannerComponent from "../../../src/components/common/Banner";
import WhyChoose from "../../../src/components/common/WhyChoose";
import "./Home.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
const Home = () => {
  const [banners, setBanners] = useState([]);
  const [endpoint, setEndpoint] = useState("tour-list-domestic");
  const [activeButton, setActiveButton] = useState("tour-list-domestic");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/banner-list`)
      .then((response) => response.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error("Error fetching banners:", err));
  }, []);

  return (
    <div className="home-page">
      {/* Banner header */}
      {banners.map(
        (banner) =>
          banner.type === "header" && (
            <BannerComponent key={banner._id} imageLink={banner.images[0]} />
          )
      )}

      {/* Nội dung chính bọc trong container */}
      <div className="container">
        {/* Section title */}
        <h2 className="section-title">TOUR HOT</h2>

        {/* Button group */}
        <div className="button-container">
          <button
            onClick={() => {
              setEndpoint("tour-list-domestic");
              setActiveButton("tour-list-domestic");
            }}
            className={activeButton === "tour-list-domestic" ? "active" : ""}
          >
            Tour Trong Nước
          </button>
          <button
            onClick={() => {
              setEndpoint("tour-list-aboard");
              setActiveButton("tour-list-aboard");
            }}
            className={activeButton === "tour-list-aboard" ? "active" : ""}
          >
            Tour Nước Ngoài
          </button>
        </div>

        {/* Tour list */}
        <TourList endpoint={endpoint} />

        {/* Why choose */}
        <WhyChoose />
      </div>

      {/* Banner footer */}
      {banners.map(
        (banner) =>
          banner.type !== "header" && (
            <BannerComponent key={banner._id} imageLink={banner.images[0]} />
          )
      )}
    </div>
  );
};

export default Home;
