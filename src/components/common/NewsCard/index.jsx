import React from "react";
import { Link } from "react-router-dom";
import "./NewsCard.css";
import { FaCalendarAlt, FaEye } from "react-icons/fa";

const NewsCard = ({
  data,
  thumbnailPosition = "top", // "top" | "bottom"
}) => {
  if (!data) return null;

  const { _id, title, excerpt, thumbnail, publishedAt, views, slug } = data;

  return (
    <Link to={`/news/detail/${slug || _id}`} className="n-card">
      {thumbnail && thumbnailPosition === "top" && (
        <div className="n-card-thumbnail">
          <img src={thumbnail} alt={title} />
        </div>
      )}

      <div className="n-card-content">
        <div className="n-card-quote">❝</div>
        <h3 className="n-card-title">{title}</h3>

        <div className="n-card-meta">
          {publishedAt && (
            <span className="n-card-meta-item">
              <FaCalendarAlt size={14} />
              {new Date(publishedAt).toLocaleDateString("vi-VN")}
            </span>
          )}
          <span className="n-card-meta-item">
            <FaEye size={14} /> {views ?? 0}
          </span>
        </div>

        {excerpt && <p className="n-card-excerpt">{excerpt}</p>}
      </div>

      {thumbnail && thumbnailPosition === "bottom" && (
        <div className="n-card-thumbnail">
          <img src={thumbnail} alt={title} />
        </div>
      )}
    </Link>
  );
};

export default NewsCard;
