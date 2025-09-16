import React from "react";
import DOMPurify from "dompurify";

export default function SafeHTML({ html, className = "" }) {
  // sanitize trước khi render
  const cleanHTML = DOMPurify.sanitize(html || "");
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
}
