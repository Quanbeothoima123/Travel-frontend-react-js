import React, { useEffect, useState } from "react";
import NewsCard from "../NewsCard";
import "./NewsList.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const NewsList = ({ data }) => {
  const [news, setNews] = useState(data || []);

  useEffect(() => {
    // Nếu không truyền data thì tự fetch
    if (!data) {
      const fetchNews = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/news/published`);
          const json = await res.json();
          if (json.success) {
            setNews(json.data);
          }
        } catch (error) {
          console.error("Error fetching news:", error);
        }
      };
      fetchNews();
    }
  }, [data]);

  if (!news || news.length === 0) {
    return <p className="n-list-empty">Chưa có bài viết nào.</p>;
  }

  return (
    <div className="n-list">
      {news.map((item, index) => (
        <NewsCard
          key={item._id}
          data={item}
          thumbnailPosition={index % 2 === 0 ? "top" : "bottom"}
        />
      ))}
    </div>
  );
};

export default NewsList;
