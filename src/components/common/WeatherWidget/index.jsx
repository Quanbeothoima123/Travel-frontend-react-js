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
  const locationUpdateTimerRef = useRef(null);
  const hasInitializedRef = useRef(false); // ✅ Thêm ref này để track đã init chưa

  const API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;
  const DEFAULT_CITY = "Hanoi";
  const LOCATION_UPDATE_INTERVAL = 15 * 60 * 1000;

  const setCookie = (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const saveLocationToCookie = (lat, lon) => {
    const locationData = JSON.stringify({
      lat,
      lon,
      timestamp: Date.now(),
    });
    setCookie("userLocation", locationData);
  };

  const getLocationFromCookie = () => {
    const locationData = getCookie("userLocation");
    if (locationData) {
      try {
        return JSON.parse(locationData);
      } catch (e) {
        console.error("Error parsing location cookie:", e);
        return null;
      }
    }
    return null;
  };

  // ✅ useEffect đầu tiên - CHỈ fetch lần đầu mở modal
  useEffect(() => {
    if (isOpen && !weather && !hasInitializedRef.current) {
      hasInitializedRef.current = true; // Đánh dấu đã init
      const savedLocation = getLocationFromCookie();
      if (savedLocation && savedLocation.lat && savedLocation.lon) {
        fetchWeatherByCoords(savedLocation.lat, savedLocation.lon);
      } else {
        fetchWeatherByCity(DEFAULT_CITY);
      }
    }

    // Reset flag khi đóng modal
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const savedLocation = getLocationFromCookie();
      if (savedLocation && savedLocation.lat && savedLocation.lon) {
        const timeSinceLastUpdate = Date.now() - savedLocation.timestamp;
        if (timeSinceLastUpdate >= LOCATION_UPDATE_INTERVAL) {
          updateCurrentLocation(true);
        }

        locationUpdateTimerRef.current = setInterval(() => {
          updateCurrentLocation(true);
        }, LOCATION_UPDATE_INTERVAL);
      }
    }

    return () => {
      if (locationUpdateTimerRef.current) {
        clearInterval(locationUpdateTimerRef.current);
      }
    };
  }, [isOpen]);

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

  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`,
        {
          headers: {
            "User-Agent": "WeatherWidget/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy tên địa điểm");
      }

      const data = await response.json();
      const address = data.address;
      let locationName = "";

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

      const district = address.city_district || address.county;
      if (district && !locationName.includes(district)) {
        locationName += `, ${district}`;
      }

      const city = address.city || address.town || address.state;
      if (city && !locationName.includes(city)) {
        locationName += `, ${city}`;
      }

      return locationName;
    } catch (err) {
      console.error("Error in reverse geocoding:", err);
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

      return null;
    }
  };

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

  // ✅ Thêm tham số saveLocation để quyết định có lưu cookie không
  const fetchWeatherByCoords = async (lat, lon, saveLocation = false) => {
    setLoading(true);
    setError(null);

    try {
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
      const locationName = await getLocationName(lat, lon);

      if (locationName) {
        weatherData.name = locationName;
        weatherData.displayName = locationName;
      }

      setWeather(weatherData);

      // ✅ Chỉ save location khi đó là vị trí hiện tại của người dùng
      if (saveLocation) {
        saveLocationToCookie(lat, lon);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Truyền saveLocation = true khi dùng vị trí hiện tại
  const updateCurrentLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    if (!silent) setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude, true); // ✅ Save location = true
        setLocationPermission("granted");
      },
      (err) => {
        if (!silent) {
          setError(
            "Không thể truy cập vị trí. Vui lòng cho phép truy cập vị trí."
          );
          setLocationPermission("denied");
          setLoading(false);
        }
      }
    );
  };

  const handleGetLocation = () => {
    updateCurrentLocation(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeatherByCity(cityInput.trim());
      setCityInput("");
    }
  };

  // ✅ Truyền saveLocation = false khi chọn từ suggestion
  const handleSuggestionClick = (suggestion) => {
    // Không lưu cookie khi search thành phố, chỉ hiển thị
    fetchWeatherByCoords(suggestion.lat, suggestion.lon, false);
    setCityInput("");
    setShowSuggestions(false);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

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
      <button
        className="ww-trigger-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Xem thời tiết"
      >
        <Cloud size={20} />
        <span>Thời tiết</span>
      </button>

      {isOpen && (
        <div className="ww-overlay" onClick={() => setIsOpen(false)}>
          <div className="ww-modal" onClick={(e) => e.stopPropagation()}>
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

            <button
              className="ww-location-btn"
              onClick={handleGetLocation}
              disabled={loading}
            >
              <MapPin size={16} />
              <span>Sử dụng vị trí hiện tại</span>
            </button>

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
