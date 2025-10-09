import React, { useState, useRef, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
} from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TourCarousel.css";

const TourCarousel = ({ thumbnail, images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const transformComponentRef = useRef(null);

  // Gộp thumbnail + images, đảm bảo sắp xếp theo index
  const fullImages = [{ url: thumbnail, index: 0 }, ...images].sort(
    (a, b) => a.index - b.index
  );

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  // Dừng autoplay khi mở lightbox
  useEffect(() => {
    if (lightboxOpen) {
      slider1.current?.slickPause();
      document.body.style.overflow = "hidden";
    } else {
      slider1.current?.slickPlay();
      document.body.style.overflow = "auto";
    }
  }, [lightboxOpen]);

  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
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

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Use useCallback to memoize functions
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === fullImages.length - 1 ? 0 : prev + 1));
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  }, [fullImages.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? fullImages.length - 1 : prev - 1));
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  }, [fullImages.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [lightboxOpen, nextImage, prevImage]);

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
              onClick={() => openLightbox(idx)}
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

      {/* Lightbox với react-zoom-pan-pinch */}
      {lightboxOpen && (
        <div className="tcr-lightbox" onClick={closeLightbox}>
          <button className="tcr-lightbox-close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          <button
            className="tcr-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <FaChevronLeft />
          </button>

          <button
            className="tcr-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <FaChevronRight />
          </button>

          <div
            className="tcr-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              ref={transformComponentRef}
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: "reset" }}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform, state }) => (
                <>
                  {/* Zoom Controls */}
                  <div className="tcr-lightbox-zoom-controls">
                    <button onClick={() => zoomOut()} title="Zoom Out">
                      <FaSearchMinus />
                    </button>
                    <button onClick={() => resetTransform()} title="Reset Zoom">
                      <FaExpand />
                    </button>
                    <button onClick={() => zoomIn()} title="Zoom In">
                      <FaSearchPlus />
                    </button>
                    <span className="tcr-zoom-level">
                      {Math.round((state?.scale || 1) * 100)}%
                    </span>
                  </div>

                  <TransformComponent
                    wrapperClass="tcr-lightbox-image-wrapper"
                    contentClass="tcr-lightbox-image-content"
                  >
                    <img
                      src={fullImages[lightboxIndex]?.url}
                      alt={`Tour ${lightboxIndex}`}
                      draggable={false}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            <div className="tcr-lightbox-counter">
              {lightboxIndex + 1} / {fullImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourCarousel;
