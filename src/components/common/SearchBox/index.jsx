// SearchBox.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SearchBox.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

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
    <div className="sb-box">
      <input
        type="text"
        className="sb-input"
        placeholder="Tìm tour..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />

      <ul
        className={`sb-dropdown ${
          showDropdown && results.length > 0 ? "sb-dropdown--show" : ""
        }`}
      >
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <li key={idx} className="sb-item sb-skeleton">
              <div className="sb-skel-thumb" />
              <div className="sb-skel-text" />
            </li>
          ))}
        {!loading &&
          results.map((tour) => (
            <li key={tour.slug} className="sb-item">
              <Link to={`/tour/${tour.slug}`} className="sb-link">
                <img
                  src={tour.thumbnail}
                  alt={tour.title}
                  className="sb-thumb"
                />
                <span className="sb-title">{tour.title}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
