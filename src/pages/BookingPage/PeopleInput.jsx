// PeopleInput.jsx
import React from "react";
import "./BookingPage.css";

export default function PeopleInput({
  label,
  value = 0,
  onChange,
  exceedCount = 0,
  moneyMore = 0,
  showSurcharge = false,
  formatVND,
}) {
  // Ensure we always work with numbers
  const safeValue = Number(value) || 0;

  const handleChange = (e) => {
    const raw = e.target.value;
    // parse to integer, clamp to >= 0
    let n = parseInt(raw, 10);
    if (Number.isNaN(n)) n = 0;
    if (n < 0) n = 0;
    onChange(n);
  };

  const showLine = showSurcharge && moneyMore > 0;

  return (
    <div className="people-tile">
      <label>{label}</label>
      <input
        type="number"
        min="0"
        step="1"
        value={safeValue}
        onChange={handleChange}
      />
      {showLine && (
        <div className="surcharge">
          Phụ thu: <strong>{formatVND(moneyMore)} / người</strong>
          {exceedCount > 0 && (
            <>
              {" "}
              — {exceedCount} người vượt =&nbsp;
              <strong>{formatVND(moneyMore * exceedCount)}</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
