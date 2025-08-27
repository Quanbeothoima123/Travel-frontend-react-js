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
import TourCategory from "./admin/pages/TourCategory";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import TourCategoryCreate from "./admin/pages/TourCategoryCreate";
import TourCategoryDetail from "./admin/pages/TourCategoryDetail";
import TourCategoryUpdate from "./admin/pages/TourCategoryEdit";
import TourManager from "./admin/pages/TourManager";

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
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="tour-categories" element={<TourCategory />} />
              <Route
                path="tour-categories/create"
                element={<TourCategoryCreate />}
              />
              <Route
                path="tour-categories/detail/:id"
                element={<TourCategoryDetail />}
              />
              <Route
                path="tour-categories/update/:id"
                element={<TourCategoryUpdate />}
              />
              <Route path="tours" element={<TourManager />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
