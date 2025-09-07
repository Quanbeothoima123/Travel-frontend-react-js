import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
} from "react-icons/fa";
import "./AdminTourDetail.css";

const AdminTourDetail = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        console.log(tourId);
        const response = await axios.get(
          `http://localhost:5000/api/v1/tours/admin/getTourById/${tourId}`
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
        <FaClock /> Loading...
      </div>
    );
  if (error)
    return (
      <div className="error">
        <FaInfoCircle /> Error: {error}
      </div>
    );
  if (!tour)
    return (
      <div>
        <FaInfoCircle /> No tour found.
      </div>
    );

  return (
    <div className="tour-detail-container">
      <h1 className="tour-title">
        <FaMapMarkerAlt /> {tour.title}
      </h1>

      <section className="section basic-info">
        <h2>
          <FaInfoCircle /> Basic Information
        </h2>
        <div className="info-grid">
          <div className="info-item">
            <label>
              <FaList /> Category:
            </label>
            <span>{tour.categoryId?.title || "N/A"}</span>
          </div>
          <div className="info-item">
            <label>
              <FaGlobe /> Type:
            </label>
            <span>{tour.type}</span>
          </div>
          <div className="info-item">
            <label>
              <FaCalendarAlt /> Travel Time:
            </label>
            <span>
              {tour.travelTimeId?.day} days, {tour.travelTimeId?.night} nights
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaHotel /> Hotel:
            </label>
            <span>
              {tour.hotelId?.name} ({tour.hotelId?.star} stars)
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaMoneyBillWave /> Price:
            </label>
            <span>
              ${tour.prices} (Discount: {tour.discount}%)
            </span>
          </div>
          <div className="info-item">
            <label>
              <FaUser /> Seats:
            </label>
            <span>{tour.seats}</span>
          </div>
          <div className="info-item">
            <label>
              <FaList /> Position:
            </label>
            <span>{tour.position}</span>
          </div>
          <div className="info-item">
            <label>
              <FaStar /> Active:
            </label>
            <span>{tour.active ? "Yes" : "No"}</span>
          </div>
          <div className="info-item">
            <label>
              <FaStar /> Deleted:
            </label>
            <span>{tour.deleted ? "Yes" : "No"}</span>
          </div>
          <div className="info-item full-width">
            <label>
              <FaTags /> Tags:
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
              <FaList /> Filters:
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
              <FaCalendarAlt /> Frequency:
            </label>
            <span>{tour.frequency?.title || "N/A"}</span>
          </div>
          <div className="info-item full-width">
            <label>
              <FaMapMarkerAlt /> Depart Places:
            </label>
            <span>
              {tour.departPlaces?.place} - {tour.departPlaces?.googleMap}
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

      <section className="section images-section">
        <h2>
          <FaImages /> Thumbnail
        </h2>
        {tour.thumbnail && (
          <img src={tour.thumbnail} alt="Thumbnail" className="thumbnail" />
        )}

        <h2>
          <FaImages /> Images
        </h2>
        <div className="images-grid">
          {tour.images
            ?.sort((a, b) => a.index - b.index)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Image ${img.index}`}
                className="gallery-img"
              />
            ))}
        </div>
      </section>

      {tour.hotelId && (
        <section className="section hotel-section">
          <h2>
            <FaHotel /> Hotel Details
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{tour.hotelId.name}</span>
            </div>
            <div className="info-item">
              <label>
                <FaMoneyBillWave /> Price:
              </label>
              <span>
                ${tour.hotelId.price} (Discount: {tour.hotelId.discount}%)
              </span>
            </div>
            <div className="info-item full-width">
              <label>Description:</label>
              <p>{tour.hotelId.description}</p>
            </div>
            <div className="info-item">
              <label>
                <FaStar /> Star:
              </label>
              <span>{tour.hotelId.star}</span>
            </div>
          </div>
          <div className="hotel-images">
            {tour.hotelId.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Hotel ${idx}`}
                className="hotel-img"
              />
            ))}
          </div>
        </section>
      )}

      <section className="section description-section">
        <h2>
          <FaCalendarAlt /> Itinerary
        </h2>
        {tour.description?.map((dayItem, idx) => (
          <div key={idx} className="day-item">
            <h3>
              Day {dayItem.day}: {dayItem.title}
            </h3>
            {dayItem.image && (
              <img
                src={dayItem.image}
                alt={`Day ${dayItem.day}`}
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

      <section className="section terms-section">
        <h2>
          <FaList /> Terms
        </h2>
        {tour.term
          ?.sort((a, b) => a.index - b.index)
          .map((termItem, idx) => (
            <div key={idx} className="term-item">
              {termItem.termId?.icon && (
                <img
                  src={termItem.termId.icon}
                  alt="Icon"
                  className="term-icon"
                />
              )}
              <h4>{termItem.termId?.title}</h4>
              <div className="term-description">{termItem.description}</div>
            </div>
          ))}
      </section>

      <section className="section vehicles-section">
        <h2>
          <FaBus /> Vehicles
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

      <section className="section additional-prices-section">
        <h2>
          <FaMoneyBillWave /> Additional Prices
        </h2>
        <div className="info-grid">
          {tour.additionalPrices?.map((ap, idx) => (
            <div key={idx} className="info-item">
              <label>Type:</label>
              <span>
                {ap.typeOfPersonId?._id || "N/A"} - +${ap.moneyMore}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section special-section">
        <h2>
          <FaStar /> Special Experience
        </h2>
        <div
          dangerouslySetInnerHTML={{ __html: tour.specialExperience || "" }}
          className="html-content"
        />
      </section>

      <section className="section audit-section">
        <h2>
          <FaUser /> Audit Trail
        </h2>
        <div className="info-grid">
          <div className="info-item full-width">
            <label>Created By:</label>
            <span>
              {tour.createdBy?._id?.fullName} at {tour.createdBy?.at}
            </span>
          </div>
          {tour.deletedBy && (
            <div className="info-item full-width">
              <label>Deleted By:</label>
              <span>
                {tour.deletedBy?._id?.fullName} at {tour.deletedBy?.at}
              </span>
            </div>
          )}
          <div className="info-item full-width">
            <label>Updated By:</label>
            <ul>
              {tour.updatedBy?.map((ub, idx) => (
                <li key={idx}>
                  {ub?._id?.fullName} at {ub.at}
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
