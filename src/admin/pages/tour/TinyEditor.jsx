import React from "react";
import { Editor } from "@tinymce/tinymce-react";
const apiKey = process.env.REACT_APP_TINYMCE_API_KEY;

const TinyEditor = ({ value, onChange, label }) => {
  const handleImageUpload = async (blobInfo, progress) => {
    const formData = new FormData();
    formData.append("file", blobInfo.blob());
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Upload failed");
    }
    return data.secure_url; // 👉 TinyMCE sẽ tự chèn ảnh này
  };

  return (
    <div className="tiny-editor">
      {label && <h4>{label}</h4>}
      <Editor
        apiKey={apiKey}
        value={value}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table code help wordcount",
            "image", // 👉 thêm plugin image
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | \
             alignleft aligncenter alignright alignjustify | \
             bullist numlist outdent indent | removeformat | help | image",
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          file_picker_types: "image",
        }}
        onEditorChange={(content) => onChange(content)}
      />
    </div>
  );
};

export default TinyEditor;
