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

  // Dữ liệu từ API
  const [travelTimes, setTravelTimes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [personTypes, setPersonTypes] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/v1/tours/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Cho phép gửi cookie
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi tạo tour");

      console.log("Tour created:", data);
      alert("Tạo tour thành công!");
    } catch (err) {
      console.error("Submit tour error:", err);
      alert("Không thể tạo tour!");
    }
  };

  return (
    <div className="tour-create">
      <h2>Tạo tour mới</h2>

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

          {/* Depart places */}
          <DepartPlacesInput
            departPlace={form.departPlaces}
            setDepartPlace={(place) =>
              setForm({ ...form, departPlaces: place })
            }
          />

          {/* Tags */}
          <TagsInput
            tags={form.tags}
            setTags={(tags) => setForm({ ...form, tags })}
          />

          {/* Additional prices */}
          <AdditionalPricesInput
            additionalPrices={form.additionalPrices}
            setAdditionalPrices={(val) =>
              setForm({ ...form, additionalPrices: val })
            }
            personTypes={personTypes}
          />

          {/* Terms */}
          <TermEditor
            terms={form.term}
            setTerms={(val) => setForm({ ...form, term: val })}
            termOptions={termOptions} // ✅ truyền termOptions
          />

          {/* Description per day */}
          <DescriptionEditor
            descriptions={form.description}
            setDescriptions={(val) => setForm({ ...form, description: val })}
          />

          {/* Special experience */}
          <SpecialExperienceEditor
            value={form.specialExperience}
            setValue={(val) => setForm({ ...form, specialExperience: val })}
          />

          {/* Submit */}
          <div className="form-submit">
            <button type="submit">Lưu tour</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TourCreatePage;
