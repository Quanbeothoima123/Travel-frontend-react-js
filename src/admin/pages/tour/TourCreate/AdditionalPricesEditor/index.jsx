import React, { useState } from "react";
import "./AdditionalPricesInput.css";
import { useToast } from "../../../../../contexts/ToastContext";
import { formatCurrencyVND } from "../../../../helpers/formatCurrencyVND";

const AdditionalPricesEditor = ({
  additionalPrices,
  setAdditionalPrices,
  personTypes,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [moneyMore, setMoneyMore] = useState(""); // hiển thị text
  const [moneyValue, setMoneyValue] = useState(0); // số thực lưu backend
  const { showToast } = useToast();

  const addPrice = () => {
    if (!selectedType) {
      showToast("Vui lòng chọn đối tượng", "error");
      return;
    }
    if (!moneyValue || moneyValue <= 0) {
      showToast("Vui lòng nhập số tiền hợp lệ", "error");
      return;
    }

    const exists = additionalPrices.some(
      (p) => p.typeOfPersonId === selectedType
    );
    if (exists) {
      showToast("Đối tượng này đã có phụ thu rồi!", "error");
      return;
    }

    setAdditionalPrices([
      ...additionalPrices,
      { typeOfPersonId: selectedType, moneyMore: moneyValue }, // ✅ lưu số
    ]);
    showToast("Thêm phụ thu thành công!", "success");

    setSelectedType("");
    setMoneyMore("");
    setMoneyValue(0);
  };

  const removePrice = (idx) => {
    const removed = additionalPrices[idx];
    setAdditionalPrices(additionalPrices.filter((_, i) => i !== idx));
    const name =
      personTypes.find((t) => t._id === removed.typeOfPersonId)?.name || "";
    showToast(`Đã xoá phụ thu cho ${name}`, "success");
  };

  const handleMoneyChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // chỉ lấy số
    const numberValue = raw ? parseInt(raw, 10) : 0;
    setMoneyValue(numberValue); // ✅ số thật
    setMoneyMore(raw ? formatCurrencyVND(numberValue) : ""); // ✅ format hiển thị
  };

  return (
    <div className="additional-prices-editor">
      <h4>Phụ thu theo đối tượng</h4>
      <ul>
        {additionalPrices.map((p, idx) => (
          <li key={idx}>
            <span>
              {personTypes.find((t) => t._id === p.typeOfPersonId)?.name}:{" "}
              {formatCurrencyVND(p.moneyMore)} {/* ✅ luôn hiển thị đẹp */}
            </span>
            <button type="button" onClick={() => removePrice(idx)}>
              X
            </button>
          </li>
        ))}
      </ul>
      <div className="price-form">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">-- Chọn đối tượng --</option>
          {personTypes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Số tiền phụ thu"
          value={moneyMore}
          onChange={handleMoneyChange}
        />
        <button type="button" onClick={addPrice}>
          + Thêm
        </button>
      </div>
    </div>
  );
};

export default AdditionalPricesEditor;
