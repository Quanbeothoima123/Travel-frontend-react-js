// PaginationV2.jsx
import React from "react";
import "./PaginationV2.css";

const PaginationV2 = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      const hasLeftDots = startPage > 2;
      const hasRightDots = endPage < totalPages - 1;

      pages.push(1);
      if (hasLeftDots) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (hasRightDots) pages.push("...");
      pages.push(totalPages);
    } else {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`pg2-pagination ${className}`}>
      <button
        className="pg2-btn pg2-prev"
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <span className="pg2-btn-text">Trước</span>
      </button>

      <div className="pg2-pages">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="pg2-dots">
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={`pg2-btn pg2-page ${
                page === currentPage ? "pg2-page--active" : ""
              }`}
              onClick={() => onPageChange(page)}
              disabled={disabled}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className="pg2-btn pg2-next"
        disabled={currentPage === totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="pg2-btn-text">Sau</span>
      </button>
    </div>
  );
};

export default PaginationV2;
