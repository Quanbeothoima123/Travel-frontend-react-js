// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import DetailTour from "./pages/DetailTour";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tour/:slug" element={<DetailTour />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
