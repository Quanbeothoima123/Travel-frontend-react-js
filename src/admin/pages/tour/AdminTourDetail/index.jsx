import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as FaIcons from "react-icons/fa"; // để dùng icon động
import {
  FaMapMarkerAlt,
  FaHotel,
  FaMoneyBillWave,
  FaTags,
  FaBus,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaImages,
  FaInfoCircle,
  FaStar,
  FaGlobe,
  FaList,
  FaExternalLinkAlt,
} from "react-icons/fa";
import "./AdminTourDetail.css";

const AdminTourDetail = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm format VNĐ
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/admin/tours/getTourById/${tourId}`
        );
        setTour(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tourId) fetchTour();
  }, [tourId]);

  if (loading)
    return (
      <div className="loading">
        <FaClock /> Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="error">
        <FaInfoCircle /> Lỗi: {error}
      </div>
    );
  if (!tour)
    return (
      <div>
        <FaInfoCircle /> Không tìm thấy tour.
      </div>
    );

  return (
    <div className="tour-detail-container">
      <h1 className="tour-title">
        <FaMapMarkerAlt /> {tour.title}
      </h1>

      {/* Thông tin cơ bản */}
      <section className="section basic-info">
        <h2>
          <FaInfoCircle /> Thông tin cơ bản
        </h2>
        <div className="info-grid">
          <div className="info-item">
            <label>
              <FaList /> Danh mục:
            </label>
            <span>{tour.categoryId?.title || "N/A"}</span>
          </div>
          <div className="info-item">
            <label>
              <FaGlobe /> Loại tour:
            </label>
            <span>
              {tour.type === "domestic" ? "Trong nước" : "Nước ngoài"}
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaCalendarAlt /> Thời gian:
            </label>
            <span>
              {tour.travelTimeId?.day} ngày, {tour.travelTimeId?.night} đêm
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaHotel /> Khách sạn:
            </label>
            <span>
              {tour.hotelId?.name} ({tour.hotelId?.star} sao)
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaMoneyBillWave /> Giá:
            </label>
            <span>
              {formatCurrency(tour.prices)} (Giảm giá: {tour.discount}%)
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaUser /> Số chỗ:
            </label>
            <span>{tour.seats}</span>
          </div>
          <div className="info-item">
            <label>
              <FaList /> Vị trí:
            </label>
            <span>{tour.position}</span>
          </div>
          <div className="info-item">
            <label>
              <FaStar /> Hoạt động:
            </label>
            <span>{tour.active ? "Có" : "Không"}</span>
          </div>
          <div className="info-item">
            <label>
              <FaStar /> Đã xóa:
            </label>
            <span>{tour.deleted ? "Có" : "Không"}</span>
          </div>
          <div className="info-item full-width">
            <label>
              <FaTags /> Thẻ:
            </label>
            <div className="tags">
              {tour.tags?.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="info-item full-width">
            <label>
              <FaList /> Bộ lọc:
            </label>
            <div className="filters">
              {tour.filter?.map((f, idx) => (
                <span key={idx} className="filter">
                  {f.label} ({f.value})
                </span>
              ))}
            </div>
          </div>
          <div className="info-item">
            <label>
              <FaCalendarAlt /> Tần suất:
            </label>
            <span>{tour.frequency?.title || "N/A"}</span>
          </div>
          <div className="info-item full-width">
            <label>
              <FaMapMarkerAlt /> Điểm khởi hành:
            </label>
            <span>
              {tour.departPlaces?.place} -{" "}
              <a
                href={tour.departPlaces?.googleMap}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                Xem bản đồ <FaExternalLinkAlt style={{ marginLeft: "4px" }} />
              </a>
            </span>
          </div>

          <div className="info-item full-width">
            <label>
              <FaGlobe /> Slug:
            </label>
            <span>{tour.slug}</span>
          </div>
        </div>
      </section>

      {/* Ảnh */}
      <section className="section images-section">
        <h2>
          <FaImages /> Ảnh đại diện
        </h2>
        {tour.thumbnail && (
          <img src={tour.thumbnail} alt="Thumbnail" className="thumbnail" />
        )}

        <h2>
          <FaImages /> Thư viện ảnh
        </h2>
        <div className="images-grid">
          {tour.images
            ?.sort((a, b) => a.index - b.index)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Ảnh ${img.index}`}
                className="gallery-img"
              />
            ))}
        </div>
      </section>

      {/* Lịch trình */}
      <section className="section description-section">
        <h2>
          <FaCalendarAlt /> Lịch trình
        </h2>
        {tour.description?.map((dayItem, idx) => (
          <div key={idx} className="day-item">
            <h3>
              Ngày {dayItem.day}: {dayItem.title}
            </h3>
            {dayItem.image && (
              <img
                src={dayItem.image}
                alt={`Ngày ${dayItem.day}`}
                className="day-image"
              />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: dayItem.description }}
              className="html-content"
            />
          </div>
        ))}
      </section>

      {/* Điều khoản */}
      <section className="section terms-section">
        <h2>
          <FaList /> Điều khoản
        </h2>
        {tour.term
          ?.sort((a, b) => a.index - b.index)
          .map((termItem, idx) => {
            const IconComp =
              FaIcons[termItem.termId?.icon] || FaIcons.FaInfoCircle;
            return (
              <div key={idx} className="term-item">
                {IconComp && <IconComp className="term-icon" />}
                <h4>{termItem.termId?.title}</h4>
                <div
                  dangerouslySetInnerHTML={{ __html: termItem.description }}
                  className="term-description"
                />
              </div>
            );
          })}
      </section>

      {/* Phương tiện */}
      <section className="section vehicles-section">
        <h2>
          <FaBus /> Phương tiện
        </h2>
        <div className="vehicles-grid">
          {tour.vehicleId?.map((vehicle, idx) => (
            <div key={idx} className="vehicle-item">
              {vehicle.image && (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="vehicle-img"
                />
              )}
              <span>{vehicle.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Phụ phí */}
      <section className="section additional-prices-section">
        <h2>
          <FaMoneyBillWave /> Phụ phí
        </h2>
        <div className="info-grid">
          {tour.additionalPrices?.map((ap, idx) => (
            <div key={idx} className="info-item">
              <label>Loại khách:</label>
              <span>
                {ap.typeOfPersonId?.title || "N/A"} - +
                {formatCurrency(ap.moneyMore)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trải nghiệm đặc biệt */}
      <section className="section special-section">
        <h2>
          <FaStar /> Trải nghiệm đặc biệt
        </h2>
        <div
          dangerouslySetInnerHTML={{ __html: tour.specialExperience || "" }}
          className="html-content"
        />
      </section>

      {/* Nhật ký chỉnh sửa */}
      <section className="section audit-section">
        <h2>
          <FaUser /> Nhật ký chỉnh sửa
        </h2>
        <div className="info-grid">
          <div className="info-item full-width">
            <label>Tạo bởi:</label>
            <span>
              {tour.createdBy?._id?.fullName} lúc {tour.createdBy?.at}
            </span>
          </div>
          {tour.deletedBy && (
            <div className="info-item full-width">
              <label>Xóa bởi:</label>
              <span>
                {tour.deletedBy?._id?.fullName} lúc {tour.deletedBy?.at}
              </span>
            </div>
          )}
          <div className="info-item full-width">
            <label>Cập nhật bởi:</label>
            <ul>
              {tour.updatedBy?.map((ub, idx) => (
                <li key={idx}>
                  {ub?._id?.fullName} lúc {ub.at}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminTourDetail;
