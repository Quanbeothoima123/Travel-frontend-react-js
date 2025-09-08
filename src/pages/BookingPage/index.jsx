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
  const [personTypes, setPersonTypes] = useState([]); // [{ id, name }]
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'cash' | 'momo'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tour detail (by selectedTour.slug or initialSlug)
  useEffect(() => {
    const currentSlug = selectedTour?.slug || initialSlug;
    if (!currentSlug) return;

    fetch(`http://localhost:5000/api/v1/tours/tour-detail/${currentSlug}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const detail = data.tourDetail;
        if (!detail) {
          showToast("Không tìm thấy chi tiết tour", "error");
          return;
        }
        setTourDetail(detail);

        // 1) Primary source: allowTypePeople (populated objects: {_id, name})
        const fromAllow =
          Array.isArray(detail.allowTypePeople) &&
          detail.allowTypePeople.length > 0
            ? detail.allowTypePeople
                .map((p) => {
                  if (!p) return null;
                  const id = p._id ? p._id.toString() : null;
                  return id ? { id, name: p.name || "Khách" } : null;
                })
                .filter(Boolean)
            : null;

        // 2) Fallback: additionalPrices (populated additionalPrices.typeOfPersonId)
        const fromAdditional =
          Array.isArray(detail.additionalPrices) &&
          detail.additionalPrices.length > 0
            ? detail.additionalPrices
                .map((p) => {
                  const tp = p?.typeOfPersonId;
                  if (!tp) return null;
                  const id = tp._id ? tp._id.toString() : null;
                  return id ? { id, name: tp.name || "Khách" } : null;
                })
                .filter(Boolean)
            : [];

        // Choose priority: allowTypePeople > additionalPrices > empty
        if (fromAllow && fromAllow.length > 0) {
          setPersonTypes(fromAllow);
        } else if (fromAdditional.length > 0) {
          // ensure unique ids
          const unique = [];
          const seen = new Set();
          fromAdditional.forEach((t) => {
            if (!seen.has(t.id)) {
              seen.add(t.id);
              unique.push(t);
            }
          });
          setPersonTypes(unique);
        } else {
          setPersonTypes([]); // no types known — render message in UI
        }

        if (!selectedCategory) setSelectedCategory(detail.categoryId || null);
        if (!selectedTour)
          setSelectedTour({ slug: detail.slug, title: detail.title });
      })
      .catch((err) => showToast("Lỗi tải tour: " + err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, selectedTour?.slug, showToast]);

  const seats = tourDetail?.seats || 0;
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - (discount || 0) / 100))
  );

  // Map id -> moneyMore (robust to null)
  const additionalMapById = useMemo(() => {
    const map = {};
    const arr = Array.isArray(tourDetail?.additionalPrices)
      ? tourDetail.additionalPrices
      : [];
    arr.forEach((p) => {
      const id = p?.typeOfPersonId?._id
        ? p.typeOfPersonId._id.toString()
        : null;
      if (id) {
        map[id] = typeof p.moneyMore === "number" ? p.moneyMore : 0;
      }
    });
    return map;
  }, [tourDetail]);

  const hasAdditional = Object.keys(additionalMapById).length > 0;

  // usePeopleLogic hook (you already have this)
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
    personTypes,
  });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const canSubmit = totalPrice > 0;

  // Tạo payload chung cho cả 2 hình thức
  const buildPayload = () => ({
    tourId: tourDetail?._id,
    departureDate: departDate,
    seatFor: personTypes.map((t) => ({
      typeOfPersonId: t.id,
      quantity: baseCounts[t.id] || 0,
    })),
    seatAddFor: personTypes
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

  // Validate form đầu vào (dùng chung)
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

  // Mở confirm theo action
  const openConfirm = (action) => {
    if (!validateBeforeSubmit()) return;
    setConfirmAction(action); // 'cash' | 'momo'
    setIsConfirmOpen(true);
  };

  // Submit tiền mặt: gọi /invoice
  const submitCash = async () => {
    const payload = buildPayload();

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/v1/invoice", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.code === 200) {
        showToast(
          "Đặt tour thành công! Vui lòng đến công ty để thanh toán.",
          "success"
        );
      } else {
        showToast(data.message || "Đặt tour thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi server: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit MoMo: gọi /pay-with-momo, nhận payUrl và redirect
  const submitMomo = async () => {
    const payload = buildPayload();

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:5000/api/v1/pay-with-momo",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (response.ok && data?.payUrl) {
        // Chuyển sang cổng thanh toán MoMo
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
      // Lưu ý: nếu redirect thành công, người dùng sẽ rời trang trước khi chạy đến đây.
      setIsSubmitting(false);
    }
  };

  // Nhấn "Xác nhận" trong ConfirmModal
  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    if (confirmAction === "cash") {
      await submitCash();
    } else if (confirmAction === "momo") {
      await submitMomo();
    }
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
          personTypes={personTypes}
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
          onChangeProvince={setProvince}
          onChangeWard={setWard}
          onChangeNote={setNote}
        />

        <PaymentSection
          paymentMethod={paymentMethod}
          onChangePayment={setPaymentMethod}
          onSubmitCash={() => openConfirm("cash")}
          onSubmitMomo={() => openConfirm("momo")}
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
