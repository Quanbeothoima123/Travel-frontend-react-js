import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaHome, FaPaypal, FaCreditCard, FaInfoCircle } from "react-icons/fa";

import CategoryTreeSelect from "../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import TourSearchSelect from "../../components/common/DropDownTreeSearch/TourSearchSelect";
import ProvinceSelect from "../../components/common/DropDownTreeSearch/ProvinceSelect";
import WardSelect from "../../components/common/DropDownTreeSearch/WardSelect";
import TourInfoSummary from "../../components/common/TourInfoSummary";

import "./BookingPage.css";

/**
 * QUY TẮC TÍNH TIỀN & CHẶN NHẬP
 * - totalPeople === 0 => totalPrice = 0
 * - seats <= 0 (chưa có số chỗ) => nếu có người, totalPrice = discountedBase (không phụ thu)
 * - 0 < totalPeople <= seats => totalPrice = discountedBase (không phụ thu)
 * - totalPeople > seats && có additionalPrices => totalPrice = discountedBase + surchargeFromExceed
 * - Nếu KHÔNG có additionalPrices => KHÔNG cho vượt seats (clamp input base)
 * - Tách riêng input base (clamp tổng <= seats) và exceed (nếu hasAdditional, show khi base >= seats)
 * - Phụ thu tính trực tiếp trên exceed từng loại, không phân bổ thứ tự nữa
 */

