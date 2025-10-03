// GalleryCategoryTree.jsx
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./GalleryCategoryTree.css";

const CategoryNode = ({
  category,
  level = 0,
  onDelete,
  highlightId,
  collapseAll,
  expandToTarget,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // collapseAll khi bấm "Thu gọn cây"
  useEffect(() => {
    if (collapseAll) {
      setCollapsed(true);
    }
  }, [collapseAll]);

  // expandToTarget - mở rộng đường dẫn đến target
  useEffect(() => {
    if (expandToTarget) {
      const hasTargetInChildren = (node, targetId) => {
        if (node._id === targetId) return true;
        if (node.children && node.children.length > 0) {
          return node.children.some((child) =>
            hasTargetInChildren(child, targetId)
          );
        }
        return false;
      };

      if (hasTargetInChildren(category, expandToTarget)) {
        setCollapsed(false);
      }
    }
  }, [expandToTarget, category]);

  return (
    <div className="gct-node">
      {/* Header */}
      <div
        className={`gct-node-header ${
          highlightId === category._id ? "gct-highlight" : ""
        }`}
        data-category-id={category._id}
      >
        {category.children && category.children.length > 0 && (
          <button
            className="gct-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        <span className={`gct-level gct-level-${level}`}>L{level}</span>
        <div className="gct-info">
          <strong>{category.title}</strong>
          <div className="gct-meta">
            slug: {category.slug} | Cấp độ: {level} | Có{" "}
            {category.children.length} danh mục con
          </div>
        </div>
        <div className="gct-actions">
          <Link
            to={`/admin/gallery-category/detail/${category._id}`}
            className="gct-action"
            title="Chi tiết"
          >
            <FaEye />
          </Link>
          <Link
            to={`/admin/gallery-category/edit/${category._id}`}
            className="gct-action"
            title="Chỉnh sửa"
          >
            <FaEdit />
          </Link>
          <p
            className="gct-action gct-delete"
            onClick={() => onDelete(category._id)}
            title="Xóa"
          >
            <FaTrash />
          </p>
        </div>
      </div>
      {/* Children */}
      {!collapsed && category.children && category.children.length > 0 && (
        <div className="gct-children">
          {category.children.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              level={level + 1}
              onDelete={onDelete}
              highlightId={highlightId}
              collapseAll={collapseAll}
              expandToTarget={expandToTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GalleryCategoryTree = ({ data, onDelete, highlightId }) => {
  const [collapseAll, setCollapseAll] = useState(false);
  const [expandToTarget, setExpandToTarget] = useState(null);

  // lắng nghe sự kiện từ NewCategoryManager
  useEffect(() => {
    const collapseHandler = () => {
      setCollapseAll(true);
      setTimeout(() => setCollapseAll(false), 0); // reset lại để lần sau bấm tiếp
    };

    const expandHandler = (event) => {
      const { targetId } = event.detail;
      setExpandToTarget(targetId);
      setTimeout(() => setExpandToTarget(null), 200); // reset sau khi expand xong
    };

    window.addEventListener("ncm-toggle-collapse", collapseHandler);
    window.addEventListener("ncm-expand-to-target", expandHandler);

    return () => {
      window.removeEventListener("ncm-toggle-collapse", collapseHandler);
      window.removeEventListener("ncm-expand-to-target", expandHandler);
    };
  }, []);

  return (
    <div className="gct-tree">
      {data.map((cat) => (
        <CategoryNode
          key={cat._id}
          category={cat}
          level={0}
          onDelete={onDelete}
          highlightId={highlightId}
          collapseAll={collapseAll}
          expandToTarget={expandToTarget}
        />
      ))}
    </div>
  );
};

export default GalleryCategoryTree;
