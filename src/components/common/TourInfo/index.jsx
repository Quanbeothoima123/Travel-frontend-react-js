import React from "react";
import "./TourInfo.css";

const TourInfo = ({ tourDetail }) => {
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
  //   const depart = departPlaces[0]?.place || "Người dùng chọn";

  return (
    <div className="tour-info">
      <h1>{title.toUpperCase()}</h1>
      <p>Thời gian: {duration}</p>
      <p>Phương tiện: {transport}</p>
      <p>Lưu trú: {stay}</p>
      <p>Khởi hành: {start}</p>
      <div className="price">
        Giá từ: {discountedPrice.toLocaleString()} vnd{" "}
        <del>{prices.toLocaleString()} vnd</del>
      </div>
      <button>ĐẶT TOUR</button>
      <div className="tags">
        {tags.map((tag, i) => (
          <button key={i} href="#">
            {tag}
          </button>
        ))}
      </div>
      <div className="social">
        <i>Chia sẻ</i> <i>X Post</i> <i>Save</i> <i>Call</i> <i>In Share</i>
      </div>
      <p>
        Họac Quy Khách có thể để lại thông tin liên hệ để được tư vấn chi tiết
        hoặc liên hệ trực tiếp tư vấn Quy khách a.
      </p>
      <button className="send">Gửi đi</button>
    </div>
  );
};

export default TourInfo;