export default function BookingPage() {
  const { slug: initialSlug } = useParams();

  const [tourDetail, setTourDetail] = useState(null);

  // selections
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);

  // people counts BASE
  const [adultsBase, setAdultsBase] = useState(0);
  const [childrenBase, setChildrenBase] = useState(0);
  const [smallChildrenBase, setSmallChildrenBase] = useState(0);
  const [infantsBase, setInfantsBase] = useState(0);

  // people counts EXCEED (vượt)
  const [adultsExceed, setAdultsExceed] = useState(0);
  const [childrenExceed, setChildrenExceed] = useState(0);
  const [smallChildrenExceed, setSmallChildrenExceed] = useState(0);
  const [infantsExceed, setInfantsExceed] = useState(0);

  // customer
  const [departDate, setDepartDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(null);
  const [ward, setWard] = useState(null);
  const [note, setNote] = useState("");

  // payment
  const [paymentMethod, setPaymentMethod] = useState("company"); // company | online | bank

  // type-of-person derive từ tourDetail
  const [personTypes, setPersonTypes] = useState([]);

  // ---- Fetch tour detail by slug ----
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

        // Derive personTypes từ additionalPrices (nếu có)
        if (
          Array.isArray(detail.additionalPrices) &&
          detail.additionalPrices.length > 0
        ) {
          const nameToKey = (name = "") => {
            const n = name.toLowerCase();
            if (n.includes("người lớn")) return "adults";
            if (n.includes("trẻ em") && !n.includes("2-5")) return "children";
            if (n.includes("2-5")) return "smallChildren";
            if (n.includes("em bé") || n.includes("em be") || n.includes("bé"))
              return "infants";
            return null;
          };
          const priorityOf = (name = "") => {
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
          setPersonTypes([]); // Không có additional thì không cần personTypes
        }

        if (!selectedCategory) {
          const cat = detail.categoryId?.[0] || null;
          setSelectedCategory(cat);
        }
        if (!selectedTour) {
          setSelectedTour({ slug: detail.slug, title: detail.title });
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, selectedTour?.slug]);

  // helpers
  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const seats = tourDetail?.seats || 0;

  // Giá tour sau giảm (giá gốc 1 tour, không nhân theo đầu người)
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - discount / 100))
  );

  const hasAdditional =
    Array.isArray(tourDetail?.additionalPrices) &&
    tourDetail.additionalPrices.length > 0;

  // Map phụ phí THEO _id
  const additionalMapById = useMemo(() => {
    const map = {};
    (tourDetail?.additionalPrices || []).forEach((p) => {
      const id = p?.typeOfPersonId?._id;
      if (id) map[id] = typeof p.moneyMore === "number" ? p.moneyMore : 0;
    });
    return map;
  }, [tourDetail]);

  // Tổng base và exceed
  const totalBase = adultsBase + childrenBase + smallChildrenBase + infantsBase;
  const totalExceed =
    adultsExceed + childrenExceed + smallChildrenExceed + infantsExceed;
  const totalPeople = totalBase + totalExceed;

  // Helper: lấy id type theo key (adults/children/...)
  const getTypeIdByKey = (key) => personTypes.find((t) => t.key === key)?.id;

  // --------- Tổng phụ thu trực tiếp từ exceed ----------
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
  }, [
    adultsExceed,
    childrenExceed,
    smallChildrenExceed,
    infantsExceed,
    additionalMapById,
    personTypes,
  ]);

  // --------- Tổng tiền ----------
  const totalPrice = useMemo(() => {
    if (!tourDetail) return 0;
    if (totalPeople === 0) return 0;

    // Chưa biết seats => hiển thị giá tour sau giảm (không phụ thu)
    if (seats <= 0) return discountedBase;

    // Không vượt hoặc vượt nhưng tính surcharge
    return discountedBase + (totalPeople > seats ? surchargeTotal : 0);
  }, [tourDetail, totalPeople, seats, discountedBase, surchargeTotal]);

  // --------- Chặn nhập cho BASE (tổng base <= seats) ----------
  const clampBase = (nextCount, currentKey) => {
    const raw = Math.max(0, parseInt(nextCount || "0", 10));

    const othersSum =
      (currentKey !== "adults" ? adultsBase : 0) +
      (currentKey !== "children" ? childrenBase : 0) +
      (currentKey !== "smallChildren" ? smallChildrenBase : 0) +
      (currentKey !== "infants" ? infantsBase : 0);

    const maxForThis = Math.max(0, seats - othersSum);
    return Math.min(raw, maxForThis);
  };

  const handleBaseChange = (key, value) => {
    const safe = clampBase(value, key);

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
      default:
        break;
    }
  };

  // --------- Handle exceed (min 0, no max) ----------
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
      default:
        break;
    }
  };

  // Show khối exceed chỉ khi hasAdditional && totalBase >= seats
  const showExceed = hasAdditional && totalBase >= seats;

  // min date = tomorrow
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const canSubmit = totalPeople > 0; // có người mới cho đặt

  // --- Lấy id từng loại
  const adultId = getTypeIdByKey("adults");
  const childId = getTypeIdByKey("children");
  const smallChildId = getTypeIdByKey("smallChildren");
  const infantId = getTypeIdByKey("infants");

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

        {/* PEOPLE BASE */}
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

            {/* Ô trạng thái ghế */}
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
                      ? `Còn ${seats - totalBase} chỗ trống` // Chỉ tính base vì exceed là vượt
                      : `Vượt ${totalExceed} chỗ (có phụ thu)`
                    : "Đang cập nhật số chỗ"}
                </span>
              </div>
            </div>
          </div>
          {!hasAdditional && seats > 0 && totalPeople > seats && (
            <p className="error">Tour này không cho vượt quá số chỗ.</p>
          )}
        </div>

        {/* PEOPLE EXCEED (vượt chỗ) */}
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

        {/* DATE */}
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

        <h2>Thông tin khách hàng</h2>
        <div className="form-grid">
          <div className="form-item">
            <label>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-item">
            <label>Điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-item">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-item">
            <label>Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-item">
            <label>Chọn tỉnh/thành phố</label>
            <ProvinceSelect value={province} onChange={setProvince} />
          </div>
          <div className="form-item">
            <label>Chọn phường/xã</label>
            <WardSelect
              provinceCode={province?.code}
              value={ward}
              onChange={setWard}
            />
          </div>

          <div className="form-item form-item--full">
            <label>Ghi chú</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <h2>Hình thức thanh toán</h2>
        <div className="payment-grid">
          <label
            className={`payment-card ${
              paymentMethod === "company" ? "is-active" : ""
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="company"
              checked={paymentMethod === "company"}
              onChange={() => setPaymentMethod("company")}
            />
            <span className="payment-badge payment-badge--red">
              <FaHome /> <span>Thanh toán tại công ty</span>
            </span>
            <span className="payment-desc">
              55 Đỗ Quang Đẩu, P. Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh
            </span>
          </label>

          <label
            className={`payment-card ${
              paymentMethod === "online" ? "is-active" : ""
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            <span className="payment-badge payment-badge--blue">
              <FaPaypal /> <span>Thanh toán trực tuyến</span>
            </span>
            <span className="payment-desc">
              (Sắp hỗ trợ Momo — hiện chọn để giữ chỗ)
            </span>
          </label>

          <label
            className={`payment-card muted ${
              paymentMethod === "bank" ? "is-active" : ""
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={paymentMethod === "bank"}
              onChange={() => setPaymentMethod("bank")}
            />
            <span className="payment-badge payment-badge--gray">
              <FaCreditCard /> <span>Chuyển khoản ngân hàng</span>
            </span>
            <span className="payment-desc">
              Tạm thời chưa mở — hiển thị dạng muted giống ảnh mẫu
            </span>
          </label>
        </div>

        <div className="action-row">
          <button
            className="company-payment"
            disabled={!canSubmit || paymentMethod !== "company"}
          >
            Xác nhận
          </button>
          <button
            className="online-payment"
            disabled={!canSubmit || paymentMethod !== "online"}
          >
            Thanh toán trực tuyến
          </button>
        </div>
      </div>

      {/* Summary ở cột phải */}
      <div className="tour-summary-wrap">
        <TourInfoSummary tourDetail={tourDetail} totalPrice={totalPrice} />
      </div>
    </div>
  );
}

/** --------- Sub components ---------- */
function PeopleInput({
  label,
  value,
  onChange,
  exceedCount = 0,
  moneyMore = 0,
  showSurcharge = false,
  formatVND,
}) {
  const showLine = showSurcharge && moneyMore > 0;

  return (
    <div className="people-tile">
      <label>{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showLine && (
        <div className="surcharge">
          Phụ thu: <strong>{formatVND(moneyMore)} / người</strong>
          {exceedCount > 0 && (
            <>
              {" "}
              — {exceedCount} người vượt =&nbsp;
              <strong>{formatVND(moneyMore * exceedCount)}</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
