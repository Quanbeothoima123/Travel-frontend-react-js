import React from "react";
import ProvinceSelect from "../../components/common/DropDownTreeSearch/ProvinceSelect";
import WardSelect from "../../components/common/DropDownTreeSearch/WardSelect";
import "./BookingPage.css";
export default function CustomerInfo({
  name,
  phone,
  email,
  address,
  province,
  ward,
  note,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onChangeAddress,
  onChangeProvince,
  onChangeWard,
  onChangeNote,
}) {
  return (
    <>
      <h2>Thông tin khách hàng</h2>
      <div className="form-grid">
        <div className="form-item">
          <label>Họ và tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
          />
        </div>
        <div className="form-item">
          <label>Điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
          />
        </div>
        <div className="form-item">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
          />
        </div>
        <div className="form-item">
          <label>Địa chỉ</label>
          <input
            type="text"
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
          />
        </div>
        <div className="form-item">
          <label>Chọn tỉnh/thành phố</label>
          <ProvinceSelect value={province} onChange={onChangeProvince} />
        </div>
        <div className="form-item">
          <label>Chọn phường/xã</label>
          <WardSelect
            provinceCode={province?.code}
            value={ward}
            onChange={onChangeWard}
          />
        </div>
        <div className="form-item form-item--full">
          <label>Ghi chú</label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
