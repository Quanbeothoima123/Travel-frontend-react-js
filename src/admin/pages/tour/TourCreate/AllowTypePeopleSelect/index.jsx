import React from "react";
import Select from "react-select";
import "./AllowTypePeopleSelect.css";

/**
 * Props:
 * - personTypes: [{ _id, name }, ...]  (từ API)
 * - value: array of selected ids (["id1","id2", ...])
 * - onChange: (idsArray) => void
 * - label: optional label text
 */
export default function AllowTypePeopleSelect({
  personTypes = [],
  value = [],
  onChange,
  label = "Loại người được phép tham gia",
  placeholder = "-- Chọn loại người --",
}) {
  // build options compatible with react-select
  const options = personTypes.map((p) => ({
    value: p._id,
    label: p.name || "Khách",
  }));

  // current selected option objects
  const selected = options.filter((o) => value?.includes(o.value));

  const handleChange = (selectedOptions) => {
    const ids = Array.isArray(selectedOptions)
      ? selectedOptions.map((s) => s.value)
      : [];
    onChange(ids);
  };

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="form-item allow-type-people">
      <label>{label}</label>

      <div className="allow-type-people-row">
        <div className="allow-type-people-select">
          <Select
            className="react-select scrollable"
            classNamePrefix="react-select"
            isMulti
            options={options}
            value={selected}
            onChange={handleChange}
            placeholder={placeholder}
            closeMenuOnSelect={false}
            menuPlacement="auto"
            maxMenuHeight={200}
            noOptionsMessage={() => "Không có loại người"}
          />
        </div>

        <div className="allow-type-people-buttons">
          <button
            type="button"
            onClick={handleSelectAll}
            className="btn btn-small"
            title="Chọn tất cả"
          >
            Chọn tất cả
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-small"
            title="Bỏ chọn"
          >
            Bỏ chọn
          </button>
        </div>
      </div>
    </div>
  );
}
