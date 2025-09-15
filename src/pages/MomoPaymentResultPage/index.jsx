import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaEnvelope,
  FaFilePdf,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaUsers,
  FaChair,
  FaTag,
  FaStickyNote,
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./MomoPaymentResultPage.css";
import LoadingModal from "../../admin/components/common/LoadingModal";
import { useToast } from "../../../src/contexts/ToastContext";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function MomoPaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const qs = new URLSearchParams(location.search);
  const orderId = qs.get("orderId");
  const resultCode = qs.get("resultCode");
  const transId = qs.get("transId");
  const { showToast } = useToast();

  const formatMoney = (v) =>
    v != null
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "Chưa có thông tin";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("vi-VN") : "Chưa có thông tin";

  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy orderId trong URL.");
      setLoading(false);
      return;
    }
    const fetchInvoice = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/invoice/detail/${orderId}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setInvoice(json.invoice || json);
      } catch (err) {
        setError(err.message || "Lỗi khi tải invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [orderId]);

  const isSuccess = () =>
    invoice?.isPaid || invoice?.status === "paid" || String(resultCode) === "0";

  const handleSendEmail = async () => {
    if (!orderId) return;
    setSendingEmail(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/invoice/send-email/${encodeURIComponent(orderId)}`,
        { method: "GET", credentials: "include" }
      );

      const json = await res.json();

      if (json.success) {
        showToast(json.message || "Email đã được gửi thành công 🎉", "success");
      } else {
        showToast(json.message || "Không thể gửi email.", "error");
      }
    } catch (err) {
      showToast("Lỗi khi gửi email: " + err.message, "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!invoiceRef.current) return window.print();
    setPrinting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * (pageWidth - 20)) / imgProps.width;
      pdf.addImage(imgData, "PNG", 10, 10, pageWidth - 20, imgHeight);
      pdf.save(
        invoice?.invoiceCode
          ? `${invoice.invoiceCode}.pdf`
          : `invoice-${orderId}.pdf`
      );
    } catch (err) {
      console.error("PDF error:", err);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const handleHome = () => navigate("/");

  const renderSeatList = (arr, isAdditional = false) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <ul className="seat-list">
        {arr.map((s, idx) => (
          <li key={idx} className="seat-item">
            <FaUsers className="seat-icon" />{" "}
            <strong>{s.typeOfPersonId?.name || "Khách"}:</strong>{" "}
            {s.quantity ?? 0}
            {isAdditional && s.moneyMoreForOne
              ? ` (+${formatMoney(s.moneyMoreForOne)} / người)`
              : ""}
          </li>
        ))}
      </ul>
    ) : (
      <span className="no-info">Chưa có thông tin</span>
    );

  return (
    <div className="momo-result-page">
      <div className="container">
        <div className={`result-card ${isSuccess() ? "success" : "fail"}`}>
          <div className="result-header">
            {isSuccess() ? (
              <>
                <FaCheckCircle className="result-icon" />
                <h2 className="result-title">Đặt tour thành công</h2>
              </>
            ) : (
              <>
                <FaTimesCircle className="result-icon" />
                <h2 className="result-title">Đặt tour thất bại</h2>
              </>
            )}
          </div>

          <div className="result-body" ref={invoiceRef}>
            {loading ? (
              <p className="loading-text">Đang tải thông tin hóa đơn...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : !invoice ? (
              <p className="no-info">Không tìm thấy hóa đơn.</p>
            ) : (
              <div className="invoice-card">
                <div className="invoice-header">
                  <h3>Hóa đơn chi tiết</h3>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaTag className="icon" /> Mã hóa đơn
                  </div>
                  <div className="value">{invoice.invoiceCode}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaTag className="icon" /> Trạng thái
                  </div>
                  <div className="value">{invoice.status}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaTag className="icon" /> Phương thức
                  </div>
                  <div className="value">{invoice.typeOfPayment}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaTag className="icon" /> Mã giao dịch
                  </div>
                  <div className="value">
                    {invoice.transactionId || transId || "Chưa có"}
                  </div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaCalendarAlt className="icon" /> Ngày thanh toán
                  </div>
                  <div className="value">{formatDate(invoice.datePayment)}</div>
                </div>
                <div className="invoice-row highlight">
                  <div className="label">
                    <FaTag className="icon" /> Tổng tiền
                  </div>
                  <div className="value">{formatMoney(invoice.totalPrice)}</div>
                </div>

                <hr className="divider" />

                <div className="invoice-row">
                  <div className="label">
                    <FaUser className="icon" /> Người đặt
                  </div>
                  <div className="value">{invoice.nameOfUser}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaPhone className="icon" /> SĐT
                  </div>
                  <div className="value">{invoice.phoneNumber}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaEnvelope className="icon" /> Email
                  </div>
                  <div className="value">{invoice.email}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaMapMarkerAlt className="icon" /> Địa chỉ
                  </div>
                  <div className="value">
                    {`${invoice.address || ""}, ${
                      invoice.ward?.name_with_type || ""
                    }, ${invoice.province?.name_with_type || ""}`.trim()}
                  </div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaCalendarAlt className="icon" /> Ngày khởi hành
                  </div>
                  <div className="value">
                    {formatDate(invoice.departureDate)}
                  </div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaUsers className="icon" /> Tổng số khách
                  </div>
                  <div className="value">{invoice.totalPeople}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaChair className="icon" /> Ghế cơ bản
                  </div>
                  <div className="value">{renderSeatList(invoice.seatFor)}</div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaChair className="icon" /> Ghế thêm
                  </div>
                  <div className="value">
                    {renderSeatList(invoice.seatAddFor, true)}
                  </div>
                </div>
                <div className="invoice-row">
                  <div className="label">
                    <FaStickyNote className="icon" /> Ghi chú
                  </div>
                  <div className="value">{invoice.note}</div>
                </div>
              </div>
            )}
          </div>

          <div className="result-footer">
            <button className="btn btn-ghost" onClick={handleHome}>
              <FaHome className="btn-icon" /> <span>Trang chủ</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleSendEmail}
              disabled={sendingEmail}
            >
              <FaEnvelope className="btn-icon" /> Gửi email
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePrintPDF}
              disabled={printing || !invoice}
            >
              <FaFilePdf className="btn-icon" /> Xuất PDF
            </button>
          </div>
        </div>
        <div className="credit">
          Cảm ơn bạn đã quan tâm đến dịch vụ - Chúng tôi sẽ liên hệ sớm nhất với
          bạn!
        </div>
      </div>

      {/* Loading Modal hiển thị khi gửi email hoặc tạo PDF */}
      <LoadingModal
        open={sendingEmail}
        message="Đang gửi email..."
        icon="FaEnvelope"
      />
      <LoadingModal
        open={printing}
        message="Đang tạo file PDF..."
        icon="FaFilePdf"
      />
    </div>
  );
}
