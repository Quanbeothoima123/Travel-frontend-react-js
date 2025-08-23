import { useState, useMemo } from "react";

export function usePeopleLogic({
  seats,
  discountedBase,
  hasAdditional,
  additionalMapById,
  getTypeIdByKey,
  showToast,
}) {
  const [adultsBase, setAdultsBase] = useState(0);
  const [childrenBase, setChildrenBase] = useState(0);
  const [smallChildrenBase, setSmallChildrenBase] = useState(0);
  const [infantsBase, setInfantsBase] = useState(0);
  const [adultsExceed, setAdultsExceed] = useState(0);
  const [childrenExceed, setChildrenExceed] = useState(0);
  const [smallChildrenExceed, setSmallChildrenExceed] = useState(0);
  const [infantsExceed, setInfantsExceed] = useState(0);

  const totalBase = adultsBase + childrenBase + smallChildrenBase + infantsBase;
  const totalExceed =
    adultsExceed + childrenExceed + smallChildrenExceed + infantsExceed;
  const totalPeople = totalBase + totalExceed;

  const surchargeTotal = useMemo(() => {
    const adultId = getTypeIdByKey("adults");
    const childId = getTypeIdByKey("children");
    const smallChildId = getTypeIdByKey("smallChildren");
    const infantId = getTypeIdByKey("infants");
    return (
      adultsExceed * (additionalMapById[adultId] || 0) +
      childrenExceed * (additionalMapById[childId] || 0) +
      smallChildrenExceed * (additionalMapById[smallChildId] || 0) +
      infantsExceed * (additionalMapById[infantId] || 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    adultsExceed,
    childrenExceed,
    smallChildrenExceed,
    infantsExceed,
    additionalMapById,
    getTypeIdByKey,
  ]);

  const totalPrice = useMemo(() => {
    if (!discountedBase) return 0;
    if (totalPeople === 0) return 0;
    if (seats <= 0) return discountedBase;
    return discountedBase + (totalPeople > seats ? surchargeTotal : 0);
  }, [discountedBase, totalPeople, seats, surchargeTotal]);

  const handleBaseChange = (key, value) => {
    const safe = clampBase(value, key, seats, totalBase, showToast);
    switch (key) {
      case "adults":
        setAdultsBase(safe);
        break;
      case "children":
        setChildrenBase(safe);
        break;
      case "smallChildren":
        setSmallChildrenBase(safe);
        break;
      case "infants":
        setInfantsBase(safe);
        break;
    }
  };

  const handleExceedChange = (key, value) => {
    const safe = Math.max(0, parseInt(value || "0", 10));
    switch (key) {
      case "adults":
        setAdultsExceed(safe);
        break;
      case "children":
        setChildrenExceed(safe);
        break;
      case "smallChildren":
        setSmallChildrenExceed(safe);
        break;
      case "infants":
        setInfantsExceed(safe);
        break;
    }
  };

  // Hàm formatVND (di chuyển vào đây để tái sử dụng)
  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return {
    adultsBase,
    childrenBase,
    smallChildrenBase,
    infantsBase,
    adultsExceed,
    childrenExceed,
    smallChildrenExceed,
    infantsExceed,
    totalPrice,
    handleBaseChange,
    handleExceedChange,
    formatVND,
  };
}

function clampBase(value, key, seats, totalBase, showToast) {
  const raw = Math.max(0, parseInt(value || "0", 10));
  const othersSum =
    (key !== "adults" ? totalBase - (key === "adults" ? 0 : raw) : 0) +
    (key !== "children" ? totalBase - (key === "children" ? 0 : raw) : 0) +
    (key !== "smallChildren"
      ? totalBase - (key === "smallChildren" ? 0 : raw)
      : 0) +
    (key !== "infants" ? totalBase - (key === "infants" ? 0 : raw) : 0);
  const maxForThis = Math.max(0, seats - othersSum);
  if (raw > maxForThis) showToast("Số người base vượt quá số chỗ!", "error");
  return Math.min(raw, maxForThis);
}
