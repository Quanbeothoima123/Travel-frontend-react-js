import React from "react";
import "./TourInfoSummary.css";

export default function TourInfoSummary({ tourDetail, totalPrice }) {
  if (!tourDetail) return <div>Đang tải...</div>;

  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="tour-info-summary">
      <h3>Thông tin đặt tour</h3>
      <img src={tourDetail.thumbnail} alt={tourDetail.title} />
      <p>
        <strong>Tên:</strong> {tourDetail.title}
      </p>
      <p>
        <strong>Thời gian:</strong> {tourDetail.travelTimeId?.day} ngày{" "}
        {tourDetail.travelTimeId?.night - 1} đêm
      </p>
      <p>
        <strong>Phương tiện:</strong> {tourDetail.vehicleId?.[0]?.name}
      </p>
      <p>
        <strong>Lưu trú:</strong> Khách sạn {tourDetail.hotelId?.star} sao
      </p>
      <p>
        <strong>Khởi hành:</strong> {tourDetail.frequency?.title}
      </p>
      <p>
        <strong>Tổng tiền:</strong>{" "}
        <span className="price-highlight">{formatVND(totalPrice)}</span>
      </p>
    </div>
  );
}
