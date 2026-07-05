// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, 
  FiFacebook, FiInstagram, FiLinkedin, FiCamera, FiSave, FiX, FiAward,
  FiStar, FiSettings, FiMap
} from 'react-icons/fi';
import Footer from '../components/Footer';
import { getProfile, updateProfile } from '../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const data = await getProfile();
        if (data.birthday) {
          data.birthday = new Date(data.birthday).toISOString().split('T')[0];
        }
        setUser(data);
        setForm(data);
        setAvatarPreview(data.avatar);
        setIsLoading(false);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target.result);
        setForm(f => ({ ...f, avatar: file })); // gửi file thực cho API
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined) {
          if (key === 'birthday' && form[key]) {
            formData.append(key, new Date(form[key]).toISOString().split('T')[0]);
          } else {
            formData.append(key, form[key]);
          }
        }
      });

      const updated = await updateProfile(formData);
      let updatedData = updated.data || await getProfile();
      if (updatedData.birthday) {
        updatedData.birthday = new Date(updatedData.birthday).toISOString().split('T')[0];
      }

      setUser(updatedData);
      setForm(updatedData);
      setAvatarPreview(updatedData.avatar);
      setEdit(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại, thử lại sau");
    }
  };

  const handleCancel = () => {
    setForm(user);
    setAvatarPreview(user.avatar);
    setEdit(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Thông tin cá nhân
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Quản lý thông tin tài khoản của bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">

              {/* Avatar */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img 
                    src={avatarPreview} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-2xl" 
                  />
                  {edit && (
                    <label className="absolute bottom-2 right-2 bg-primary text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-all transform hover:scale-110">
                      <FiCamera className="text-lg" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <FiAward className="text-primary" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {user.role === 'student' ? 'Học viên' : 'Giáo viên'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                  <FiMail className="text-sm" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 mb-8">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiStar className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user.role === 'student' ? 'Lớp học' : 'Kinh nghiệm'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.role === 'student' ? user.grade : `${user.experience} năm`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <FiMap className="text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user.role === 'student' ? 'Trường học' : 'Bộ môn'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.role === 'student' ? user.school : user.subject}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!edit ? (
                  <button
                    onClick={() => setEdit(true)}
                    className="w-full bg-primary text-white py-3 px-6 rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiEdit2 /> Chỉnh sửa thông tin
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleSave}
                      className="w-full bg-primary text-white py-3 px-6 rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FiSave /> Lưu thay đổi
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 px-6 rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FiX /> Hủy bỏ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiSettings /> Thông tin chi tiết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone || ''}
                      onChange={handleChange}
                      disabled={!edit}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Số điện thoại"
                    />
                  </div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày sinh</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="birthday"
                      value={form.birthday || ''}
                      onChange={handleChange}
                      disabled={!edit}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giới tính</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="gender"
                      value={form.gender || 'Nam'}
                      onChange={handleChange}
                      disabled={!edit}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={form.address || ''}
                      onChange={handleChange}
                      disabled={!edit}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Địa chỉ"
                    />
                  </div>
                </div>

                {/* Role-specific */}
                <div className="space-y-4">
                  {user.role === 'student' ? (
                    <>
                      <label>Lớp học</label>
                      <select
                        name="grade"
                        value={form.grade || ''}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Chọn lớp</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>

                      <label>Trường học</label>
                      <input
                        type="text"
                        name="school"
                        value={form.school || ''}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Trường học"
                      />

                      <label>Phụ huynh</label>
                      <input
                        type="text"
                        name="parent"
                        value={form.parent || ''}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Phụ huynh"
                      />

                      <label>Ghi chú</label>
                      <textarea
                        name="note"
                        value={form.note || ''}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ghi chú"
                      />
                    </>
                  ) : (
                    <>
                      <label>Bộ môn</label>
                      <input type="text" name="subject" value={form.subject || ''} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Bộ môn" />

                      <label>Kinh nghiệm (năm)</label>
                      <input type="number" name="experience" value={form.experience || 0} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Số năm kinh nghiệm" />

                      <label>Mô tả</label>
                      <textarea name="bio" value={form.bio || ''} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Mô tả về bản thân" />

                      {/* Social links */}
                      <label>Facebook</label>
                      <input type="text" name="facebook" value={form.facebook || ''} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Facebook URL" />
                      <label>Instagram</label>
                      <input type="text" name="instagram" value={form.instagram || ''} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Instagram URL" />
                      <label>LinkedIn</label>
                      <input type="text" name="linkedin" value={form.linkedin || ''} onChange={handleChange} disabled={!edit} className="w-full pl-4 pr-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="LinkedIn URL" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
