import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tree-dropdown.css"; // file CSS riêng
const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
export default function CategoryTreeSelect({
  value,
  onChange,
  fetchUrl = `${API_BASE}/api/v1/tour-category/get-all-category?tree=true`,
  placeholder = "Chọn danh mục tour",
  noDataText = "Không có danh mục",
}) {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(fetchUrl, { credentials: "include" });
        const data = await res.json();
        if (mounted) setTree(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [fetchUrl]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredTree = useMemo(() => {
    if (!q.trim()) return tree;
    const needle = q.trim().toLowerCase();

    const filterRec = (nodes) => {
      const out = [];
      for (const n of nodes) {
        const match = n.title?.toLowerCase().includes(needle);
        const kids = Array.isArray(n.children) ? filterRec(n.children) : [];
        if (match || kids.length) {
          out.push({ ...n, children: kids });
        }
      }
      return out;
    };
    return filterRec(tree);
  }, [tree, q]);

  const handlePick = (node) => {
    onChange?.(node);
    setOpen(false);
  };

  function findTitleById(nodes, id) {
    for (const n of nodes) {
      if (n._id === id) return n.title;
      if (n.children) {
        const found = findTitleById(n.children, id);
        if (found) return found;
      }
    }
    return "";
  }

  return (
    <div className="tdp-field" ref={wrapRef}>
      <div
        className={`tdp-control ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`tdp-placeholder ${value ? "has-value" : ""}`}>
          {value
            ? value.title || findTitleById(tree, value._id) || placeholder
            : placeholder}
        </span>
        <span className="tdp-caret">▾</span>
      </div>

      {open && (
        <div className="tdp-menu">
          <div className="tdp-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm danh mục…"
            />
          </div>

          <div className="tdp-list">
            {loading ? (
              <div className="tdp-empty">Đang tải…</div>
            ) : filteredTree.length === 0 ? (
              <div className="tdp-empty">{noDataText}</div>
            ) : (
              <TreeList nodes={filteredTree} onPick={handlePick} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TreeList({ nodes, onPick, depth = 0 }) {
  return (
    <ul className="tdp-ul">
      {nodes.map((n) => (
        <TreeNode key={n._id} node={n} onPick={onPick} depth={depth} />
      ))}
    </ul>
  );
}

function TreeNode({ node, onPick, depth }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <li className="tdp-li">
      <div className="tdp-row" style={{ "--tdp-depth": depth }}>
        {hasChildren ? (
          <button
            type="button"
            className={`tdp-toggle ${expanded ? "open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label="toggle"
          />
        ) : (
          <span className="tdp-bullet" />
        )}

        <button
          type="button"
          className="tdp-label"
          onClick={() => onPick(node)}
          title={node.title}
        >
          {node.title}
        </button>
      </div>

      {hasChildren && expanded && (
        <TreeList nodes={node.children} onPick={onPick} depth={depth + 1} />
      )}
    </li>
  );
}
