// NewCategoryManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import SearchBarNewCategory from "./SearchBarTourCategory";
import NewCategoryTree from "./TourCategoryTree/index.jsx.jsx";
import "./TourCategoryManager.css";
import { useToast } from "../../../../contexts/ToastContext";
import ConfirmModal from "../../../components/common/ConfirmModal";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const TourCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [highlightId, setHighlightId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [countChildren, setCountChildren] = useState(null);
  const [nameCategory, setNameCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { showToast } = useToast();

  // fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/admin/tour-categories/get-all-category?tree=true`
        );
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };
    fetchData();
  }, []);

  // xóa danh mục
  const handleDelete = async (id) => {
    try {
      setCategoryId(id);
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/tour-categories/delete-info/${id}`
      );

      const data = await res.json();
      if (data.success) {
        setCountChildren(data.affectedCount);
        setNameCategory(data.categoryTitle);
        setConfirmDelete(true);
      } else {
        showToast("Không lấy được thông tin danh mục cần xóa", "error");
      }
    } catch (err) {
      console.error("Lỗi khi fetch delete-info:", err);
    }
  };

  // Xác nhận xóa
  const handleDeleteConfirm = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/tour-categories/delete/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        showToast(
          `Đã xoá danh mục: ${nameCategory} và (${countChildren} danh mục con)`,
          "success"
        );
        setConfirmDelete(false);
        const fetchData = async () => {
          try {
            const res = await fetch(
              `${API_BASE}/api/v1/admin/tour-categories/get-all-category?tree=true`
            );
            const data = await res.json();
            setCategories(data || []);
          } catch (err) {
            console.error("Fetch categories error:", err);
          }
        };
        fetchData();
      } else {
        showToast(data.message || "Xoá danh mục thất bại", "error");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API xoá:", err);
      showToast("Có lỗi xảy ra khi xoá danh mục", "error");
    }
  };

  // highlight và scroll đến danh mục
  const triggerHighlight = (id) => {
    setHighlightId(id);

    // Expand tất cả nodes để hiển thị danh mục target
    const event = new CustomEvent("tcm-expand-to-target", {
      detail: { targetId: id },
    });
    window.dispatchEvent(event);

    // Đợi một chút để DOM được render sau khi expand
    setTimeout(() => {
      const targetElement = document.querySelector(
        `[data-category-id="${id}"]`
      );
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 100);

    // Tắt highlight sau 3s
    setTimeout(() => setHighlightId(null), 3000);
  };

  // Lấy danh mục được cập nhật mới nhất từ API
  const handleFindLatestUpdated = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/tour-categories/last-updated`
      );
      const data = await res.json();

      if (data.success) {
        triggerHighlight(data.latestId);
        showToast(
          `Tìm thấy danh mục cập nhật mới nhất: ${data.title}`,
          "success"
        );
      } else {
        showToast(data.message || "Không tìm thấy danh mục nào", "error");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh mục cập nhật mới nhất:", err);
      showToast("Có lỗi xảy ra khi lấy danh mục cập nhật mới nhất", "error");
    }
  };

  // Lấy danh mục được tạo mới nhất từ API
  const handleFindLatestCreated = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/tour-categories/last-created`
      );
      const data = await res.json();

      if (data.success) {
        triggerHighlight(data.latestId);
        showToast(`Tìm thấy danh mục tạo mới nhất: ${data.title}`, "success");
      } else {
        showToast(data.message || "Không tìm thấy danh mục nào", "error");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh mục tạo mới nhất:", err);
      showToast("Có lỗi xảy ra khi lấy danh mục tạo mới nhất", "error");
    }
  };

  // toggle collapse (demo: emit event -> child tự xử lý)
  const handleToggleCollapse = () => {
    const event = new CustomEvent("tcm-toggle-collapse");
    window.dispatchEvent(event);
  };

  // filter & search dữ liệu
  const filteredCategories = useMemo(() => {
    const filterTree = (nodes) => {
      return nodes
        .map((node) => {
          const matchSearch = node.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchStatus =
            statusFilter === "all"
              ? true
              : statusFilter === "active"
              ? node.active === true
              : node.active === false;

          const filteredChildren = node.children
            ? filterTree(node.children)
            : [];

          if ((matchSearch && matchStatus) || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean);
    };

    return filterTree(categories);
  }, [categories, searchTerm, statusFilter]);

  return (
    <div className="tcm-container">
      <h2 className="tcm-title">Quản lý danh mục mới</h2>

      <SearchBarNewCategory
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onFindLatestUpdated={handleFindLatestUpdated}
        onFindLatestCreated={handleFindLatestCreated}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="tcm-tree-wrapper">
        <NewCategoryTree
          data={filteredCategories}
          onDelete={handleDelete}
          highlightId={highlightId}
        />
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa danh mục du lịch"
        message={`Bạn đồng ý xóa danh mục ${nameCategory} chứ? ${
          countChildren - 1
        } danh mục con cũng sẽ được xóa theo?`}
      />
    </div>
  );
};

export default TourCategoryManager;
