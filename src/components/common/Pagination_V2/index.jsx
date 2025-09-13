import React from "react";
import "./Pagination_V2.css";
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
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
    <div className={`pagination ${className}`}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="dots">
            ...
          </span>
        ) : (
          <button
            key={idx}
            className={page === currentPage ? "active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
