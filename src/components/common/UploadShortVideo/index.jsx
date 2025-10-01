// UploadShortVideo.jsx
import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import ProvinceSelect from "../DropDownTreeSearch/ProvinceSelect";
import WardSelect from "../DropDownTreeSearch/WardSelect";
import LoadingModal from "../../../admin/components/common/LoadingModal";
import { useToast } from "../../../contexts/ToastContext";
import "./UploadShortVideo.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const UploadShortVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
    province: null,
    ward: null,
    placeName: "",
    googleMap: "",
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (province) => {
    setFormData((prev) => ({
      ...prev,
      province,
      ward: null,
    }));
  };

  const handleWardChange = (ward) => {
    setFormData((prev) => ({ ...prev, ward }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("Vui lòng chọn file video!", "error");
      e.target.value = null;
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("File video quá lớn! Vui lòng chọn file nhỏ hơn 20MB", "error");
      e.target.value = null;
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = function () {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;

      if (duration > 120) {
        showToast(
          "Video quá dài! Vui lòng chọn video ngắn hơn 2 phút",
          "error"
        );
        e.target.value = null;
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFormData((prev) => ({ ...prev, videoFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    };

    videoElement.onerror = function () {
      showToast(
        "Không thể đọc thông tin video. Vui lòng chọn file khác",
        "error"
      );
      e.target.value = null;
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      showToast("Vui lòng nhập tag!", "error");
      return;
    }

    if (tags.includes(trimmedTag)) {
      showToast("Tag đã tồn tại!", "error");
      return;
    }

    setTags((prev) => [...prev, trimmedTag]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề!", "error");
      return;
    }

    if (!formData.videoFile) {
      showToast("Vui lòng chọn video!", "error");
      return;
    }

    setLoading(true);
    setLoadingMessage("Đang tải video lên...");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("video", formData.videoFile);
    submitData.append("province", formData.province?._id || "");
    submitData.append("ward", formData.ward?._id || "");
    submitData.append("placeName", formData.placeName);
    submitData.append("googleMap", formData.googleMap);
    submitData.append("tags", JSON.stringify(tags));

    try {
      const response = await fetch(`${API_BASE}/api/v1/shorts/upload`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setLoadingMessage("Đang xử lý video...");
        await pollProcessingStatus(data.shortId);
        showToast("Tải video lên thành công!", "success");

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFormData({
          title: "",
          description: "",
          videoFile: null,
          province: null,
          ward: null,
          placeName: "",
          googleMap: "",
        });
        setTags([]);
        setPreviewUrl(null);
      } else {
        let errorMessage = data.message || "Upload failed";
        if (data.error === "FILE_TOO_LARGE") {
          errorMessage = `File quá lớn! Kích thước tối đa là ${data.maxSize}`;
        } else if (data.error === "INVALID_FILE_TYPE") {
          errorMessage = `Định dạng file không hợp lệ! Chỉ chấp nhận: ${data.allowedTypes.join(
            ", "
          )}`;
        } else if (data.duration && data.maxDuration) {
          errorMessage = `Video quá dài (${data.duration}s)! Thời lượng tối đa là ${data.maxDuration}s`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      showToast("Có lỗi xảy ra khi tải video lên: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const pollProcessingStatus = async (shortId) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/shorts/status/${shortId}`,
            {
              credentials: "include",
            }
          );
          const data = await response.json();

          if (data.status === "completed") {
            clearInterval(interval);
            resolve();
          } else if (data.status === "failed") {
            clearInterval(interval);
            reject(new Error("Video processing failed"));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 300000);
    });
  };

  return (
    <div className="upload-short-container">
      <LoadingModal
        open={loading}
        message={loadingMessage}
        icon="FaCloudUploadAlt"
      />

      <div className="upload-short-card">
        <div className="upload-short-header">
          <FaIcons.FaVideo className="header-icon" />
          <h2>Tạo Video Short</h2>
        </div>

        <form onSubmit={handleSubmit} className="upload-short-form">
          {/* Video Upload */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaFileVideo /> Video *
            </label>

            <div className="validation-info">
              <div className="validation-item">
                <FaIcons.FaCheckCircle className="validation-icon" />
                <span>
                  Kích thước tối đa: <strong>20MB</strong>
                </span>
              </div>
              <div className="validation-item">
                <FaIcons.FaCheckCircle className="validation-icon" />
                <span>
                  Thời lượng tối đa: <strong>2 phút</strong>
                </span>
              </div>
              <div className="validation-item">
                <FaIcons.FaCheckCircle className="validation-icon" />
                <span>
                  Định dạng: <strong>MP4, MOV, AVI</strong>
                </span>
              </div>
            </div>

            <div className="video-upload-area">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input"
                id="video-input"
              />
              <label htmlFor="video-input" className="file-label">
                {previewUrl ? (
                  <div className="video-preview">
                    <video
                      src={previewUrl}
                      controls
                      className="preview-video"
                    />
                    <div className="file-info">
                      <p className="file-name">
                        <FaIcons.FaFileVideo /> {formData.videoFile?.name}
                      </p>
                      <p className="file-size">
                        <FaIcons.FaDatabase />{" "}
                        {(formData.videoFile?.size / (1024 * 1024)).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <FaIcons.FaCloudUploadAlt size={48} />
                    <p>Nhấn để chọn video</p>
                    <span>MP4, MOV, AVI (Max 20MB, 2 phút)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaHeading /> Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Nhập tiêu đề video..."
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaAlignLeft /> Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Mô tả về video của bạn..."
              maxLength={500}
              rows={4}
            />
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          {/* Province */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaMapMarkerAlt /> Tỉnh/Thành phố
            </label>
            <div className="select-wrapper">
              <ProvinceSelect
                value={formData.province}
                onChange={handleProvinceChange}
                placeholder="Chọn tỉnh/thành phố..."
              />
            </div>
          </div>

          {/* Ward */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaMapPin /> Quận/Huyện
            </label>
            <div className="select-wrapper">
              <WardSelect
                provinceCode={formData.province?.code}
                value={formData.ward}
                onChange={handleWardChange}
                placeholder="Chọn quận/huyện..."
              />
            </div>
          </div>

          {/* Place Name */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaMapMarkedAlt /> Tên địa điểm
            </label>
            <input
              type="text"
              name="placeName"
              value={formData.placeName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="VD: Hồ Hoàn Kiếm, Phố cổ..."
            />
          </div>

          {/* Google Map */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaMap /> Link Google Maps
            </label>
            <input
              type="url"
              name="googleMap"
              value={formData.googleMap}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <FaIcons.FaTags /> Tags
            </label>

            {/* Tag Input */}
            <div className="tag-input-wrapper">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="form-input"
                placeholder="Nhập tag và nhấn Enter hoặc nút Thêm..."
              />
              <button
                type="button"
                className="add-tag-button"
                onClick={handleAddTag}
              >
                <FaIcons.FaPlus /> Thêm
              </button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="tags-display">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <FaIcons.FaTimes
                      className="remove-tag-icon"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            <FaIcons.FaCloudUploadAlt />
            Tải lên
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadShortVideo;
