import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImagesUploader from "../../tour/TourCreate/ImagesUploader";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import GalleryCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/GalleryCategoryTreeSelect";
import TourSearchSelect from "../../../../components/common/DropDownTreeSearch/TourSearchSelect";
import LoadingModal from "../../../components/common/LoadingModal";
import "./GalleryCreate.css";
import { useToast } from "../../../../contexts/ToastContext";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryCreate = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...");
  const [generatingTags, setGeneratingTags] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    thumbnail: "",
    tags: [],
  });

  const [images, setImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState({});

  const [videoLinks, setVideoLinks] = useState([]);
  const [videoInput, setVideoInput] = useState("");
  const [videoDescriptions, setVideoDescriptions] = useState({});

  const [selectedTourCategory, setSelectedTourCategory] = useState(null);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const handleTourChange = (tour) => {
    console.log("Selected Tour Data:", tour);
    setSelectedTour(tour);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailUpload = (urls) => {
    if (urls && urls.length > 0) {
      setFormData((prev) => ({ ...prev, thumbnail: urls[0] }));
    }
  };

  const handleAddVideoLink = () => {
    if (!videoInput.trim()) return;
    const newVideo = { id: Date.now(), url: videoInput.trim() };
    setVideoLinks([...videoLinks, newVideo]);
    setVideoInput("");
  };

  const handleRemoveVideo = (id) => {
    setVideoLinks(videoLinks.filter((v) => v.id !== id));
    const newDescriptions = { ...videoDescriptions };
    delete newDescriptions[id];
    setVideoDescriptions(newDescriptions);
  };

  const handleVideoDescriptionChange = (id, value) => {
    setVideoDescriptions((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageDescriptionChange = (id, value) => {
    setImageDescriptions((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleGenerateTags = async () => {
    if (!formData.title && !formData.shortDescription) {
      showToast("Vui lòng nhập tiêu đề hoặc mô tả ngắn để tạo tags!", "error");
      return;
    }

    try {
      setGeneratingTags(true);
      setLoadingMessage("Đang tạo tags bằng AI...");

      const res = await fetch(
        `${API_BASE}/api/v1/admin/gallery/generate-tags`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title,
            description: formData.shortDescription,
          }),
        }
      );

      const data = await res.json();
      if (data.tags && Array.isArray(data.tags)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...new Set([...prev.tags, ...data.tags])],
        }));
      }
    } catch (error) {
      console.error("Error generating tags:", error);
      showToast("Có lỗi khi tạo tags!", "error");
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề!", "error");
      return;
    }
    if (!formData.thumbnail) {
      showToast("Vui lòng upload ảnh thumbnail!", "error");
      return;
    }
    // THÊM VALIDATION CHO GALLERY CATEGORY (BẮT BUỘC)
    if (!selectedGalleryCategory || !selectedGalleryCategory._id) {
      showToast("Vui lòng chọn danh mục Gallery!", "error");
      return;
    }
    if (images.length === 0 && videoLinks.length === 0) {
      showToast("Vui lòng thêm ít nhất một ảnh hoặc video!", "error");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Đang tạo gallery...");

      const imagesWithDesc = images.map((img) => ({
        url: img.url,
        title: imageDescriptions[img.id] || "",
      }));

      const videosWithDesc = videoLinks.map((vid) => ({
        url: vid.url,
        title: videoDescriptions[vid.id] || "",
      }));

      const payload = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        thumbnail: formData.thumbnail,
        images: imagesWithDesc,
        videos: videosWithDesc,
        tags: formData.tags,
        galleryCategory: selectedGalleryCategory._id, // BẮT BUỘC
      };

      // Chỉ thêm tour và tourCategory nếu có
      if (selectedTour && selectedTour._id) {
        payload.tour = selectedTour._id;
      }
      if (selectedTourCategory && selectedTourCategory._id) {
        payload.tourCategory = selectedTourCategory._id;
      }

      console.log("Payload gửi lên:", payload);

      const res = await fetch(`${API_BASE}/api/v1/admin/gallery/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Tạo gallery thành công!", "success");
      } else {
        showToast(data.message || "Có lỗi xảy ra!", "error");
      }
    } catch (error) {
      console.error("Error creating gallery:", error);
      showToast("Có lỗi xảy ra khi tạo gallery!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gallery-create-container">
      <LoadingModal
        open={loading || generatingTags}
        message={loadingMessage}
        icon="FaSpinner"
      />

      <div className="gallery-create-header">
        <h1>Tạo Gallery Mới</h1>
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate("/admin/gallery")}
        >
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="gallery-create-form">
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h2>Thông tin cơ bản</h2>

          <div className="form-group">
            <label>
              Tiêu đề <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề gallery..."
              required
            />
          </div>

          <div className="gallery-create-form-group">
            <label>Mô tả ngắn</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="Nhập mô tả ngắn..."
              rows="3"
            />
          </div>

          <div className="gallery-create-form-group">
            <label>Mô tả chi tiết</label>
            <textarea
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              placeholder="Nhập mô tả chi tiết..."
              rows="6"
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div className="gallery-create-form-section">
          <h2>
            Ảnh Thumbnail <span className="gallery-create-required">*</span>
          </h2>
          <ImagesUploader
            images={
              formData.thumbnail ? [{ id: 1, url: formData.thumbnail }] : []
            }
            setImages={(imgs) =>
              setFormData((prev) => ({
                ...prev,
                thumbnail: imgs.length > 0 ? imgs[0].url : "",
              }))
            }
            onUpload={handleThumbnailUpload}
          />
        </div>

        {/* Danh mục Gallery - DI CHUYỂN LÊN TRƯỚC */}
        <div className="gallery-create-form-section">
          <h2>
            Danh mục Gallery <span className="gallery-create-required">*</span>
          </h2>

          <div className="gallery-create-form-group">
            <label>
              Danh mục Gallery <span className="required">*</span>
            </label>
            <GalleryCategoryTreeSelect
              value={selectedGalleryCategory}
              onChange={setSelectedGalleryCategory}
              placeholder="Chọn danh mục gallery..."
            />
            <small
              style={{
                color: "#666",
                fontSize: "13px",
                marginTop: "6px",
                display: "block",
              }}
            >
              Phân loại gallery này thuộc danh mục nào (ví dụ: Cảnh đẹp, Ẩm
              thực, Hoạt động...)
            </small>
          </div>
        </div>

        {/* Chọn Tour và Category */}
        <div className="gallery-create-form-section">
          <h2>Liên kết với Tour (Tùy chọn)</h2>

          <div className="gallery-create-form-group">
            <label>Danh mục Tour</label>
            <CategoryTreeSelect
              value={selectedTourCategory}
              onChange={setSelectedTourCategory}
              placeholder="Chọn danh mục tour..."
            />
          </div>

          <div className="gallery-create-form-group">
            <label>Tour</label>
            <TourSearchSelect
              categorySlug={selectedTourCategory?.slug}
              value={selectedTour}
              onChange={handleTourChange}
              placeholder={
                selectedTourCategory
                  ? "Chọn tour..."
                  : "Vui lòng chọn danh mục tour trước"
              }
            />
            <small
              style={{
                color: "#666",
                fontSize: "13px",
                marginTop: "6px",
                display: "block",
              }}
            >
              Liên kết gallery này với một tour cụ thể (nếu có)
            </small>
          </div>
        </div>

        {/* Thư viện ảnh */}
        <div className="gallery-create-form-section">
          <h2>Thư viện ảnh</h2>
          <ImagesUploader images={images} setImages={setImages} />

          {images.length > 0 && (
            <div className="gallery-create-image-descriptions">
              <h3>Mô tả cho từng ảnh (tùy chọn)</h3>
              {images.map((img) => (
                <div key={img.id} className="gallery-create-description-item">
                  <img
                    src={img.url}
                    alt=""
                    className="gallery-create-desc-thumbnail"
                  />
                  <input
                    type="text"
                    placeholder="Nhập mô tả cho ảnh này..."
                    value={imageDescriptions[img.id] || ""}
                    onChange={(e) =>
                      handleImageDescriptionChange(img.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Links */}
        <div className="gallery-create-form-section">
          <h2>Video (YouTube Links)</h2>
          <div className="gallery-create-video-input-group">
            <input
              type="text"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="Nhập link YouTube..."
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddVideoLink())
              }
            />
            <button
              type="button"
              onClick={handleAddVideoLink}
              className="gallery-create-btn-add"
            >
              Thêm Video
            </button>
          </div>

          {videoLinks.length > 0 && (
            <div className="gallery-create-video-list">
              {videoLinks.map((vid) => (
                <div key={vid.id} className="gallery-create-video-item">
                  <div className="gallery-create-video-header">
                    <span className="gallery-create-video-url">{vid.url}</span>
                    <button
                      type="button"
                      className="gallery-create-btn-remove"
                      onClick={() => handleRemoveVideo(vid.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Mô tả video (tùy chọn)..."
                    value={videoDescriptions[vid.id] || ""}
                    onChange={(e) =>
                      handleVideoDescriptionChange(vid.id, e.target.value)
                    }
                    className="gallery-create-video-desc-input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="gallery-create-form-section">
          <h2>Tags</h2>
          <div className="gallery-create-tags-controls">
            <div className="gallery-create-tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="gallery-create-btn-add"
              >
                Thêm Tag
              </button>
            </div>
            <button
              type="button"
              onClick={handleGenerateTags}
              className="gallery-create-btn-ai"
              disabled={generatingTags}
            >
              🤖 Tạo Tags bằng AI
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="gallery-create-tags-list">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="gallery-create-tag-item">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="gallery-create-tag-remove"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="gallery-create-form-actions">
          <button type="submit" className="gallery-create-btn-submit">
            Tạo Gallery
          </button>
          <button
            type="button"
            className="gallery-create-btn-cancel"
            onClick={() => navigate("/admin/gallery")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryCreate;
