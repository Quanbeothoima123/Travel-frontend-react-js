import React from "react";
import { Link } from "react-router-dom";
import {
  FaHashtag,
  FaFileInvoiceDollar,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaGlobe,
  FaInfoCircle,
  FaCogs,
} from "react-icons/fa";
import "./InvoiceTableUser.css";

const InvoiceTableUser = ({ data }) => {
  if (!data || !data.invoices || data.invoices.length === 0) {
    return (
      <div className="itu-table-empty">
        <p>Không có hóa đơn nào được tìm thấy</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTourTypeText = (type) => {
    return type === "aboard" ? "Nước ngoài" : "Trong nước";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "paid":
        return "Đã thanh toán";
      case "cancelled":
        return "Đã hủy";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const handleCancelTour = (invoiceId) => {
    console.log("Cancel tour:", invoiceId);
  };
  const handleViewDetails = (invoiceId) => {
    console.log("View details:", invoiceId);
  };
  const handleContact = (invoiceId) => {
    console.log("Contact support:", invoiceId);
  };

  return (
    <div className="itu-container">
      <div className="itu-wrapper">
        <table className="itu-table">
          <thead className="itu-thead">
            <tr>
              <th>
                <span className="itu-th-content">
                  <FaHashtag className="itu-th-icon" />
                  STT
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaFileInvoiceDollar className="itu-th-icon" />
                  Mã thanh toán
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaMapMarkedAlt className="itu-th-icon" />
                  Tên tour
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaCalendarAlt className="itu-th-icon" />
                  Ngày đặt
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaUsers className="itu-th-icon" />
                  Số lượng ghế
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaMoneyBillWave className="itu-th-icon" />
                  Tổng tiền
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaGlobe className="itu-th-icon" />
                  Loại tour
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaInfoCircle className="itu-th-icon" />
                  Trạng thái
                </span>
              </th>
              <th>
                <span className="itu-th-content">
                  <FaCogs className="itu-th-icon" />
                  Hành động
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {data.invoices.map((invoice, index) => (
              <tr key={invoice._id}>
                <td>
                  {index +
                    1 +
                    (data.pagination.currentPage - 1) * data.pagination.limit}
                </td>
                <td className="itu-code">{invoice.invoiceCode}</td>
                <td className="itu-tour-info">
                  <a
                    href={`/tour/${invoice.tourId.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="itu-tour-link"
                  >
                    <div className="itu-tour-content">
                      <img
                        src={invoice.tourId.thumbnail}
                        alt={invoice.tourId.title}
                        className="itu-tour-thumbnail"
                      />
                      <span className="itu-tour-title">
                        {invoice.tourId.title}
                      </span>
                    </div>
                  </a>
                </td>
                <td>{formatDate(invoice.createdAt)}</td>
                <td className="itu-text-center">{invoice.totalPeople}</td>
                <td className="itu-total-price">
                  {formatPrice(invoice.totalPrice)}
                </td>
                <td>
                  <span
                    className={`itu-tour-type itu-tour-type-${invoice.tourId.type}`}
                  >
                    {getTourTypeText(invoice.tourId.type)}
                  </span>
                </td>
                <td>
                  <span className={`itu-status itu-status-${invoice.status}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td>
                  <div className="itu-actions">
                    {invoice.status === "pending" && (
                      <>
                        <button
                          className="itu-btn itu-btn-cancel"
                          onClick={() => handleCancelTour(invoice._id)}
                        >
                          Hủy tour
                        </button>
                        {invoice.typeOfPayment === "momo" && (
                          <Link
                            className="itu-btn itu-btn-pay-again"
                            to={`/repay/${invoice._id}`}
                          >
                            Thanh toán lại
                          </Link>
                        )}
                        <button
                          className="itu-btn itu-btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                      </>
                    )}

                    {invoice.status === "paid" && (
                      <>
                        <button
                          className="itu-btn itu-btn-cancel"
                          onClick={() => handleCancelTour(invoice._id)}
                        >
                          Hủy
                        </button>
                        <button
                          className="itu-btn itu-btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                      </>
                    )}

                    {invoice.status === "refunded" && (
                      <>
                        <button
                          className="itu-btn itu-btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="itu-btn itu-btn-contact"
                          onClick={() => handleContact(invoice._id)}
                        >
                          Liên hệ
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pagination && (
        <div className="itu-pagination">
          <p>
            Hiển thị {data.invoices.length} trên{" "}
            {data.pagination.totalDocuments} kết quả (Trang{" "}
            {data.pagination.currentPage}/{data.pagination.totalPages})
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceTableUser;
