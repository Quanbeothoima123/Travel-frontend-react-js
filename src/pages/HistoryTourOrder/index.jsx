import React, { useState, useEffect, useCallback } from "react";
import InvoiceSearchFilterUser from "../../components/common/InvoiceSearchFilterUser";
import InvoiceTableUser from "../../components/common/InvoiceTableUser";
import "./HistoryTourOrder.css";
import PaginationV2 from "../../components/common/Pagination_V2";

const HistoryTourOrder = () => {
  const [filters, setFilters] = useState({
    search: "",
    searchTour: "",
    categoryId: null,
    tourType: null,
    departPlaceId: null,
    status: null,
    typeOfPayment: null,
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE =
    process.env.REACT_APP_DOMAIN_BACKEND || "http://localhost:5000";

  const buildQueryString = useCallback((filterParams) => {
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });
    return params.toString();
  }, []);

  const fetchInvoices = useCallback(
    async (filterParams = filters) => {
      try {
        setLoading(true);
        setError(null);
        const queryString = buildQueryString(filterParams);
        const url = `${API_BASE}/api/v1/invoice/get-all-invoice${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.success) {
          setInvoiceData(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch invoices");
        }
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    },
    [filters, buildQueryString, API_BASE]
  );

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleSearch = useCallback(() => {
    fetchInvoices(filters);
  }, [filters, fetchInvoices]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      search: "",
      searchTour: "",
      categoryId: null,
      tourType: null,
      departPlaceId: null,
      status: null,
      typeOfPayment: null,
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    fetchInvoices(resetFilters);
  }, [fetchInvoices]);

  const handlePageChange = useCallback(
    (newPage) => {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      fetchInvoices(newFilters);
    },
    [filters, fetchInvoices]
  );

  const handleSortChange = useCallback(
    (sortBy, sortOrder) => {
      const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
      setFilters(newFilters);
      fetchInvoices(newFilters);
    },
    [filters, fetchInvoices]
  );

  return (
    <div className="history-tour-order">
      <div className="history-tour-order__container">
        {/* Page Header */}
        <header className="history-tour-order__header">
          <h1 className="history-tour-order__title">Lịch sử đặt tour</h1>
          <p className="history-tour-order__description">
            Quản lý và theo dõi tất cả các chuyến du lịch bạn đã đặt
          </p>
        </header>

        {/* Search Filter */}
        <section className="history-tour-order__section">
          <InvoiceSearchFilterUser
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onReset={handleResetFilters}
            isLoading={loading}
          />
        </section>

        {/* Error Display */}
        {error && (
          <section className="history-tour-order__section history-tour-order__error">
            <div className="history-tour-order__error-content">
              <span className="history-tour-order__error-icon">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              className="history-tour-order__retry-button"
              onClick={() => fetchInvoices()}
              disabled={loading}
            >
              Thử lại
            </button>
          </section>
        )}

        {/* Results Info */}
        {invoiceData && (
          <section className="history-tour-order__section history-tour-order__results-info">
            <div className="history-tour-order__results-count">
              <span className="history-tour-order__count-text">
                Tìm thấy{" "}
                <strong>{invoiceData.pagination.totalDocuments}</strong> kết quả
              </span>
            </div>
            <div className="history-tour-order__sort-options">
              <label
                htmlFor="sort-select"
                className="history-tour-order__sort-label"
              >
                Sắp xếp:
              </label>
              <select
                id="sort-select"
                className="history-tour-order__sort-select"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("_");
                  handleSortChange(sortBy, sortOrder);
                }}
              >
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="totalPrice_desc">Giá cao nhất</option>
                <option value="totalPrice_asc">Giá thấp nhất</option>
              </select>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="history-tour-order__section history-tour-order__loading">
            <div className="history-tour-order__loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </section>
        )}

        {/* Invoice Table */}
        {!loading && !error && (
          <section className="history-tour-order__section">
            <InvoiceTableUser data={invoiceData} />
          </section>
        )}

        {/* Pagination */}
        {invoiceData && invoiceData.pagination.totalPages > 1 && (
          <section className="history-tour-order__section history-tour-order__pagination">
            <PaginationV2
              currentPage={invoiceData.pagination.currentPage}
              totalPages={invoiceData.pagination.totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default HistoryTourOrder;
