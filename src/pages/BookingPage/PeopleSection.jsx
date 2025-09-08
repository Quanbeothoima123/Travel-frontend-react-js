// PeopleSection.jsx
import React from "react";
import PeopleInput from "./PeopleInput";
import { FaInfoCircle } from "react-icons/fa";

export default function PeopleSection({
  baseCounts,
  exceedCounts,
  hasAdditional,
  additionalMapById,
  seats,
  formatVND,
  showToast,
  onBaseChange,
  onExceedChange,
  personTypes = [],
}) {
  const totalBase = Object.values(baseCounts || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalExceed = Object.values(exceedCounts || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalPeople = totalBase + totalExceed;
  const showExceed = hasAdditional && seats > 0 && totalBase >= seats;

  return (
    <div className="people-section">
      <div className="people-grid">
        {personTypes.length > 0 ? (
          personTypes.map((type) => (
            <PeopleInput
              key={type.id}
              label={type.name}
              value={Number(baseCounts?.[type.id] || 0)}
              onChange={(v) => onBaseChange(type.id, v)}
              exceedCount={Number(exceedCounts?.[type.id] || 0)}
              moneyMore={Number(additionalMapById?.[type.id] || 0)}
              showSurcharge={Boolean(additionalMapById?.[type.id])}
              formatVND={formatVND}
            />
          ))
        ) : (
          <div className="people-tile no-types">
            <p>
              Chưa có loại người để đặt cho tour này.
              {hasAdditional
                ? " (Dữ liệu phụ thu có nhưng loại người không có)"
                : ""}
            </p>
            <p>Vui lòng liên hệ admin nếu bạn nghĩ đây là lỗi.</p>
          </div>
        )}

        <div
          className={`people-tile seat-tile ${
            seats <= 0 || totalPeople <= seats ? "ok" : "exceed"
          }`}
        >
          <div className="seat-line">
            <FaInfoCircle />
            <span>
              {seats > 0
                ? totalPeople <= seats
                  ? `Còn ${Math.max(0, seats - totalBase)} chỗ trống`
                  : `Vượt ${totalExceed} chỗ (có phụ thu)`
                : "Đang cập nhật số chỗ"}
            </span>
          </div>
        </div>
      </div>

      {!hasAdditional && seats > 0 && totalPeople > seats && (
        <p className="error">Tour này không cho vượt quá số chỗ.</p>
      )}

      {showExceed && (
        <div className="exceed-section">
          <h3>Số lượng vượt chỗ (có phụ thu)</h3>
          <div className="people-grid">
            {personTypes.map((type) => (
              <PeopleInput
                key={type.id + "-exceed"}
                label={type.name}
                value={Number(exceedCounts?.[type.id] || 0)}
                onChange={(v) => onExceedChange(type.id, v)}
                exceedCount={Number(exceedCounts?.[type.id] || 0)}
                moneyMore={Number(additionalMapById?.[type.id] || 0)}
                showSurcharge={Boolean(additionalMapById?.[type.id])}
                formatVND={formatVND}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
