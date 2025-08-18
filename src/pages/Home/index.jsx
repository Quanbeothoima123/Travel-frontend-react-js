import React, { useState, useEffect } from "react";
import TourList from "../../../src/components/common/TourList";
import BannerComponent from "../../../src/components/common/Banner";
import WhyChoose from "../../../src/components/common/WhyChoose";
import "./Home.css";
const Home = () => {
  const [banners, setBanners] = useState([]);
  const [endpoint, setEndpoint] = useState("tour-list-domestic");
  const [activeButton, setActiveButton] = useState("tour-list-domestic");
  useEffect(() => {
    fetch("http://localhost:5000/api/v1/banner-list")
      .then((response) => response.json())
      .then((data) => setBanners(data));
  }, []);

  return (
    <div className="text-center">
      {banners.map(
        (banner) =>
          banner.type === "header" && (
            <BannerComponent key={banner._id} imageLink={banner.images[0]} />
          )
      )}
      <div className="display-4 fw-bold py-4">TOUR HOT</div>
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
      <TourList endpoint={endpoint} />
      {banners.map(
        (banner) =>
          banner.type !== "header" && (
            <BannerComponent key={banner._id} imageLink={banner.images[0]} />
          )
      )}
      <WhyChoose />
    </div>
  );
};

export default Home;
