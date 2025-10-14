import React, { useState, useEffect, useRef } from "react";
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
  Sun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
} from "lucide-react";
import "./WeatherWidget.css";

const WeatherWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("");
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const API_KEY =
    process.env.REACT_APP_OPENWEATHER_KEY || "a6844b78148e1f3da68f878bcd6f1acf";
  const DEFAULT_CITY = "Hanoi";

  // Load thời tiết mặc định khi mở widget lần đầu
  useEffect(() => {
    if (isOpen && !weather) {
      fetchWeatherByCity(DEFAULT_CITY);
    }
  }, [isOpen]);

  // Xử lý click bên ngoài để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce cho autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cityInput.trim().length >= 2) {
        fetchCitySuggestions(cityInput.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cityInput]);

  // Hàm gọi API gợi ý thành phố (Autocomplete)
  const fetchCitySuggestions = async (query) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=5&appid=${API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("API key không hợp lệ");
        }
        throw new Error("Không thể tải gợi ý thành phố");
      }

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Hàm lấy tên địa điểm từ tọa độ (Reverse Geocoding) - Dùng Nominatim (OpenStreetMap)
  const getLocationName = async (lat, lon) => {
    try {
      // Dùng Nominatim API (miễn phí, chính xác cho VN)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`,
        {
          headers: {
            "User-Agent": "WeatherWidget/1.0", // Nominatim yêu cầu User-Agent
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy tên địa điểm");
      }

      const data = await response.json();

      // Xây dựng tên địa điểm từ các thành phần
      const address = data.address;
      let locationName = "";

      // Ưu tiên: Phường/Xã > Quận/Huyện > Thành phố/Tỉnh
      if (address.suburb || address.quarter || address.neighbourhood) {
        locationName =
          address.suburb || address.quarter || address.neighbourhood;
      } else if (address.village || address.hamlet) {
        locationName = address.village || address.hamlet;
      } else if (address.city_district || address.county) {
        locationName = address.city_district || address.county;
      } else if (address.city || address.town) {
        locationName = address.city || address.town;
      } else if (address.state) {
        locationName = address.state;
      } else {
        locationName = data.display_name.split(",")[0];
      }

      // Thêm quận/huyện nếu có
      const district = address.city_district || address.county;
      if (district && !locationName.includes(district)) {
        locationName += `, ${district}`;
      }

      // Thêm thành phố/tỉnh
      const city = address.city || address.town || address.state;
      if (city && !locationName.includes(city)) {
        locationName += `, ${city}`;
      }

      return locationName;
    } catch (err) {
      console.error("Error in reverse geocoding:", err);
      // Fallback: dùng OpenWeatherMap geocoding
      try {
        const fallbackResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.length > 0) {
            const location = fallbackData[0];
            let name = location.local_names?.vi || location.name;
            if (location.state) {
              name += `, ${location.state}`;
            }
            return name;
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback geocoding failed:", fallbackErr);
      }

      return null; // Trả về null nếu không lấy được tên
    }
  };

  // Hàm gọi API theo tên thành phố
  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("API key không hợp lệ. Vui lòng kiểm tra lại.");
        }
        throw new Error("Không tìm thấy thành phố");
      }

      const data = await response.json();
      setWeather(data);
      setShowSuggestions(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API theo tọa độ GPS - IMPROVED: Lấy tên địa điểm chính xác từ Nominatim
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      // Bước 1: Lấy dữ liệu thời tiết từ OpenWeatherMap
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error("API key không hợp lệ. Vui lòng kiểm tra lại.");
        }
        throw new Error("Không thể lấy dữ liệu thời tiết");
      }

      const weatherData = await weatherResponse.json();

      // Bước 2: Lấy tên địa điểm chính xác từ Nominatim
      const locationName = await getLocationName(lat, lon);

      // Nếu lấy được tên từ Nominatim thì thay thế, không thì giữ nguyên
      if (locationName) {
        weatherData.name = locationName;
        // Xóa country code vì đã có tên đầy đủ
        weatherData.displayName = locationName;
      }

      setWeather(weatherData);
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
      setCityInput("");
    }
  };

  // Xử lý khi click vào suggestion
  const handleSuggestionClick = (suggestion) => {
    fetchWeatherByCoords(suggestion.lat, suggestion.lon);
    setCityInput("");
    setShowSuggestions(false);
  };

  // Lấy icon thời tiết từ OpenWeather
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Lấy icon tùy chỉnh từ Lucide
  const getCustomWeatherIcon = (weatherMain) => {
    const iconProps = { size: 60, strokeWidth: 1.5 };

    switch (weatherMain?.toLowerCase()) {
      case "clear":
        return <Sun {...iconProps} className="ww-custom-icon ww-icon-sun" />;
      case "clouds":
        return (
          <Cloud {...iconProps} className="ww-custom-icon ww-icon-cloud" />
        );
      case "rain":
        return (
          <CloudRain {...iconProps} className="ww-custom-icon ww-icon-rain" />
        );
      case "drizzle":
        return (
          <CloudDrizzle
            {...iconProps}
            className="ww-custom-icon ww-icon-drizzle"
          />
        );
      case "snow":
        return (
          <CloudSnow {...iconProps} className="ww-custom-icon ww-icon-snow" />
        );
      default:
        return (
          <Cloud {...iconProps} className="ww-custom-icon ww-icon-cloud" />
        );
    }
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

            {/* Search bar với autocomplete */}
            <div className="ww-search-wrapper">
              <div className="ww-search-form" onSubmit={handleSearch}>
                <div className="ww-search-input-container">
                  <input
                    ref={inputRef}
                    type="text"
                    className="ww-search-input"
                    placeholder="Nhập tên thành phố..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(e);
                      }
                    }}
                  />

                  {/* Dropdown gợi ý */}
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="ww-suggestions-dropdown"
                    >
                      {loadingSuggestions ? (
                        <div className="ww-suggestions-loading">
                          <Loader className="ww-spinner" size={20} />
                          <span>Đang tìm kiếm...</span>
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="ww-suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <MapPin size={16} className="ww-suggestion-icon" />
                            <div className="ww-suggestion-info">
                              <div className="ww-suggestion-name">
                                {suggestion.name}
                              </div>
                              <div className="ww-suggestion-location">
                                {suggestion.state && `${suggestion.state}, `}
                                {suggestion.country}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="ww-search-btn"
                  onClick={handleSearch}
                  aria-label="Tìm kiếm"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

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
                        {weather.displayName ||
                          `${weather.name}, ${weather.sys.country}`}
                      </h2>
                    </div>

                    <div className="ww-temp-wrapper">
                      <div className="ww-weather-icons">
                        {getCustomWeatherIcon(weather.weather[0].main)}
                        <img
                          src={getWeatherIcon(weather.weather[0].icon)}
                          alt={weather.weather[0].description}
                          className="ww-weather-icon"
                        />
                      </div>
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
              <small>Dữ liệu từ OpenWeatherMap & OpenStreetMap</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherWidget;
