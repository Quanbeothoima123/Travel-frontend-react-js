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

  // Tạo danh sách số trang
  const getPageNumbers = () => {
    const pages = [];
    const totalNumbers = siblingCount * 2 + 3; // current + siblings + first + last
    const totalBlocks = totalNumbers + 2; // thêm "..."

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      let hasLeftDots = startPage > 2;
      let hasRightDots = endPage < totalPages - 1;

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
    <div className={`pagination-v2 ${className}`}>
      <button
        className="pagination-v2__btn pagination-v2__prev"
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <span className="pagination-v2__btn-text">Trước</span>
      </button>

      <div className="pagination-v2__pages">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="pagination-v2__dots">
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={`pagination-v2__btn pagination-v2__page ${
                page === currentPage ? "pagination-v2__page--active" : ""
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
        className="pagination-v2__btn pagination-v2__next"
        disabled={currentPage === totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="pagination-v2__btn-text">Sau</span>
      </button>
    </div>
  );
};

export default PaginationV2;
