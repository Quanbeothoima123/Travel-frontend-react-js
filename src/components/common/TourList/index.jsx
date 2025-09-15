import React, { useEffect, useState } from "react";
import TourCard from "../TourCard";
import "./TourList.css";

const TourList = ({ endpoint }) => {
  const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;
  const [tours, setTours] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/${endpoint}`)
      .then((response) => response.json())
      .then((data) => setTours(data))
      .catch((error) => console.error("Error fetching tours:", error));
  }, [endpoint]);

  return (
    <div className="tour-list">
      {tours.slice(0, 9).map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </div>
  );
};

export default TourList;
