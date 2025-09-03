import React, { useState } from "react";
import ImageUploader from "../ImageUploader";
import ImageLoadingModal from "../../../../../admin/components/common/ImageLoadingModal";
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
import "./ImagesUploader.css";

const SortableItem = ({ id, url, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="preview-item"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <img src={url} alt={id} />
      <button className="remove-btn" onClick={() => onRemove(id)}>
        ✕
      </button>
    </div>
  );
};

const ImagesUploader = ({ images, setImages }) => {
  const [loading, setLoading] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleUpload = (urls) => {
    if (!urls || urls.length === 0) return;
    const uploaded = urls.map((url, idx) => ({ id: Date.now() + idx, url }));
    setImages([...images, ...uploaded]);
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const newImg = { id: Date.now(), url: linkInput.trim() };
    setImages([...images, newImg]);
    setLinkInput("");
  };

  const handleRemove = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className="images-uploader">
      <h4>
        Thư viện ảnh(Có thể dùng ảnh từ máy tính hoặc link trên mạng xã hội)
      </h4>

      <div className="uploader-actions">
        {/* Upload ảnh */}
        <ImageUploader
          multiple
          onUpload={handleUpload}
          onUploadStart={() => setLoading(true)}
          onUploadEnd={() => setLoading(false)}
        />

        {/* Thêm ảnh bằng link */}
        <div className="link-input-wrapper">
          <input
            type="text"
            placeholder="Dán link ảnh..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <button className="add-link-btn" onClick={handleAddLink}>
            Thêm
          </button>
        </div>
      </div>

      {loading && <ImageLoadingModal />}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="preview-list">
            {images.map((img) => (
              <SortableItem
                key={img.id}
                id={img.id}
                url={img.url}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ImagesUploader;
