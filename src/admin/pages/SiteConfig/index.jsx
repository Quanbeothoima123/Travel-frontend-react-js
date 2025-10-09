import React, { useState, useEffect } from "react";
import "./SiteConfig.css";
import ImageUploader from "../tour/TourCreate/ImageUploader";
import LoadingModal from "../../components/common/LoadingModal";
import { useToast } from "../../../contexts/ToastContext";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const initialConfigState = {
  companyName: "",
  companyNameEn: "",
  companyShortName: "",
  companyDescription: "",
  headquartersAddress: "",
  headquartersPhone: [],
  headquartersEmail: "",
  businessLicenseNumber: "",
  businessLicenseIssuer: "",
  travelLicenseNumber: "",
  travelLicenseType: "",
  branches: [],
  logo: "",
  logoLight: "",
  logoDark: "",
  favicon: "",
  ogImage: "",
  socialMedia: [],
  contactFloatingEnabled: true,
  contactFloatingItems: [],
  newsletterEnabled: true,
  newsletterTitle: "",
  newsletterPlaceholder: "",
  seoDefaultTitle: "",
  seoDefaultDescription: "",
  seoDefaultKeywords: [],
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  maintenanceMode: false,
  maintenanceMessage: "",
  timezone: "Asia/Ho_Chi_Minh",
};

const SiteConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/v1/admin/site-config`, {
          credentials: "include",
        });
        if (response.status === 404) {
          setIsCreating(true);
          setConfig(initialConfigState);
        } else if (response.ok) {
          const data = await response.json();
          setConfig(data);
          setIsCreating(false);
        } else {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }
      } catch (err) {
        showToast("Không thể tải cấu hình: " + err.message, "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (fieldName, url) => {
    setConfig((prev) => ({ ...prev, [fieldName]: url }));
  };

  const handleUploadStart = (fieldName) => {
    setUploading(true);
    setUploadingField(fieldName);
  };

  const handleUploadEnd = () => {
    setUploading(false);
    setUploadingField("");
  };

  // Handler cho icon của contactFloatingItems hoặc socialMedia
  const handleArrayImageUpload = (arrayName, index, field, url) => {
    setConfig((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: url };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setConfig((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleAddItem = (arrayName, newItem) => {
    setConfig((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), newItem],
    }));
  };

  const handleRemoveItem = (arrayName, index) => {
    setConfig((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleStringArrayChange = (arrayName, index, value) => {
    setConfig((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addStringToArray = (arrayName) => {
    setConfig((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), ""],
    }));
  };

  const removeStringFromArray = (arrayName, index) => {
    setConfig((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleBranchPhoneChange = (branchIndex, phoneIndex, value) => {
    setConfig((prev) => {
      const newBranches = [...prev.branches];
      const newPhones = [...(newBranches[branchIndex].phone || [])];
      newPhones[phoneIndex] = value;
      newBranches[branchIndex] = {
        ...newBranches[branchIndex],
        phone: newPhones,
      };
      return { ...prev, branches: newBranches };
    });
  };

  const addBranchPhone = (branchIndex) => {
    setConfig((prev) => {
      const newBranches = [...prev.branches];
      newBranches[branchIndex] = {
        ...newBranches[branchIndex],
        phone: [...(newBranches[branchIndex].phone || []), ""],
      };
      return { ...prev, branches: newBranches };
    });
  };

  const removeBranchPhone = (branchIndex, phoneIndex) => {
    setConfig((prev) => {
      const newBranches = [...prev.branches];
      newBranches[branchIndex] = {
        ...newBranches[branchIndex],
        phone: newBranches[branchIndex].phone.filter(
          (_, i) => i !== phoneIndex
        ),
      };
      return { ...prev, branches: newBranches };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const endpoint = isCreating ? "/create" : "/update";
    const method = isCreating ? "POST" : "PATCH";
    const url = `${API_BASE}/api/v1/admin/site-config${endpoint}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
      }
      const savedData = await response.json();
      if (isCreating) {
        showToast("Tạo cấu hình thành công!", "success");
        setIsCreating(false);
        setConfig(savedData.data);
      } else {
        showToast("Cập nhật cấu hình thành công!", "success");
        setConfig(savedData.data);
      }
    } catch (err) {
      showToast(`Lỗi khi lưu cấu hình: ${err.message}`, "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="site-config-loader">Đang tải cấu hình...</div>;
  if (!config)
    return (
      <div className="site-config-error">
        Không thể khởi tạo cấu hình. Vui lòng thử lại.
      </div>
    );

  const renderTabs = () => (
    <div className="site-config-tabs">
      <button
        type="button"
        className={`site-config-tab ${activeTab === "info" ? "active" : ""}`}
        onClick={() => setActiveTab("info")}
      >
        Thông tin chung
      </button>
      <button
        type="button"
        className={`site-config-tab ${activeTab === "legal" ? "active" : ""}`}
        onClick={() => setActiveTab("legal")}
      >
        Pháp lý
      </button>
      <button
        type="button"
        className={`site-config-tab ${
          activeTab === "branches" ? "active" : ""
        }`}
        onClick={() => setActiveTab("branches")}
      >
        Chi nhánh
      </button>
      <button
        type="button"
        className={`site-config-tab ${
          activeTab === "branding" ? "active" : ""
        }`}
        onClick={() => setActiveTab("branding")}
      >
        Branding
      </button>
      <button
        type="button"
        className={`site-config-tab ${activeTab === "social" ? "active" : ""}`}
        onClick={() => setActiveTab("social")}
      >
        Mạng xã hội
      </button>
      <button
        type="button"
        className={`site-config-tab ${activeTab === "ui" ? "active" : ""}`}
        onClick={() => setActiveTab("ui")}
      >
        Tùy chỉnh
      </button>
      <button
        type="button"
        className={`site-config-tab ${activeTab === "seo" ? "active" : ""}`}
        onClick={() => setActiveTab("seo")}
      >
        SEO
      </button>
      <button
        type="button"
        className={`site-config-tab ${
          activeTab === "settings" ? "active" : ""
        }`}
        onClick={() => setActiveTab("settings")}
      >
        Cài đặt
      </button>
    </div>
  );

  return (
    <div className="site-config-container">
      <LoadingModal
        open={uploading}
        message={`Đang upload ${uploadingField}...`}
        icon="FaCloudUploadAlt"
      />

      <form onSubmit={handleSubmit} className="site-config-form">
        <header className="site-config-header">
          <h1>
            {isCreating ? "Tạo cấu hình Website" : "Cập nhật cấu hình Website"}
          </h1>
          <button
            type="submit"
            className="site-config-save-btn"
            disabled={saving || uploading}
          >
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </header>

        {isCreating && (
          <div className="site-config-notice">
            <strong>📝 Chưa có cấu hình nào!</strong> Bạn đang ở chế độ tạo mới.
            Vui lòng điền đầy đủ thông tin và nhấn "Lưu tất cả".
          </div>
        )}

        {renderTabs()}

        <div className="site-config-tab-content">
          {/* TAB: THÔNG TIN CHUNG */}
          {activeTab === "info" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Thông tin Công ty</h2>
              <div className="site-config-grid-2">
                <div className="site-config-form-group">
                  <label>Tên công ty (Tiếng Việt) *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={config.companyName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Tên công ty (Tiếng Anh)</label>
                  <input
                    type="text"
                    name="companyNameEn"
                    value={config.companyNameEn || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Tên viết tắt</label>
                  <input
                    type="text"
                    name="companyShortName"
                    value={config.companyShortName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Email liên hệ</label>
                  <input
                    type="email"
                    name="headquartersEmail"
                    value={config.headquartersEmail || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="site-config-form-group">
                <label>Mô tả ngắn</label>
                <textarea
                  name="companyDescription"
                  value={config.companyDescription || ""}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="site-config-form-group">
                <label>Địa chỉ trụ sở</label>
                <input
                  type="text"
                  name="headquartersAddress"
                  value={config.headquartersAddress || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="site-config-form-group">
                <label>Số điện thoại</label>
                {(config.headquartersPhone || []).map((phone, index) => (
                  <div key={index} className="site-config-string-array-item">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) =>
                        handleStringArrayChange(
                          "headquartersPhone",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Nhập số điện thoại"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeStringFromArray("headquartersPhone", index)
                      }
                      className="site-config-repeater__remove-btn--small"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStringToArray("headquartersPhone")}
                  className="site-config-repeater__add-btn--small"
                >
                  + Thêm SĐT
                </button>
              </div>
            </section>
          )}

          {/* TAB: PHÁP LÝ */}
          {activeTab === "legal" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Thông tin Pháp lý</h2>
              <div className="site-config-grid-2">
                <div className="site-config-form-group">
                  <label>GPKD số</label>
                  <input
                    type="text"
                    name="businessLicenseNumber"
                    value={config.businessLicenseNumber || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Nơi cấp GPKD</label>
                  <input
                    type="text"
                    name="businessLicenseIssuer"
                    value={config.businessLicenseIssuer || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Giấy phép lữ hành số</label>
                  <input
                    type="text"
                    name="travelLicenseNumber"
                    value={config.travelLicenseNumber || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Loại giấy phép lữ hành</label>
                  <input
                    type="text"
                    name="travelLicenseType"
                    value={config.travelLicenseType || ""}
                    onChange={handleChange}
                    placeholder="VD: Quốc tế, Nội địa"
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB: CHI NHÁNH */}
          {activeTab === "branches" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Quản lý Chi nhánh</h2>
              <div className="site-config-repeater">
                {(config.branches || []).map((branch, index) => (
                  <div key={index} className="site-config-repeater__item">
                    <div className="site-config-repeater__header">
                      <h4>Chi nhánh #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("branches", index)}
                        className="site-config-repeater__remove-btn"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="site-config-grid-2">
                      <div className="site-config-form-group">
                        <label>Tên chi nhánh *</label>
                        <input
                          type="text"
                          value={branch.name || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "branches",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="site-config-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={branch.email || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "branches",
                              index,
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="site-config-form-group">
                      <label>Địa chỉ *</label>
                      <input
                        type="text"
                        value={branch.address || ""}
                        onChange={(e) =>
                          handleArrayChange(
                            "branches",
                            index,
                            "address",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div className="site-config-form-group">
                      <label>Số điện thoại</label>
                      {(branch.phone || []).map((phone, phoneIndex) => (
                        <div
                          key={phoneIndex}
                          className="site-config-string-array-item"
                        >
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                              handleBranchPhoneChange(
                                index,
                                phoneIndex,
                                e.target.value
                              )
                            }
                            placeholder="Nhập số điện thoại"
                          />
                          <button
                            type="button"
                            onClick={() => removeBranchPhone(index, phoneIndex)}
                            className="site-config-repeater__remove-btn--small"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBranchPhone(index)}
                        className="site-config-repeater__add-btn--small"
                      >
                        + Thêm SĐT
                      </button>
                    </div>
                    <div className="site-config-form-group">
                      <label>Thứ tự hiển thị</label>
                      <input
                        type="number"
                        value={branch.order || 0}
                        onChange={(e) =>
                          handleArrayChange(
                            "branches",
                            index,
                            "order",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem("branches", {
                      name: "",
                      address: "",
                      phone: [],
                      email: "",
                      order: 0,
                    })
                  }
                  className="site-config-repeater__add-btn"
                >
                  + Thêm chi nhánh
                </button>
              </div>
            </section>
          )}

          {/* TAB: BRANDING */}
          {activeTab === "branding" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Logo và Hình ảnh</h2>
              <div className="site-config-grid-3">
                <div className="site-config-image-group">
                  <label>Logo (sáng)</label>
                  {config.logoLight && (
                    <img src={config.logoLight} alt="Logo Light" />
                  )}
                  <ImageUploader
                    onUpload={(url) => handleImageUpload("logoLight", url)}
                    onUploadStart={() => handleUploadStart("Logo Light")}
                    onUploadEnd={handleUploadEnd}
                  />
                </div>
                <div className="site-config-image-group">
                  <label>Logo (tối)</label>
                  {config.logoDark && (
                    <img src={config.logoDark} alt="Logo Dark" />
                  )}
                  <ImageUploader
                    onUpload={(url) => handleImageUpload("logoDark", url)}
                    onUploadStart={() => handleUploadStart("Logo Dark")}
                    onUploadEnd={handleUploadEnd}
                  />
                </div>
                <div className="site-config-image-group">
                  <label>Favicon</label>
                  {config.favicon && <img src={config.favicon} alt="Favicon" />}
                  <ImageUploader
                    onUpload={(url) => handleImageUpload("favicon", url)}
                    onUploadStart={() => handleUploadStart("Favicon")}
                    onUploadEnd={handleUploadEnd}
                  />
                </div>
                <div className="site-config-image-group">
                  <label>Ảnh OG (chia sẻ MXH)</label>
                  {config.ogImage && (
                    <img src={config.ogImage} alt="OG Image" />
                  )}
                  <ImageUploader
                    onUpload={(url) => handleImageUpload("ogImage", url)}
                    onUploadStart={() => handleUploadStart("OG Image")}
                    onUploadEnd={handleUploadEnd}
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB: MẠNG XÃ HỘI */}
          {activeTab === "social" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Mạng xã hội</h2>
              <div className="site-config-repeater">
                {(config.socialMedia || []).map((social, index) => (
                  <div key={index} className="site-config-repeater__item">
                    <div className="site-config-repeater__header">
                      <h4>Mạng xã hội #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("socialMedia", index)}
                        className="site-config-repeater__remove-btn"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="site-config-grid-2">
                      <div className="site-config-form-group">
                        <label>Nền tảng</label>
                        <select
                          value={social.platform || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "socialMedia",
                              index,
                              "platform",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Chọn...</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">Tiktok</option>
                          <option value="youtube">Youtube</option>
                          <option value="twitter">Twitter</option>
                          <option value="linkedin">LinkedIn</option>
                        </select>
                      </div>
                      <div className="site-config-form-group">
                        <label>URL</label>
                        <input
                          type="text"
                          value={social.url || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "socialMedia",
                              index,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="site-config-form-group">
                      <label>Icon (Upload hoặc URL)</label>
                      <div className="site-config-image-url-group">
                        {social.icon && (
                          <div className="site-config-image-preview">
                            <img src={social.icon} alt="Icon preview" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={social.icon || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "socialMedia",
                              index,
                              "icon",
                              e.target.value
                            )
                          }
                          placeholder="https://... hoặc upload"
                        />
                        <ImageUploader
                          onUpload={(url) =>
                            handleArrayImageUpload(
                              "socialMedia",
                              index,
                              "icon",
                              url
                            )
                          }
                          onUploadStart={() =>
                            handleUploadStart(`Icon MXH #${index + 1}`)
                          }
                          onUploadEnd={handleUploadEnd}
                        />
                      </div>
                    </div>

                    <div className="site-config-grid-2">
                      <div className="site-config-form-group">
                        <label>Thứ tự</label>
                        <input
                          type="number"
                          value={social.order || 0}
                          onChange={(e) =>
                            handleArrayChange(
                              "socialMedia",
                              index,
                              "order",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="site-config-form-group-toggle">
                      <label>Kích hoạt</label>
                      <input
                        type="checkbox"
                        checked={social.isActive !== false}
                        onChange={(e) =>
                          handleArrayChange(
                            "socialMedia",
                            index,
                            "isActive",
                            e.target.checked
                          )
                        }
                        className="site-config-toggle"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem("socialMedia", {
                      platform: "",
                      url: "",
                      icon: "",
                      order: 0,
                      isActive: true,
                    })
                  }
                  className="site-config-repeater__add-btn"
                >
                  + Thêm mạng xã hội
                </button>
              </div>
            </section>
          )}

          {/* TAB: TÙY CHỈNH */}
          {activeTab === "ui" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">
                Tùy chỉnh Giao diện
              </h2>

              <div className="site-config-form-group-toggle">
                <label>Bật nút liên hệ nổi (floating contact buttons)</label>
                <input
                  type="checkbox"
                  name="contactFloatingEnabled"
                  checked={config.contactFloatingEnabled || false}
                  onChange={handleChange}
                  className="site-config-toggle"
                />
              </div>

              {config.contactFloatingEnabled && (
                <div className="site-config-subsection">
                  <h3>Danh sách nút liên hệ nổi</h3>
                  <p className="site-config-help-text">
                    Các nút này sẽ hiển thị cố định ở góc màn hình (VD: Facebook
                    Messenger, Zalo, Hotline...)
                  </p>
                  <div className="site-config-repeater">
                    {(config.contactFloatingItems || []).map((item, index) => (
                      <div key={index} className="site-config-repeater__item">
                        <div className="site-config-repeater__header">
                          <h4>Nút #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem("contactFloatingItems", index)
                            }
                            className="site-config-repeater__remove-btn"
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="site-config-grid-2">
                          <div className="site-config-form-group">
                            <label>ID *</label>
                            <input
                              type="text"
                              value={item.id || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "id",
                                  e.target.value
                                )
                              }
                              placeholder="facebook-messenger"
                              required
                            />
                          </div>
                          <div className="site-config-form-group">
                            <label>Label</label>
                            <input
                              type="text"
                              value={item.label || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Facebook Messenger"
                            />
                          </div>
                        </div>

                        <div className="site-config-form-group">
                          <label>Icon URL (Upload hoặc nhập link)</label>
                          <div className="site-config-image-url-group">
                            {item.icon && (
                              <div className="site-config-image-preview">
                                <img src={item.icon} alt="Icon preview" />
                              </div>
                            )}
                            <input
                              type="text"
                              value={item.icon || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "icon",
                                  e.target.value
                                )
                              }
                              placeholder="https://... hoặc upload ảnh"
                            />
                            <ImageUploader
                              onUpload={(url) =>
                                handleArrayImageUpload(
                                  "contactFloatingItems",
                                  index,
                                  "icon",
                                  url
                                )
                              }
                              onUploadStart={() =>
                                handleUploadStart(`Icon nút #${index + 1}`)
                              }
                              onUploadEnd={handleUploadEnd}
                            />
                          </div>
                        </div>

                        <div className="site-config-grid-2">
                          <div className="site-config-form-group">
                            <label>Alt text</label>
                            <input
                              type="text"
                              value={item.alt || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "alt",
                                  e.target.value
                                )
                              }
                              placeholder="Mô tả icon cho SEO"
                            />
                          </div>
                          <div className="site-config-form-group">
                            <label>Link</label>
                            <input
                              type="text"
                              value={item.link || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "link",
                                  e.target.value
                                )
                              }
                              placeholder="https://m.me/... hoặc tel:0123456789"
                            />
                          </div>
                          <div className="site-config-form-group">
                            <label>Thứ tự hiển thị</label>
                            <input
                              type="number"
                              value={item.order || 0}
                              onChange={(e) =>
                                handleArrayChange(
                                  "contactFloatingItems",
                                  index,
                                  "order",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="site-config-form-group-toggle">
                          <label>Kích hoạt</label>
                          <input
                            type="checkbox"
                            checked={item.isActive !== false}
                            onChange={(e) =>
                              handleArrayChange(
                                "contactFloatingItems",
                                index,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="site-config-toggle"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        handleAddItem("contactFloatingItems", {
                          id: "",
                          icon: "",
                          alt: "",
                          label: "",
                          link: "",
                          order: 0,
                          isActive: true,
                        })
                      }
                      className="site-config-repeater__add-btn"
                    >
                      + Thêm nút liên hệ
                    </button>
                  </div>
                </div>
              )}

              <hr className="site-config-divider" />

              <div className="site-config-form-group-toggle">
                <label>Bật khung nhận tin (Newsletter Subscription)</label>
                <input
                  type="checkbox"
                  name="newsletterEnabled"
                  checked={config.newsletterEnabled || false}
                  onChange={handleChange}
                  className="site-config-toggle"
                />
              </div>

              {config.newsletterEnabled && (
                <div className="site-config-subsection">
                  <p className="site-config-help-text">
                    Khung nhận tin cho phép khách hàng đăng ký email để nhận
                    thông tin khuyến mãi, tour mới...
                  </p>
                  <div className="site-config-grid-2">
                    <div className="site-config-form-group">
                      <label>Tiêu đề khung nhận tin</label>
                      <input
                        type="text"
                        name="newsletterTitle"
                        value={config.newsletterTitle || ""}
                        onChange={handleChange}
                        placeholder="VD: Đăng ký nhận tin khuyến mãi"
                      />
                    </div>
                    <div className="site-config-form-group">
                      <label>Placeholder trong ô nhập email</label>
                      <input
                        type="text"
                        name="newsletterPlaceholder"
                        value={config.newsletterPlaceholder || ""}
                        onChange={handleChange}
                        placeholder="VD: Nhập email của bạn"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB: SEO */}
          {activeTab === "seo" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">SEO & Marketing</h2>
              <div className="site-config-form-group">
                <label>Tiêu đề mặc định (Default Title)</label>
                <input
                  type="text"
                  name="seoDefaultTitle"
                  value={config.seoDefaultTitle || ""}
                  onChange={handleChange}
                  placeholder="VD: Du lịch Việt Nam - Tour giá rẻ"
                />
              </div>
              <div className="site-config-form-group">
                <label>Mô tả mặc định (Default Description)</label>
                <textarea
                  name="seoDefaultDescription"
                  value={config.seoDefaultDescription || ""}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về website, hiển thị trên Google..."
                ></textarea>
              </div>
              <div className="site-config-form-group">
                <label>Từ khóa mặc định (Keywords)</label>
                {(config.seoDefaultKeywords || []).map((kw, index) => (
                  <div key={index} className="site-config-string-array-item">
                    <input
                      type="text"
                      value={kw}
                      onChange={(e) =>
                        handleStringArrayChange(
                          "seoDefaultKeywords",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Nhập từ khóa"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeStringFromArray("seoDefaultKeywords", index)
                      }
                      className="site-config-repeater__remove-btn--small"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStringToArray("seoDefaultKeywords")}
                  className="site-config-repeater__add-btn--small"
                >
                  + Thêm từ khóa
                </button>
              </div>
              <hr className="site-config-divider" />
              <h3 className="site-config-subsection-title">
                Mã theo dõi (Tracking Codes)
              </h3>
              <div className="site-config-grid-3">
                <div className="site-config-form-group">
                  <label>Google Analytics ID</label>
                  <input
                    type="text"
                    name="googleAnalyticsId"
                    value={config.googleAnalyticsId || ""}
                    onChange={handleChange}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Google Tag Manager ID</label>
                  <input
                    type="text"
                    name="googleTagManagerId"
                    value={config.googleTagManagerId || ""}
                    onChange={handleChange}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
                <div className="site-config-form-group">
                  <label>Facebook Pixel ID</label>
                  <input
                    type="text"
                    name="facebookPixelId"
                    value={config.facebookPixelId || ""}
                    onChange={handleChange}
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB: CÀI ĐẶT */}
          {activeTab === "settings" && (
            <section className="site-config-section">
              <h2 className="site-config-section__title">Cài đặt Hệ thống</h2>
              <div className="site-config-form-group-toggle">
                <label>Bật chế độ bảo trì (Maintenance Mode)</label>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={config.maintenanceMode || false}
                  onChange={handleChange}
                  className="site-config-toggle"
                />
              </div>
              {config.maintenanceMode && (
                <div className="site-config-form-group">
                  <label>Thông báo bảo trì</label>
                  <textarea
                    name="maintenanceMessage"
                    value={config.maintenanceMessage || ""}
                    onChange={handleChange}
                    placeholder="Website đang được bảo trì. Vui lòng quay lại sau."
                  ></textarea>
                </div>
              )}
              <div className="site-config-form-group">
                <label>Múi giờ (Timezone)</label>
                <select
                  name="timezone"
                  value={config.timezone || "Asia/Ho_Chi_Minh"}
                  onChange={handleChange}
                >
                  <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                  <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                  <option value="Asia/Singapore">Singapore (GMT+8)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
            </section>
          )}
        </div>
      </form>
    </div>
  );
};

export default SiteConfig;
