import React from "react";
import { FaBed, FaCarSide, FaUserFriends } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link
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
      <img src={tour.thumbnail} alt={tour.title} />
      <h3>{tour.title}</h3>
      <p>
        <FaBed /> {tour.day} Ngày {tour.night} Đêm
      </p>
      <p>
        <FaCarSide /> {tour.vehicle[0]}
      </p>
      <p>
        <FaUserFriends /> Khách sạn {tour.hotelStar} sao
      </p>
      <p className="price">
        {discountedPrice && (
          <span className="original-price">
            {originalPrice.toLocaleString()} VNĐ
          </span>
        )}
        <span className={discountedPrice ? "discounted-price" : ""}>
          {discountedPrice
            ? discountedPrice.toLocaleString()
            : originalPrice.toLocaleString()}{" "}
          VNĐ
        </span>
      </p>
      <p>
        <FaUserFriends /> Số người: {tour.seats}
      </p>
      <Link to={`/tour/${tour.slug}`}>Xem Thêm</Link>
    </div>
  );
};

export default TourCard;
