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
  const totalBase = Object.values(baseCounts).reduce((sum, v) => sum + v, 0);
  const totalExceed = Object.values(exceedCounts).reduce(
    (sum, v) => sum + v,
    0
  );
  const totalPeople = totalBase + totalExceed;
  const showExceed = hasAdditional && totalBase >= seats;

  return (
    <div className="people-section">
      <div className="people-grid">
        {personTypes.map((type) => (
          <PeopleInput
            key={type.id}
            label={type.name}
            value={baseCounts[type.id] || 0}
            onChange={(v) => onBaseChange(type.id, v)}
            exceedCount={0}
            moneyMore={0}
            showSurcharge={false}
            formatVND={formatVND}
          />
        ))}

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
                key={type.id}
                label={type.name}
                value={exceedCounts[type.id] || 0}
                onChange={(v) => onExceedChange(type.id, v)}
                exceedCount={exceedCounts[type.id] || 0}
                moneyMore={additionalMapById[type.id] || 0}
                showSurcharge={true}
                formatVND={formatVND}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
