import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SearchBox.css";

export default function SearchBox({ setQuery }) {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
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
          `${API_BASE}/api/v1/tours/search-combined?query=${input}`
        );
        const data = await res.json();
        setResults(data.data || []);
        setQuery(input);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [input, setQuery]);

  return (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="Tìm tour..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // delay nhỏ để kịp click
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
