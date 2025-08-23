import React from "react";
import "./BookingPage.css";
export default function PeopleInput({
  label,
  value,
  onChange,
  exceedCount = 0,
  moneyMore = 0,
  showSurcharge = false,
  formatVND,
}) {
  const showLine = showSurcharge && moneyMore > 0;

  return (
    <div className="people-tile">
      <label>{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showLine && (
        <div className="surcharge">
          Phụ thu: <strong>{formatVND(moneyMore)} / người</strong>
          {exceedCount > 0 && (
            <>
              — {exceedCount} người vượt =&nbsp;
              <strong>{formatVND(moneyMore * exceedCount)}</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
