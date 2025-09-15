import React from "react";
import "./BookingPage.css";
import { FaHome, FaPaypal, FaCreditCard } from "react-icons/fa";

export default function PaymentSection({
  paymentMethod,
  onChangePayment,
  onSubmitCash,
  onSubmitMomo,
  onSubmitCard, // Thêm prop này
  canSubmit,
  isSubmitting,
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
            Nhà số 1, ngõ 30, làng Hương Ngải, xã Tây Phương, thành phố Hà Nội
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
            <FaPaypal /> <span>Thanh toán ví MoMo</span>
          </span>
          <span className="payment-desc">
            Thanh toán trực tuyến an toàn qua cổng MoMo.
          </span>
        </label>

        <label
          className={`payment-card ${
            paymentMethod === "card" ? "is-active" : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => onChangePayment("card")}
          />
          <span className="payment-badge payment-badge--green">
            <FaCreditCard /> <span>Thanh toán thẻ tín dụng</span>
          </span>
          <span className="payment-desc">
            Thanh toán bằng thẻ tín dụng/ghi nợ.
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
            disabled
          />
          <span className="payment-badge payment-badge--gray">
            <FaCreditCard /> <span>Chuyển khoản ngân hàng</span>
          </span>
          <span className="payment-desc">
            Tạm thời chưa mở — hiển thị dạng muted.
          </span>
        </label>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="company-payment"
          disabled={!canSubmit || paymentMethod !== "cash" || isSubmitting}
          onClick={onSubmitCash}
        >
          {isSubmitting && paymentMethod === "cash"
            ? "Đang xử lý..."
            : "Xác nhận"}
        </button>

        <button
          type="button"
          className="online-payment"
          disabled={!canSubmit || paymentMethod !== "momo" || isSubmitting}
          onClick={onSubmitMomo}
        >
          {isSubmitting && paymentMethod === "momo"
            ? "Đang chuyển đến MoMo..."
            : "Thanh toán MoMo"}
        </button>

        <button
          type="button"
          className="card-payment"
          disabled={!canSubmit || paymentMethod !== "card" || isSubmitting}
          onClick={onSubmitCard}
        >
          {isSubmitting && paymentMethod === "card"
            ? "Đang xử lý..."
            : "Thanh toán thẻ"}
        </button>
      </div>
    </>
  );
}
