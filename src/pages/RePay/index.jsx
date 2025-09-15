// RepayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import PeopleSection from "../BookingPage/PeopleSection";
import CustomerInfo from "../BookingPage/CustomerInfo";
import PaymentSection from "../BookingPage/PaymentSection";
import TourInfoSummary from "../../components/common/TourInfoSummary";
import { usePeopleLogicWithInit } from "./usePeopleLogicWithInit";
import { validateForm } from "../BookingPage/Validate";
import ConfirmModal from "../../components/common/ConfirmModal";
import "../BookingPage/BookingPage.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function RepayPage() {
  const { invoiceId } = useParams(); // Nhận invoice_id từ URL
  const { showToast } = useToast();

  // State cho invoice và tour detail
  const [invoiceData, setInvoiceData] = useState(null);
  const [tourDetail, setTourDetail] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [isLoadingTour, setIsLoadingTour] = useState(true);

  // State cho form (sẽ được fill từ invoice data)
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
  const [confirmAction, setConfirmAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler để xử lý thay đổi province và reset ward
  const handleProvinceChange = (newProvince) => {
    setProvince(newProvince);
    if (ward && (!newProvince || newProvince.code !== province?.code)) {
      setWard(null);
    }
  };

  // 1. Fetch invoice data
  useEffect(() => {
    if (!invoiceId) return;

    let cancelled = false;
    setIsLoadingInvoice(true);

    fetch(`${API_BASE}/api/v1/invoice/detail/${invoiceId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data || !data._id) {
          showToast("Không tìm thấy hóa đơn", "error");
          setInvoiceData(null);
          return;
        }
        setInvoiceData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          showToast("Lỗi tải hóa đơn: " + err.message, "error");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInvoice(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invoiceId, showToast]);

  // 2. Fetch tour detail khi có invoiceData (sử dụng slug từ invoice)
  useEffect(() => {
    if (!invoiceData?.tourId?.slug) return;

    let cancelled = false;
    setIsLoadingTour(true);

    // Sử dụng slug từ invoice để fetch detail
    fetch(`${API_BASE}/api/v1/tours/tour-detail/${invoiceData.tourId.slug}`, {
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
        if (!cancelled) {
          showToast("Lỗi tải tour: " + err.message, "error");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTour(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invoiceData?.tourId?.slug, showToast]);

  // 3. Fill form data từ invoice khi invoiceData load xong
  useEffect(() => {
    if (!invoiceData) return;

    // Fill customer info
    setName(invoiceData.nameOfUser || "");
    setPhone(invoiceData.phoneNumber || "");
    setEmail(invoiceData.email || "");
    setAddress(invoiceData.address || "");
    setNote(invoiceData.note || "");

    // Fill departure date
    if (invoiceData.departureDate) {
      const date = new Date(invoiceData.departureDate);
      const formattedDate = date.toISOString().split("T")[0];
      setDepartDate(formattedDate);
    }

    // Fill province/ward - cần transform từ populated data
    if (invoiceData.province) {
      const provinceData = {
        _id: invoiceData.province._id,
        name_with_type: invoiceData.province.name_with_type,
        code: invoiceData.province.code || invoiceData.province._id, // fallback
      };
      setProvince(provinceData);
    }

    if (invoiceData.ward) {
      const wardData = {
        _id: invoiceData.ward._id,
        name_with_type: invoiceData.ward.name_with_type,
        code: invoiceData.ward.code || invoiceData.ward._id, // fallback
      };
      setWard(wardData);
    }

    // Payment method - reset về cash để user chọn lại
    setPaymentMethod("cash");
  }, [invoiceData]);

  // Derive surchargePersonTypes from tour detail
  const surchargePersonTypes = useMemo(() => {
    if (!tourDetail || !Array.isArray(tourDetail.additionalPrices)) return [];
    const arr = tourDetail.additionalPrices
      .map((p) => {
        const tp = p?.typeOfPersonId;
        if (!tp) return null;
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

  // Derive allowPersonTypes from tour detail
  const allowPersonTypes = useMemo(() => {
    if (!tourDetail || !Array.isArray(tourDetail.allowTypePeople)) return [];

    const nameLookup = {};
    surchargePersonTypes.forEach((p) => {
      nameLookup[p.id] = p.name;
    });

    return tourDetail.allowTypePeople
      .map((p) => {
        let id = null;
        let name = null;
        if (typeof p === "string") {
          id = p;
          name = nameLookup[id] || "Khách";
        } else if (p && (p._id || p.id)) {
          id = p._id ? String(p._id) : String(p.id);
          name = p.name || p.title || nameLookup[id] || "Khách";
        }
        if (!id) return null;
        return { id, name };
      })
      .filter(Boolean);
  }, [tourDetail, surchargePersonTypes]);

  // additionalMapById
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

  const baseRenderTypes = allowPersonTypes.length
    ? allowPersonTypes
    : surchargePersonTypes;

  const unionForHook = useMemo(() => {
    const map = new Map();
    for (const t of baseRenderTypes) map.set(t.id, t);
    for (const t of surchargePersonTypes) {
      if (!map.has(t.id)) map.set(t.id, t);
    }
    return Array.from(map.values());
  }, [baseRenderTypes, surchargePersonTypes]);

  const hasAdditional = Object.keys(additionalMapById).length > 0;

  // Tour info
  const seats = tourDetail?.seats || 0;
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - (discount || 0) / 100))
  );

  // Prepare initial counts từ invoice data
  const initialBaseCounts = useMemo(() => {
    if (!invoiceData?.seatFor) return {};
    const counts = {};
    invoiceData.seatFor.forEach((seat) => {
      const typeId = seat.typeOfPersonId?._id || seat.typeOfPersonId;
      if (typeId) {
        counts[String(typeId)] = seat.quantity || 0;
      }
    });
    return counts;
  }, [invoiceData]);

  const initialExceedCounts = useMemo(() => {
    if (!invoiceData?.seatAddFor) return {};
    const counts = {};
    invoiceData.seatAddFor.forEach((seat) => {
      const typeId = seat.typeOfPersonId?._id || seat.typeOfPersonId;
      if (typeId) {
        counts[String(typeId)] = seat.quantity || 0;
      }
    });
    return counts;
  }, [invoiceData]);

  // People logic hook với initial values
  const {
    baseCounts,
    exceedCounts,
    totalPrice,
    handleBaseChange,
    handleExceedChange,
    formatVND,
  } = usePeopleLogicWithInit({
    seats,
    discountedBase,
    hasAdditional,
    additionalMapById,
    showToast,
    personTypes: unionForHook,
    initialBaseCounts,
    initialExceedCounts,
  });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const canSubmit = totalPrice > 0 && !isLoadingInvoice && !isLoadingTour;

  // Helper functions cho status
  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ffc107",
      paid: "#28a745",
      canceled: "#dc3545",
      refunded: "#6c757d",
    };
    return colorMap[status] || "#6c757d";
  };

  // Build payload cho repay - tận dụng lại endpoint hiện có
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
    note: `${note} [Thanh toán lại từ hóa đơn ${invoiceData?.invoiceCode}]`,
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

  // Submit handlers - tận dụng lại endpoints hiện có
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

        const params = new URLSearchParams({
          orderId: invoiceId,
          resultCode: "0",
          orderInfo: `Thanh toán lại đơn hàng ${invoiceCode}`,
          transId: inv.transactionId || "",
        });

        window.location.href = `http://localhost:3000/payment/momo/result?${params.toString()}`;
      } else {
        showToast(data.message || "Thanh toán lại thất bại", "error");
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

  const submitCard = async () => {
    const payload = buildPayload();
    payload.typeOfPayment = "card";

    try {
      setIsSubmitting(true);
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

        const params = new URLSearchParams({
          orderId: invoiceId,
          resultCode: "0",
          orderInfo: `Thanh toán lại đơn hàng ${invoiceCode}`,
          transId: inv.transactionId || "",
        });

        window.location.href = `http://localhost:3000/payment/momo/result?${params.toString()}`;
        return;
      }

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

  // Loading states
  if (isLoadingInvoice) {
    return (
      <div className="booking-page">
        <div
          className="loading-message"
          style={{
            textAlign: "center",
            padding: "50px",
            fontSize: "18px",
          }}
        >
          Đang tải thông tin hóa đơn...
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="booking-page">
        <div
          className="error-message"
          style={{
            textAlign: "center",
            padding: "50px",
            fontSize: "18px",
            color: "red",
          }}
        >
          Không tìm thấy hóa đơn
        </div>
      </div>
    );
  }

  if (isLoadingTour) {
    return (
      <div className="booking-page">
        <div
          className="loading-message"
          style={{
            textAlign: "center",
            padding: "50px",
            fontSize: "18px",
          }}
        >
          Đang tải thông tin tour...
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-form">
        <h2>Thanh toán lại đơn hàng</h2>

        {/* Hiển thị thông tin hóa đơn gốc */}
        <div
          className="invoice-info"
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "1px solid #e9ecef",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#495057" }}>
            Thông tin hóa đơn gốc
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <p>
              <strong>Mã hóa đơn:</strong> {invoiceData.invoiceCode}
            </p>
            <p>
              <strong>Trạng thái:</strong>
              <span
                style={{
                  color: getStatusColor(invoiceData.status),
                  marginLeft: "5px",
                }}
              >
                {getStatusText(invoiceData.status)}
              </span>
            </p>

            <p>
              <strong>Tour:</strong> {invoiceData.tourId?.title}
            </p>
            <p>
              <strong>Tổng tiền ban đầu:</strong>{" "}
              {formatVND(invoiceData.totalPrice)}
            </p>
          </div>
        </div>

        {/* Form không hiển thị phần chọn category/tour vì đã fix */}
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
          allowedTypes={allowPersonTypes}
          surchargeTypes={surchargePersonTypes}
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
          onChangeProvince={handleProvinceChange}
          onChangeWard={setWard}
          onChangeNote={setNote}
        />

        <PaymentSection
          paymentMethod={paymentMethod}
          onChangePayment={setPaymentMethod}
          onSubmitCash={() => openConfirm("cash")}
          onSubmitMomo={() => openConfirm("momo")}
          onSubmitCard={() => openConfirm("card")}
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
            ? "Bạn xác nhận thanh toán lại qua MoMo cho đơn hàng này?"
            : confirmAction === "card"
            ? "Bạn xác nhận thanh toán lại bằng thẻ cho đơn hàng này?"
            : "Bạn đồng ý thanh toán lại đơn hàng này tại công ty?"
        }
      />
    </div>
  );
}
