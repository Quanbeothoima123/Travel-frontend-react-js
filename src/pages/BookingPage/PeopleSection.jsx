// PeopleSection.jsx
import React from "react";
import PeopleInput from "./PeopleInput";
import { FaInfoCircle } from "react-icons/fa";

/**
 * Props:
 * - baseCounts, exceedCounts, hasAdditional, additionalMapById, seats, formatVND,
 *   showToast, onBaseChange, onExceedChange
 * - allowedTypes: [{ id, name }] (from allowTypePeople)
 * - surchargeTypes: [{ id, name }] (from additionalPrices)
 *
 * Behavior:
 * - Base inputs are rendered for allowedTypes (if any). If allowedTypes is empty,
 *   we fall back to rendering surchargeTypes as base inputs (so booking remains possible).
 * - Exceed (vượt chỗ) inputs are rendered only for surchargeTypes.
 */
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
  allowedTypes = [],
  surchargeTypes = [],
}) {
  // totals (guard to treat missing values as 0)
  const totalBase = Object.values(baseCounts || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalExceed = Object.values(exceedCounts || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalPeople = totalBase + totalExceed;

  // base types to render: prefer allowedTypes, otherwise fallback to surchargeTypes
  const baseRenderTypes = allowedTypes.length ? allowedTypes : surchargeTypes;

  // only show exceed section when there is surcharge config AND seats known and base reached seats
  const showExceedSection = hasAdditional && seats > 0 && totalBase >= seats;

  return (
    <div className="people-section">
      <div className="people-grid">
        {baseRenderTypes.length > 0 ? (
          baseRenderTypes.map((type) => (
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
            <p>Chưa có loại người để đặt cho tour này.</p>
            <p>Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ admin.</p>
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

      {showExceedSection && (
        <div className="exceed-section">
          <h3>Số lượng vượt chỗ (có phụ thu)</h3>
          <div className="people-grid">
            {surchargeTypes.map((type) => (
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
