import React from "react";
import PeopleInput from "./PeopleInput";
import { FaInfoCircle } from "react-icons/fa";
export default function PeopleSection({
  adultsBase,
  childrenBase,
  smallChildrenBase,
  infantsBase,
  adultsExceed,
  childrenExceed,
  smallChildrenExceed,
  infantsExceed,
  hasAdditional,
  additionalMapById,
  seats,
  getTypeIdByKey,
  formatVND,
  showToast,
  onBaseChange,
  onExceedChange,
}) {
  const totalBase = adultsBase + childrenBase + smallChildrenBase + infantsBase;
  const totalExceed =
    adultsExceed + childrenExceed + smallChildrenExceed + infantsExceed;
  const totalPeople = totalBase + totalExceed;
  const showExceed = hasAdditional && totalBase >= seats;

  const adultId = getTypeIdByKey("adults");
  const childId = getTypeIdByKey("children");
  const smallChildId = getTypeIdByKey("smallChildren");
  const infantId = getTypeIdByKey("infants");

  const handleBaseChange = (key, value) => {
    const safe = clampBase(
      value,
      key,
      seats,
      totalBase -
        (key === "adults"
          ? adultsBase
          : key === "children"
          ? childrenBase
          : key === "smallChildren"
          ? smallChildrenBase
          : infantsBase),
      showToast
    );
    if (
      totalBase +
        totalExceed -
        (key === "adults"
          ? adultsBase
          : key === "children"
          ? childrenBase
          : key === "smallChildren"
          ? smallChildrenBase
          : infantsBase) +
        safe >
      seats
    ) {
      showToast("Tổng số người base không được vượt quá số chỗ!", "error");
      return;
    }
    onBaseChange(key, safe);
  };

  const handleExceedChange = (key, value) => {
    const safe = Math.max(0, parseInt(value || "0", 10));
    onExceedChange(key, safe);
  };

  return (
    <div className="people-section">
      <div className="people-grid">
        <PeopleInput
          label="Người lớn"
          value={adultsBase}
          onChange={(v) => handleBaseChange("adults", v)}
          exceedCount={0}
          moneyMore={0}
          showSurcharge={false}
          formatVND={formatVND}
        />
        <PeopleInput
          label="Trẻ em"
          value={childrenBase}
          onChange={(v) => handleBaseChange("children", v)}
          exceedCount={0}
          moneyMore={0}
          showSurcharge={false}
          formatVND={formatVND}
        />
        <PeopleInput
          label="Trẻ nhỏ (2-5 tuổi)"
          value={smallChildrenBase}
          onChange={(v) => handleBaseChange("smallChildren", v)}
          exceedCount={0}
          moneyMore={0}
          showSurcharge={false}
          formatVND={formatVND}
        />
        <PeopleInput
          label="Em bé"
          value={infantsBase}
          onChange={(v) => handleBaseChange("infants", v)}
          exceedCount={0}
          moneyMore={0}
          showSurcharge={false}
          formatVND={formatVND}
        />
        <div
          className={`people-tile seat-tile ${
            totalPeople <= seats ||
            seats <= 0 ||
            (hasAdditional && totalExceed > 0)
              ? "ok"
              : "exceed"
          }`}
        >
          <div className="seat-line">
            <FaInfoCircle />
            <span>
              {seats > 0
                ? totalPeople <= seats
                  ? `Còn ${seats - totalBase} chỗ trống`
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
            <PeopleInput
              label="Người lớn"
              value={adultsExceed}
              onChange={(v) => handleExceedChange("adults", v)}
              exceedCount={adultsExceed}
              moneyMore={additionalMapById[adultId] || 0}
              showSurcharge={true}
              formatVND={formatVND}
            />
            <PeopleInput
              label="Trẻ em"
              value={childrenExceed}
              onChange={(v) => handleExceedChange("children", v)}
              exceedCount={childrenExceed}
              moneyMore={additionalMapById[childId] || 0}
              showSurcharge={true}
              formatVND={formatVND}
            />
            <PeopleInput
              label="Trẻ nhỏ (2-5 tuổi)"
              value={smallChildrenExceed}
              onChange={(v) => handleExceedChange("smallChildren", v)}
              exceedCount={smallChildrenExceed}
              moneyMore={additionalMapById[smallChildId] || 0}
              showSurcharge={true}
              formatVND={formatVND}
            />
            <PeopleInput
              label="Em bé"
              value={infantsExceed}
              onChange={(v) => handleExceedChange("infants", v)}
              exceedCount={infantsExceed}
              moneyMore={additionalMapById[infantId] || 0}
              showSurcharge={true}
              formatVND={formatVND}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function clampBase(value, key, seats, currentTotal, showToast) {
  const raw = Math.max(0, parseInt(value || "0", 10));
  const othersSum =
    currentTotal -
    (key === "adults"
      ? raw
      : key === "children"
      ? raw
      : key === "smallChildren"
      ? raw
      : raw);
  const maxForThis = Math.max(0, seats - othersSum);
  if (raw > maxForThis) showToast("Số người base vượt quá số chỗ!", "error");
  return Math.min(raw, maxForThis);
}
