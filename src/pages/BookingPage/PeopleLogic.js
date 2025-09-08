import { useState, useMemo, useEffect } from "react";

export function usePeopleLogic({
  seats,
  discountedBase,
  hasAdditional,
  additionalMapById,
  showToast,
  personTypes = [],
}) {
  // Khởi tạo state trống
  const [baseCounts, setBaseCounts] = useState({});
  const [exceedCounts, setExceedCounts] = useState({});

  // Khi personTypes thay đổi → chỉ thêm id mới, không reset hết
  useEffect(() => {
    setBaseCounts((prev) => {
      const next = { ...prev };
      personTypes.forEach((t) => {
        if (!(t.id in next)) next[t.id] = 0;
      });
      return next;
    });

    setExceedCounts((prev) => {
      const next = { ...prev };
      personTypes.forEach((t) => {
        if (!(t.id in next)) next[t.id] = 0;
      });
      return next;
    });
  }, [personTypes]);

  // Tổng số base
  const totalBase = useMemo(
    () => Object.values(baseCounts).reduce((sum, v) => sum + v, 0),
    [baseCounts]
  );

  // Tổng số exceed
  const totalExceed = useMemo(
    () => Object.values(exceedCounts).reduce((sum, v) => sum + v, 0),
    [exceedCounts]
  );

  const totalPeople = totalBase + totalExceed;

  // Tổng phụ thu cho phần vượt chỗ
  const surchargeTotal = useMemo(() => {
    return personTypes.reduce((sum, t) => {
      const count = exceedCounts[t.id] || 0;
      const surcharge = additionalMapById[t.id] || 0;
      return sum + count * surcharge;
    }, 0);
  }, [exceedCounts, additionalMapById, personTypes]);

  // ✅ Tổng tiền: base (1 lần) + phụ thu (nếu vượt chỗ)
  const totalPrice = useMemo(() => {
    if (totalPeople === 0 || !discountedBase) return 0;

    const baseOnce = discountedBase;

    if (seats <= 0 || !hasAdditional) return baseOnce;
    if (totalPeople <= seats) return baseOnce;

    return baseOnce + surchargeTotal;
  }, [discountedBase, totalPeople, seats, hasAdditional, surchargeTotal]);

  // --- Handlers ---
  const handleBaseChange = (id, value) => {
    const currentBase = baseCounts[id] || 0;
    const othersSum = totalBase - currentBase;
    const safe = clampBase(value, seats, othersSum, showToast);
    setBaseCounts((prev) => ({ ...prev, [id]: safe }));
  };

  const handleExceedChange = (id, value) => {
    const safe = Math.max(0, parseInt(value || "0", 10));
    setExceedCounts((prev) => ({ ...prev, [id]: safe }));
  };

  // Format VND
  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return {
    baseCounts,
    exceedCounts,
    totalBase,
    totalExceed,
    totalPeople,
    totalPrice,
    surchargeTotal,
    handleBaseChange,
    handleExceedChange,
    formatVND,
  };
}

// --- Helper ---
function clampBase(value, seats, othersSum, showToast) {
  const raw = Math.max(0, parseInt(value || "0", 10));
  if (seats <= 0) return raw; // chưa biết seats thì không clamp
  const maxForThis = Math.max(0, seats - othersSum);
  if (raw > maxForThis) showToast("Số người base vượt quá số chỗ!", "error");
  return Math.min(raw, maxForThis);
}
