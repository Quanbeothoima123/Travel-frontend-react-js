import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "yet-another-react-lightbox/styles.css";
import "./TourCarousel.css";

const TourCarousel = ({ thumbnail, images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Gộp thumbnail + images, đảm bảo sắp xếp theo index
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
    <div className="tcr-carousel">
      {/* Slider chính */}
      <Slider {...mainSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.url}
              alt={`Tour ${idx}`}
              className="tcr-main-image"
              onClick={() => {
                setActiveIndex(idx);
                setLightboxOpen(true);
              }}
            />
          </div>
        ))}
      </Slider>

      {/* Khoảng cách */}
      <div style={{ height: "20px" }} />

      {/* Slider thumbnail */}
      <Slider {...thumbSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.url}
              alt={`Thumb ${idx}`}
              className={`tcr-thumb-image ${
                idx === activeIndex ? "tcr-active-thumb" : ""
              }`}
              onClick={() => {
                slider1.current.slickGoTo(idx);
                setActiveIndex(idx);
              }}
            />
          </div>
        ))}
      </Slider>

      {/* Lightbox với Zoom plugin */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={activeIndex}
          slides={fullImages.map((img) => ({ src: img.url }))}
          plugins={[Zoom]}
        />
      )}
    </div>
  );
};

export default TourCarousel;
