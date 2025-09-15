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
      <div className="invoice-table-empty">
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
    <div className="invoice-table-container">
      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead className="table-header-invoice-user">
            <tr>
              <th>
                <span className="th-content">
                  <FaHashtag className="th-icon" />
                  STT
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaFileInvoiceDollar className="th-icon" />
                  Mã thanh toán
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaMapMarkedAlt className="th-icon" />
                  Tên tour
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaCalendarAlt className="th-icon" />
                  Ngày đặt
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaUsers className="th-icon" />
                  Số lượng ghế
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaMoneyBillWave className="th-icon" />
                  Tổng tiền
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaGlobe className="th-icon" />
                  Loại tour
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaInfoCircle className="th-icon" />
                  Trạng thái
                </span>
              </th>
              <th>
                <span className="th-content">
                  <FaCogs className="th-icon" />
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
                <td className="invoice-code">{invoice.invoiceCode}</td>
                <td className="invoice-tour-info">
                  <a
                    href={`/tour/${invoice.tourId.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour-link"
                  >
                    <div className="tour-content">
                      <img
                        src={invoice.tourId.thumbnail}
                        alt={invoice.tourId.title}
                        className="tour-thumbnail"
                      />
                      <span className="tour-title">{invoice.tourId.title}</span>
                    </div>
                  </a>
                </td>
                <td>{formatDate(invoice.createdAt)}</td>
                <td className="text-center">{invoice.totalPeople}</td>
                <td className="total-price">
                  {formatPrice(invoice.totalPrice)}
                </td>
                <td>
                  <span
                    className={`tour-type tour-type-${invoice.tourId.type}`}
                  >
                    {getTourTypeText(invoice.tourId.type)}
                  </span>
                </td>
                <td>
                  <span className={`status status-${invoice.status}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td>
                  <div className="invoice-actions">
                    {invoice.status === "pending" && (
                      <>
                        <button
                          className="btn btn-cancel"
                          onClick={() => handleCancelTour(invoice._id)}
                        >
                          Hủy tour
                        </button>
                        {invoice.typeOfPayment === "momo" && (
                          <Link
                            className="btn btn-pay-again"
                            to={`/repay/${invoice._id}`}
                          >
                            Thanh toán lại
                          </Link>
                        )}
                        <button
                          className="btn btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                      </>
                    )}

                    {invoice.status === "paid" && (
                      <>
                        <button
                          className="btn btn-cancel"
                          onClick={() => handleCancelTour(invoice._id)}
                        >
                          Hủy
                        </button>
                        <button
                          className="btn btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                      </>
                    )}

                    {invoice.status === "refunded" && (
                      <>
                        <button
                          className="btn btn-details"
                          onClick={() => handleViewDetails(invoice._id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn-contact"
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
        <div className="invoice-pagination-info">
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
