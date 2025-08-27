// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import DetailTour from "./pages/DetailTour";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import BookingPage from "./pages/BookingPage";
import ReAuthFlow from "./pages/ReAuthFlow";
import SearchPage from "./pages/SearchPage";
import AdminLayout from "./admin/components/layout/AdminLayout";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* User routes */}
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tour/:slug" element={<DetailTour />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/re-auth" element={<ReAuthFlow />} />
                    <Route
                      path="/booking-tour/:slug"
                      element={<BookingPage />}
                    />
                    <Route
                      path="/search/tours/:categorySlug"
                      element={<SearchPage />}
                    />
                  </Routes>
                </>
              }
            />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminLayout />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
