// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header/Header";
// Import các component trang (tạo mới nếu chưa có)
import Home from "./pages/Home/Home";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
