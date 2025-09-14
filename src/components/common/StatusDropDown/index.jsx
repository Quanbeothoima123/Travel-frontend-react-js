import React, { useState } from "react";
import Select from "react-select";

const statusOptions = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "canceled", label: "Đã hủy" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

export default function StatusDropDown({
  handleChangeValue,
  placeholder = "-- Chọn trạng thái --",
  defaultValue = null,
}) {
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (selectedOption) => {
    setSelected(selectedOption);
    if (handleChangeValue) {
      handleChangeValue(selectedOption ? selectedOption.value : null);
    }
  };

  return (
    <div className="status-dropdown">
      <label className="dropdown-label">Trạng thái</label>
      <Select
        className="dropdown-select"
        classNamePrefix="status"
        options={statusOptions}
        value={selected}
        onChange={handleChange}
        isClearable
        placeholder={placeholder}
      />
    </div>
  );
}
