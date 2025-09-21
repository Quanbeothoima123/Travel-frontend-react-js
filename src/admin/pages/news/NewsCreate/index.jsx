import React, { useState, useEffect } from "react";
import TinyEditor from "../../tour/TinyEditor";
import "./NewsCreate.css";

const NewsCreate = () => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    thumbnail: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    categoryId: "",
    destinationIds: [],
    relatedTourIds: [],
    author: {
      type: "admin",
      id: "",
    },
    tags: [],
    type: "news",
    status: "draft",
    publishedAt: "",
    eventDate: "",
    highlightImages: [],
    language: "vi",
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [tours, setTours] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);

  // AI generation states
  const [aiLoading, setAiLoading] = useState({
    title: false,
    excerpt: false,
    content: false,
    metaTitle: false,
    metaDescription: false,
    tags: false,
  });

  // Fetch data for dropdowns
  useEffect(() => {
    fetchCategories();
    fetchProvinces();
    fetchTours();
    fetchAdminAccounts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/tour-categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch("/api/admin/provinces");
      const data = await response.json();
      setProvinces(data.provinces || []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await fetch("/api/admin/tours?limit=50");
      const data = await response.json();
      setTours(data.tours || []);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const fetchAdminAccounts = async () => {
    try {
      const response = await fetch("/api/admin/accounts");
      const data = await response.json();
      setAdminAccounts(data.accounts || []);
    } catch (error) {
      console.error("Error fetching admin accounts:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value,
      },
    }));
  };

  const handleArrayInputChange = (field, value, isAdd = true) => {
    setFormData((prev) => ({
      ...prev,
      [field]: isAdd
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  // Auto-generate slug from title
  const generateSlug = (title) => {
    const slug = title
      .toLowerCase()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
      .replace(/[éèẻẽẹêếềểễệ]/g, "e")
      .replace(/[íìỉĩị]/g, "i")
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
      .replace(/[úùủũụưứừửữự]/g, "u")
      .replace(/[ýỳỷỹỵ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    handleInputChange("slug", slug);
  };

  // AI Generation functions (placeholders for now)
  const handleAIGenerate = async (field) => {
    setAiLoading((prev) => ({ ...prev, [field]: true }));

    try {
      // TODO: Implement actual AI API call
      const response = await fetch(`/api/admin/ai/generate-${field}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: formData.title || formData.content,
          type: formData.type,
          language: formData.language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        handleInputChange(field, data.content);
      }
    } catch (error) {
      console.error(`Error generating ${field}:`, error);
    } finally {
      setAiLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Tin tức đã được tạo thành công!");
        // Reset form or redirect
      } else {
        alert("Có lỗi xảy ra: " + data.message);
      }
    } catch (error) {
      console.error("Error creating news:", error);
      alert("Có lỗi xảy ra khi tạo tin tức");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nc-container">
      <div className="nc-header">
        <h1 className="nc-title">Tạo tin tức mới</h1>
        <div className="nc-actions">
          <button
            type="button"
            className="nc-btn nc-btn-secondary"
            onClick={() => handleInputChange("status", "draft")}
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            form="news-form"
            className="nc-btn nc-btn-primary"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Xuất bản"}
          </button>
        </div>
      </div>

      <form id="news-form" onSubmit={handleSubmit} className="nc-form">
        <div className="nc-form-grid">
          {/* Left Column */}
          <div className="nc-left-column">
            {/* Basic Information */}
            <div className="nc-section">
              <h3 className="nc-section-title">Thông tin cơ bản</h3>

              <div className="nc-form-group">
                <label className="nc-label">Tiêu đề *</label>
                <div className="nc-input-group">
                  <input
                    type="text"
                    className="nc-input"
                    value={formData.title}
                    onChange={(e) => {
                      handleInputChange("title", e.target.value);
                      generateSlug(e.target.value);
                    }}
                    placeholder="Nhập tiêu đề tin tức"
                    required
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("title")}
                    disabled={aiLoading.title}
                  >
                    {aiLoading.title ? "⏳" : "🤖"} AI
                  </button>
                </div>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Slug *</label>
                <input
                  type="text"
                  className="nc-input"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="duong-dan-url"
                  required
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Ảnh thumbnail</label>
                <input
                  type="url"
                  className="nc-input"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    handleInputChange("thumbnail", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="nc-thumbnail-preview">
                    <img src={formData.thumbnail} alt="Thumbnail preview" />
                  </div>
                )}
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Mô tả ngắn</label>
                <div className="nc-input-group">
                  <textarea
                    className="nc-textarea"
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleInputChange("excerpt", e.target.value)
                    }
                    placeholder="Mô tả ngắn gọn về nội dung tin tức"
                    rows="3"
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("excerpt")}
                    disabled={aiLoading.excerpt}
                  >
                    {aiLoading.excerpt ? "⏳" : "🤖"} AI
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="nc-section">
              <h3 className="nc-section-title">Nội dung</h3>
              <div className="nc-content-group">
                <div className="nc-content-header">
                  <span>Nội dung bài viết *</span>
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("content")}
                    disabled={aiLoading.content}
                  >
                    {aiLoading.content
                      ? "⏳ Đang tạo..."
                      : "🤖 Tạo nội dung bằng AI"}
                  </button>
                </div>
                <TinyEditor
                  value={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="nc-section">
              <h3 className="nc-section-title">SEO</h3>

              <div className="nc-form-group">
                <label className="nc-label">Meta Title</label>
                <div className="nc-input-group">
                  <input
                    type="text"
                    className="nc-input"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleInputChange("metaTitle", e.target.value)
                    }
                    placeholder="Tiêu đề SEO (60 ký tự)"
                    maxLength="60"
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("metaTitle")}
                    disabled={aiLoading.metaTitle}
                  >
                    {aiLoading.metaTitle ? "⏳" : "🤖"} AI
                  </button>
                </div>
                <small className="nc-helper-text">
                  {formData.metaTitle.length}/60 ký tự
                </small>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Meta Description</label>
                <div className="nc-input-group">
                  <textarea
                    className="nc-textarea"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    placeholder="Mô tả SEO (160 ký tự)"
                    maxLength="160"
                    rows="3"
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("metaDescription")}
                    disabled={aiLoading.metaDescription}
                  >
                    {aiLoading.metaDescription ? "⏳" : "🤖"} AI
                  </button>
                </div>
                <small className="nc-helper-text">
                  {formData.metaDescription.length}/160 ký tự
                </small>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="nc-right-column">
            {/* Publishing Options */}
            <div className="nc-section">
              <h3 className="nc-section-title">Xuất bản</h3>

              <div className="nc-form-group">
                <label className="nc-label">Trạng thái</label>
                <select
                  className="nc-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Ngày xuất bản</label>
                <input
                  type="datetime-local"
                  className="nc-input"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    handleInputChange("publishedAt", e.target.value)
                  }
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Loại tin tức</label>
                <select
                  className="nc-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  <option value="news">Tin tức</option>
                  <option value="guide">Hướng dẫn</option>
                  <option value="review">Đánh giá</option>
                  <option value="event">Sự kiện</option>
                  <option value="promotion">Khuyến mãi</option>
                </select>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Ngôn ngữ</label>
                <select
                  className="nc-select"
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Category & Relations */}
            <div className="nc-section">
              <h3 className="nc-section-title">Phân loại</h3>

              <div className="nc-form-group">
                <label className="nc-label">Danh mục</label>
                <select
                  className="nc-select"
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Điểm đến</label>
                <select
                  className="nc-select"
                  multiple
                  value={formData.destinationIds}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    handleInputChange("destinationIds", values);
                  }}
                >
                  {provinces.map((province) => (
                    <option key={province._id} value={province._id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Tours liên quan</label>
                <select
                  className="nc-select"
                  multiple
                  value={formData.relatedTourIds}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    handleInputChange("relatedTourIds", values);
                  }}
                >
                  {tours.map((tour) => (
                    <option key={tour._id} value={tour._id}>
                      {tour.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="nc-section">
              <h3 className="nc-section-title">Tags</h3>

              <div className="nc-form-group">
                <div className="nc-input-group">
                  <input
                    type="text"
                    className="nc-input"
                    placeholder="Thêm tag và nhấn Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value && !formData.tags.includes(value)) {
                          handleArrayInputChange("tags", value);
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("tags")}
                    disabled={aiLoading.tags}
                  >
                    {aiLoading.tags ? "⏳" : "🤖"} AI
                  </button>
                </div>

                <div className="nc-tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="nc-tag">
                      {tag}
                      <button
                        type="button"
                        className="nc-tag-remove"
                        onClick={() =>
                          handleArrayInputChange("tags", tag, false)
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="nc-section">
              <h3 className="nc-section-title">Tác giả</h3>

              <div className="nc-form-group">
                <label className="nc-label">Loại tác giả</label>
                <select
                  className="nc-select"
                  value={formData.author.type}
                  onChange={(e) =>
                    handleNestedInputChange("author", "type", e.target.value)
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Tác giả</label>
                <select
                  className="nc-select"
                  value={formData.author.id}
                  onChange={(e) =>
                    handleNestedInputChange("author", "id", e.target.value)
                  }
                >
                  <option value="">Chọn tác giả</option>
                  {adminAccounts.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.fullName} ({admin.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Details */}
            {formData.type === "event" && (
              <div className="nc-section">
                <h3 className="nc-section-title">Chi tiết sự kiện</h3>

                <div className="nc-form-group">
                  <label className="nc-label">Ngày sự kiện</label>
                  <input
                    type="datetime-local"
                    className="nc-input"
                    value={formData.eventDate}
                    onChange={(e) =>
                      handleInputChange("eventDate", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="nc-section">
              <h3 className="nc-section-title">Thư viện ảnh</h3>

              <div className="nc-form-group">
                <label className="nc-label">URL ảnh</label>
                <input
                  type="url"
                  className="nc-input"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !formData.highlightImages.includes(value)) {
                        handleArrayInputChange("highlightImages", value);
                        e.target.value = "";
                      }
                    }
                  }}
                />
              </div>

              <div className="nc-gallery-list">
                {formData.highlightImages.map((image, index) => (
                  <div key={index} className="nc-gallery-item">
                    <img src={image} alt={`Gallery ${index + 1}`} />
                    <button
                      type="button"
                      className="nc-gallery-remove"
                      onClick={() =>
                        handleArrayInputChange("highlightImages", image, false)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsCreate;
