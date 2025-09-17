import React from "react";
import { FaBed, FaCarSide, FaHotel, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./TourCard.css";

const TourCard = ({ tour }) => {
  const originalPrice = tour.prices;
  const discountedPrice =
    tour.discount && tour.discount > 0
      ? tour.prices * (1 - tour.discount / 100)
      : null;

  return (
    <div className="tc-card">
      {tour.discount > 0 && (
        <span className="tc-discount-badge">-{tour.discount}%</span>
      )}

      {/* Thumbnail */}
      <div className="tc-image-wrapper">
        <img src={tour.thumbnail} alt={tour.title} />
      </div>

      {/* Title */}
      <h3 className="tc-title">{tour.title}</h3>

      {/* Info */}
      <p className="tc-info">
        <FaBed /> {tour.day} Ngày {tour.night} Đêm
      </p>
      {/* Phương tiện */}
      <p className="tc-info">
        <FaCarSide /> {tour.vehicle?.join(" | ")}
      </p>

      <p className="tc-info">
        <FaHotel /> Khách sạn {tour.hotelStar} sao
      </p>
      <p className="tc-info">
        <FaUsers /> Số chỗ: {tour.seats}
      </p>

      {/* Price */}
      <div className="tc-price">
        {discountedPrice && (
          <span className="tc-original-price">
            {originalPrice.toLocaleString()} VNĐ
          </span>
        )}
        <span className={discountedPrice ? "tc-discounted-price" : ""}>
          {(discountedPrice || originalPrice).toLocaleString()} VNĐ
        </span>
      </div>

      {/* Link */}
      <Link to={`/tour/${tour.slug}`} className="tc-details-link">
        Xem chi tiết
      </Link>
    </div>
  );
};

export default TourCard;
