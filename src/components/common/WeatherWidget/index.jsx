import React, { useState, useEffect } from "react";
import {
  Cloud,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Gauge,
  X,
  Search,
  Loader,
} from "lucide-react";
import "./WeatherWidget.css";

const WeatherWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("");
  const [locationPermission, setLocationPermission] = useState("prompt");

  // API key từ environment variable (demo: sử dụng key mẫu)
  const API_KEY =
    process.env.REACT_APP_OPENWEATHER_KEY || "demo_key_replace_with_real";
  const DEFAULT_CITY = "Hanoi";

  // Load thời tiết mặc định khi mở widget lần đầu
  useEffect(() => {
    if (isOpen && !weather) {
      fetchWeatherByCity(DEFAULT_CITY);
    }
  }, [isOpen]);

  // Hàm gọi API theo tên thành phố
  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!response.ok) {
        throw new Error("Không tìm thấy thành phố");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API theo tọa độ GPS
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu thời tiết");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lấy vị trí hiện tại
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
        setLocationPermission("granted");
      },
      (err) => {
        setError(
          "Không thể truy cập vị trí. Vui lòng cho phép truy cập vị trí."
        );
        setLocationPermission("denied");
        setLoading(false);
      }
    );
  };

  // Xử lý tìm kiếm theo tên thành phố
  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeatherByCity(cityInput.trim());
    }
  };

  // Lấy icon thời tiết
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <>
      {/* Nút mở widget */}
      <button
        className="ww-trigger-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Xem thời tiết"
      >
        <Cloud size={20} />
        <span>Thời tiết</span>
      </button>

      {/* Modal widget */}
      {isOpen && (
        <div className="ww-overlay" onClick={() => setIsOpen(false)}>
          <div className="ww-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ww-header">
              <div className="ww-header-title">
                <Cloud size={24} />
                <h3>Thời tiết</h3>
              </div>
              <button
                className="ww-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search bar */}
            <form className="ww-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="ww-search-input"
                placeholder="Nhập tên thành phố..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
              <button
                type="submit"
                className="ww-search-btn"
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Location button */}
            <button
              className="ww-location-btn"
              onClick={handleGetLocation}
              disabled={loading}
            >
              <MapPin size={16} />
              <span>Sử dụng vị trí hiện tại</span>
            </button>

            {/* Content area */}
            <div className="ww-content">
              {loading && (
                <div className="ww-loading">
                  <Loader className="ww-spinner" size={32} />
                  <p>Đang tải dữ liệu...</p>
                </div>
              )}

              {error && !loading && (
                <div className="ww-error">
                  <p>{error}</p>
                  <button
                    className="ww-retry-btn"
                    onClick={() => fetchWeatherByCity(DEFAULT_CITY)}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {weather && !loading && !error && (
                <div className="ww-weather-display">
                  {/* Main info */}
                  <div className="ww-main-info">
                    <div className="ww-location">
                      <MapPin size={18} />
                      <h2>
                        {weather.name}, {weather.sys.country}
                      </h2>
                    </div>

                    <div className="ww-temp-wrapper">
                      <img
                        src={getWeatherIcon(weather.weather[0].icon)}
                        alt={weather.weather[0].description}
                        className="ww-weather-icon"
                      />
                      <div className="ww-temp-info">
                        <div className="ww-temp">
                          {Math.round(weather.main.temp)}°C
                        </div>
                        <div className="ww-description">
                          {weather.weather[0].description}
                        </div>
                      </div>
                    </div>

                    <div className="ww-feels-like">
                      Cảm giác như {Math.round(weather.main.feels_like)}°C
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="ww-details-grid">
                    <div className="ww-detail-item">
                      <div className="ww-detail-icon">
                        <Droplets size={20} />
                      </div>
                      <div className="ww-detail-info">
                        <div className="ww-detail-label">Độ ẩm</div>
                        <div className="ww-detail-value">
                          {weather.main.humidity}%
                        </div>
                      </div>
                    </div>

                    <div className="ww-detail-item">
                      <div className="ww-detail-icon">
                        <Wind size={20} />
                      </div>
                      <div className="ww-detail-info">
                        <div className="ww-detail-label">Tốc độ gió</div>
                        <div className="ww-detail-value">
                          {weather.wind.speed} m/s
                        </div>
                      </div>
                    </div>

                    <div className="ww-detail-item">
                      <div className="ww-detail-icon">
                        <Gauge size={20} />
                      </div>
                      <div className="ww-detail-info">
                        <div className="ww-detail-label">Áp suất</div>
                        <div className="ww-detail-value">
                          {weather.main.pressure} hPa
                        </div>
                      </div>
                    </div>

                    <div className="ww-detail-item">
                      <div className="ww-detail-icon">
                        <Eye size={20} />
                      </div>
                      <div className="ww-detail-info">
                        <div className="ww-detail-label">Tầm nhìn</div>
                        <div className="ww-detail-value">
                          {weather.visibility
                            ? (weather.visibility / 1000).toFixed(1)
                            : "N/A"}{" "}
                          km
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="ww-additional-info">
                    <div className="ww-info-row">
                      <span>Nhiệt độ cao nhất:</span>
                      <strong>{Math.round(weather.main.temp_max)}°C</strong>
                    </div>
                    <div className="ww-info-row">
                      <span>Nhiệt độ thấp nhất:</span>
                      <strong>{Math.round(weather.main.temp_min)}°C</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ww-footer">
              <small>Dữ liệu từ OpenWeatherMap API</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherWidget;
