// src/utils/validation.js
export const validateRegisterForm = (form) => {
  const errors = {};

  if (!form.full_name.trim()) errors.full_name = "Họ tên không được để trống";

  if (!form.email) errors.email = "Email không được để trống";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Email không hợp lệ";

  if (!form.password) errors.password = "Mật khẩu không được để trống";
  else if (form.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";

  if (form.phone && !/^\d{9,15}$/.test(form.phone.replace(/\D/g, "")))
    errors.phone = "Số điện thoại không hợp lệ";

  if (form.birthday) {
    const today = new Date();
    const birth = new Date(form.birthday);
    if (birth > today) errors.birthday = "Ngày sinh không hợp lệ";
  }

  return errors;
};
