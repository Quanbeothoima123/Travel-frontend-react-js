import React, { useState, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";
import LoadingModal from "../../components/common/LoadingModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ImageUploader from "../tour/TourCreate/ImageUploader";
import TinyEditor from "../tour/TinyEditor";
import "./AboutUsManager.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const AboutUsManager = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/admin/about-us`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        if (data.data) {
          setForm(data.data);
        } else {
          setShowCreateModal(true);
        }
      } else {
        showToast(data.message || "Lỗi khi tải dữ liệu", "error");
      }
    } catch (error) {
      console.error("Error fetching about us:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitial = () => {
    setForm({
      companyName: "",
      slogan: "",
      shortDescription: "",
      longDescription: "",
      foundedYear: new Date().getFullYear(),
      founderName: "",
      foundingStory: "",
      mission: "",
      vision: "",
      coreValues: [],
      achievements: [],
      teamMembers: [],
      branches: [],
      certifications: [],
      partners: [],
      socialMedia: {
        facebook: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        twitter: "",
        linkedin: "",
        zalo: "",
      },
      contact: {
        hotline: "",
        email: "",
        supportEmail: "",
        address: "",
        workingHours: "",
      },
      media: {
        logo: "",
        logoWhite: "",
        favicon: "",
        coverImage: "",
        companyImages: [],
        companyVideo: "",
      },
      futureGoals: [],
      awards: [],
      workProcess: [],
      whyChooseUs: [],
      policies: {
        privacyPolicy: "",
        termsOfService: "",
        refundPolicy: "",
        cookiePolicy: "",
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
        ogImage: "",
      },
      isActive: true,
    });
    setShowCreateModal(false);
    showToast("Đã khởi tạo form. Vui lòng nhập thông tin", "info");
  };

  const handleSave = async () => {
    if (!form) return;

    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE}/api/v1/admin/about-us/createOrUpdate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        setForm(data.data);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => showToast(err, "error"));
        } else {
          showToast(data.message || "Lỗi khi lưu", "error");
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      showToast("Lỗi khi lưu dữ liệu", "error");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field, defaultItem) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem],
    }));
  };

  const removeItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (field, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleImageUpload = (field, url) => {
    setForm((prev) => ({
      ...prev,
      media: { ...prev.media, [field]: url },
    }));
  };

  const handleMultipleImagesUpload = (urls) => {
    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        companyImages: [...(prev.media.companyImages || []), ...urls],
      },
    }));
  };

  const removeCompanyImage = (index) => {
    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        companyImages: prev.media.companyImages.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading) {
    return <LoadingModal open={true} message="Đang tải..." icon="FaSpinner" />;
  }

  if (!form) {
    return null;
  }

  return (
    <div className="about-us-manager">
      <LoadingModal open={saving} message="Đang lưu..." icon="FaSave" />
      <LoadingModal
        open={uploading}
        message="Đang tải ảnh lên..."
        icon="FaCloudUploadAlt"
      />

      <ConfirmModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateInitial}
        title="Chưa có nội dung About Us"
        message="Bạn muốn tạo nội dung ban đầu?"
      />

      <div className="aum-header">
        <h1>Quản lý trang About Us</h1>
        <button onClick={handleSave} className="aum-btn-save">
          💾 Lưu thay đổi
        </button>
      </div>

      <div className="aum-tabs">
        {[
          { id: "basic", label: "Thông tin cơ bản" },
          { id: "history", label: "Lịch sử & Giá trị" },
          { id: "achievements", label: "Thành tựu" },
          { id: "team", label: "Đội ngũ" },
          { id: "branches", label: "Chi nhánh" },
          { id: "certifications", label: "Chứng nhận" },
          { id: "partners", label: "Đối tác" },
          { id: "contact", label: "Liên hệ" },
          { id: "media", label: "Media" },
          { id: "others", label: "Khác" },
          { id: "seo", label: "SEO" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`aum-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="aum-content">
        {/* BASIC INFO */}
        {activeTab === "basic" && (
          <div className="aum-section">
            <h2>Thông tin cơ bản</h2>

            <div className="aum-field">
              <label>Tên công ty *</label>
              <input
                type="text"
                value={form.companyName || ""}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                placeholder="VD: Du lịch Việt Travel"
              />
            </div>

            <div className="aum-field">
              <label>Slogan</label>
              <input
                type="text"
                value={form.slogan || ""}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                placeholder="VD: Hành trình của bạn, đam mê của chúng tôi"
              />
            </div>

            <div className="aum-field">
              <label>Mô tả ngắn (Plain text)</label>
              <textarea
                value={form.shortDescription || ""}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                rows="3"
                placeholder="Giới thiệu ngắn gọn về công ty (1-2 câu)"
              />
            </div>

            <div className="aum-field">
              <label>Mô tả chi tiết (Rich text)</label>
              <TinyEditor
                value={form.longDescription || ""}
                onChange={(content) =>
                  setForm({ ...form, longDescription: content })
                }
              />
            </div>
          </div>
        )}

        {/* HISTORY & VALUES */}
        {activeTab === "history" && (
          <div className="aum-section">
            <h2>Lịch sử & Giá trị cốt lõi</h2>

            <div className="aum-row">
              <div className="aum-field">
                <label>Năm thành lập</label>
                <input
                  type="number"
                  value={form.foundedYear || ""}
                  onChange={(e) =>
                    setForm({ ...form, foundedYear: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="aum-field">
                <label>Người sáng lập</label>
                <input
                  type="text"
                  value={form.founderName || ""}
                  onChange={(e) =>
                    setForm({ ...form, founderName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="aum-field">
              <label>Câu chuyện thành lập</label>
              <TinyEditor
                value={form.foundingStory || ""}
                onChange={(content) =>
                  setForm({ ...form, foundingStory: content })
                }
              />
            </div>

            <div className="aum-field">
              <label>Sứ mệnh (Mission)</label>
              <TinyEditor
                value={form.mission || ""}
                onChange={(content) => setForm({ ...form, mission: content })}
              />
            </div>

            <div className="aum-field">
              <label>Tầm nhìn (Vision)</label>
              <TinyEditor
                value={form.vision || ""}
                onChange={(content) => setForm({ ...form, vision: content })}
              />
            </div>

            <div className="aum-field">
              <label>Giá trị cốt lõi</label>
              <button
                onClick={() =>
                  addItem("coreValues", {
                    title: "",
                    description: "",
                    icon: "",
                  })
                }
                className="aum-btn-add"
              >
                + Thêm giá trị
              </button>

              {form.coreValues?.map((value, idx) => (
                <div key={idx} className="aum-array-item">
                  <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={value.title}
                    onChange={(e) =>
                      updateItem("coreValues", idx, "title", e.target.value)
                    }
                  />
                  <TinyEditor
                    value={value.description}
                    onChange={(content) =>
                      updateItem("coreValues", idx, "description", content)
                    }
                    label="Mô tả"
                  />
                  <input
                    type="text"
                    placeholder="Icon URL hoặc class"
                    value={value.icon}
                    onChange={(e) =>
                      updateItem("coreValues", idx, "icon", e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeItem("coreValues", idx)}
                    className="aum-btn-remove"
                  >
                    ❌ Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="aum-section">
            <h2>Thành tựu & Số liệu</h2>

            <button
              onClick={() =>
                addItem("achievements", {
                  title: "",
                  value: "",
                  description: "",
                  icon: "",
                })
              }
              className="aum-btn-add"
            >
              + Thêm thành tựu
            </button>

            {form.achievements?.map((achievement, idx) => (
              <div key={idx} className="aum-array-item">
                <input
                  type="text"
                  placeholder="Tiêu đề (VD: Khách hàng hài lòng)"
                  value={achievement.title}
                  onChange={(e) =>
                    updateItem("achievements", idx, "title", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Giá trị (VD: 10000+, 98%)"
                  value={achievement.value}
                  onChange={(e) =>
                    updateItem("achievements", idx, "value", e.target.value)
                  }
                />
                <textarea
                  placeholder="Mô tả"
                  value={achievement.description}
                  onChange={(e) =>
                    updateItem(
                      "achievements",
                      idx,
                      "description",
                      e.target.value
                    )
                  }
                  rows="2"
                />
                <button
                  onClick={() => removeItem("achievements", idx)}
                  className="aum-btn-remove"
                >
                  ❌ Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TEAM */}
        {activeTab === "team" && (
          <div className="aum-section">
            <h2>Đội ngũ</h2>

            <button
              onClick={() =>
                addItem("teamMembers", {
                  name: "",
                  position: "",
                  bio: "",
                  avatar: "",
                  email: "",
                  phone: "",
                  socialLinks: { facebook: "", linkedin: "", twitter: "" },
                })
              }
              className="aum-btn-add"
            >
              + Thêm thành viên
            </button>

            {form.teamMembers?.map((member, idx) => (
              <div key={idx} className="aum-array-item">
                <div className="aum-row">
                  <input
                    type="text"
                    placeholder="Tên"
                    value={member.name}
                    onChange={(e) =>
                      updateItem("teamMembers", idx, "name", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Chức vụ"
                    value={member.position}
                    onChange={(e) =>
                      updateItem("teamMembers", idx, "position", e.target.value)
                    }
                  />
                </div>

                <div className="aum-field">
                  <label>Avatar</label>
                  <ImageUploader
                    onUpload={(url) =>
                      updateItem("teamMembers", idx, "avatar", url)
                    }
                    onUploadStart={() => setUploading(true)}
                    onUploadEnd={() => setUploading(false)}
                  />
                  {member.avatar && (
                    <img
                      src={member.avatar}
                      alt="Avatar"
                      className="aum-image-preview"
                    />
                  )}
                </div>

                <TinyEditor
                  value={member.bio}
                  onChange={(content) =>
                    updateItem("teamMembers", idx, "bio", content)
                  }
                  label="Tiểu sử"
                />

                <button
                  onClick={() => removeItem("teamMembers", idx)}
                  className="aum-btn-remove"
                >
                  ❌ Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MEDIA */}
        {activeTab === "media" && (
          <div className="aum-section">
            <h2>Media & Hình ảnh</h2>

            <div className="aum-row">
              <div className="aum-field">
                <label>Logo</label>
                <ImageUploader
                  onUpload={(url) => handleImageUpload("logo", url)}
                  onUploadStart={() => setUploading(true)}
                  onUploadEnd={() => setUploading(false)}
                />
                {form.media?.logo && (
                  <img
                    src={form.media.logo}
                    alt="Logo"
                    className="aum-image-preview"
                  />
                )}
              </div>

              <div className="aum-field">
                <label>Cover Image</label>
                <ImageUploader
                  onUpload={(url) => handleImageUpload("coverImage", url)}
                  onUploadStart={() => setUploading(true)}
                  onUploadEnd={() => setUploading(false)}
                />
                {form.media?.coverImage && (
                  <img
                    src={form.media.coverImage}
                    alt="Cover"
                    className="aum-image-preview"
                  />
                )}
              </div>
            </div>

            <div className="aum-field">
              <label>Hình ảnh công ty</label>
              <ImageUploader
                multiple
                onUpload={handleMultipleImagesUpload}
                onUploadStart={() => setUploading(true)}
                onUploadEnd={() => setUploading(false)}
              />

              <div className="aum-image-list">
                {form.media?.companyImages?.map((img, idx) => (
                  <div key={idx} className="aum-image-item">
                    <img src={img} alt={`Company ${idx}`} />
                    <button onClick={() => removeCompanyImage(idx)}>❌</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && (
          <div className="aum-section">
            <h2>Thông tin liên hệ</h2>

            <div className="aum-row">
              <div className="aum-field">
                <label>Hotline</label>
                <input
                  type="text"
                  value={form.contact?.hotline || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, hotline: e.target.value },
                    })
                  }
                />
              </div>

              <div className="aum-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.contact?.email || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, email: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <h3>Mạng xã hội</h3>
            <div className="aum-grid-2">
              {Object.keys(form.socialMedia || {}).map((platform) => (
                <div key={platform} className="aum-field">
                  <label>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  <input
                    type="url"
                    value={form.socialMedia[platform] || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socialMedia: {
                          ...form.socialMedia,
                          [platform]: e.target.value,
                        },
                      })
                    }
                    placeholder={`URL ${platform}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {["branches", "certifications", "partners", "others", "seo"].includes(
          activeTab
        ) && (
          <div className="aum-section">
            <h2>Tab {activeTab}</h2>
            <p className="aum-text-muted">
              Nội dung cho tab này tương tự như các tab trên. Bạn có thể tự
              implement theo pattern.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsManager;
