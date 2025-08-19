import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TourCarousel.css";
const TourCarousel = ({ thumbnail, images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  // Combine thumbnail with images
  const fullImages = [{ url: thumbnail, index: 0 }, ...images].sort(
    (a, b) => a.index - b.index
  );

  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    asNavFor: nav2,
    ref: (slider) => (slider1.current = slider),
    responsive: [{ breakpoint: 768, settings: { arrows: false } }],
  };

  const thumbSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: nav1,
    centerMode: true,
    focusOnSelect: true,
    ref: (slider) => (slider2.current = slider),
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div style={{ width: "690px", maxWidth: "100%", margin: "0 auto" }}>
      <Slider {...mainSettings} afterChange={() => setNav1(slider1.current)}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.url}
              alt={`Tour ${idx}`}
              style={{
                width: "676px",
                height: "462px",
                objectFit: "cover",
                maxWidth: "100%",
              }}
            />
          </div>
        ))}
      </Slider>
      <div style={{ height: "20px" }} /> {/* Gap */}
      <Slider {...thumbSettings} afterChange={() => setNav2(slider2.current)}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.url}
              alt={`Thumb ${idx}`}
              style={{
                width: "125px",
                height: "125px",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TourCarousel;
