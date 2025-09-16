// Pagination.jsx
import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="pg-pagination">
      <button
        className="pg-btn"
        disabled={currentPage === 1}
        onClick={() => handleClick(currentPage - 1)}
      >
        ◀
      </button>

      <div className="pg-list">
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="pg-ellipsis">
              …
            </span>
          ) : (
            <button
              key={idx}
              className={`pg-btn ${page === currentPage ? "active" : ""}`}
              onClick={() => handleClick(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className="pg-btn"
        disabled={currentPage === totalPages}
        onClick={() => handleClick(currentPage + 1)}
      >
        ▶
      </button>
    </nav>
  );
};

export default Pagination;
