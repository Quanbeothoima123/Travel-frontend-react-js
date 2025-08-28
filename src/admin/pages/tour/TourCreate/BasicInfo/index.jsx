import React from "react";
import CategoryTreeSelect from "../../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
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
        value={form.categoryId ? { _id: form.categoryId } : null} // lưu id thôi
        onChange={(node) => setForm({ ...form, categoryId: node._id })}
      />

      {/* Travel Time */}
      <label>Thời gian (Ngày/Đêm)</label>
      <select
        value={form.travelTimeId}
        onChange={(e) => setForm({ ...form, travelTimeId: e.target.value })}
      >
        <option value="">-- Chọn thời gian --</option>
        {travelTimes.map((time) => (
          <option key={time._id} value={time._id}>
            {time.day} ngày {time.night} đêm
          </option>
        ))}
      </select>

      {/* Hotel */}
      <label>Khách sạn</label>
      <select
        value={form.hotelId}
        onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
      >
        <option value="">-- Chọn khách sạn --</option>
        {hotels.map((h) => (
          <option key={h._id} value={h._id}>
            {h.name}
          </option>
        ))}
      </select>

      {/* Vehicles */}
      <label>Phương tiện</label>
      <select
        multiple
        value={form.vehicleId}
        onChange={(e) =>
          setForm({
            ...form,
            vehicleId: Array.from(e.target.selectedOptions, (opt) => opt.value),
          })
        }
      >
        {vehicles.map((v) => (
          <option key={v._id} value={v._id}>
            {v.name}
          </option>
        ))}
      </select>

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
