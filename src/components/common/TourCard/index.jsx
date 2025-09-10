import React from "react";
import { FaBed, FaCarSide, FaHotel, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./TourCard.css";

const TourCard = ({ tour }) => {
  const originalPrice = tour.prices;
  const discountedPrice = tour.discount
    ? tour.prices * (1 - tour.discount / 100)
    : null;

  return (
    <div className="tour-card">
      {tour.discount > 0 && (
        <span className="discount-badge">-{tour.discount}%</span>
      )}

      {/* Thumbnail */}
      <div className="image-wrapper">
        <img src={tour.thumbnail} alt={tour.title} />
      </div>

      {/* Title */}
      <h3>{tour.title}</h3>

      {/* Info */}
      <p>
        <FaBed /> {tour.day} Ngày {tour.night} Đêm
      </p>
      <p>
        <FaCarSide /> {tour.vehicle[0]}
      </p>
      <p>
        <FaHotel /> Khách sạn {tour.hotelStar} sao
      </p>
      <p>
        <FaUsers /> Số chỗ: {tour.seats}
      </p>

      {/* Price */}
      <p className="price">
        {discountedPrice && (
          <span className="original-price">
            {originalPrice.toLocaleString()} VNĐ
          </span>
        )}
        <span className={discountedPrice ? "discounted-price" : ""}>
          {(discountedPrice || originalPrice).toLocaleString()} VNĐ
        </span>
      </p>

      {/* Link */}
      <Link to={`/tour/${tour.slug}`} className="details-link">
        Xem chi tiết
      </Link>
    </div>
  );
};

export default TourCard;
