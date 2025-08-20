// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import DetailTour from "./pages/DetailTour";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ReAuthFlow from "./pages/ReAuthFlow";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <Router>
      <ToastProvider>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tour/:slug" element={<DetailTour />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/re-auth" element={<ReAuthFlow />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
