import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TourCarousel.css";

const TourCarousel = ({ thumbnail, images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Combine thumbnail + images
  const fullImages = [{ url: thumbnail, index: 0 }, ...images].sort(
    (a, b) => a.index - b.index
  );

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    asNavFor: nav2,
    ref: (slider) => (slider1.current = slider),
    beforeChange: (_, next) => setActiveIndex(next),
    responsive: [{ breakpoint: 768, settings: { arrows: false } }],
  };

  const thumbSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: nav1,
    centerMode: false,
    focusOnSelect: true,
    ref: (slider) => (slider2.current = slider),
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="TourCarousel">
      {/* Main slider */}
      <Slider {...mainSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img src={img.url} alt={`Tour ${idx}`} className="main-image" />
          </div>
        ))}
      </Slider>

      {/* Gap */}
      <div style={{ height: "20px" }} />

      {/* Thumbnail slider */}
      <Slider {...thumbSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.url}
              alt={`Thumb ${idx}`}
              className={`thumb-image ${
                idx === activeIndex ? "active-thumb" : ""
              }`}
              onClick={() => {
                slider1.current.slickGoTo(idx);
                setActiveIndex(idx);
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TourCarousel;
