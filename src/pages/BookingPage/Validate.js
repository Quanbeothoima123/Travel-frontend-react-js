export function validateForm({
  name,
  phone,
  email,
  address,
  province,
  ward,
  departDate,
  totalPrice,
  showToast,
}) {
  const errors = [];
  if (!name) errors.push("Họ và tên là bắt buộc.");
  if (!phone) errors.push("Số điện thoại là bắt buộc.");
  if (!email) errors.push("Email là bắt buộc.");
  if (!address) errors.push("Địa chỉ là bắt buộc.");
  if (!province) errors.push("Tỉnh/thành phố là bắt buộc.");
  if (!ward) errors.push("Phường/xã là bắt buộc.");
  if (!departDate) errors.push("Ngày khởi hành là bắt buộc.");
  if (totalPrice <= 0) errors.push("Tổng tiền không hợp lệ.");
  if (errors.length) errors.forEach((msg) => showToast(msg, "error"));
  return errors;
}
