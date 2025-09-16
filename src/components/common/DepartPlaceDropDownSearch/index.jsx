import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./DepartPlaceDropDownSearch.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

export default function DepartPlaceDropDownSearch({
  handleChangeValue,
  apiUrl = "/api/v1/depart-place/getAll",
  placeholder = "-- Chọn điểm khởi hành --",
  defaultValue = null,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchDepartPlaces = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + apiUrl);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            value: item._id,
            label: item.name,
            description: item.description,
            googleDirection: item.googleDirection,
          }));
          setOptions(mapped);
        }
      } catch (err) {
        console.error("Error fetching depart places:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartPlaces();
  }, [apiUrl]);

  const handleChange = (selectedOption) => {
    setSelected(selectedOption);
    if (handleChangeValue) {
      handleChangeValue(selectedOption ? selectedOption.value : null);
    }
  };

  return (
    <div className="dpd-dropdown">
      <label className="dpd-dropdown__label">Điểm khởi hành</label>
      <Select
        className="dpd-dropdown__select"
        classNamePrefix="dpd"
        options={options}
        value={selected || defaultValue}
        onChange={handleChange}
        isLoading={loading}
        isClearable
        placeholder={placeholder}
      />
    </div>
  );
}
