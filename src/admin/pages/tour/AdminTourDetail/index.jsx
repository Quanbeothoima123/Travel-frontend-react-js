import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as FaIcons from "react-icons/fa";
import SafeHTML from "../../../../components/common/SafeHTML";
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
  FaExclamation,
} from "react-icons/fa";
import "./AdminTourDetail.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const AdminTourDetail = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          `${API_BASE}/api/v1/admin/tours/getTourById/${tourId}`,
          {
            withCredentials: true, // 👈 thêm dòng này
          }
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
      <div className="admin-tour-loading">
        <FaClock /> Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="admin-tour-error">
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
    <div className="admin-tour-detail-container">
      <h1 className="admin-tour-title">
        <FaMapMarkerAlt /> {tour.title}
      </h1>

      {/* Thông tin cơ bản */}
      <section className="admin-tour-section">
        <h2>
          <FaInfoCircle /> Thông tin cơ bản
        </h2>
        <div className="admin-tour-info-grid">
          <div className="admin-tour-info-item">
            <label>
              <FaList /> Danh mục:
            </label>
            <span>{tour.categoryId?.title || "N/A"}</span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaGlobe /> Loại tour:
            </label>
            <span>
              {tour.type === "domestic" ? "Trong nước" : "Nước ngoài"}
            </span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaCalendarAlt /> Thời gian:
            </label>
            <span>
              {tour.travelTimeId?.day} ngày, {tour.travelTimeId?.night} đêm
            </span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaHotel /> Khách sạn:
            </label>
            <span>
              {tour.hotelId?.name} ({tour.hotelId?.star} sao)
            </span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaMoneyBillWave /> Giá:
            </label>
            <span>
              {formatCurrency(tour.prices)} (Giảm giá: {tour.discount}%)
            </span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaUser /> Số chỗ:
            </label>
            <span>{tour.seats}</span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaList /> Thứ tự:
            </label>
            <span>{tour.position}</span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaStar /> Hoạt động:
            </label>
            <span>{tour.active ? "Có" : "Không"}</span>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaStar /> Đã xóa:
            </label>
            <span>{tour.deleted ? "Có" : "Không"}</span>
          </div>
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>
              <FaTags /> Thẻ:
            </label>
            <div className="admin-tour-tags">
              {tour.tags?.map((tag, idx) => (
                <span key={idx} className="admin-tour-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>
              <FaList /> Bộ lọc:
            </label>
            <div className="admin-tour-filters">
              {tour.filterId?.map((f, idx) => (
                <span key={idx} className="admin-tour-filter">
                  {f.label} ({f.value})
                </span>
              ))}
            </div>
          </div>
          <div className="admin-tour-info-item">
            <label>
              <FaCalendarAlt /> Tần suất:
            </label>
            <span>{tour.frequency?.title || "N/A"}</span>
          </div>
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>
              <FaMapMarkerAlt /> Điểm khởi hành:
            </label>
            <span>
              {tour.departPlaceId?.name} -{" "}
              <a
                href={tour.departPlaceId?.googleDirection}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-tour-map-link"
              >
                Xem bản đồ <FaExternalLinkAlt style={{ marginLeft: "4px" }} />
              </a>
            </span>
          </div>
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>
              <FaExclamation /> Chú ý:
            </label>
            <span>
              <span>{tour.departPlaceId?.description}</span>
            </span>
          </div>
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>
              <FaGlobe /> Slug:
            </label>
            <span>{tour.slug}</span>
          </div>
        </div>
      </section>

      {/* Ảnh */}
      <section className="admin-tour-section">
        <h2>
          <FaImages /> Ảnh giới thiệu
        </h2>
        {tour.thumbnail && (
          <img
            src={tour.thumbnail}
            alt="Thumbnail"
            className="admin-tour-thumbnail"
          />
        )}

        <h2>
          <FaImages /> Thư viện ảnh
        </h2>
        <div className="admin-tour-images-grid">
          {tour.images
            ?.sort((a, b) => a.index - b.index)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Ảnh ${img.index}`}
                className="admin-tour-gallery-img"
              />
            ))}
        </div>
      </section>

      {/* Lịch trình */}
      <section className="admin-tour-section">
        <h2>
          <FaCalendarAlt /> Lịch trình
        </h2>
        {tour.description?.map((dayItem, idx) => (
          <div key={idx} className="admin-tour-day-item">
            <h3>
              Ngày {dayItem.day}: {dayItem.title}
            </h3>
            {dayItem.image && (
              <img
                src={dayItem.image}
                alt={`Ngày ${dayItem.day}`}
                className="admin-tour-day-image"
              />
            )}
            <SafeHTML
              html={dayItem.description}
              className="admin-tour-html-content"
            />
          </div>
        ))}
      </section>

      {/* Điều khoản */}
      <section className="admin-tour-section">
        <h2>
          <FaList /> Điều khoản
        </h2>
        {tour.term
          ?.sort((a, b) => a.index - b.index)
          .map((termItem, idx) => {
            const IconComp =
              FaIcons[termItem.termId?.icon] || FaIcons.FaInfoCircle;
            return (
              <div key={idx} className="admin-tour-term-item">
                {IconComp && <IconComp className="admin-tour-term-icon" />}
                <h4>{termItem.termId?.title}</h4>
                <SafeHTML
                  html={termItem.description}
                  className="admin-tour-html-content"
                />
              </div>
            );
          })}
      </section>

      {/* Phương tiện */}
      <section className="admin-tour-section">
        <h2>
          <FaBus /> Phương tiện
        </h2>
        <div className="admin-tour-vehicles-grid">
          {tour.vehicleId?.map((vehicle, idx) => (
            <div key={idx} className="admin-tour-vehicle-item">
              {vehicle.image && (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="admin-tour-vehicle-img"
                />
              )}
              <span>{vehicle.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Phụ phí */}
      <section className="admin-tour-section">
        <h2>
          <FaMoneyBillWave /> Phụ phí
        </h2>
        <div className="admin-tour-info-grid">
          {tour.additionalPrices?.map((ap, idx) => (
            <div key={idx} className="admin-tour-info-item">
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
      <section className="admin-tour-section">
        <h2>
          <FaStar /> Trải nghiệm đặc biệt
        </h2>
        <SafeHTML
          html={tour.specialExperience || ""}
          className="admin-tour-html-content"
        />
      </section>

      {/* Nhật ký chỉnh sửa */}
      <section className="admin-tour-section">
        <h2>
          <FaUser /> Nhật ký chỉnh sửa
        </h2>
        <div className="admin-tour-info-grid">
          <div className="admin-tour-info-item admin-tour-full-width">
            <label>Tạo bởi:</label>
            <span>
              {tour.createdBy?._id?.fullName} lúc {tour.createdBy?.at}
            </span>
          </div>
          {tour.deletedBy && (
            <div className="admin-tour-info-item admin-tour-full-width">
              <label>Xóa bởi:</label>
              <span>
                {tour.deletedBy?._id?.fullName} lúc {tour.deletedBy?.at}
              </span>
            </div>
          )}
          <div className="admin-tour-info-item admin-tour-full-width">
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
