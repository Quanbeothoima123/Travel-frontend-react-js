import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClock,
  FaBus,
  FaHotel,
  FaCalendarAlt,
  FaPlane,
  FaMapMarkerAlt,
  FaShareAlt,
  FaBookmark,
  FaPhone,
  FaLinkedin,
  FaPaperPlane,
  FaExclamation,
} from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import "./TourInfo.css";

const TourInfo = ({ tourDetail }) => {
  const [phone, setPhone] = useState("");
  const { showToast } = useToast();
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

  if (!tourDetail) return null;

  const {
    _id: tourId,
    title,
    travelTimeId,
    vehicleId,
    hotelId,
    frequency,
    departPlaceId,
    prices,
    discount,
    tags,
    slug,
  } = tourDetail;

  const discountedPrice = prices * (1 - discount / 100);
  const duration = `${travelTimeId.day} Ngày ${travelTimeId.night} Đêm`;
  const transport = vehicleId[0]?.name || "Ô tô";
  const stay = `${hotelId.name} ${hotelId.star} sao`;
  const start = frequency.title;

  const isValidVNPhone = (number) => {
    const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return regex.test(number);
  };

  const handleSend = async () => {
    if (!phone) {
      showToast("Vui lòng nhập số điện thoại!", "error");
      return;
    }
    if (!isValidVNPhone(phone)) {
      showToast("Số điện thoại không hợp lệ!", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/customer-consolation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber: phone, tourId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Chúng tôi sẽ sớm liên hệ với bạn!", "success");
        setPhone("");
      } else {
        showToast(data.message || "Có lỗi xảy ra", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể kết nối server!", "error");
    }
  };

  return (
    <div className="tour-info">
      <h1>{title.toUpperCase()}</h1>

      <p>
        <FaClock className="icon" /> Thời gian: {duration}
      </p>
      <p>
        <FaBus className="icon" /> Phương tiện: {transport}
      </p>
      <p>
        <FaHotel className="icon" /> Lưu trú: {stay}
      </p>
      <p>
        <FaCalendarAlt className="icon" /> Khởi hành: {start}
      </p>

      {departPlaceId && (
        <p className="depart">
          <FaPlane className="icon" /> Điểm khởi hành: {departPlaceId.name}
          {departPlaceId.googleDirection && (
            <a
              href={departPlaceId.googleDirection}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              <FaMapMarkerAlt />
              Map
            </a>
          )}
        </p>
      )}
      <p>
        <FaExclamation className="icon" /> Chú ý: {departPlaceId.description}
      </p>

      <div className="price">
        {discountedPrice.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
        <del>
          {prices.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </del>
      </div>

      <Link to={`/booking-tour/${slug}`} className="btn-main booking-button">
        ĐẶT TOUR
      </Link>

      <div className="tags">
        {tags.map((tag, i) => (
          <button key={i} className="tag-btn">
            {tag}
          </button>
        ))}
      </div>

      <div className="social">
        <FaShareAlt /> Chia sẻ
        <FaBookmark /> Lưu
        <FaPhone /> Gọi
        <FaLinkedin /> In Share
      </div>

      <p className="note">
        Hoặc Quý Khách có thể để lại thông tin liên hệ để được tư vấn chi tiết.
      </p>

      <div className="phone-input">
        <input
          type="tel"
          placeholder="Nhập số điện thoại của bạn"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn-send" onClick={handleSend}>
          <FaPaperPlane /> Gửi đi
        </button>
      </div>
    </div>
  );
};

export default TourInfo;
