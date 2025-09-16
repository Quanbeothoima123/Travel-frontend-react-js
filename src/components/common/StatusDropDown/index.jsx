import React, { useState } from "react";
import "./StatusDropDown.css";

const statusOptions = [
  { value: "", label: "-- Chọn trạng thái (tất cả) --" }, // placeholder/không lọc
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "canceled", label: "Đã hủy" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

export default function StatusDropDown({
  handleChangeValue,
  defaultValue = "",
}) {
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    if (handleChangeValue) {
      handleChangeValue(value || null); // nếu rỗng thì trả về null
    }
  };

  return (
    <div className="sdd-container">
      <label className="sdd-label">Trạng thái</label>
      <select className="sdd-select" value={selected} onChange={handleChange}>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
