import React from "react";
import "./DepartPlacesInput.css";
const DepartPlacesInput = ({ departPlace, setDepartPlace }) => {
  return (
    <div className="depart-places-input">
      <h4>Điểm khởi hành</h4>
      <div className="depart-form">
        <input
          type="text"
          placeholder="Tên địa điểm"
          value={departPlace.place || ""}
          onChange={(e) =>
            setDepartPlace({ ...departPlace, place: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Google Map URL"
          value={departPlace.googleMap || ""}
          onChange={(e) =>
            setDepartPlace({ ...departPlace, googleMap: e.target.value })
          }
        />
      </div>

      {departPlace.place && (
        <p>
          {departPlace.place}{" "}
          {departPlace.googleMap && (
            <a href={departPlace.googleMap} target="_blank" rel="noreferrer">
              (Google Map)
            </a>
          )}
        </p>
      )}
    </div>
  );
};

export default DepartPlacesInput;
