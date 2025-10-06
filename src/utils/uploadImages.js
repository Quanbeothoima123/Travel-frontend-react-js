// utils/imageUpload.utils.js

/**
 * Upload một hoặc nhiều ảnh lên Cloudinary
 * @param {File|File[]} files - File hoặc mảng file cần upload
 * @param {Function} onProgress - Callback khi có progress (optional)
 * @returns {Promise<string|string[]>} - URL hoặc mảng URLs của ảnh đã upload
 */
export const uploadImages = async (files, onProgress) => {
  const fileArray = Array.isArray(files) ? files : [files];
  const uploadedUrls = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD}/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);

        // Callback progress nếu có
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            percentage: Math.round(((i + 1) / fileArray.length) * 100),
          });
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  // Trả về string nếu upload 1 ảnh, array nếu nhiều ảnh
  return Array.isArray(files) ? uploadedUrls : uploadedUrls[0];
};

/**
 * Upload ảnh cho chat message
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} - URL của ảnh
 */
export const uploadChatImage = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Kiểm tra file có phải ảnh không
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Kiểm tra kích thước (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error("Image size must be less than 5MB");
  }

  return await uploadImages(file);
};

/**
 * Mở dialog chọn file và upload
 * @param {Object} options - Options cho upload
 * @param {boolean} options.multiple - Cho phép chọn nhiều file
 * @param {Function} options.onStart - Callback khi bắt đầu
 * @param {Function} options.onProgress - Callback khi có progress
 * @param {Function} options.onSuccess - Callback khi thành công
 * @param {Function} options.onError - Callback khi có lỗi
 */
export const selectAndUploadImages = (options = {}) => {
  const { multiple = false, onStart, onProgress, onSuccess, onError } = options;

  // Tạo input element
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = multiple;
  input.style.display = "none";

  input.onchange = async (e) => {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];

    if (!files || (Array.isArray(files) && files.length === 0)) {
      return;
    }

    try {
      if (onStart) onStart();

      const urls = await uploadImages(files, onProgress);

      if (onSuccess) onSuccess(urls);
    } catch (error) {
      console.error("Upload error:", error);
      if (onError) onError(error);
    } finally {
      // Cleanup
      document.body.removeChild(input);
    }
  };

  // Thêm vào DOM và trigger click
  document.body.appendChild(input);
  input.click();
};
