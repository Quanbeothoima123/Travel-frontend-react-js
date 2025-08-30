import React from "react";
import Select from "react-select";
import CategoryTreeSelect from "../../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import "./BasicInfo.css";

const BasicInfo = ({
  form,
  setForm,
  travelTimes,
  hotels,
  vehicles,
  frequencies,
}) => {
  return (
    <div className="basic-info">
      <h4>Thông tin cơ bản</h4>

      {/* Tên tour */}
      <label>Tiêu đề Tour</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* Slug */}
      <label>Slug</label>
      <input
        type="text"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />

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
        isClearable={false} // 👉 bỏ nút x trong select
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
      <label>Tần suất</label>
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
        type="number"
        value={form.prices}
        onChange={(e) => setForm({ ...form, prices: e.target.value })}
      />

      <label>Giảm giá (%)</label>
      <input
        type="number"
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
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="domestic">Trong nước</option>
        <option value="aboard">Nước ngoài</option>
      </select>

      {/* Filter */}
      <label>Filter</label>
      <select
        value={form.filter}
        onChange={(e) => setForm({ ...form, filter: e.target.value })}
      >
        <option value="">-- Không chọn --</option>
        <option value="hot">Hot</option>
        <option value="deep_discount">Giảm giá sâu</option>
      </select>

      {/* Active */}
      <label>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Kích hoạt
      </label>

      {/* Position */}
      <label>Thứ tự</label>
      <input
        type="number"
        value={form.position}
        onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
      />
    </div>
  );
};

export default BasicInfo;
