// src/pages/DetailTour.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TourCarousel from "../../../src/components/common/TourCarousel";
import TourInfo from "../../../src/components/common/TourInfo";
import TourExperience from "../../../src/components/common/TourExperience";
import TourSchedule from "../../../src/components/common/TourSchedule";
import TourTerms from "../../../src/components/common/TourTerms";
import "./DetailTour.css";

const DetailTour = () => {
  const { slug } = useParams(); // Lấy slug từ URL
  const [tourDetail, setTourDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/tour-detail/${slug}`
        );
        if (!response.ok) throw new Error("Failed to fetch tour details");
        const data = await response.json();
        setTourDetail(data.tourDetail);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="detail-tour">
      <div className="main-content">
        <div className="left-column">
          <TourCarousel
            thumbnail={tourDetail?.thumbnail}
            images={tourDetail?.images || []}
          />
          <TourExperience tour={tourDetail} />
          <TourSchedule tour={tourDetail} />
          <TourTerms terms={tourDetail.term} />
        </div>
        <div className="right-column">
          <TourInfo tourDetail={tourDetail} />
        </div>
      </div>
    </div>
  );
};

export default DetailTour;
