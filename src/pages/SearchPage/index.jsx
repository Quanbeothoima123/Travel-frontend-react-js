// src/pages/search/SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SearchBox from "../../components/common/SearchBox";
import CategoryTreeSelect from "../../components/common/DropDownTreeSearch/CategoryTreeSelectUser";
import TourCard from "../../components/common/TourCard";
import Pagination from "../../components/common/Pagination";
import "./SearchPage.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

export default function SearchPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [departPlace, setDepartPlace] = useState("");
  const [filters, setFilters] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [allFilters, setAllFilters] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allDepartPlaces, setAllDepartPlaces] = useState([]);
  const [sortBy, setSortBy] = useState("");

  // Sắp xếp tours
  const sortTours = (tours, sortBy) => {
    if (!sortBy) return tours;

    const sorted = [...tours];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return sorted.sort((a, b) => (a.prices || 0) - (b.prices || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.prices || 0) - (a.prices || 0));
      default:
        return sorted;
    }
  };

  // Format số tiền Việt Nam
  const formatVND = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Parse số tiền từ string formatted
  const parseVND = (formattedAmount) => {
    if (!formattedAmount) return "";
    return formattedAmount.replace(/\D/g, "");
  };

  // Handle input change cho price
  const handlePriceChange = (value, setPriceState) => {
    const numericValue = parseVND(value);
    setPriceState(numericValue);
  };

  // fetch filter + vehicle + depart place options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [filterRes, vehicleRes, departPlaceRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/filter/getAll`),
          fetch(`${API_BASE}/api/v1/vehicle/getAll`),
          fetch(`${API_BASE}/api/v1/depart-place/getAll`),
        ]);
        const filterData = await filterRes.json();
        const vehicleData = await vehicleRes.json();
        const departPlaceData = await departPlaceRes.json();

        setAllFilters(filterData || []);
        setAllVehicles(vehicleData || []);
        setAllDepartPlaces(departPlaceData || []);
      } catch (err) {
        console.error("Lỗi fetch filter/vehicle/departPlace:", err);
      }
    };
    fetchOptions();
  }, []);

  // fetch selectedCategory theo slug ban đầu
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/tour-category/get-tour-category-by-slug/${categorySlug}`
        );
        const data = await res.json();
        setSelectedCategory(data.data); // data phải là object category
      } catch (err) {
        console.error("Lỗi fetch category:", err);
      }
    };
    fetchCategory();
  }, [categorySlug]);

  // fetch tours mỗi khi thay đổi categorySlug, query, page
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const q = params.get("q") || "";
        const min = params.get("minPrice") || "";
        const max = params.get("maxPrice") || "";
        const depart = params.get("departPlace") || "";
        const filters = params.getAll("filters");
        const vehicles = params.getAll("vehicles");

        setQuery(q);
        setMinPrice(min);
        setMaxPrice(max);
        setDepartPlace(depart);
        setFilters(filters);
        setVehicles(vehicles);

        const url = `${API_BASE}/api/v1/tours/advanced-search/${categorySlug}?page=${page}&${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        setTours(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi fetch tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [categorySlug, page, location.search]);

  // toggle filter
  const toggleFilter = (slug) => {
    setFilters((prev) =>
      prev.includes(slug) ? prev.filter((f) => f !== slug) : [...prev, slug]
    );
  };

  // toggle vehicle
  const toggleVehicle = (slug) => {
    setVehicles((prev) =>
      prev.includes(slug) ? prev.filter((v) => v !== slug) : [...prev, slug]
    );
  };

  // nút tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (departPlace) params.set("departPlace", departPlace);
    filters.forEach((f) => params.append("filters", f));
    vehicles.forEach((v) => params.append("vehicles", v));

    // ✅ THÊM: Xử lý selectedCategory
    const targetCategorySlug =
      selectedCategory?.slug || categorySlug || "tour-du-lich";

    navigate(`/search/tours/${targetCategorySlug}?${params.toString()}`);
  };

  return (
    <div className="sp-search-page">
      <div className="sp-search-container">
        <div className="sp-tour-list-container">
          {/* Sort controls */}
          <div className="sp-sort-controls">
            <span className="sp-sort-label">Sắp xếp theo:</span>
            <select
              className="sp-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Mặc định</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>

          <div className="sp-tour-list">
            {loading ? (
              <p className="sp-loading">Đang tải...</p>
            ) : tours.length > 0 ? (
              sortTours(tours, sortBy).map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))
            ) : (
              <p className="sp-no-tours">Không có tour nào.</p>
            )}
          </div>
        </div>

        <div className="sp-search-sidebar">
          <div className="sp-search-filters-container">
            <h3 className="sp-sidebar-title">Tìm kiếm & Lọc</h3>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Tìm kiếm tour</h4>
              <SearchBox setQuery={setQuery} initialValue={query} />
            </div>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Loại tour</h4>
              <CategoryTreeSelect
                value={selectedCategory}
                onChange={(node) => setSelectedCategory(node)}
                fetchUrl={`${API_BASE}/api/v1/admin/tour-categories/get-all-category?tree=true`}
                placeholder="Chọn loại tour..."
                noDataText="Không có danh mục"
              />
            </div>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Khoảng giá</h4>
              <div className="sp-price-range">
                <div className="sp-price-input-group">
                  <input
                    type="text"
                    placeholder="Giá tối thiểu"
                    value={minPrice ? formatVND(minPrice) : ""}
                    onChange={(e) =>
                      handlePriceChange(e.target.value, setMinPrice)
                    }
                    className="sp-price-input"
                  />
                  <span className="sp-currency">đ</span>
                </div>
                <div className="sp-price-input-group">
                  <input
                    type="text"
                    placeholder="Giá tối đa"
                    value={maxPrice ? formatVND(maxPrice) : ""}
                    onChange={(e) =>
                      handlePriceChange(e.target.value, setMaxPrice)
                    }
                    className="sp-price-input"
                  />
                  <span className="sp-currency">đ</span>
                </div>
              </div>
            </div>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Điểm khởi hành</h4>
              <select
                className="sp-depart-place-select"
                value={departPlace}
                onChange={(e) => setDepartPlace(e.target.value)}
              >
                <option value="">Chọn điểm khởi hành</option>
                {allDepartPlaces.map((place) => (
                  <option key={place._id} value={place.slug}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Bộ lọc</h4>
              <div className="sp-checkbox-group">
                {allFilters.map((f) => (
                  <label key={f._id} className="sp-checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.includes(f.slug)}
                      onChange={() => toggleFilter(f.slug)}
                      className="sp-checkbox-input"
                    />
                    <span className="sp-checkbox-custom"></span>
                    <span className="sp-checkbox-label">
                      {f.label || f.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sp-filter-section">
              <h4 className="sp-filter-title">Phương tiện</h4>
              <div className="sp-checkbox-group">
                {allVehicles.map((v) => (
                  <label key={v._id} className="sp-checkbox-item">
                    <input
                      type="checkbox"
                      checked={vehicles.includes(v.slug)}
                      onChange={() => toggleVehicle(v.slug)}
                      className="sp-checkbox-input"
                    />
                    <span className="sp-checkbox-custom"></span>
                    <span className="sp-checkbox-label">{v.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="sp-search-button" onClick={handleSearch}>
              🔍 Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
