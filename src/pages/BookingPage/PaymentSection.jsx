import React from "react";
import "./BookingPage.css";
import { FaHome, FaPaypal, FaCreditCard } from "react-icons/fa";
export default function PaymentSection({
  paymentMethod,
  onChangePayment,
  onSubmit,
  canSubmit,
}) {
  return (
    <>
      <h2>Hình thức thanh toán</h2>
      <div className="payment-grid">
        <label
          className={`payment-card ${
            paymentMethod === "cash" ? "is-active" : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => onChangePayment("cash")}
          />
          <span className="payment-badge payment-badge--red">
            <FaHome /> <span>Thanh toán tại công ty</span>
          </span>
          <span className="payment-desc">
            nhà số 1, ngõ 30, làng Hương Ngải, xã Tây Phương, thành phố Hà Nội
          </span>
        </label>
        <label
          className={`payment-card ${
            paymentMethod === "momo" ? "is-active" : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="momo"
            checked={paymentMethod === "momo"}
            onChange={() => onChangePayment("momo")}
          />
          <span className="payment-badge payment-badge--blue">
            <FaPaypal /> <span>Thanh toán trực tuyến</span>
          </span>
          <span className="payment-desc">
            (Sắp hỗ trợ Momo — hiện chọn để giữ chỗ)
          </span>
        </label>
        <label
          className={`payment-card muted ${
            paymentMethod === "bank-transfer" ? "is-active" : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="bank-transfer"
            checked={paymentMethod === "bank-transfer"}
            onChange={() => onChangePayment("bank-transfer")}
          />
          <span className="payment-badge payment-badge--gray">
            <FaCreditCard /> <span>Chuyển khoản ngân hàng</span>
          </span>
          <span className="payment-desc">
            Tạm thời chưa mở — hiển thị dạng muted giống ảnh mẫu
          </span>
        </label>
      </div>
      <div className="action-row">
        <button
          className="company-payment"
          disabled={!canSubmit || paymentMethod !== "cash"}
          onClick={onSubmit}
        >
          Xác nhận
        </button>
        <button
          className="online-payment"
          disabled={!canSubmit || paymentMethod !== "momo"}
          onClick={onSubmit}
        >
          Thanh toán MOMO
        </button>
      </div>
    </>
  );
}
