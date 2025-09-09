import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaEnvelope,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./MomoPaymentResultPage.css";

export default function MomoPaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const qs = new URLSearchParams(location.search);
  const orderId = qs.get("orderId") || qs.get("orderid") || qs.get("invoiceId");
  const resultCode =
    qs.get("resultCode") || qs.get("resultcode") || qs.get("errorCode");
  const transId = qs.get("transId") || qs.get("transactionId");

  // helper formatters
  const formatMoney = (v) => {
    if (v == null) return "Chưa có thông tin";
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v);
    } catch {
      return v;
    }
  };
  const formatDate = (d) => {
    if (!d) return "Chưa có thông tin";
    try {
      return new Date(d).toLocaleString("vi-VN");
    } catch {
      return d;
    }
  };

  // fetch invoice
  useEffect(() => {
    let cancelled = false;
    if (!orderId) {
      setError("Không tìm thấy orderId trong URL.");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/admin/invoice/${orderId}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
        const json = await res.json();
        // backend might return { invoice: { ... } } or invoice object directly
        const inv = json.invoice || json;
        if (!cancelled) setInvoice(inv);
      } catch (err) {
        if (!cancelled) setError(err.message || "Lỗi khi tải invoice");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInvoice();
    return () => (cancelled = true);
  }, [orderId]);

  // If MoMo returned resultCode=0 but invoice not updated yet, poll a few times
  useEffect(() => {
    if (!orderId) return;
    if (String(resultCode) !== "0") return;
    if (!invoice || invoice.status === "paid" || invoice.isPaid) return;

    let attempts = 0;
    const maxAttempts = 8;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/invoice/${orderId}`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const json = await res.json();
          const inv = json.invoice || json;
          setInvoice(inv);
          if (inv.status === "paid" || inv.isPaid) {
            clearInterval(timer);
          }
        }
      } catch (e) {
        // ignore
      }
      if (attempts >= maxAttempts) clearInterval(timer);
    }, 2000);

    return () => clearInterval(timer);
  }, [orderId, resultCode, invoice]);

  const isSuccess = () => {
    if (invoice && (invoice.status === "paid" || invoice.isPaid === true))
      return true;
    if (String(resultCode) === "0") return true;
    return false;
  };

  const handleSendEmail = async () => {
    if (!orderId) return;
    setSendingEmail(true);
    setMessage(null);
    try {
      // backend expected GET with orderId as query param (adjust if your backend endpoint differs)
      const res = await fetch(
        `http://localhost:5000/api/v1/invoice/send-email?orderId=${encodeURIComponent(
          orderId
        )}`,
        { method: "GET", credentials: "include" }
      );
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message || "Đã gửi email. Vui lòng kiểm tra hộp thư.");
      } else {
        setMessage(json.message || "Không thể gửi email. Vui lòng thử lại.");
      }
    } catch (err) {
      setMessage("Lỗi khi gửi email: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!invoiceRef.current) {
      window.print();
      return;
    }
    setPrinting(true);
    try {
      // render the invoice card to canvas
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      // create PDF (A4)
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // create image ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidthMm = pageWidth - 20; // margin 10mm
      const imgHeightMm = (imgProps.height * imgWidthMm) / imgProps.width;

      let position = 10;
      pdf.addImage(imgData, "PNG", 10, position, imgWidthMm, imgHeightMm);
      // if content taller than page, add pages
      let remainingHeightPx =
        canvas.height - imgProps.height * (imgWidthMm / imgProps.width);
      // (rare) For large content, we could split into multiple pages. Basic single page for most invoices.

      const fileName = invoice?.invoiceCode
        ? `${invoice.invoiceCode}.pdf`
        : `invoice-${orderId}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF error:", err);
      // fallback
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const handleHome = () => navigate("/");

  // render helpers for arrays
  const renderSeatList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return <span>Chưa có thông tin</span>;
    return (
      <ul className="seat-list">
        {arr.map((s, idx) => {
          const tp = s.typeOfPersonId || s.typeOfPerson || s.type; // different shapes
          const name =
            typeof tp === "object"
              ? tp.name || tp.title || tp._id || "Khách"
              : tp || "Khách";
          return (
            <li key={idx}>
              <strong>{name}:</strong> {s.quantity ?? 0}{" "}
              {s.moneyMoreForOne
                ? `(+ ${formatMoney(s.moneyMoreForOne)} / người)`
                : ""}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="momo-result-page">
      <div className="container">
        <div className={`result-card ${isSuccess() ? "success" : "fail"}`}>
          <div className="result-header">
            {isSuccess() ? (
              <>
                <FaCheckCircle className="result-icon" />
                <h2>Thanh toán thành công</h2>
              </>
            ) : (
              <>
                <FaTimesCircle className="result-icon" />
                <h2>Thanh toán không thành công</h2>
              </>
            )}
          </div>

          <div className="result-body" ref={invoiceRef}>
            {loading ? (
              <p>Đang tải thông tin hóa đơn...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : !invoice ? (
              <p>Không tìm thấy hóa đơn.</p>
            ) : (
              <div className="invoice-card">
                <div className="invoice-row">
                  <div className="label">Mã hóa đơn</div>
                  <div className="value">
                    {invoice.invoiceCode || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Trạng thái</div>
                  <div className="value">
                    {invoice.status || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Phương thức</div>
                  <div className="value">
                    {invoice.typeOfPayment || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Mã giao dịch (transId)</div>
                  <div className="value">
                    {invoice.transactionId || transId || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Ngày thanh toán</div>
                  <div className="value">
                    {formatDate(invoice.datePayment || invoice.updatedAt)}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Tổng tiền</div>
                  <div className="value">{formatMoney(invoice.totalPrice)}</div>
                </div>

                <hr />

                <div className="invoice-row">
                  <div className="label">Người đặt</div>
                  <div className="value">
                    {invoice.nameOfUser || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">SĐT</div>
                  <div className="value">
                    {invoice.phoneNumber || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Email</div>
                  <div className="value">
                    {invoice.email || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Địa chỉ</div>
                  <div className="value">
                    {invoice.address || "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Ngày khởi hành</div>
                  <div className="value">
                    {formatDate(invoice.departureDate)}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Tổng số khách</div>
                  <div className="value">
                    {invoice.totalPeople ?? "Chưa có thông tin"}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Ghế (loại cơ bản)</div>
                  <div className="value">{renderSeatList(invoice.seatFor)}</div>
                </div>

                <div className="invoice-row">
                  <div className="label">Ghế thêm (phụ phí)</div>
                  <div className="value">
                    {renderSeatList(invoice.seatAddFor)}
                  </div>
                </div>

                <div className="invoice-row">
                  <div className="label">Ghi chú</div>
                  <div className="value">
                    {invoice.note || "Chưa có thông tin"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="result-footer">
            <button className="btn btn-ghost" onClick={handleHome}>
              <FaHome /> <span>Quay về trang chủ</span>
            </button>

            <div className="middle-actions">
              <button
                className="btn btn-secondary"
                onClick={handleSendEmail}
                disabled={sendingEmail || !orderId}
              >
                <FaEnvelope />{" "}
                <span>
                  {sendingEmail ? "Đang gửi..." : "Gửi hóa đơn về email"}
                </span>
              </button>
              {message && <div className="small-message">{message}</div>}
            </div>

            <button
              className="btn btn-primary"
              onClick={handlePrintPDF}
              disabled={printing || !invoice}
            >
              <FaFilePdf />{" "}
              <span>{printing ? "Đang tạo PDF..." : "In / Xuất PDF"}</span>
            </button>
          </div>
        </div>

        <div className="credit">
          <small>
            Travelify — Cảm ơn bạn đã sử dụng dịch vụ. Nếu có thắc mắc, liên hệ
            CSKH.
          </small>
        </div>
      </div>
    </div>
  );
}
