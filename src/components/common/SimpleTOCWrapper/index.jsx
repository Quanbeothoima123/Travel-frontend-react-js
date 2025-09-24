import React, { useEffect, useState } from "react";
import generateTOCFromHtml from "../../../utils/tocGenerator";
import "./SimpleTOCWrapper.css";

const SimpleTOCWrapper = ({
  htmlContent,
  children,
  tocOptions = {},
  className = "",
}) => {
  const [tocData, setTocData] = useState({ tocHtml: "", contentHtml: "" });

  // Default TOC options
  const defaultTocOptions = {
    tocTitle: "Mục lục",
    smoothScroll: true,
    includeNumbers: false,
    ...tocOptions,
  };

  // Generate TOC when content changes
  useEffect(() => {
    if (htmlContent) {
      const toc = generateTOCFromHtml(htmlContent, defaultTocOptions);
      setTocData(toc);
    }
  }, [htmlContent]);

  // Handle TOC link click
  useEffect(() => {
    const handleTocClick = (e) => {
      if (e.target.classList.contains("toc-link")) {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const offsetTop =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            100;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleTocClick);
    return () => document.removeEventListener("click", handleTocClick);
  }, []);

  return (
    <div className={`simple-toc-container ${className}`}>
      <div className="simple-toc-layout">
        {/* Table of Contents - Fixed Position */}
        {tocData.tocHtml && (
          <div className="simple-toc-sidebar">
            <div
              className="simple-toc-content"
              dangerouslySetInnerHTML={{ __html: tocData.tocHtml }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="simple-toc-main-content">
          {tocData.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: tocData.contentHtml }} />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTOCWrapper;
