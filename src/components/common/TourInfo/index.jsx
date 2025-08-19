import React, { useState } from "react";
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
} from "react-icons/fa";
import "./TourInfo.css";

const TourInfo = ({ tourDetail }) => {
  const [phone, setPhone] = useState("");

  if (!tourDetail) return null;

  const {
    title,
    travelTimeId,
    vehicleId,
    hotelId,
    frequency,
    departPlaces,
    prices,
    discount,
    tags,
  } = tourDetail;

  const discountedPrice = prices * (1 - discount / 100);
  const duration = `${travelTimeId.day} Ngày ${travelTimeId.night} Đêm`;
  const transport = vehicleId[0]?.name || "Ô tô";
  const stay = `${hotelId.name} ${hotelId.star} sao`;
  const start = frequency.title;

  const handleSend = () => {
    if (!phone) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }
    // TODO: gửi dữ liệu phone tới API hoặc xử lý khác
    alert(`Số điện thoại của bạn: ${phone}`);
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

      {departPlaces?.length > 0 && (
        <div className="depart">
          <FaPlane className="icon" /> Điểm khởi hành:{" "}
          <span>{departPlaces[0].place}</span>
          {departPlaces[0].googleMap && (
            <a
              href={departPlaces[0].googleMap}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              <FaMapMarkerAlt /> Chỉ đường
            </a>
          )}
        </div>
      )}

      <div className="price">
        Giá từ:{" "}
        {discountedPrice.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}{" "}
        <del>
          {prices.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </del>
      </div>

      <button className="btn-main">ĐẶT TOUR</button>

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
        Hoặc Quý Khách có thể để lại thông tin liên hệ để được tư vấn chi tiết
        hoặc liên hệ trực tiếp tư vấn.
      </p>

      {/* Ô nhập số điện thoại + nút gửi đi */}
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
