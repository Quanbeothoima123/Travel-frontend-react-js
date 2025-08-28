import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
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

  // dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMode, setDropdownMode] = useState(null); // 'recentCreated' | 'recentUpdated' | 'deleted' | null
  const [recentItems, setRecentItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  // expand/collapse all toggle
  const [allExpanded, setAllExpanded] = useState(false);

  // refs for nodes and dropdown
  const nodeRefs = useRef({});
  const dropdownRef = useRef(null);

  // base API
  const API_BASE = "http://localhost:5000/api/v1/tour-categories?tree=true";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        setCategories(json);
      } catch (err) {
        console.error("Fetch categories error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // click outside to close dropdown
  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setDropdownMode(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Derived: map by id
  const mapById = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c._id] = c));
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

  // Expand all nodes that have children
  const expandAll = () => {
    const ids = new Set();
    categories.forEach((c) => {
      if (categories.some((x) => x.parentId === c._id)) ids.add(c._id);
    });
    setExpandedIds(ids);
    setAllExpanded(true);
  };
  const collapseAll = () => {
    setExpandedIds(new Set());
    setAllExpanded(false);
  };

  // Filter logic:
  const filteredFlat = useMemo(() => {
    // first apply status filter
    const byStatus = categories.filter((c) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? c.active
        : !c.active
    );

    if (!q.trim()) {
      return byStatus;
    }
    const text = q.trim().toLowerCase();
    // find matches
    const matchIds = new Set(
      byStatus
        .filter((c) => (c.title || "").toLowerCase().includes(text))
        .map((c) => c._id)
    );

    // include ancestors (only if they exist in byStatus)
    const include = new Set(matchIds);
    matchIds.forEach((id) => {
      let cur = mapById[id]?.parentId;
      while (cur) {
        if (byStatus.find((b) => b._id === cur)) include.add(cur);
        cur = mapById[cur]?.parentId;
      }
    });

    return byStatus.filter((c) => include.has(c._id));
  }, [categories, q, statusFilter, mapById]);

  const tree = useMemo(() => filteredFlat, [filteredFlat]);

  // delete logic (collect descendants and remove from state)
  const collectDescendants = (targetId) => {
    const toRemove = new Set([targetId]);
    const stack = [targetId];
    while (stack.length) {
      const cur = stack.pop();
      categories.forEach((c) => {
        if (c.parentId === cur && !toRemove.has(c._id)) {
          toRemove.add(c._id);
          stack.push(c._id);
        }
      });
    }
    return Array.from(toRemove);
  };

  const handleDelete = (node) => {
    // open confirm modal
    const descendants = collectDescendants(node._id);
    setConfirmDelete({
      show: true,
      id: node._id,
      title: node.title,
      count: descendants.length,
    });
  };

  // Confirm xóa (gọi API DELETE /delete/:id)
  const handleDeleteConfirm = async () => {
    const id = confirmDelete.id;
    if (!id) return setConfirmDelete({ show: false, id: null, title: "" });

    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      // gọi lại API sau khi xóa
      const refreshed = await fetch(API_BASE);
      const json = await refreshed.json();
      setCategories(json);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setConfirmDelete({ show: false, id: null, title: "" });
      setExpandedIds(new Set()); // reset expand để tránh orphan
    }
  };

  // fetch recent items (created or updated)
  const fetchRecent = async (type = "created") => {
    try {
      const res = await fetch(`${API_BASE}/recent?type=${type}&limit=20`);
      if (!res.ok) throw new Error("Recent API error");
      const json = await res.json();
      setRecentItems(json);
    } catch (err) {
      console.error("Fetch recent error:", err);
      setRecentItems([]);
    }
  };

  // fetch deleted items
  const fetchDeleted = async () => {
    try {
      const res = await fetch(`${API_BASE}?deleted=true`);
      if (!res.ok) throw new Error("Deleted API error");
      const json = await res.json();
      setDeletedItems(json);
    } catch (err) {
      console.error("Fetch deleted error:", err);
      setDeletedItems([]);
    }
  };

  // expand to node and scroll into view
  const expandToNode = (id) => {
    if (!mapById[id]) {
      // not in current active list (e.g. deleted) -> cannot expand in tree
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

    setTimeout(() => {
      const el = nodeRefs.current[id];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 160);
  };

  // handle dropdown mode change
  const openDropdownWithMode = async (mode) => {
    setDropdownOpen(true);
    setDropdownMode(mode);
    if (mode === "recentCreated") await fetchRecent("created");
    if (mode === "recentUpdated") await fetchRecent("updated");
    if (mode === "deleted") await fetchDeleted();
  };

  // small helper to render each node recursively inside the dropdown lists
  const DropNode = ({ node, depth = 0, onClick }) => {
    return (
      <div style={{ marginLeft: depth * 10 }}>
        <div
          className="tc-dropdown-item"
          onClick={() => onClick(node)}
          role="button"
        >
          <div className="tc-dropdown-item-title">{node.title}</div>
          {node.children && node.children.length > 0 && (
            <div className="tc-dropdown-children">
              {node.children.map((c) => (
                <DropNode
                  key={c._id}
                  node={c}
                  depth={depth + 1}
                  onClick={onClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // small helper to render each node recursively in the main tree (with refs)
  const Node = ({ node, depth = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = expandedIds.has(node._id);
    const isHighlighted = highlightedId === node._id;

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
                {node.title}
                {!node.active && (
                  <span className="tc-badge-inactive">Inactive</span>
                )}
              </div>
              <div className="tc-sub">slug: {node.slug}</div>
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

          <div className="tc-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="tc-btn"
              onClick={() =>
                dropdownOpen
                  ? setDropdownOpen(false)
                  : openDropdownWithMode("recentCreated")
              }
            >
              Dropdown
            </button>

            {dropdownOpen && (
              <div className="tc-dropdown-panel">
                <div className="tc-dropdown-tabs">
                  <button
                    className={`tc-tab ${
                      dropdownMode === "recentCreated" ? "active" : ""
                    }`}
                    onClick={() => openDropdownWithMode("recentCreated")}
                  >
                    Mới thêm
                  </button>
                  <button
                    className={`tc-tab ${
                      dropdownMode === "recentUpdated" ? "active" : ""
                    }`}
                    onClick={() => openDropdownWithMode("recentUpdated")}
                  >
                    Cập nhật mới
                  </button>
                  <button
                    className={`tc-tab ${
                      dropdownMode === "deleted" ? "active" : ""
                    }`}
                    onClick={() => openDropdownWithMode("deleted")}
                  >
                    Đã xóa
                  </button>
                </div>

                <div className="tc-dropdown-body">
                  {/* RECENT created/updated */}
                  {(dropdownMode === "recentCreated" ||
                    dropdownMode === "recentUpdated") && (
                    <div className="tc-recent-list">
                      {recentItems.length === 0 ? (
                        <div className="tc-empty">Không có mục nào</div>
                      ) : (
                        recentItems.map((root) => (
                          <div key={root._id} className="tc-recent-root">
                            <div
                              className="tc-recent-item"
                              onClick={() => {
                                // highlight + expand and close dropdown
                                setHighlightedId(root._id);
                                expandToNode(root._id);
                                setDropdownOpen(false);
                                setDropdownMode(null);
                                // clear highlight after a while
                                setTimeout(() => setHighlightedId(null), 4000);
                              }}
                            >
                              <div className="tc-dropdown-item-title">
                                {root.title}
                              </div>
                            </div>

                            {/* children (if any) */}
                            {root.children && root.children.length > 0 && (
                              <div className="tc-recent-children">
                                {root.children.map((c) => (
                                  <DropNode
                                    key={c._id}
                                    node={c}
                                    onClick={(n) => {
                                      setHighlightedId(n._id);
                                      expandToNode(n._id);
                                      setDropdownOpen(false);
                                      setDropdownMode(null);
                                      setTimeout(
                                        () => setHighlightedId(null),
                                        4000
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* DELETED */}
                  {dropdownMode === "deleted" && (
                    <div className="tc-deleted-block">
                      <div className="tc-deleted-title">Danh sách đã xóa</div>
                      {deletedItems.length === 0 ? (
                        <div className="tc-empty">Không có mục đã xóa</div>
                      ) : (
                        deletedItems.map((root) => (
                          <div key={root._id} className="tc-deleted-item">
                            <div className="tc-deleted-title-line">
                              <Link to={`/admin/tour-categories/${root._id}`}>
                                {root.title}
                              </Link>
                            </div>
                            {root.children && root.children.length > 0 && (
                              <div className="tc-deleted-children">
                                {root.children.map((c) => (
                                  <div key={c._id} className="tc-deleted-child">
                                    <Link
                                      to={`/admin/tour-categories/${c._id}`}
                                    >
                                      {c.title}
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="tc-filter">
            <button className="tc-btn">
              <FaFilter style={{ marginRight: 8 }} />
              Lọc
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
        <div className="tc-panel-inner">
          <div className="tc-panel-title">Danh sách danh mục dạng cây</div>

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
