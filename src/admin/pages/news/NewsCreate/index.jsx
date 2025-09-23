import React, { useState, useEffect } from "react";
import TinyEditor from "../../tour/TinyEditor";
import ImageUploader from "../../tour/TourCreate/ImageUploader";
import NewsCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/NewsCategoryTreeSelect";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import ProvinceSelect from "../../../../components/common/DropDownTreeSearch/ProvinceSelect";
import LoadingModal from "../../../components/common/LoadingModal";
import TourSelect from "./TourSelect";
import { useToast } from "../../../../contexts/ToastContext";
import { FaCog, FaBrain, FaRobot, FaMagic } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./NewsCreate.css";
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

// Sortable Gallery Item Component
const SortableGalleryItem = ({ image, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="nc-gallery-item sortable"
      {...attributes}
      {...listeners}
    >
      <img src={image} alt={`Gallery ${index + 1}`} />
      <button
        type="button"
        className="nc-gallery-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image);
        }}
      >
        ×
      </button>
      <div className="nc-gallery-order">{index + 1}</div>
    </div>
  );
};

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
    newsCategoryId: null,
    categoryId: null,
    destinationIds: [], // Changed to array for multiple destinations
    relatedTourIds: [],
    tags: [],
    type: "news",
    status: "draft",
    publishedAt: "",
    eventDate: "",
    highlightImages: [],
    language: "vi",
  });

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // AI loading modal states
  const [aiLoadingModal, setAiLoadingModal] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("");

  // AI generation states
  const [aiLoading, setAiLoading] = useState({
    slug: false,
    excerpt: false,
    content: false,
    metaTitle: false,
    metaDescription: false,
    tags: false,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tours for related tours dropdown
  useEffect(() => {
    // TourSelect component will handle its own data fetching
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  // Auto-generate slug from title with AI
  const generateSlugFromTitle = (title) => {
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

  // Get AI loading message based on field
  const getAiLoadingMessage = (field) => {
    const messages = {
      slug: "Đang tạo slug từ tiêu đề...",
      excerpt: "Đang tạo mô tả ngắn...",
      content: "Đang tạo nội dung bài viết...",
      metaTitle: "Đang tạo Meta Title SEO...",
      metaDescription: "Đang tạo Meta Description SEO...",
      tags: "Đang tạo tags phù hợp...",
    };
    return messages[field] || "Đang xử lý...";
  };

  // Get AI icon based on field
  const getAiIcon = (field) => {
    const icons = {
      slug: "FaMagic",
      excerpt: "FaRobot",
      content: "FaBrain",
      metaTitle: "FaMagic",
      metaDescription: "FaRobot",
      tags: "FaBrain",
    };
    return icons[field] || "FaRobot";
  };

  // AI Generation functions
  const handleAIGenerate = async (field) => {
    setAiLoading((prev) => ({ ...prev, [field]: true }));
    setAiLoadingModal(true);
    setAiLoadingMessage(getAiLoadingMessage(field));

    // Minimum loading time of 2.5 seconds
    const minLoadingTime = 2500;
    const startTime = Date.now();

    try {
      // Determine context based on field type
      let contextData = formData.title || formData.content;

      // For slug generation, always use title as context
      if (field === "slug") {
        contextData = formData.title;
        if (!contextData) {
          setAiLoadingModal(false);
          showToast("Vui lòng nhập tiêu đề trước khi tạo slug", "error");
          return;
        }
      }

      // Use specific route for each field
      const response = await fetch(
        `${API_BASE}/api/v1/admin/ai/generate-${field}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            context: contextData,
            type: formData.type,
            language: formData.language,
          }),
        }
      );

      const data = await response.json();

      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      if (data.success) {
        if (field === "tags" && Array.isArray(data.content)) {
          handleInputChange(field, data.content);
        } else {
          handleInputChange(field, data.content);
        }
        showToast(`Đã tạo ${field} thành công!`, "success");
      } else {
        showToast(`Lỗi tạo ${field}: ${data.message}`, "error");
      }
    } catch (error) {
      // Ensure minimum loading time even for errors
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      console.error(`Error generating ${field}:`, error);
      showToast(`Lỗi khi tạo ${field}`, "error");
    } finally {
      setAiLoading((prev) => ({ ...prev, [field]: false }));
      setAiLoadingModal(false);
      setAiLoadingMessage("");
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (url) => {
    handleInputChange("thumbnail", url);
  };

  // Handle gallery images upload
  const handleGalleryUpload = (urls) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setFormData((prev) => ({
      ...prev,
      highlightImages: [...prev.highlightImages, ...urlArray],
    }));
  };

  // Handle drag end for gallery images
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = formData.highlightImages.indexOf(active.id);
      const newIndex = formData.highlightImages.indexOf(over.id);

      const newImages = arrayMove(formData.highlightImages, oldIndex, newIndex);
      handleInputChange("highlightImages", newImages);
    }
  };

  // Get button text based on status
  const getButtonText = () => {
    if (loading) {
      return formData.status === "draft"
        ? "Đang lưu nháp..."
        : "Đang xuất bản...";
    }
    return formData.status === "draft" ? "Lưu nháp" : "Xuất bản";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        newsCategoryId: formData.newsCategoryId?._id || null,
        categoryId: formData.categoryId?._id || null,
        // Handle multiple destinations - extract IDs or codes
        destinationIds: formData.destinationIds.map(
          (dest) => dest._id || dest.code || dest
        ),
        // Handle tours - extract IDs
        relatedTourIds: formData.relatedTourIds.map((tour) => tour._id || tour),
      };
      console.log(submitData);
      const response = await fetch(`${API_BASE}/api/v1/admin/news/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        showToast("Tin tức đã được tạo thành công!", "success");
        // Reset form or redirect
      } else {
        showToast("Có lỗi xảy ra: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error creating news:", error);
      showToast("Có lỗi xảy ra khi tạo tin tức", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nc-container">
      {/* Upload Loading Modal */}
      <LoadingModal
        open={uploadLoading}
        message="Đang tải ảnh lên..."
        icon="FaCloudUploadAlt"
      />

      {/* AI Loading Modal */}
      <LoadingModal
        open={aiLoadingModal}
        message={aiLoadingMessage}
        icon={getAiIcon(Object.keys(aiLoading).find((key) => aiLoading[key]))}
      />

      <div className="nc-header">
        <h1 className="nc-title">Tạo tin tức mới</h1>
        <div className="nc-actions">
          <button
            type="button"
            className="nc-btn nc-btn-secondary"
            onClick={() => handleInputChange("status", "draft")}
          >
            Nháp
          </button>
          <button
            type="button"
            className="nc-btn nc-btn-secondary"
            onClick={() => handleInputChange("status", "published")}
          >
            Xuất bản
          </button>
          <button
            type="submit"
            form="news-form"
            className="nc-btn nc-btn-primary"
            disabled={loading || aiLoadingModal}
          >
            {getButtonText()}
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
                <input
                  type="text"
                  className="nc-input"
                  value={formData.title}
                  onChange={(e) => {
                    handleInputChange("title", e.target.value);
                    generateSlugFromTitle(e.target.value);
                  }}
                  placeholder="Nhập tiêu đề tin tức"
                  required
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Slug *</label>
                <div className="nc-input-group">
                  <input
                    type="text"
                    className="nc-input"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="duong-dan-url"
                    required
                  />
                  <button
                    type="button"
                    className="nc-ai-btn"
                    onClick={() => handleAIGenerate("slug")}
                    disabled={aiLoading.slug || aiLoadingModal}
                  >
                    {aiLoading.slug ? <FaCog /> : <FaMagic />} AI
                  </button>
                </div>
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Ảnh thumbnail</label>
                <div className="nc-thumbnail-section">
                  <div className="nc-thumbnail-options">
                    <input
                      type="url"
                      className="nc-input"
                      value={formData.thumbnail}
                      onChange={(e) =>
                        handleInputChange("thumbnail", e.target.value)
                      }
                      placeholder="https://example.com/image.jpg hoặc upload ảnh"
                    />
                    <span className="nc-or-divider">hoặc</span>
                    <ImageUploader
                      onUpload={handleThumbnailUpload}
                      onUploadStart={() => setUploadLoading(true)}
                      onUploadEnd={() => setUploadLoading(false)}
                      multiple={false}
                    />
                  </div>
                  {formData.thumbnail && (
                    <div className="nc-thumbnail-preview">
                      <img src={formData.thumbnail} alt="Thumbnail preview" />
                    </div>
                  )}
                </div>
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
                    disabled={aiLoading.excerpt || aiLoadingModal}
                  >
                    {aiLoading.excerpt ? <FaCog /> : <FaRobot />} AI
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
                    disabled={aiLoading.content || aiLoadingModal}
                  >
                    {aiLoading.content ? <FaCog /> : <FaBrain />} AI
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
                    disabled={aiLoading.metaTitle || aiLoadingModal}
                  >
                    {aiLoading.metaTitle ? <FaCog /> : <FaMagic />} AI
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
                    disabled={aiLoading.metaDescription || aiLoadingModal}
                  >
                    {aiLoading.metaDescription ? <FaCog /> : <FaRobot />} AI
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
                <label className="nc-label">Danh mục tin tức</label>
                <NewsCategoryTreeSelect
                  value={formData.newsCategoryId}
                  onChange={(category) =>
                    handleInputChange("newsCategoryId", category)
                  }
                  placeholder="Chọn danh mục tin tức"
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Danh mục tour</label>
                <CategoryTreeSelect
                  value={formData.categoryId}
                  onChange={(category) =>
                    handleInputChange("categoryId", category)
                  }
                  placeholder="Chọn danh mục tour"
                />
              </div>

              {/* In the Right Column - Category & Relations section */}
              <div className="nc-form-group">
                <label className="nc-label">Điểm đến</label>
                <ProvinceSelect
                  value={null} // Always null to reset after selection
                  onChange={(selectedProvince) => {
                    if (selectedProvince) {
                      // Check if province already exists in the list
                      const exists = formData.destinationIds.some(
                        (dest) => dest.code === selectedProvince.code
                      );

                      if (exists) {
                        showToast(
                          `Điểm đến "${selectedProvince.name_with_type}" đã được chọn!`,
                          "warning"
                        );
                      } else {
                        // Add new province to the list
                        handleInputChange("destinationIds", [
                          ...formData.destinationIds,
                          selectedProvince,
                        ]);
                        showToast(
                          `Đã thêm điểm đến "${selectedProvince.name_with_type}"`,
                          "success"
                        );
                      }
                    }
                  }}
                  placeholder="Chọn điểm đến để thêm vào danh sách"
                />

                {/* Display selected destinations */}
                {formData.destinationIds.length > 0 && (
                  <div className="nc-selected-destinations">
                    <div className="nc-selected-list">
                      {formData.destinationIds.map((destination, index) => (
                        <div
                          key={destination.code}
                          className="nc-selected-item"
                        >
                          <span
                            className="nc-selected-text"
                            title={destination.name_with_type}
                          >
                            {destination.name_with_type}
                          </span>
                          <button
                            type="button"
                            className="nc-selected-remove"
                            onClick={() => {
                              const updatedDestinations =
                                formData.destinationIds.filter(
                                  (dest) => dest.code !== destination.code
                                );
                              handleInputChange(
                                "destinationIds",
                                updatedDestinations
                              );
                              showToast(
                                `Đã xóa điểm đến "${destination.name_with_type}"`,
                                "info"
                              );
                            }}
                            title="Xóa điểm đến này"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="nc-selected-count">
                      Đã chọn {formData.destinationIds.length} điểm đến
                    </div>
                  </div>
                )}
              </div>

              <div className="nc-form-group">
                <label className="nc-label">Tours liên quan</label>
                <TourSelect
                  value={formData.relatedTourIds}
                  onChange={(tours) => {
                    // Store the full tour objects to have access to both _id and title
                    handleInputChange("relatedTourIds", tours || []);
                  }}
                  placeholder="Chọn tour liên quan"
                  multiple={true}
                />
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
                    disabled={aiLoading.tags || aiLoadingModal}
                  >
                    {aiLoading.tags ? <FaCog /> : <FaBrain />} AI
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
                <div className="nc-gallery-upload-section">
                  <input
                    type="url"
                    className="nc-input"
                    placeholder="https://example.com/image.jpg hoặc upload nhiều ảnh"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (
                          value &&
                          !formData.highlightImages.includes(value)
                        ) {
                          handleArrayInputChange("highlightImages", value);
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                  <span className="nc-or-divider">hoặc</span>
                  <ImageUploader
                    onUpload={handleGalleryUpload}
                    onUploadStart={() => setUploadLoading(true)}
                    onUploadEnd={() => setUploadLoading(false)}
                    multiple={true}
                  />
                </div>
              </div>

              {formData.highlightImages.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.highlightImages}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="nc-gallery-list">
                      {formData.highlightImages.map((image, index) => (
                        <SortableGalleryItem
                          key={image}
                          image={image}
                          index={index}
                          onRemove={(img) =>
                            handleArrayInputChange(
                              "highlightImages",
                              img,
                              false
                            )
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsCreate;
