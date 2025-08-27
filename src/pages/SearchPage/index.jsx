import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // thêm useNavigate
import SearchBox from "../../components/common/SearchBox";
import CategoryTreeSelect from "../../components/common/DropDownTreeSearch/CategoryTreeSelect";
import TourCard from "../../components/common/TourCard";
import Pagination from "../../components/common/Pagination";
import "./SearchPage.css";

export default function SearchPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate(); // dùng để thay đổi url

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");

  // fetch tour
  const fetchTours = async () => {
    try {
      setLoading(true);

      let url = "";
      if (categorySlug) {
        // lấy từ URL param (trường hợp lần đầu load bằng categorySlug)
        url = `http://localhost:5000/api/v1/tour-list-by-category/${categorySlug}?page=${page}`;
      } else {
        const slugParam = selectedCategory?.slug
          ? `&category=${selectedCategory.slug}`
          : "";
        url = `http://localhost:5000/api/v1/tours/search-combined?query=${encodeURIComponent(
          query
        )}&page=${page}${slugParam}`;
      }
      console.log("Fetch URL:", url);

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        setTours(data);
        setTotalPages(1);
      } else {
        setTours(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [categorySlug, page]);

  // xử lý nút tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);

    // Đẩy category + query lên URL
    let newUrl = "/search/tours";
    if (selectedCategory?.slug) {
      newUrl += `/${selectedCategory.slug}`;
    }

    // query thì đưa lên query string
    const params = new URLSearchParams();
    if (query) params.append("q", query);

    navigate(`${newUrl}?${params.toString()}`);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="tour-list">
          {loading ? (
            <p>Đang tải...</p>
          ) : tours.length > 0 ? (
            tours.map((tour) => <TourCard key={tour._id} tour={tour} />)
          ) : (
            <p>Không có tour nào.</p>
          )}
        </div>

        <div className="search-sidebar">
          <SearchBox setQuery={setQuery} />
          <CategoryTreeSelect
            value={selectedCategory}
            onChange={(node) => setSelectedCategory(node)}
            fetchUrl="http://localhost:5000/api/v1/tour-categories?tree=true"
            placeholder="Chọn loại tour..."
            noDataText="Không có danh mục"
          />
          <button className="search-button" onClick={handleSearch}>
            🔍 Tìm kiếm
          </button>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
