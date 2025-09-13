import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ThumbnailUploader from "../TourCreate/ThumbnailUploader";
import ImagesUploader from "../TourCreate/ImagesUploader";
import TagsInput from "../TourCreate/TagInput";
import AllowTypePeopleSelect from "../TourCreate/AllowTypePeopleSelect";
import AdditionalPricesInput from "../TourCreate/AdditionalPricesEditor";
import TermEditor from "../TourCreate/TermsEditor";
import DescriptionEditor from "../TourCreate/DescriptionEditor";
import SpecialExperienceEditor from "../TourCreate/SpecialExperienceEditor";
import BasicInfo from "../TourCreate/BasicInfo";
import "../TourCreate/TourCreatePage.css";

import { useToast } from "../../../../contexts/ToastContext";
import ConfirmModal from "../../../components/common/ConfirmModal";
import LoadingModal from "../../../components/common/LoadingModal";

const TourEditPage = () => {
  const { tourId } = useParams();
  const { showToast } = useToast();

  // === Form state ===
  const [form, setForm] = useState(null);

  // === UI state ===
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  // === Options from API ===
  const [travelTimes, setTravelTimes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [departPlaces, setDepartPlaces] = useState([]);

  // === Fetch data ban đầu ===
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
          tourRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/v1/admin/travel-time/getAll"),
          fetch("http://localhost:5000/api/v1/admin/hotel/getAll"),
          fetch("http://localhost:5000/api/v1/admin/vehicle/getAll"),
          fetch("http://localhost:5000/api/v1/admin/frequency/getAll"),
          fetch("http://localhost:5000/api/v1/admin/type-of-person/getAll"),
          fetch("http://localhost:5000/api/v1/admin/term/getAll"),
          fetch("http://localhost:5000/api/v1/admin/filter/getAll"),
          fetch("http://localhost:5000/api/v1/admin/depart-place/getAll"),
          fetch(
            `http://localhost:5000/api/v1/admin/tours/getTourById/${tourId}`
          ),
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
          tourData,
        ] = await Promise.all([
          travelRes.json(),
          hotelRes.json(),
          vehicleRes.json(),
          freqRes.json(),
          personRes.json(),
          termRes.json(),
          filterRes.json(),
          departRes.json(),
          tourRes.json(),
        ]);

        setTravelTimes(travelData || []);
        setHotels(hotelData || []);
        setVehicles(vehicleData || []);
        setFrequencies(freqData || []);
        setPersonTypes(personData || []);
        setTermOptions(termData || []);
        setFilterOptions(filterData || []);
        setDepartPlaces(departData || []);

        if (tourData) {
          setForm({
            categoryId: tourData.categoryId?._id || "",
            title: tourData.title || "",
            thumbnail: tourData.thumbnail || "",
            images: tourData.images || [],
            travelTimeId: tourData.travelTimeId?._id || "",
            hotelId: tourData.hotelId?._id || "",
            departPlaceId: tourData.departPlaceId?._id || "",
            position: tourData.position || 0,
            prices: tourData.prices || 0,
            discount: tourData.discount || 0,
            tags: tourData.tags || [],
            seats: tourData.seats || 1,
            description: tourData.description || [],
            term: tourData.term || [],
            vehicleId: tourData.vehicleId?.map((v) => v._id) || [],
            slug: tourData.slug || "",
            type: tourData.type || "domestic",
            active: tourData.active ?? true,
            filterId: tourData.filterId?.map((f) => f._id) || [],
            frequency: tourData.frequency?._id || "",
            specialExperience: tourData.specialExperience || "",
            additionalPrices: tourData.additionalPrices || [],
            allowTypePeople: tourData.allowTypePeople?.map((p) => p._id) || [],
          });
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        showToast("Lỗi khi tải dữ liệu tour", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId, showToast]);

  // === Utility ===
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const postForm = async (url, successMsg, failMsg) => {
    setLoadingModal(true);
    setLoadingMessage("Đang xử lý...");
    const MIN_LOADING = 2500;

    try {
      const fetchPromise = fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      }).then((res) => res.json());

      const [data] = await Promise.all([fetchPromise, delay(MIN_LOADING)]);

      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => showToast(err, "error"));
        } else {
          showToast(data.message || failMsg, "error");
        }
      } else {
        showToast(successMsg, "success");
      }
    } catch (err) {
      showToast(failMsg, "error");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postForm(
      `http://localhost:5000/api/v1/admin/tours/update/${tourId}`,
      "Cập nhật tour thành công",
      "Không thể cập nhật tour!"
    );
  };

  // === Derived data ===
  const allowedPersonTypes = personTypes.filter((p) =>
    form?.allowTypePeople.includes(p._id)
  );

  useEffect(() => {
    if (form) {
      setForm((prev) => ({
        ...prev,
        additionalPrices: prev.additionalPrices.filter((ap) =>
          prev.allowTypePeople.includes(ap.typeOfPersonId)
        ),
      }));
    }
  }, [form?.allowTypePeople]);

  if (loading || !form) {
    return <p>Đang tải dữ liệu…</p>;
  }

  return (
    <div className="tour-create">
      <h2>Chỉnh sửa tour</h2>
      <LoadingModal open={loadingModal} message={loadingMessage} />

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
          <button type="submit" className="btn-save">
            Lưu thay đổi
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {}}
        title="Xóa toàn bộ nội dung?"
        message="Bạn có chắc chắn muốn xóa toàn bộ thông tin đã nhập không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default TourEditPage;
