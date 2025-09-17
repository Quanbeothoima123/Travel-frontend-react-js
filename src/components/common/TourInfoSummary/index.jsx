import React from "react";
import "./TourInfoSummary.css";

export default function TourInfoSummary({ tourDetail, totalPrice }) {
  if (!tourDetail) return <div className="tis-loading">Đang tải...</div>;
  console.log(tourDetail);
  console.log(tourDetail.vehicleId);

  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="tis-summary">
      <h3 className="tis-title">Thông tin đặt tour</h3>
      <img
        src={tourDetail.thumbnail}
        alt={tourDetail.title}
        className="tis-thumbnail"
      />
      <p>
        <strong>Tên:</strong> {tourDetail.title}
      </p>
      <p>
        <strong>Thời gian:</strong> {tourDetail.travelTimeId?.day} ngày{" "}
        {tourDetail.travelTimeId?.night - 1} đêm
      </p>
      <p>
        <strong>Phương tiện:</strong>{" "}
        {tourDetail.vehicleId?.map((v) => v.name).join(" | ")}
      </p>

      <p>
        <strong>Lưu trú:</strong> Khách sạn {tourDetail.hotelId?.star} sao
      </p>
      <p>
        <strong>Khởi hành:</strong> {tourDetail.frequency?.title}
      </p>
      <p>
        <strong>Tổng tiền:</strong>{" "}
        <span className="tis-price">{formatVND(totalPrice)}</span>
      </p>
    </div>
  );
}
