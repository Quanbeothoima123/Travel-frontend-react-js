import React, { useState, useEffect } from "react";
import ThumbnailUploader from "./ThumbnailUploader";
import ImagesUploader from "./ImagesUploader";
import TagsInput from "./TagInput";
import AllowTypePeopleSelect from "./AllowTypePeopleSelect";
import AdditionalPricesInput from "./AdditionalPricesEditor";
import TermEditor from "./TermsEditor";
import DescriptionEditor from "./DescriptionEditor";
import SpecialExperienceEditor from "./SpecialExperienceEditor";
import BasicInfo from "./BasicInfo";
import "./TourCreatePage.css";
import { useToast } from "../../../../contexts/ToastContext";
import ConfirmModal from "../../../components/common/ConfirmModal";
import LoadingModal from "../../../components/common/LoadingModal";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const TourCreatePage = () => {
  const { showToast } = useToast();

  // === Form state ===
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    thumbnail: "",
    images: [],
    travelTimeId: "",
    hotelId: "",
    departPlaceId: "",
    position: 0,
    prices: 0,
    discount: 0,
    tags: [],
    seats: 1,
    description: [],
    term: [],
    vehicleId: [],
    slug: "",
    type: "domestic",
    active: true,
    filterId: [],
    frequency: "",
    specialExperience: "",
    additionalPrices: [],
    allowTypePeople: [],
  });

  // === UI state ===
  const [showClearModal, setShowClearModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [iconForLoading, setIconForLoading] = useState("");

  // === Options from API ===
  const [travelTimes, setTravelTimes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [departPlaces, setDepartPlaces] = useState([]);

  // === Reset form ===
  const resetForm = () => {
    setForm({
      categoryId: "",
      title: "",
      thumbnail: "",
      images: [],
      travelTimeId: "",
      hotelId: "",
      departPlaceId: "",
      position: 0,
      prices: 0,
      discount: 0,
      tags: [],
      seats: 1,
      description: [],
      term: [],
      vehicleId: [],
      slug: "",
      type: "domestic",
      active: true,
      filterId: [],
      frequency: "",
      specialExperience: "",
      additionalPrices: [],
      allowTypePeople: [],
    });
    setShowClearModal(false);
    showToast("Dữ liệu đã được làm mới", "success");
  };

  // === Fetch initial data ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          travelRes,
          hotelRes,
          vehicleRes,
          freqRes,
          personRes,
          termRes,
          filterRes,
          departRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/v1/admin/travel-time/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/hotel/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/vehicle/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/frequency/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/type-of-person/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/term/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/filter/getAll`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/v1/admin/depart-place/getAll`, {
            credentials: "include",
          }),
        ]);

        const [
          travelData,
          hotelData,
          vehicleData,
          freqData,
          personData,
          termData,
          filterData,
          departData,
        ] = await Promise.all([
          travelRes.json(),
          hotelRes.json(),
          vehicleRes.json(),
          freqRes.json(),
          personRes.json(),
          termRes.json(),
          filterRes.json(),
          departRes.json(),
        ]);

        setTravelTimes(travelData || []);
        setHotels(hotelData || []);
        setVehicles(vehicleData || []);
        setFrequencies(freqData || []);
        setPersonTypes(personData || []);
        setTermOptions(termData || []);
        setFilterOptions(filterData || []);
        setDepartPlaces(departData || []);
      } catch (err) {
        console.error("Fetch data error:", err);
        showToast("Lỗi khi tải dữ liệu danh mục", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // === Handle Check ===
  const handleCheck = async () => {
    setLoadingModal(true);
    setIconForLoading("FaCheck");
    setLoadingMessage("Đang kiểm tra thông tin");

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/tours/check-info-tour-create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => showToast(err, "error"));
        } else {
          showToast(data.message || "Thông tin không hợp lệ", "error");
        }
      } else {
        showToast("Dữ liệu tour hợp lệ", "success");
      }
    } catch (err) {
      console.error("Check error:", err);
      showToast("Lỗi khi kiểm tra thông tin", "error");
    } finally {
      setLoadingModal(false);
    }
  };

  // === Handle Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingModal(true);
    setLoadingMessage("Đang tiến hành lưu tour");
    setIconForLoading("FaSave");

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/tours/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => showToast(err, "error"));
        } else {
          showToast(data.message || "Không thể tạo tour!", "error");
        }
      } else {
        showToast("Tạo tour mới thành công", "success");
        resetForm();
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Không thể tạo tour!", "error");
    } finally {
      setLoadingModal(false);
    }
  };

  // === Derived data ===
  const allowedPersonTypes = personTypes.filter((p) =>
    form.allowTypePeople.includes(p._id)
  );

  // Nếu thay đổi allowTypePeople, tự động lọc lại additionalPrices
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      additionalPrices: prev.additionalPrices.filter((ap) =>
        prev.allowTypePeople.includes(ap.typeOfPersonId)
      ),
    }));
  }, [form.allowTypePeople]);

  return (
    <div className="tour-create">
      <h2>Tạo tour mới</h2>
      <LoadingModal
        open={loadingModal}
        message={loadingMessage}
        icon={iconForLoading}
      />

      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : (
        <form onSubmit={handleSubmit} className="tour-form">
          <BasicInfo
            form={form}
            setForm={setForm}
            travelTimes={travelTimes}
            hotels={hotels}
            vehicles={vehicles}
            frequencies={frequencies}
            filters={filterOptions}
            departPlaces={departPlaces}
          />

          <ThumbnailUploader
            value={form.thumbnail}
            onChange={(url) => setForm({ ...form, thumbnail: url })}
          />

          <ImagesUploader
            images={form.images}
            setImages={(imgs) => setForm({ ...form, images: imgs })}
          />
          <TagsInput
            tags={form.tags}
            setTags={(tags) => setForm({ ...form, tags })}
            title={form.title}
          />

          <AllowTypePeopleSelect
            personTypes={personTypes}
            value={form.allowTypePeople}
            onChange={(ids) => setForm({ ...form, allowTypePeople: ids })}
          />

          <AdditionalPricesInput
            additionalPrices={form.additionalPrices}
            setAdditionalPrices={(val) =>
              setForm({ ...form, additionalPrices: val })
            }
            personTypes={allowedPersonTypes}
          />

          <TermEditor
            terms={form.term}
            setTerms={(val) => setForm({ ...form, term: val })}
            termOptions={termOptions}
          />

          <DescriptionEditor
            descriptions={form.description}
            setDescriptions={(val) => setForm({ ...form, description: val })}
          />

          <SpecialExperienceEditor
            value={form.specialExperience}
            setValue={(val) => setForm({ ...form, specialExperience: val })}
          />

          <div className="form-submit">
            <button
              type="button"
              className="btn-clear"
              onClick={() => setShowClearModal(true)}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn-validate"
              onClick={handleCheck}
            >
              Kiểm tra thông tin
            </button>
            <button type="submit" className="btn-save">
              Lưu tour
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={resetForm}
        title="Xóa toàn bộ nội dung?"
        message="Bạn có chắc chắn muốn xóa toàn bộ thông tin đã nhập không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default TourCreatePage;
