import React, { useState, useEffect } from "react";
import ThumbnailUploader from "./ThumbnailUploader";
import ImagesUploader from "./ImagesUploader";
import DepartPlacesInput from "./DepartPlacesInput";
import TagsInput from "./TagInput";
import AdditionalPricesInput from "./AdditionalPricesEditor";
import TermEditor from "./TermsEditor";
import DescriptionEditor from "./DescriptionEditor";
import SpecialExperienceEditor from "./SpecialExperienceEditor";
import BasicInfo from "./BasicInfo";
import "./TourCreatePage.css";
import { useToast } from "../../../../contexts/ToastContext";
import ConfirmModal from "../../../components/common/ConfirmModal";
import LoadingModal from "../../../components/common/LoadingModal";
const TourCreatePage = () => {
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    thumbnail: "",
    images: [],
    travelTimeId: "",
    hotelId: "",
    departPlaces: { place: "", googleMap: "" },
    position: 0,
    prices: 0,
    discount: 0,
    tags: [],
    seats: 0,
    description: [],
    term: [],
    vehicleId: [],
    slug: "",
    type: "domestic",
    active: true,
    filter: "",
    frequency: "",
    specialExperience: "",
    additionalPrices: [],
  });
  // ✅ lưu trạng thái modal
  const [showClearModal, setShowClearModal] = useState(false);
  // ✅ reset form
  const resetForm = () => {
    setForm({
      categoryId: "",
      title: "",
      thumbnail: "",
      images: [],
      travelTimeId: "",
      hotelId: "",
      departPlaces: { place: "", googleMap: "" },
      position: 0,
      prices: 0,
      discount: 0,
      tags: [],
      seats: 0,
      description: [],
      term: [],
      vehicleId: [],
      slug: "",
      type: "domestic",
      active: true,
      filter: "",
      frequency: "",
      specialExperience: "",
      additionalPrices: [],
    });
    setShowClearModal(false);
    showToast("Dữ liệu đã được làm mới", "success");
  };
  // Dữ liệu từ API
  const [travelTimes, setTravelTimes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  // ✅ Hàm tiện ích delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // useToast
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [travelRes, hotelRes, vehicleRes, freqRes, personRes, termRes] =
          await Promise.all([
            fetch("http://localhost:5000/api/v1/travel-time/getAll"),
            fetch("http://localhost:5000/api/v1/hotel/getAll"),
            fetch("http://localhost:5000/api/v1/vehicle/getAll"),
            fetch("http://localhost:5000/api/v1/frequency/getAll"),
            fetch("http://localhost:5000/api/v1/type-of-person/getAll"),
            fetch("http://localhost:5000/api/v1/term/getAll"),
          ]);

        const [
          travelData,
          hotelData,
          vehicleData,
          freqData,
          personData,
          termData,
        ] = await Promise.all([
          travelRes.json(),
          hotelRes.json(),
          vehicleRes.json(),
          freqRes.json(),
          personRes.json(),
          termRes.json(),
        ]);

        setTravelTimes(travelData || []);
        setHotels(hotelData || []);
        setVehicles(vehicleData || []);
        setFrequencies(freqData || []);
        setPersonTypes(personData || []);
        setTermOptions(termData || []);
      } catch (err) {
        console.error("Fetch data error:", err);
        showToast("Lỗi khi tải dữ liệu danh mục", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line

  // ✅ Hàm handleCheck
  const handleCheck = async () => {
    setLoadingModal(true);
    setLoadingMessage("Đang kiểm tra tour...");

    const MIN_LOADING = 2500;

    try {
      const fetchPromise = fetch(
        "http://localhost:5000/api/v1/tours/check-info-tour-create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      ).then((res) => res.json());

      const [data] = await Promise.all([fetchPromise, delay(MIN_LOADING)]);

      if (!data.success) {
        showToast(data.message || "Thông tin không hợp lệ", "error");
      } else {
        showToast("Dữ liệu tour hợp lệ", "success");
      }
    } catch (err) {
      showToast("Lỗi khi kiểm tra tour", "error");
    } finally {
      setLoadingModal(false);
    }
  };

  // ✅ Hàm handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingModal(true);
    setLoadingMessage("Đang lưu tour...");

    const MIN_LOADING = 2500;

    try {
      const fetchPromise = fetch("http://localhost:5000/api/v1/tours/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      }).then((res) => res.json());

      const [data] = await Promise.all([fetchPromise, delay(MIN_LOADING)]);

      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => showToast(err, "error"));
        } else {
          showToast(data.message || "Lỗi khi tạo tour", "error");
        }
      } else {
        showToast("Tạo tour thành công!", "success");
      }
    } catch (err) {
      showToast("Không thể tạo tour!", "error");
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="tour-create">
      <h2>Tạo tour mới</h2>
      <LoadingModal open={loadingModal} message={loadingMessage} />

      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : (
        <form onSubmit={handleSubmit} className="tour-form">
          {/* Basic info */}
          <BasicInfo
            form={form}
            setForm={setForm}
            travelTimes={travelTimes}
            hotels={hotels}
            vehicles={vehicles}
            frequencies={frequencies}
          />

          {/* Thumbnail */}
          <ThumbnailUploader
            value={form.thumbnail}
            onChange={(url) => setForm({ ...form, thumbnail: url })}
          />

          {/* Images */}
          <ImagesUploader
            images={form.images}
            setImages={(imgs) => setForm({ ...form, images: imgs })}
          />

          {/* ... các phần khác ... */}
          <DepartPlacesInput
            departPlace={form.departPlaces}
            setDepartPlace={(place) =>
              setForm({ ...form, departPlaces: place })
            }
          />

          <TagsInput
            tags={form.tags}
            setTags={(tags) => setForm({ ...form, tags })}
          />

          <AdditionalPricesInput
            additionalPrices={form.additionalPrices}
            setAdditionalPrices={(val) =>
              setForm({ ...form, additionalPrices: val })
            }
            personTypes={personTypes}
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

          {/* Submit + Validate */}
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
      {/* Confirm Clear Modal */}
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
