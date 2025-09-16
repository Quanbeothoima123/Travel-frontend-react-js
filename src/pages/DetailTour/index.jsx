// src/pages/DetailTour.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TourCarousel from "../../../src/components/common/TourCarousel";
import TourInfo from "../../../src/components/common/TourInfo";
import TourExperience from "../../../src/components/common/TourExperience";
import TourSchedule from "../../../src/components/common/TourSchedule";
import TourTerms from "../../../src/components/common/TourTerms";
import "./DetailTour.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

const DetailTour = () => {
  const { slug } = useParams();
  const [tourDetail, setTourDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTourDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/tours/tour-detail/${slug}`);
        if (!res.ok) throw new Error("Không thể tải chi tiết tour");
        const data = await res.json();
        setTourDetail(data.tourDetail);
      } catch (err) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [slug]);

  if (loading) return <div className="dt-loading">Đang tải...</div>;
  if (error) return <div className="dt-error">Lỗi: {error}</div>;

  return (
    <div className="dt-detail-tour">
      <div className="dt-main-content">
        <div className="dt-left-column">
          <TourCarousel
            thumbnail={tourDetail?.thumbnail}
            images={tourDetail?.images || []}
          />
          <TourExperience tour={tourDetail} />
          <TourSchedule tour={tourDetail} />
          <TourTerms terms={tourDetail.term} />
        </div>
        <div className="dt-right-column">
          <TourInfo tourDetail={tourDetail} />
        </div>
      </div>
    </div>
  );
};

export default DetailTour;
