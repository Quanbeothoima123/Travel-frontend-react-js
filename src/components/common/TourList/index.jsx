import React, { useEffect, useState } from "react";
import TourCard from "../TourCard";
import "./TourList.css";

const TourList = ({ endpoint }) => {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/${endpoint}`)
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
