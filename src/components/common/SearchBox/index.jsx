import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SearchBox.css";

export default function SearchBox({ setQuery }) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!input || input.length < 2) {
      setResults([]);
      setQuery("");
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/tours/search-combined?query=${input}`
        );
        const data = await res.json();
        setResults(data.data || []);
        setQuery(input);
        setShowDropdown(true); // chỉ bật dropdown khi có kết quả
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [input]);

  return (
    <div
      className="search-box"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)} // hover ra ngoài -> ẩn
    >
      <input
        type="text"
        className="search-input"
        placeholder="Tìm tour..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)} // focus vào -> hiện
      />

      <ul
        className={`search-dropdown ${
          showDropdown && results.length > 0 ? "show" : ""
        }`}
      >
        {loading && <li className="search-item">Đang tìm kiếm...</li>}
        {!loading &&
          results.map((tour) => (
            <li key={tour.slug} className="search-item">
              <Link to={`/tour/${tour.slug}`} className="search-link">
                <img
                  src={tour.thumbnail}
                  alt={tour.title}
                  className="search-thumb"
                />
                <span className="search-title">{tour.title}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
