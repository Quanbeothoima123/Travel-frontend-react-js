import { useState, useMemo, useEffect } from "react";

export function usePeopleLogic({
  seats,
  discountedBase,
  hasAdditional,
  additionalMapById,
  showToast,
  personTypes = [],
}) {
  // Khởi tạo state theo danh sách loại người (key = id)
  const initialCounts = useMemo(() => {
    return personTypes.reduce((acc, t) => {
      acc[t.id] = 0;
      return acc;
    }, {});
  }, [personTypes]);

  const [baseCounts, setBaseCounts] = useState(initialCounts);
  const [exceedCounts, setExceedCounts] = useState(initialCounts);

  // Reset khi personTypes thay đổi
  useEffect(() => {
    setBaseCounts(initialCounts);
    setExceedCounts(initialCounts);
  }, [initialCounts]);

  const totalBase = useMemo(
    () => Object.values(baseCounts).reduce((sum, v) => sum + v, 0),
    [baseCounts]
  );

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

    // Base luôn tính 1 lần khi có người đặt
    const baseOnce = discountedBase;

    // Chưa biết seats hoặc tour không cho vượt -> không cộng phụ thu
    if (seats <= 0 || !hasAdditional) return baseOnce;

    // Không vượt chỗ -> không phụ thu
    if (totalPeople <= seats) return baseOnce;

    // Vượt chỗ -> cộng tổng phụ thu theo loại người
    return baseOnce + surchargeTotal;
  }, [discountedBase, totalPeople, seats, hasAdditional, surchargeTotal]);

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

function clampBase(value, seats, othersSum, showToast) {
  const raw = Math.max(0, parseInt(value || "0", 10));
  if (seats <= 0) return raw; // chưa biết seats thì không clamp
  const maxForThis = Math.max(0, seats - othersSum);
  if (raw > maxForThis) showToast("Số người base vượt quá số chỗ!", "error");
  return Math.min(raw, maxForThis);
}
