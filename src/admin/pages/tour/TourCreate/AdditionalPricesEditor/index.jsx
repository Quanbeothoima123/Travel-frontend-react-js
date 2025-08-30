import React, { useState } from "react";
import "./AdditionalPricesInput.css";
const AdditionalPricesEditor = ({
  additionalPrices,
  setAdditionalPrices,
  personTypes,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [moneyMore, setMoneyMore] = useState(0);

  const addPrice = () => {
    if (!selectedType) return;
    setAdditionalPrices([
      ...additionalPrices,
      { typeOfPersonId: selectedType, moneyMore: Number(moneyMore) },
    ]);
    setSelectedType("");
    setMoneyMore(0);
  };

  const removePrice = (idx) => {
    setAdditionalPrices(additionalPrices.filter((_, i) => i !== idx));
  };

  return (
    <div className="additional-prices-editor">
      <h4>Phụ thu theo đối tượng</h4>
      <ul>
        {additionalPrices.map((p, idx) => (
          <li key={idx}>
            <span>
              {personTypes.find((t) => t._id === p.typeOfPersonId)?.name}:
              {p.moneyMore.toLocaleString()}đ
            </span>
            <button type="button" onClick={() => removePrice(idx)}>
              ❌
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
          type="number"
          placeholder="Số tiền phụ thu"
          value={moneyMore}
          onChange={(e) => setMoneyMore(e.target.value)}
        />
        <button type="button" onClick={addPrice}>
          + Thêm
        </button>
      </div>
    </div>
  );
};

export default AdditionalPricesEditor;
