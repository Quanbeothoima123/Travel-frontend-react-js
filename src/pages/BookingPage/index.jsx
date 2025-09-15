// BookingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import PeopleSection from "./PeopleSection";
import CustomerInfo from "./CustomerInfo";
import PaymentSection from "./PaymentSection";
import TourInfoSummary from "../../components/common/TourInfoSummary";
import { usePeopleLogic } from "./PeopleLogic";
import { validateForm } from "./Validate";
import CategoryTreeSelect from "../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import TourSearchSelect from "../../components/common/DropDownTreeSearch/TourSearchSelect";
import ConfirmModal from "../../components/common/ConfirmModal";
import "./BookingPage.css";

export default function BookingPage() {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const { slug: initialSlug } = useParams();
  const { showToast } = useToast();

  const [tourDetail, setTourDetail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);

  const [departDate, setDepartDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(null);
  const [ward, setWard] = useState(null);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'cash' | 'momo'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler để xử lý thay đổi province và reset ward
  const handleProvinceChange = (newProvince) => {
    setProvince(newProvince);

    // Reset ward khi đổi province (trừ khi cùng tỉnh)
    if (ward && (!newProvince || newProvince.code !== province?.code)) {
      setWard(null);
    }
  };

  // Fetch tour detail
  useEffect(() => {
    const currentSlug = selectedTour?.slug || initialSlug;
    if (!currentSlug) return;

    let cancelled = false;
    fetch(`${API_BASE}/api/v1/tours/tour-detail/${currentSlug}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const detail = data?.tourDetail || null;
        if (!detail) {
          showToast("Không tìm thấy chi tiết tour", "error");
          setTourDetail(null);
          return;
        }
        setTourDetail(detail);
      })
      .catch((err) => {
        if (!cancelled) showToast("Lỗi tải tour: " + err.message, "error");
      });

    return () => {
      cancelled = true;
    };
  }, [initialSlug, selectedTour?.slug, showToast]);

  // --- Derive surchargePersonTypes from additionalPrices (types that have extra money) ---
  const surchargePersonTypes = useMemo(() => {
    if (!tourDetail || !Array.isArray(tourDetail.additionalPrices)) return [];
    const arr = tourDetail.additionalPrices
      .map((p) => {
        const tp = p?.typeOfPersonId;
        if (!tp) return null;
        // typeOfPersonId might be populated object or plain id
        let id = null;
        if (typeof tp === "string") id = tp;
        else if (tp._id) id = String(tp._id);
        else if (tp.id) id = String(tp.id);
        if (!id) return null;
        const name =
          typeof tp === "object" ? tp.name || tp.title || "Khách" : "Khách";
        return { id, name };
      })
      .filter(Boolean);

    // unique by id
    const unique = [];
    const seen = new Set();
    for (const t of arr) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  }, [tourDetail]);

  // --- Derive allowPersonTypes from allowTypePeople (admin-configured allowed participants) ---
  const allowPersonTypes = useMemo(() => {
    if (!tourDetail || !Array.isArray(tourDetail.allowTypePeople)) return [];

    // build nameLookup from surchargePersonTypes (if additionalPrices populated names exist)
    const nameLookup = {};
    surchargePersonTypes.forEach((p) => {
      nameLookup[p.id] = p.name;
    });

    return tourDetail.allowTypePeople
      .map((p) => {
        // allowTypePeople item can be string id or populated object
        let id = null;
        let name = null;
        if (typeof p === "string") {
          id = p;
          name = nameLookup[id] || "Khách"; // fallback to name from surcharge if available
        } else if (p && (p._id || p.id)) {
          id = p._id ? String(p._id) : String(p.id);
          name = p.name || p.title || nameLookup[id] || "Khách";
        }
        if (!id) return null;
        return { id, name };
      })
      .filter(Boolean);
  }, [tourDetail, surchargePersonTypes]);

  // --- additionalMapById: id -> moneyMore (surcharge). Robust to shapes. ---
  const additionalMapById = useMemo(() => {
    const map = {};
    if (!tourDetail || !Array.isArray(tourDetail.additionalPrices)) return map;
    for (const p of tourDetail.additionalPrices) {
      const tp = p?.typeOfPersonId;
      if (!tp) continue;
      let id = null;
      if (typeof tp === "string") id = tp;
      else if (tp._id) id = String(tp._id);
      else if (tp.id) id = String(tp.id);
      if (!id) continue;
      map[id] = typeof p.moneyMore === "number" ? p.moneyMore : 0;
    }
    return map;
  }, [tourDetail]);

  // Which types to show as base inputs?
  // - If admin configured allowTypePeople, use that (explicit)
  // - Otherwise fallback to surchargePersonTypes so user can still book if no explicit allow list
  const baseRenderTypes = allowPersonTypes.length
    ? allowPersonTypes
    : surchargePersonTypes;

  // union of all types that hook should know about (so it can keep baseCounts & exceedCounts)
  const unionForHook = useMemo(() => {
    const map = new Map();
    // add baseRenderTypes first then surcharge to preserve names
    for (const t of baseRenderTypes) map.set(t.id, t);
    for (const t of surchargePersonTypes) {
      if (!map.has(t.id)) map.set(t.id, t);
    }
    return Array.from(map.values());
  }, [baseRenderTypes, surchargePersonTypes]);

  const hasAdditional = Object.keys(additionalMapById).length > 0;

  // Sync selectedCategory / selectedTour when tourDetail loads (only when empty)
  useEffect(() => {
    if (!tourDetail) return;
    if (!selectedCategory) setSelectedCategory(tourDetail.categoryId || null);
    if (!selectedTour)
      setSelectedTour({ slug: tourDetail.slug, title: tourDetail.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourDetail]);

  // price/seats
  const seats = tourDetail?.seats || 0;
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - (discount || 0) / 100))
  );

  // People logic hook: pass unionForHook so hook maintains counts for both groups
  const {
    baseCounts,
    exceedCounts,
    totalPrice,
    handleBaseChange,
    handleExceedChange,
    formatVND,
  } = usePeopleLogic({
    seats,
    discountedBase,
    hasAdditional,
    additionalMapById,
    showToast,
    personTypes: unionForHook, // union includes both base types and surcharge-only types
  });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const canSubmit = totalPrice > 0;

  // build payload: seatFor uses baseRenderTypes; seatAddFor uses surchargePersonTypes
  const buildPayload = () => ({
    tourId: tourDetail?._id,
    departureDate: departDate,
    seatFor: baseRenderTypes.map((t) => ({
      typeOfPersonId: t.id,
      quantity: baseCounts[t.id] || 0,
    })),
    seatAddFor: surchargePersonTypes
      .map((t) => ({
        typeOfPersonId: t.id,
        quantity: exceedCounts[t.id] || 0,
        moneyMoreForOne: additionalMapById[t.id] || 0,
      }))
      .filter((s) => s.quantity > 0),
    nameOfUser: name,
    phoneNumber: phone,
    email,
    address,
    province: province?._id,
    ward: ward?._id,
    note,
    typeOfPayment: paymentMethod,
    totalPrice,
  });

  const validateBeforeSubmit = () => {
    const errors = validateForm({
      name,
      phone,
      email,
      address,
      province,
      ward,
      departDate,
      totalPrice,
      showToast,
    });
    return errors.length === 0;
  };

  const openConfirm = (action) => {
    if (!validateBeforeSubmit()) return;
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  // submit handlers unchanged
  const submitCash = async () => {
    const payload = buildPayload();
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/v1/invoice/payUsingCash`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success && data.invoice) {
        const inv = data.invoice;
        const invoiceId = inv._id || inv.id;
        const invoiceCode = inv.invoiceCode || "";

        // tạo query params
        const params = new URLSearchParams({
          orderId: invoiceId,
          resultCode: "0", // 0 = thành công
          orderInfo: `Thanh toán đơn hàng ${invoiceCode}`,
          transId: inv.transactionId || "", // có thể null nếu là cash
        });

        // redirect đến trang kết quả (tái sử dụng chung với MoMo)
        window.location.href = `http://localhost:3000/payment/momo/result?${params.toString()}`;
      } else {
        showToast(data.message || "Đặt tour thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi server: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitMomo = async () => {
    const payload = buildPayload();
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/v1/invoice/pay-with-momo`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data?.payUrl) {
        window.location.href = data.payUrl;
      } else {
        showToast(
          data?.message || "Không tạo được giao dịch MoMo. Vui lòng thử lại.",
          "error"
        );
      }
    } catch (err) {
      showToast("Lỗi server khi tạo giao dịch MoMo: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- thêm hàm submitCard (dán gần submitMomo / submitCash) ---
  const submitCard = async () => {
    const payload = buildPayload();
    // force payment type to card to be safe
    payload.typeOfPayment = "card";

    try {
      setIsSubmitting(true);

      // NOTE: sửa URL nếu backend của bạn expose createInvoice ở route khác
      const response = await fetch(`${API_BASE}/api/v1/invoice/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data?.invoice) {
        const inv = data.invoice;
        const invoiceId = inv._id || inv.id;
        const invoiceCode = inv.invoiceCode || "";

        // build redirect params: resultCode=0 => treat as success in MomoPaymentResultPage
        const params = new URLSearchParams({
          orderId: invoiceId,
          resultCode: "0",
          orderInfo: `Thanh toán đơn hàng ${invoiceCode}`,
          transId: inv.transactionId || "", // nếu backend có transactionId cho card
        });

        // redirect to the same result page used by MoMo
        window.location.href = `http://localhost:3000/payment/momo/result?${params.toString()}`;
        return;
      }

      // nếu backend trả lỗi
      showToast(
        data?.message || "Không thể tạo hóa đơn thanh toán bằng thẻ.",
        "error"
      );
    } catch (err) {
      showToast("Lỗi server khi tạo hóa đơn (card): " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    if (confirmAction === "cash") await submitCash();
    else if (confirmAction === "momo") await submitMomo();
    else if (confirmAction === "card") await submitCard();
    setConfirmAction(null);
  };

  return (
    <div className="booking-page">
      <div className="booking-form">
        <h2>Đặt tour</h2>

        <div className="form-grid">
          <div className="form-item">
            <label>Chọn loại tour</label>
            <CategoryTreeSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
          <div className="form-item">
            <label>Chọn tour</label>
            <TourSearchSelect
              categorySlug={selectedCategory?.slug}
              value={selectedTour}
              onChange={setSelectedTour}
            />
          </div>
        </div>

        <PeopleSection
          baseCounts={baseCounts}
          exceedCounts={exceedCounts}
          hasAdditional={hasAdditional}
          additionalMapById={additionalMapById}
          seats={seats}
          formatVND={formatVND}
          showToast={showToast}
          onBaseChange={handleBaseChange}
          onExceedChange={handleExceedChange}
          allowedTypes={allowPersonTypes} // use allowTypePeople for base inputs (if present)
          surchargeTypes={surchargePersonTypes} // use additionalPrices for exceed inputs
        />

        <div className="form-grid">
          <div className="form-item">
            <label>Ngày khởi hành</label>
            <input
              type="date"
              min={minDate}
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
            />
          </div>
        </div>

        <CustomerInfo
          name={name}
          phone={phone}
          email={email}
          address={address}
          province={province}
          ward={ward}
          note={note}
          onChangeName={setName}
          onChangePhone={setPhone}
          onChangeEmail={setEmail}
          onChangeAddress={setAddress}
          onChangeProvince={handleProvinceChange} // Sử dụng handler có logic reset ward
          onChangeWard={setWard}
          onChangeNote={setNote}
        />

        <PaymentSection
          paymentMethod={paymentMethod}
          onChangePayment={setPaymentMethod}
          onSubmitCash={() => openConfirm("cash")}
          onSubmitMomo={() => openConfirm("momo")}
          onSubmitCard={() => openConfirm("card")} // <-- thêm
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="tour-summary-wrap">
        <TourInfoSummary tourDetail={tourDetail} totalPrice={totalPrice} />
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        message={
          confirmAction === "momo"
            ? "Bạn xác nhận thanh toán qua MoMo cho đơn đặt tour này?"
            : "Bạn đồng ý đặt tour và thanh toán tại công ty chứ?"
        }
      />
    </div>
  );
}
