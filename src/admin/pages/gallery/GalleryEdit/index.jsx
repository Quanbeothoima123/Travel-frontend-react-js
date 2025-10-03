import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImagesUploader from "../../tour/TourCreate/ImagesUploader";
import CategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import GalleryCategoryTreeSelect from "../../../../components/common/DropDownTreeSearch/GalleryCategoryTreeSelect";
import TourSearchSelect from "../../../../components/common/DropDownTreeSearch/TourSearchSelect";
import LoadingModal from "../../../components/common/LoadingModal";
import "./GalleryEdit.css";
import { useToast } from "../../../../contexts/ToastContext";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const GalleryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...");
  const [generatingTags, setGeneratingTags] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  // ✅ Fetch dữ liệu gallery khi component mount
  useEffect(() => {
    fetchGalleryData();
  }, [id]);

  const fetchGalleryData = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(
        `${API_BASE}/api/v1/admin/gallery/infoToEdit/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success && data.data) {
        const gallery = data.data;

        // Set form data
        setFormData({
          title: gallery.title || "",
          shortDescription: gallery.shortDescription || "",
          longDescription: gallery.longDescription || "",
          thumbnail: gallery.thumbnail || "",
          tags: gallery.tags || [],
        });

        // Set categories
        if (gallery.galleryCategory) {
          setSelectedGalleryCategory(gallery.galleryCategory);
        }
        if (gallery.tourCategory) {
          setSelectedTourCategory(gallery.tourCategory);
        }
        if (gallery.tour) {
          setSelectedTour(gallery.tour);
        }

        // Set images với id unique
        if (gallery.images && gallery.images.length > 0) {
          const imagesWithId = gallery.images.map((img, idx) => ({
            id: `img-${idx}-${Date.now()}`,
            url: img.url,
          }));
          setImages(imagesWithId);

          // Set image descriptions
          const imgDesc = {};
          gallery.images.forEach((img, idx) => {
            if (img.title) {
              imgDesc[`img-${idx}-${Date.now()}`] = img.title;
            }
          });
          setImageDescriptions(imgDesc);
        }

        // Set videos với id unique
        if (gallery.videos && gallery.videos.length > 0) {
          const videosWithId = gallery.videos.map((vid, idx) => ({
            id: `vid-${idx}-${Date.now()}`,
            url: vid.url,
          }));
          setVideoLinks(videosWithId);

          // Set video descriptions
          const vidDesc = {};
          gallery.videos.forEach((vid, idx) => {
            if (vid.title) {
              vidDesc[`vid-${idx}-${Date.now()}`] = vid.title;
            }
          });
          setVideoDescriptions(vidDesc);
        }
      } else {
        showToast(data.message || "Không thể tải thông tin gallery", "error");
        navigate("/admin/gallery");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      showToast("Có lỗi xảy ra khi tải thông tin gallery", "error");
      navigate("/admin/gallery");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTourChange = (tour) => {
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
      setLoadingMessage("Đang cập nhật gallery...");

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
        galleryCategory: selectedGalleryCategory._id,
      };

      // Chỉ thêm tour và tourCategory nếu có
      if (selectedTour && selectedTour._id) {
        payload.tour = selectedTour._id;
      }
      if (selectedTourCategory && selectedTourCategory._id) {
        payload.tourCategory = selectedTourCategory._id;
      }

      const res = await fetch(`${API_BASE}/api/v1/admin/gallery/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Cập nhật gallery thành công!", "success");
        setTimeout(() => navigate("/admin/gallery"), 1500);
      } else {
        showToast(data.message || "Có lỗi xảy ra!", "error");
      }
    } catch (error) {
      console.error("Error updating gallery:", error);
      showToast("Có lỗi xảy ra khi cập nhật gallery!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <LoadingModal
        open={true}
        message="Đang tải thông tin gallery..."
        icon="FaSpinner"
      />
    );
  }

  return (
    <div className="gallery-create-container">
      <LoadingModal
        open={loading || generatingTags}
        message={loadingMessage}
        icon="FaSpinner"
      />

      <div className="gallery-create-header">
        <h1>Chỉnh sửa Gallery</h1>
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

        {/* Danh mục Gallery */}
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
              Phân loại gallery này thuộc danh mục nào
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
            Cập nhật Gallery
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

export default GalleryEdit;
