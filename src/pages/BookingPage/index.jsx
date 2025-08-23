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

  const [tourDetail, setTourDetail] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedTour, setSelectedTour] = React.useState(null);
  const [departDate, setDepartDate] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [province, setProvince] = React.useState(null);
  const [ward, setWard] = React.useState(null);
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [personTypes, setPersonTypes] = React.useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State cho modal

  // Fetch tour detail
  useEffect(() => {
    const currentSlug = selectedTour?.slug || initialSlug;
    if (!currentSlug) return;

    fetch(`http://localhost:5000/api/v1/tour-detail/${currentSlug}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const detail = data.tourDetail;
        setTourDetail(detail);

        if (
          Array.isArray(detail.additionalPrices) &&
          detail.additionalPrices.length > 0
        ) {
          const nameToKey = (name) => {
            const n = name.toLowerCase();
            if (n.includes("người lớn")) return "adults";
            if (n.includes("trẻ em") && !n.includes("2-5")) return "children";
            if (n.includes("2-5")) return "smallChildren";
            if (n.includes("em bé") || n.includes("em be") || n.includes("bé"))
              return "infants";
            return null;
          };
          const priorityOf = (name) => {
            const n = name.toLowerCase();
            if (n.includes("người lớn")) return 1;
            if (n.includes("trẻ em") && !n.includes("2-5")) return 2;
            if (n.includes("2-5")) return 3;
            if (n.includes("em bé") || n.includes("em be") || n.includes("bé"))
              return 4;
            return 99;
          };

          const arr = detail.additionalPrices
            .map((p) => ({
              id: p.typeOfPersonId._id,
              name: p.typeOfPersonId.name,
              key: nameToKey(p.typeOfPersonId.name),
              priority: priorityOf(p.typeOfPersonId.name),
            }))
            .filter((x) => x.key);

          arr.sort((a, b) => a.priority - b.priority);
          setPersonTypes(arr);
        } else {
          setPersonTypes([]);
        }

        if (!selectedCategory)
          setSelectedCategory(detail.categoryId?.[0] || null);
        if (!selectedTour)
          setSelectedTour({ slug: detail.slug, title: detail.title });
      })
      .catch((err) => showToast("Lỗi tải tour: " + err.message, "error"));
  }, [initialSlug, selectedTour?.slug, showToast]);

  const seats = tourDetail?.seats || 0;
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - discount / 100))
  );
  const hasAdditional =
    Array.isArray(tourDetail?.additionalPrices) &&
    tourDetail.additionalPrices.length > 0;

  const additionalMapById = useMemo(() => {
    const map = {};
    (tourDetail?.additionalPrices || []).forEach((p) => {
      const id = p?.typeOfPersonId?._id;
      if (id) map[id] = typeof p.moneyMore === "number" ? p.moneyMore : 0;
    });
    return map;
  }, [tourDetail]);

  const getTypeIdByKey = (key) => personTypes.find((t) => t.key === key)?.id;

  const {
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
  } = usePeopleLogic({
    seats,
    discountedBase,
    hasAdditional,
    additionalMapById,
    getTypeIdByKey,
    showToast,
  });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const canSubmit = totalPrice > 0;

  const handleSubmit = async () => {
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
    if (errors.length) return;

    // Mở modal xác nhận
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    const payload = {
      tourId: tourDetail?._id,
      departureDate: departDate,
      seatFor: [
        { typeOfPersonId: getTypeIdByKey("adults"), quantity: adultsBase },
        { typeOfPersonId: getTypeIdByKey("children"), quantity: childrenBase },
        {
          typeOfPersonId: getTypeIdByKey("smallChildren"),
          quantity: smallChildrenBase,
        },
        { typeOfPersonId: getTypeIdByKey("infants"), quantity: infantsBase },
      ],
      seatAddFor: [
        {
          typeOfPersonId: getTypeIdByKey("adults"),
          quantity: adultsExceed,
          moneyMoreForOne: additionalMapById[getTypeIdByKey("adults")] || 0,
        },
        {
          typeOfPersonId: getTypeIdByKey("children"),
          quantity: childrenExceed,
          moneyMoreForOne: additionalMapById[getTypeIdByKey("children")] || 0,
        },
        {
          typeOfPersonId: getTypeIdByKey("smallChildren"),
          quantity: smallChildrenExceed,
          moneyMoreForOne:
            additionalMapById[getTypeIdByKey("smallChildren")] || 0,
        },
        {
          typeOfPersonId: getTypeIdByKey("infants"),
          quantity: infantsExceed,
          moneyMoreForOne: additionalMapById[getTypeIdByKey("infants")] || 0,
        },
      ].filter((s) => s.quantity > 0),
      nameOfUser: name,
      phoneNumber: phone,
      email,
      address,
      province: province?._id,
      ward: ward?._id,
      note,
      typeOfPayment: paymentMethod,
      totalPrice,
    };

    try {
      const response = await fetch("http://localhost:5000/api/v1/invoice", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.code === 200) {
        showToast("Đặt tour thành công!", "success");
      } else {
        showToast(data.message || "Đặt tour thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi server: " + err.message, "error");
    }
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
          adultsBase={adultsBase}
          childrenBase={childrenBase}
          smallChildrenBase={smallChildrenBase}
          infantsBase={infantsBase}
          adultsExceed={adultsExceed}
          childrenExceed={childrenExceed}
          smallChildrenExceed={smallChildrenExceed}
          infantsExceed={infantsExceed}
          hasAdditional={hasAdditional}
          additionalMapById={additionalMapById}
          seats={seats}
          getTypeIdByKey={getTypeIdByKey}
          formatVND={formatVND}
          showToast={showToast}
          onBaseChange={handleBaseChange}
          onExceedChange={handleExceedChange}
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
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
        />
      </div>
      <div className="tour-summary-wrap">
        <TourInfoSummary tourDetail={tourDetail} totalPrice={totalPrice} />
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        message="Bạn đồng ý đặt tour này chứ?"
      />
    </div>
  );
}
