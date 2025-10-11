import React from "react";
import Select from "react-select";
import { useState } from "react";
import CategoryTreeSelect from "../../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import LoadingModal from "../../../../components/common/LoadingModal";
import { generateSlugLocal } from "../../../../../utils/slugGenerator";
import { useToast } from "../../../../../contexts/ToastContext";
import { formatCurrencyVND } from "../../../../../admin/helpers/formatCurrencyVND";
import "./BasicInfo.css";

const BasicInfo = ({
  form,
  setForm,
  travelTimes,
  hotels,
  vehicles,
  frequencies,
  filters,
  departPlaces, // ✅ nhận thêm
}) => {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugMessage, setSlugMessage] = useState("");
  const { showToast } = useToast();
  const [priceDisplay, setPriceDisplay] = useState(
    form.prices ? formatCurrencyVND(form.prices) : ""
  );
  const handleGenerateSlug = async () => {
    if (!form.title || !form.title.trim()) {
      showToast("Bạn cần nhập tiêu đề trước khi tạo slug", "error");
      return;
    }
    setSlugMessage("Đang tạo slug...");
    setSlugLoading(true);

    try {
      // --- Thử gọi AI trước ---
      const res = await fetch(
        `${API_BASE}/api/v1/admin/tours/generate-slug-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title }),
        }
      );

      const data = await res.json();
      if (data.success && data.slug) {
        setForm({ ...form, slug: data.slug });
        showToast("Tạo slug bằng AI thành công", "success");
      } else {
        // --- fallback sang local ---
        const slug = generateSlugLocal(form.title);
        setForm({ ...form, slug });
      }
    } catch (err) {
      console.error("generate slug ai error", err);
      const slug = generateSlugLocal(form.title);
      setForm({ ...form, slug });
    } finally {
      setSlugLoading(false);
      setSlugMessage("");
    }
  };

  return (
    <div className="basic-info">
      <h4>Thông tin cơ bản</h4>

      {/* Tên tour */}
      <label>Tên Tour</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* Slug */}
      <label>Slug</label>
      <div className="slug-input">
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <button
          type="button"
          onClick={handleGenerateSlug}
          disabled={slugLoading}
        >
          {slugLoading ? "Đang tạo..." : "Tạo Slug Tự Động"}
        </button>
      </div>

      {/* Danh mục */}
      <label>Danh mục Tour</label>
      <CategoryTreeSelect
        value={form.categoryId ? { _id: form.categoryId } : null}
        onChange={(node) => setForm({ ...form, categoryId: node._id })}
      />

      {/* Travel Time */}
      <label>Thời gian (Ngày/Đêm)</label>
      <Select
        options={travelTimes.map((t) => ({
          value: t._id,
          label: `${t.day} ngày ${t.night} đêm`,
        }))}
        value={
          form.travelTimeId
            ? {
                value: form.travelTimeId,
                label: `${
                  travelTimes.find((t) => t._id === form.travelTimeId)?.day
                } ngày ${
                  travelTimes.find((t) => t._id === form.travelTimeId)?.night
                } đêm`,
              }
            : null
        }
        onChange={(selected) =>
          setForm({ ...form, travelTimeId: selected.value })
        }
        menuPlacement="auto"
        maxMenuHeight={200} // ~ 5 item
      />

      {/* Depart Place */}
      <label>Điểm khởi hành</label>
      <Select
        options={departPlaces.map((d) => ({
          value: d._id,
          label: d.name,
        }))}
        value={
          form.departPlaceId
            ? {
                value: form.departPlaceId,
                label: departPlaces.find((d) => d._id === form.departPlaceId)
                  ?.name,
              }
            : null
        }
        onChange={(selected) =>
          setForm({ ...form, departPlaceId: selected.value })
        }
        menuPlacement="auto"
        maxMenuHeight={200}
        placeholder="Chọn điểm khởi hành..."
      />

      {/* Hotel */}
      <label>Khách sạn</label>
      <Select
        options={hotels.map((h) => ({ value: h._id, label: h.name }))}
        value={
          form.hotelId
            ? {
                value: form.hotelId,
                label: hotels.find((h) => h._id === form.hotelId)?.name,
              }
            : null
        }
        onChange={(selected) => setForm({ ...form, hotelId: selected.value })}
        menuPlacement="auto"
        maxMenuHeight={200} // ~ 5 item
      />

      {/* Vehicles */}
      <label>Phương tiện(Có thể chọn nhiều phương tiện)</label>
      <Select
        options={vehicles.map((v) => ({ value: v._id, label: v.name }))}
        value={null} // 👉 luôn để trống, không hiện chọn bên trong select
        onChange={(selected) => {
          if (selected) {
            if (!form.vehicleId.includes(selected.value)) {
              setForm({
                ...form,
                vehicleId: [...form.vehicleId, selected.value],
              });
            }
          }
        }}
        menuPlacement="auto"
        maxMenuHeight={200}
        placeholder="Chọn phương tiện..."
        isClearable={false}
        isMulti={false}
      />

      {/* Hiển thị danh sách phương tiện đã chọn */}
      <div className="selected-vehicles">
        {form.vehicleId.map((id) => {
          const vehicle = vehicles.find((v) => v._id === id);
          return (
            <div key={id} className="vehicle-tag">
              {vehicle?.name}
              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  setForm({
                    ...form,
                    vehicleId: form.vehicleId.filter((vid) => vid !== id),
                  })
                }
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Frequency */}
      <label>Tần suất chuyến đi</label>
      <select
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
      >
        <option value="">-- Chọn tần suất --</option>
        {frequencies.map((f) => (
          <option key={f._id} value={f._id}>
            {f.title}
          </option>
        ))}
      </select>

      {/* Giá & Giảm giá */}
      <label>Giá (VNĐ)</label>
      <input
        type="text"
        value={priceDisplay}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, ""); // bỏ ký tự ngoài số
          const num = raw ? parseInt(raw, 10) : 0;

          setForm({ ...form, prices: num });
          setPriceDisplay(raw ? formatCurrencyVND(num) : "");
        }}
      />

      <label>Giảm giá (%)</label>
      <input
        type="number"
        min="0"
        max="100"
        value={form.discount}
        onChange={(e) => setForm({ ...form, discount: e.target.value })}
      />

      {/* Số ghế */}
      <label>Số ghế</label>
      <input
        type="number"
        value={form.seats}
        onChange={(e) => setForm({ ...form, seats: e.target.value })}
      />

      {/* Type */}
      <label>Loại Tour</label>
      <select
        value={form.type}
        min="1"
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="domestic">Trong nước</option>
        <option value="aboard">Nước ngoài</option>
      </select>

      {/* Filter */}
      <label>Filter (Có thể chọn nhiều)</label>
      <Select
        options={filters.map((f) => ({ value: f._id, label: f.label }))}
        value={null} // 👉 luôn để trống, không hiển thị trong select
        onChange={(selected) => {
          if (selected) {
            if (!form.filterId.includes(selected.value)) {
              setForm({
                ...form,
                filterId: [...form.filterId, selected.value],
              });
            }
          }
        }}
        menuPlacement="auto"
        maxMenuHeight={200}
        placeholder="Chọn filter..."
        isClearable={false}
        isMulti={false}
      />

      {/* Hiển thị danh sách filter đã chọn */}
      <div className="selected-filters">
        {form.filterId.map((fid) => {
          const f = filters.find((fl) => fl._id === fid);
          return (
            <div key={fid} className="filter-tag">
              {f?.label}
              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  setForm({
                    ...form,
                    filterId: form.filterId.filter((id) => id !== fid),
                  })
                }
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Active */}
      <label>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Hoạt động
      </label>

      <label>Thứ tự</label>
      <div className="position-input">
        <input
          type="number"
          value={form.position}
          onChange={(e) =>
            setForm({ ...form, position: Number(e.target.value) })
          }
        />
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch(
                `${API_BASE}/api/v1/admin/tours/countTours`,{
                  credentials:"include",
                }
              );
              const data = await res.json();
              if (data.success) {
                setForm({ ...form, position: data.count + 1 });
              }
            } catch (error) {
              console.error("Error fetching count:", error);
            }
          }}
        >
          Lấy tự động
        </button>
      </div>
      <LoadingModal open={slugLoading} message={slugMessage} icon="FaAnchor" />
    </div>
  );
};

export default BasicInfo;
