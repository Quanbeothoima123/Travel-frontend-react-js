// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import DetailTour from "./pages/DetailTour";
import Login from "./pages/Auth/Login";
import UserLayout from "./components/layout/UserLayout";
import UserProfile from "./components/common/UserProfile";
import Register from "./pages/Auth/Register";
import BookingPage from "./pages/BookingPage";
import RepayPage from "./pages/RePay";
import ReAuthFlow from "./pages/ReAuthFlow";
import SearchPage from "./pages/SearchPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import MomoPaymentResultPage from "./pages/MomoPaymentResultPage";
import HistoryTourOrder from "./pages/HistoryTourOrder";
import AdminLayout from "./admin/components/layout/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
// Quản lí danh mục tour
import TourCategoryManager from "./admin/pages/tour-category/TourCategoryManager";
import TourCategoryCreate from "./admin/pages/tour-category/TourCategoryCreate";
import TourCategoryDetail from "./admin/pages/tour-category/TourCategoryDetail";
import TourCategoryUpdate from "./admin/pages/tour-category/TourCategoryEdit";
// Quản lí danh mục tin tức
import NewsCategoryManager from "./admin/pages/news-category/NewsCategoryManager";
import NewsCategoryCreate from "./admin/pages/news-category/NewsCategoryCreate";
import NewsCategoryDetail from "./admin/pages/news-category/NewsCategoryDetail";
import NewsCategoryEdit from "./admin/pages/news-category/NewsCategoryEdit";
// Quản lí tin tức
import NewsCreate from "./admin/pages/news/NewsCreate";
// Quản lí tour
import TourManager from "./admin/pages/tour/TourManager";
import TourCreatePage from "./admin/pages/tour/TourCreate";
import AdminTourDetail from "./admin/pages/tour/AdminTourDetail";
import TourEditPage from "./admin/pages/tour/TourEdit";

import AdminLogin from "./admin/pages/Login";

import AdminPrivateRoute from "./admin/components/routes/AdminPrivateRoute";

// Component để xử lý hiển thị Header có điều kiện
function AppContent() {
  const location = useLocation();

  // Ẩn Header khi ở /user/* và /admin/*
  const hideHeader =
    location.pathname.startsWith("/user") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/tour/:slug" element={<DetailTour />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/re-auth" element={<ReAuthFlow />} />
        <Route path="/booking-tour/:slug" element={<BookingPage />} />
        <Route path="/repay/:invoiceId" element={<RepayPage />} />
        <Route path="/search/tours/:categorySlug" element={<SearchPage />} />
        <Route path="/news/:newsCategorySlug" element={<NewsPage />} />
        <Route path="/news/detail/:newsSlug" element={<NewsDetailPage />} />
        <Route
          path="/payment/momo/result"
          element={<MomoPaymentResultPage />}
        />

        {/* User dashboard routes */}
        <Route path="/user/*" element={<UserLayout />}>
          {/* Redirect mặc định */}
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="transactions_tour" element={<HistoryTourOrder />} />
          <Route
            path="transactions_service"
            element={<div>Lịch sử sử dụng dịch vụ</div>}
          />
          <Route path="posts" element={<div>Bài viết cá nhân</div>} />
          <Route path="favorites" element={<div>Tour yêu thích</div>} />
          <Route path="coupons" element={<div>Mã giảm giá</div>} />
          <Route path="support" element={<div>Liên hệ hỗ trợ</div>} />
          <Route path="dark-mode" element={<div>Chế độ tối</div>} />
        </Route>

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
          <Route path="tour-categories" element={<TourCategoryManager />} />
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
          <Route path="tours/detail/:tourId" element={<AdminTourDetail />} />
          <Route path="tours/edit/:tourId" element={<TourEditPage />} />
          <Route path="news-category" element={<NewsCategoryManager />} />
          <Route path="news-category/create" element={<NewsCategoryCreate />} />
          <Route
            path="news-category/detail/:id"
            element={<NewsCategoryDetail />}
          />
          <Route path="news-category/edit/:id" element={<NewsCategoryEdit />} />
          <Route path="news/create" element={<NewsCreate />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
