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
import TourCategory from "./admin/pages/tour-category/TourCategory";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import TourCategoryCreate from "./admin/pages/tour-category/TourCategoryCreate";
import TourCategoryDetail from "./admin/pages/tour-category/TourCategoryDetail";
import TourCategoryUpdate from "./admin/pages/tour-category/TourCategoryEdit";
import TourManager from "./admin/pages/tour/TourManager";
import TourCreatePage from "./admin/pages/tour/TourCreate";
import AdminTourDetail from "./admin/pages/tour/AdminTourDetail";
import TourEditPage from "./admin/pages/tour/TourEdit";
import AdminLogin from "./admin/pages/Login";
import AdminPrivateRoute from "./admin/components/routes/AdminPrivateRoute";

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
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminPrivateRoute>
                  <AdminLayout />
                </AdminPrivateRoute>
              }
            >
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
              <Route path="tours/create" element={<TourCreatePage />} />
              <Route
                path="tours/detail/:tourId"
                element={<AdminTourDetail />}
              />
              <Route path="tours/edit/:tourId" element={<TourEditPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
