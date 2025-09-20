// TourCategoryTree.jsx
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./TourCategoryTree.css";

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
    <div className="tct-node">
      {/* Header */}
      <div
        className={`tct-node-header ${
          highlightId === category._id ? "tct-highlight" : ""
        }`}
        data-category-id={category._id}
      >
        {category.children && category.children.length > 0 && (
          <button
            className="tct-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        <span className={`tct-level tct-level-${level}`}>L{level}</span>
        <div className="tct-info">
          <strong>{category.title}</strong>
          <div className="tct-meta">
            slug: {category.slug} | Cấp độ: {level} | Có{" "}
            {category.children.length} danh mục con
          </div>
        </div>
        <div className="tct-actions">
          <Link
            to={`/admin/tour-categories/detail/${category._id}`}
            className="tct-action"
            title="Chi tiết"
          >
            <FaEye />
          </Link>
          <Link
            to={`/admin/tour-categories/update/${category._id}`}
            className="tct-action"
            title="Chỉnh sửa"
          >
            <FaEdit />
          </Link>
          <p
            className="tct-action tct-delete"
            onClick={() => onDelete(category._id)}
            title="Xóa"
          >
            <FaTrash />
          </p>
        </div>
      </div>
      {/* Children */}
      {!collapsed && category.children && category.children.length > 0 && (
        <div className="tct-children">
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

const TourCategoryTree = ({ data, onDelete, highlightId }) => {
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

    window.addEventListener("tcm-toggle-collapse", collapseHandler);
    window.addEventListener("tcm-expand-to-target", expandHandler);

    return () => {
      window.removeEventListener("tcm-toggle-collapse", collapseHandler);
      window.removeEventListener("tcm-expand-to-target", expandHandler);
    };
  }, []);

  return (
    <div className="tct-tree">
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

export default TourCategoryTree;
