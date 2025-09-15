// src/admin/pages/tour/TourCategory.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaChevronDown,
  FaChevronRight,
  FaMinus,
  FaPlusCircle,
} from "react-icons/fa";
import "./TourCategory.css";

export default function TourCategory() {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // controls
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    title: "",
  });

  // highlight & scrolling
  const [highlightedId, setHighlightedId] = useState(null);

  // expand/collapse all toggle
  const [allExpanded, setAllExpanded] = useState(false);

  // refs for nodes
  const nodeRefs = useRef({});

  // API config
  const API_ROOT = `${API_BASE}/api/v1/admin/tour-categories`;
  const API_TREE = `${API_ROOT}?tree=true`;

  // load tree
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API_TREE);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        setCategories(json);
      } catch (err) {
        console.error("Fetch categories error:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // flatten mapById (duyệt đệ quy) — hỗ trợ tree nested
  const mapById = useMemo(() => {
    const m = {};
    const traverse = (nodes, parent = null) => {
      (nodes || []).forEach((n) => {
        // keep original object reference, but ensure parentId exists
        m[n._id] = { ...n, parentId: n.parentId ?? parent?._id ?? null };
        if (n.children && n.children.length) traverse(n.children, n);
      });
    };
    traverse(categories || []);
    return m;
  }, [categories]);

  // Toggle expand / collapse single
  const toggleNode = (id) => {
    setExpandedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  // Expand all nodes that have children (walk the tree)
  const expandAll = () => {
    const ids = new Set();
    const traverse = (nodes) => {
      (nodes || []).forEach((n) => {
        if (n.children && n.children.length) {
          ids.add(n._id);
          traverse(n.children);
        }
      });
    };
    traverse(categories || []);
    setExpandedIds(ids);
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
    setAllExpanded(false);
  };

  // Filter logic (flattened search that still returns tree roots handled later)
  const filteredFlat = useMemo(() => {
    // first apply status filter
    const allNodes = Object.values(mapById);
    const byStatus = allNodes.filter((c) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? c.active
        : !c.active
    );

    if (!q.trim()) {
      // return top-level roots from categories (still in tree shape)
      return categories || [];
    }
    const text = q.trim().toLowerCase();
    // find matches
    const matchIds = new Set(
      byStatus
        .filter((c) => (c.title || "").toLowerCase().includes(text))
        .map((c) => c._id)
    );

    // include ancestors
    const include = new Set(matchIds);
    matchIds.forEach((id) => {
      let cur = mapById[id]?.parentId;
      while (cur) {
        include.add(cur);
        cur = mapById[cur]?.parentId;
      }
    });

    // Build a new tree only containing included nodes (helper)
    const buildTree = (nodes) =>
      (nodes || [])
        .map((n) => {
          if (!include.has(n._id)) return null;
          return {
            ...n,
            children: buildTree(n.children),
          };
        })
        .filter(Boolean);

    return buildTree(categories || []);
  }, [categories, q, statusFilter, mapById]);

  // For rendering tree we use `tree`
  const tree = filteredFlat;

  // collect descendants robustly (use children if present; fallback to flat parentId scan)
  const collectDescendants = (targetId) => {
    const res = new Set();
    const node = mapById[targetId];
    if (!node) return [];

    // If node has children property (tree), use it
    if (node.children && node.children.length) {
      const stack = [node];
      while (stack.length) {
        const cur = stack.pop();
        res.add(cur._id);
        if (cur.children && cur.children.length) {
          cur.children.forEach((c) => stack.push(c));
        }
      }
      return Array.from(res);
    }

    // fallback: scan all nodes by parentId
    const stack = [targetId];
    while (stack.length) {
      const curId = stack.pop();
      res.add(curId);
      Object.values(mapById).forEach((n) => {
        if (n.parentId === curId && !res.has(n._id)) {
          stack.push(n._id);
        }
      });
    }
    return Array.from(res);
  };

  // handle delete (open confirm)
  const handleDelete = (node) => {
    const descendants = collectDescendants(node._id);
    setConfirmDelete({
      show: true,
      id: node._id,
      title: node.title,
      count: descendants.length,
    });
  };

  // Confirm delete and refresh tree
  const handleDeleteConfirm = async () => {
    const id = confirmDelete.id;
    if (!id) return setConfirmDelete({ show: false, id: null, title: "" });

    try {
      const res = await fetch(`${API_ROOT}/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");

      // refetch tree
      const refreshed = await fetch(API_TREE);
      const json = await refreshed.json();
      setCategories(json);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setConfirmDelete({ show: false, id: null, title: "" });
      setExpandedIds(new Set());
      setAllExpanded(false);
    }
  };

  // expand to node and scroll into view + highlight
  const expandToNode = (id) => {
    if (!mapById[id]) {
      // not present in current tree
      return;
    }
    const ancestors = [];
    let cur = mapById[id]?.parentId;
    while (cur) {
      ancestors.push(cur);
      cur = mapById[cur]?.parentId;
    }
    setExpandedIds((prev) => {
      const s = new Set(prev);
      ancestors.forEach((a) => s.add(a));
      s.add(id);
      return s;
    });

    // ensure allExpanded flag
    setAllExpanded(true);

    // scroll into view after layout
    setTimeout(() => {
      const el = nodeRefs.current[id];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // set highlight
      setHighlightedId(id);
      // remove highlight after 4s
      setTimeout(() => setHighlightedId(null), 4000);
    }, 160);
  };

  // fetch the latest item (created or updated) and navigate to it
  const fetchLatestAndOpen = async (type = "updated") => {
    try {
      const res = await fetch(`${API_ROOT}/recent?type=${type}&limit=1`);
      if (!res.ok) throw new Error("Recent API error");
      const json = await res.json();

      // Expect json is array or single object - normalize
      const item = Array.isArray(json) ? json[0] : json;
      if (!item) {
        console.warn("No recent item found");
        return;
      }

      // ensure active and not deleted if possible
      if (item.deleted || item.active === false) {
        console.warn("Found item is deleted or inactive, skipping.");
        return;
      }

      // if the item is not present in current map, refetch tree and then expand
      if (!mapById[item._id]) {
        const refreshed = await fetch(API_TREE);
        const all = await refreshed.json();
        setCategories(all);
        // slight delay to let categories state update then expand
        setTimeout(() => expandToNode(item._id), 200);
      } else {
        // ensure tree opened and expand to node
        if (!allExpanded) expandAll();
        expandToNode(item._id);
      }
    } catch (err) {
      console.error("Fetch latest error:", err);
    }
  };

  // NEW: Function to calculate level depth
  const calculateLevel = (nodeId) => {
    let level = 0;
    let currentId = mapById[nodeId]?.parentId;
    while (currentId) {
      level++;
      currentId = mapById[currentId]?.parentId;
    }
    return level;
  };

  // Node renderer (recursive) - UPDATED with level display
  const Node = ({ node, depth = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = expandedIds.has(node._id);
    const isHighlighted = highlightedId === node._id;

    // Calculate actual level in tree structure
    const level = calculateLevel(node._id);

    return (
      <div
        className={`tc-node ${isHighlighted ? "tc-highlight" : ""}`}
        style={{ marginLeft: depth * 12 }}
        ref={(el) => (nodeRefs.current[node._id] = el)}
      >
        <div className="tc-item">
          <div className="tc-left">
            {hasChildren ? (
              <button
                className={`tc-caret ${isOpen ? "open" : ""}`}
                onClick={() => toggleNode(node._id)}
                aria-label="toggle"
              >
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            ) : (
              <span className="tc-caret-placeholder" />
            )}

            <div className="tc-title-block">
              <div className="tc-title">
                {/* NEW: Level badge */}
                <span className="tc-level-badge">L{level}</span>
                {node.title}
                {!node.active && (
                  <span className="tc-badge-inactive">Inactive</span>
                )}
              </div>
              <div className="tc-sub">
                slug: {node.slug} | Cấp độ: {level} | Có{" "}
                {hasChildren ? node.children.length : 0} danh mục con
              </div>
            </div>
          </div>

          <div className="tc-actions">
            <Link
              to={`/admin/tour-categories/detail/${node._id}`}
              className="tc-action"
              title="Chi tiết"
            >
              <FaEye />
            </Link>
            <Link
              to={`/admin/tour-categories/update/${node._id}`}
              className="tc-action"
              title="Sửa"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => handleDelete(node)}
              className="tc-action danger"
              title="Xóa"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {hasChildren && (
          <div className={`tc-children ${isOpen ? "open" : ""}`}>
            {node.children.map((child) => (
              <Node key={child._id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tc-page">
      <div className="tc-header">
        <div className="tc-controls">
          <div className="tc-search">
            <FaSearch className="tc-icon" />
            <input
              placeholder="Tìm kiếm (tên)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="tc-input"
            />
          </div>

          <div className="tc-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tc-select-el"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Chỉ Active</option>
              <option value="inactive">Chỉ Inactive</option>
            </select>
          </div>

          {/* NEW: quick buttons for latest updated / latest created */}
          <div className="tc-quick">
            <button
              className="tc-btn tc-btn-small"
              title="Danh mục cập nhật mới nhất"
              onClick={() => fetchLatestAndOpen("updated")}
            >
              Danh mục cập nhật mới nhất
            </button>

            <button
              className="tc-btn tc-btn-small"
              title="Danh mục thêm mới nhất"
              onClick={() => fetchLatestAndOpen("created")}
            >
              Danh mục thêm mới nhất
            </button>
          </div>

          <div className="tc-expand-toggle">
            {allExpanded ? (
              <button className="tc-btn" onClick={collapseAll}>
                <FaMinus /> Thu gọn
              </button>
            ) : (
              <button className="tc-btn" onClick={expandAll}>
                <FaPlus /> Mở rộng
              </button>
            )}
          </div>

          <div className="tc-add">
            <Link to="/admin/tour-categories/create" className="tc-add-btn">
              <FaPlusCircle /> Thêm mới danh mục
            </Link>
          </div>
        </div>
      </div>

      <div className="tc-panel">
        <div className="tc-panel-title">Danh sách danh mục dạng cây</div>
        <div className="tc-panel-inner">
          {loading ? (
            <div className="tc-empty">Đang tải...</div>
          ) : tree.length === 0 ? (
            <div className="tc-empty">Không tìm thấy danh mục</div>
          ) : (
            <div className="tc-tree">
              {tree.map((root) => (
                <Node key={root._id} node={root} depth={0} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* confirm modal */}
      {confirmDelete.show && (
        <div className="tc-modal-overlay">
          <div className="tc-modal">
            <div className="tc-modal-title">Xác nhận xóa</div>
            <div className="tc-modal-body">
              Bạn có chắc muốn xóa danh mục{" "}
              <strong>{confirmDelete.title}</strong>? <br />
              (Sẽ xóa cả {confirmDelete.count || "1"} mục con nếu có.)
            </div>
            <div className="tc-modal-actions">
              <button
                className="tc-btn tc-btn-muted"
                onClick={() =>
                  setConfirmDelete({ show: false, id: null, title: "" })
                }
              >
                Hủy
              </button>
              <button
                className="tc-btn tc-btn-danger"
                onClick={handleDeleteConfirm}
              >
                Xóa &amp; Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
