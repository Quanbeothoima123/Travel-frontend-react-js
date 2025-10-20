import React, { useState, useEffect, useRef } from "react";
import {
  Plane,
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  ArrowRight,
  Clock,
  Luggage,
  Coffee,
  X,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  AlertCircle,
  Check,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

// Airport Autocomplete Component
const AirportAutocomplete = ({
  value,
  onChange,
  placeholder,
  onSelect,
  label,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/v1/flight/airports/search?keyword=${inputValue}`
        );
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue]);

  const handleSelect = (airport) => {
    const displayText = `${airport.iataCode} - ${airport.name}`;
    setInputValue(displayText);
    onSelect(airport);
    setShowSuggestions(false);
  };

  return (
    <div className="fs-autocomplete-wrapper" ref={wrapperRef}>
      <label className="fs-label">{label}</label>
      <div className="fs-input-container">
        <MapPin size={18} className="fs-input-icon" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="fs-input"
        />
        {loading && <div className="fs-input-loader">...</div>}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="fs-suggestions">
          {suggestions.map((airport, idx) => (
            <div
              key={idx}
              className="fs-suggestion-item"
              onClick={() => handleSelect(airport)}
            >
              <div className="fs-suggestion-code">{airport.iataCode}</div>
              <div className="fs-suggestion-info">
                <div className="fs-suggestion-name">{airport.name}</div>
                <div className="fs-suggestion-location">
                  {airport.cityName}, {airport.countryName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Flight Search Form
const FlightSearchForm = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState("oneWay");
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [showPassengers, setShowPassengers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [nonStop, setNonStop] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `${API_BASE}/api/v1/flight/airports/nearest?latitude=${latitude}&longitude=${longitude}`
          );
          const data = await response.json();
          if (data.success) {
            setOrigin(data.data);
          }
        } catch (error) {
          alert("Không thể lấy vị trí");
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        alert("Vui lòng cho phép truy cập vị trí");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    onSearch({
      originLocationCode: origin.iataCode,
      destinationLocationCode: destination.iataCode,
      departureDate,
      returnDate: tripType === "roundTrip" ? returnDate : null,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      travelClass,
      nonStop,
    });
  };

  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;

  return (
    <form className="fs-search-form" onSubmit={handleSubmit}>
      <div className="fs-trip-type">
        <button
          type="button"
          className={`fs-trip-btn ${tripType === "oneWay" ? "active" : ""}`}
          onClick={() => setTripType("oneWay")}
        >
          Một chiều
        </button>
        <button
          type="button"
          className={`fs-trip-btn ${tripType === "roundTrip" ? "active" : ""}`}
          onClick={() => setTripType("roundTrip")}
        >
          Khứ hồi
        </button>
      </div>

      <div className="fs-form-grid">
        <div className="fs-form-col">
          <AirportAutocomplete
            value={origin?.name || ""}
            onChange={() => {}}
            placeholder="Nhập thành phố hoặc sân bay..."
            onSelect={setOrigin}
            label="Điểm đi"
          />
          <button
            type="button"
            className="fs-location-btn"
            onClick={handleGetLocation}
            disabled={gettingLocation}
            title="Sử dụng vị trí hiện tại"
          >
            <MapPin size={16} />
          </button>
        </div>

        <div className="fs-form-col">
          <AirportAutocomplete
            value={destination?.name || ""}
            onChange={() => {}}
            placeholder="Nhập thành phố hoặc sân bay..."
            onSelect={setDestination}
            label="Điểm đến"
          />
        </div>

        <div className="fs-form-col">
          <label className="fs-label">Ngày đi</label>
          <div className="fs-input-container">
            <Calendar size={18} className="fs-input-icon" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="fs-input"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {tripType === "roundTrip" && (
          <div className="fs-form-col">
            <label className="fs-label">Ngày về</label>
            <div className="fs-input-container">
              <Calendar size={18} className="fs-input-icon" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="fs-input"
                min={departureDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        )}

        <div className="fs-form-col fs-passengers-col">
          <label className="fs-label">Hành khách & Hạng vé</label>
          <div
            className="fs-input-container fs-clickable"
            onClick={() => setShowPassengers(!showPassengers)}
          >
            <Users size={18} className="fs-input-icon" />
            <div className="fs-passengers-display">
              {totalPassengers} hành khách, {travelClass}
            </div>
            <ChevronDown size={18} />
          </div>

          {showPassengers && (
            <div className="fs-passengers-dropdown">
              <div className="fs-passenger-row">
                <span>Người lớn (≥12 tuổi)</span>
                <div className="fs-counter">
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({
                        ...p,
                        adults: Math.max(1, p.adults - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <span>{passengers.adults}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({ ...p, adults: p.adults + 1 }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="fs-passenger-row">
                <span>Trẻ em (2-11 tuổi)</span>
                <div className="fs-counter">
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({
                        ...p,
                        children: Math.max(0, p.children - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <span>{passengers.children}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({ ...p, children: p.children + 1 }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="fs-passenger-row">
                <span>Em bé (&lt;2 tuổi)</span>
                <div className="fs-counter">
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({
                        ...p,
                        infants: Math.max(0, p.infants - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <span>{passengers.infants}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers((p) => ({ ...p, infants: p.infants + 1 }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="fs-class-selector">
                <button
                  type="button"
                  className={travelClass === "ECONOMY" ? "active" : ""}
                  onClick={() => setTravelClass("ECONOMY")}
                >
                  Phổ thông
                </button>
                <button
                  type="button"
                  className={travelClass === "PREMIUM_ECONOMY" ? "active" : ""}
                  onClick={() => setTravelClass("PREMIUM_ECONOMY")}
                >
                  Phổ thông đặc biệt
                </button>
                <button
                  type="button"
                  className={travelClass === "BUSINESS" ? "active" : ""}
                  onClick={() => setTravelClass("BUSINESS")}
                >
                  Thương gia
                </button>
                <button
                  type="button"
                  className={travelClass === "FIRST" ? "active" : ""}
                  onClick={() => setTravelClass("FIRST")}
                >
                  Hạng nhất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fs-advanced-filters">
        <button
          type="button"
          className="fs-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Bộ lọc nâng cao
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFilters && (
          <div className="fs-filters-content">
            <label className="fs-checkbox">
              <input
                type="checkbox"
                checked={nonStop}
                onChange={(e) => setNonStop(e.target.checked)}
              />
              <span>Chỉ chuyến bay thẳng</span>
            </label>
          </div>
        )}
      </div>

      <button type="submit" className="fs-submit-btn" disabled={loading}>
        <Search size={20} />
        {loading ? "Đang tìm kiếm..." : "Tìm chuyến bay"}
      </button>
    </form>
  );
};

// Flight Card Component
const FlightCard = ({ flight, dictionaries, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const itinerary = flight.itineraries[0];
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const parseDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return `${hours}g ${minutes}p`;
  };

  const airlineName =
    dictionaries?.carriers?.[firstSegment.carrierCode] ||
    firstSegment.carrierCode;
  const stops = itinerary.segments.length - 1;

  // Tính giá trung bình để hiển thị badge "Giá tốt"
  const isPriceGood = parseFloat(flight.price.total) < 2000000;

  return (
    <div className="fs-flight-card">
      <div className="fs-flight-main">
        <div className="fs-flight-airline">
          <div className="fs-airline-logo">{firstSegment.carrierCode}</div>
          <div>
            <div className="fs-airline-name">{airlineName}</div>
            <div className="fs-flight-number">
              {firstSegment.carrierCode} {firstSegment.number}
            </div>
          </div>
        </div>

        <div className="fs-flight-route">
          <div className="fs-flight-time">
            <div className="fs-time">
              {formatTime(firstSegment.departure.at)}
            </div>
            <div className="fs-date">
              {formatDate(firstSegment.departure.at)}
            </div>
            <div className="fs-airport">{firstSegment.departure.iataCode}</div>
          </div>

          <div className="fs-flight-duration">
            <div className="fs-duration-time">
              <Clock size={14} />
              {parseDuration(itinerary.duration)}
            </div>
            <div className="fs-flight-line">
              <div className="fs-line"></div>
              <ArrowRight size={20} className="fs-arrow-icon" />
            </div>
            <div className="fs-stops">
              {stops === 0 ? "Bay thẳng" : `${stops} điểm dừng`}
            </div>
          </div>

          <div className="fs-flight-time">
            <div className="fs-time">{formatTime(lastSegment.arrival.at)}</div>
            <div className="fs-date">{formatDate(lastSegment.arrival.at)}</div>
            <div className="fs-airport">{lastSegment.arrival.iataCode}</div>
          </div>
        </div>

        <div className="fs-flight-price">
          {isPriceGood && (
            <div className="fs-price-badge">
              <TrendingDown size={14} />
              Giá tốt
            </div>
          )}
          <div className="fs-price-amount">
            {parseInt(flight.price.total).toLocaleString("vi-VN")} ₫
          </div>
          <div className="fs-price-label">
            Tổng giá cho {flight.travelerPricings.length} người
          </div>
          <button className="fs-select-btn" onClick={() => onSelect(flight)}>
            <Check size={16} />
            Chọn chuyến bay
          </button>
        </div>
      </div>

      <div className="fs-flight-footer">
        <div className="fs-flight-info">
          <div className="fs-info-item">
            <Luggage size={14} />
            {flight.travelerPricings[0]?.fareDetailsBySegment[0]
              ?.includedCheckedBags?.quantity || 0}{" "}
            hành lý ký gửi
          </div>
          <div className="fs-info-item">
            <Coffee size={14} />
            Hạng {flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin}
          </div>
          {flight.numberOfBookableSeats && (
            <div className="fs-info-item fs-seats-warning">
              <AlertCircle size={14} />
              Chỉ còn {flight.numberOfBookableSeats} chỗ
            </div>
          )}
        </div>

        <button
          className="fs-details-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <X size={16} />
              Đóng chi tiết
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Xem chi tiết chuyến bay
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="fs-flight-details">
          <div className="fs-segments">
            {itinerary.segments.map((segment, idx) => (
              <div key={idx} className="fs-segment">
                <div className="fs-segment-header">
                  <div className="fs-segment-title">
                    Chặng {idx + 1}: {segment.departure.iataCode} →{" "}
                    {segment.arrival.iataCode}
                  </div>
                  <div className="fs-segment-duration">
                    {parseDuration(segment.duration)}
                  </div>
                </div>

                <div className="fs-segment-body">
                  <div className="fs-segment-dep">
                    <div className="fs-segment-time">
                      {formatTime(segment.departure.at)}
                    </div>
                    <div className="fs-segment-airport">
                      {segment.departure.iataCode}
                      {segment.departure.terminal &&
                        ` - Terminal ${segment.departure.terminal}`}
                    </div>
                    <div className="fs-segment-date">
                      {formatDate(segment.departure.at)}
                    </div>
                  </div>

                  <div className="fs-segment-flight">
                    <div className="fs-flight-line-vertical"></div>
                    <div className="fs-segment-aircraft">
                      <Plane size={16} />
                      <div>
                        {dictionaries?.carriers?.[segment.carrierCode]}{" "}
                        {segment.number}
                      </div>
                      <div className="fs-aircraft-code">
                        Máy bay: {segment.aircraft}
                      </div>
                    </div>
                  </div>

                  <div className="fs-segment-arr">
                    <div className="fs-segment-time">
                      {formatTime(segment.arrival.at)}
                    </div>
                    <div className="fs-segment-airport">
                      {segment.arrival.iataCode}
                      {segment.arrival.terminal &&
                        ` - Terminal ${segment.arrival.terminal}`}
                    </div>
                    <div className="fs-segment-date">
                      {formatDate(segment.arrival.at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fs-price-breakdown">
            <div className="fs-breakdown-title">Chi tiết giá</div>
            <div className="fs-breakdown-row">
              <span>Giá cơ bản</span>
              <span>
                {parseInt(flight.price.base).toLocaleString("vi-VN")} ₫
              </span>
            </div>
            {flight.price.fees?.map((fee, idx) => (
              <div key={idx} className="fs-breakdown-row">
                <span>Phí {fee.type}</span>
                <span>{parseInt(fee.amount).toLocaleString("vi-VN")} ₫</span>
              </div>
            ))}
            <div className="fs-breakdown-row fs-breakdown-total">
              <span>Tổng cộng</span>
              <span>
                {parseInt(flight.price.grandTotal).toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function FlightSearchPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useState(null);
  const [sortBy, setSortBy] = useState("price");

  const handleSearch = async (params) => {
    setLoading(true);
    setError("");
    setSearchParams(params);

    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v != null)
      ).toString();

      const response = await fetch(
        `${API_BASE}/api/v1/flight/flights/search?${queryString}`
      );
      const data = await response.json();

      if (data.success) {
        setFlights(data.data);
      } else {
        setError(data.message);
        setFlights([]);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    alert(
      `Bạn đã chọn chuyến bay ${flight.id}. Tính năng đặt vé sẽ được phát triển tiếp!`
    );
  };

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === "price")
      return parseFloat(a.price.total) - parseFloat(b.price.total);
    if (sortBy === "duration") {
      const durationA = a.itineraries[0].segments.reduce((sum, seg) => {
        const match = seg.duration.match(/PT(\d+H)?(\d+M)?/);
        return (
          sum +
          (match[1] ? parseInt(match[1]) * 60 : 0) +
          (match[2] ? parseInt(match[2]) : 0)
        );
      }, 0);
      const durationB = b.itineraries[0].segments.reduce((sum, seg) => {
        const match = seg.duration.match(/PT(\d+H)?(\d+M)?/);
        return (
          sum +
          (match[1] ? parseInt(match[1]) * 60 : 0) +
          (match[2] ? parseInt(match[2]) : 0)
        );
      }, 0);
      return durationA - durationB;
    }
    return 0;
  });

  const dictionaries = flights.length > 0 ? flights[0].dictionaries : {};

  const parseDuration = (duration) => {
    if (!duration) return "N/A";
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return `${hours}g ${minutes}p`;
  };

  return (
    <div className="fs-container">
      <div className="fs-header">
        <div className="fs-header-content">
          <Plane size={32} className="fs-logo" />
          <h1 className="fs-header-title">Tìm kiếm chuyến bay</h1>
        </div>
      </div>

      <div className="fs-main">
        <FlightSearchForm onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="fs-results">
            <div className="fs-loading">
              <div className="fs-loading-spinner"></div>
              <div className="fs-loading-text">
                Đang tìm kiếm chuyến bay tốt nhất cho bạn...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fs-results">
            <div className="fs-error">
              <AlertCircle size={20} />
              {error}
            </div>
          </div>
        )}

        {!loading && !error && flights.length > 0 && (
          <div className="fs-results">
            <div className="fs-results-header">
              <div className="fs-results-title">
                Tìm thấy {flights.length} chuyến bay
              </div>
              <select
                className="fs-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Giá tăng dần</option>
                <option value="duration">Thời gian bay</option>
              </select>
            </div>

            <div className="fs-stats-bar">
              <div className="fs-stat-item">
                <TrendingDown size={18} className="fs-stat-icon" />
                <div>
                  <div className="fs-stat-label">Giá thấp nhất</div>
                  <div className="fs-stat-value">
                    {Math.min(
                      ...flights.map((f) => parseFloat(f.price.total))
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </div>
                </div>
              </div>

              <div className="fs-stat-item">
                <Clock size={18} className="fs-stat-icon" />
                <div>
                  <div className="fs-stat-label">Bay nhanh nhất</div>
                  <div className="fs-stat-value">
                    {parseDuration(
                      flights.reduce((min, f) => {
                        const duration = f.itineraries[0].duration;
                        return !min || duration < min ? duration : min;
                      }, null)
                    )}
                  </div>
                </div>
              </div>

              <div className="fs-stat-item">
                <Check size={18} className="fs-stat-icon" />
                <div>
                  <div className="fs-stat-label">Bay thẳng</div>
                  <div className="fs-stat-value">
                    {
                      flights.filter(
                        (f) => f.itineraries[0].segments.length === 1
                      ).length
                    }{" "}
                    chuyến
                  </div>
                </div>
              </div>
            </div>

            {sortedFlights.map((flight, idx) => (
              <FlightCard
                key={idx}
                flight={flight}
                dictionaries={dictionaries}
                onSelect={handleSelectFlight}
              />
            ))}
          </div>
        )}

        {!loading && !error && flights.length === 0 && searchParams && (
          <div className="fs-results">
            <div className="fs-empty">
              <Plane size={64} className="fs-empty-icon" />
              <p>
                Không tìm thấy chuyến bay phù hợp. Vui lòng thử tìm kiếm với
                tiêu chí khác.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
