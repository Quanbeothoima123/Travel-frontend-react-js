// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./admin/contexts/AdminContext"; // 👈 Import AdminProvider

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ContactFloating from "./components/common/ContactFloating";
import WeatherWidget from "./components/common/WeatherWidget";

import FlightSearchPage from "./pages/FlightSearchPage";

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
import FriendsPage from "./pages/FriendPage";
import GalleryPage from "./pages/GalleryPage";
import GalleryDetailPage from "./pages/GalleryDetailPage";
import MomoPaymentResultPage from "./pages/MomoPaymentResultPage";
import HistoryTourOrder from "./pages/HistoryTourOrder";
import UploadShortVideo from "./components/common/UploadShortVideo";
import Shorts from "./pages/Shorts";
import ChatPage from "./pages/ChatPage";

// 👈 Import SupportChatWidget
import SupportChatWidget from "./components/common/SupportChatWidget";

import AdminLayout from "./admin/components/layout/AdminLayout";
import AdminLogin from "./admin/pages/Login";
import AdminPrivateRoute from "./admin/components/routes/AdminPrivateRoute";

import BookingManagement from "./admin/pages/BookingManagement";

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
import NewsManager from "./admin/pages/news/NewsManager";
import NewsCreate from "./admin/pages/news/NewsCreate";
import NewsEdit from "./admin/pages/news/NewsEdit";
import NewsDetail from "./admin/pages/news/NewsDetail";

// Quản lí danh mục gallery
import GalleryCategoryManager from "./admin/pages/gallery-category/GalleryCategoryManager";
import GalleryCategoryCreate from "./admin/pages/gallery-category/GalleryCategoryCreate";
import GalleryCategoryEdit from "./admin/pages/gallery-category/GalleryCategoryEdit";
import GalleryCategoryDetail from "./admin/pages/gallery-category/GalleryCategoryDetail";

// Quản lí gallery
import GalleryManager from "./admin/pages/gallery/GalleryManager";
import GalleryCreate from "./admin/pages/gallery/GalleryCreate";
import GalleryEdit from "./admin/pages/gallery/GalleryEdit";
import GalleryDetail from "./admin/pages/gallery/GalleryDetail";

// Quản lí tour
import TourManager from "./admin/pages/tour/TourManager";
import TourCreatePage from "./admin/pages/tour/TourCreate";
import AdminTourDetail from "./admin/pages/tour/AdminTourDetail";
import TourEditPage from "./admin/pages/tour/TourEdit";

import SiteConfig from "./admin/pages/SiteConfig";
import AboutUsManager from "./admin/pages/AboutUsManager";

// 👈 Import Admin Support Page
import AdminSupportPage from "./admin/pages/AdminSupportPage";

import UserManagement from "./admin/pages/user-account/UserManagerment";

import PermissionsManagement from "./admin/pages/PermissionsManagement";

import RolePermissionsAssignment from "./admin/pages/RolePermissionsAssignment";

import RolesManagement from "./admin/pages/RolesManagement";

import AdminAccountsManagement from "./admin/pages/admin-account/AdminAccountsManagement";

// Component để xử lý hiển thị Header, Footer và ContactFloating có điều kiện
function AppContent() {
  const location = useLocation();

  // Ẩn Header, Footer và ContactFloating khi ở /user/* và /admin/*
  const hideLayoutComponents =
    location.pathname.startsWith("/user") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {/* Header chỉ hiển thị trên trang public */}
      {!hideLayoutComponents && <Header />}

      <div className={!hideLayoutComponents ? "main-content" : ""}>
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
          <Route path="/gallery/:categorySlug" element={<GalleryPage />} />
          <Route path="/gallery/detail/:slug" element={<GalleryDetailPage />} />
          <Route path="/shorts" element={<Shorts />} />

          <Route
            path="/service/tra-cuu-chuyen-bay"
            element={<FlightSearchPage />}
          />
          <Route
            path="/payment/momo/result"
            element={<MomoPaymentResultPage />}
          />

          {/* User dashboard routes */}
          <Route path="/user/*" element={<UserLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="transactions_tour" element={<HistoryTourOrder />} />
            <Route
              path="transactions_service"
              element={<div>Lịch sử sử dụng dịch vụ</div>}
            />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="upload/videos" element={<UploadShortVideo />} />
            <Route path="posts" element={<div>Bài viết cá nhân</div>} />
            <Route path="favorites" element={<div>Tour yêu thích</div>} />
            <Route path="coupons" element={<div>Mã giảm giá</div>} />
            <Route path="support" element={<div>Liên hệ hỗ trợ</div>} />
            <Route path="dark-mode" element={<div>Chế độ tối</div>} />

            {/* Chat routes */}
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:chatId" element={<ChatPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminPrivateRoute>
                <AdminProvider>
                  {/*  Wrap AdminLayout với AdminProvider */}
                  <AdminLayout />
                </AdminProvider>
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
            <Route
              path="news-category/create"
              element={<NewsCategoryCreate />}
            />
            <Route
              path="news-category/detail/:id"
              element={<NewsCategoryDetail />}
            />
            <Route
              path="news-category/edit/:id"
              element={<NewsCategoryEdit />}
            />

            <Route path="news" element={<NewsManager />} />
            <Route path="news/create" element={<NewsCreate />} />
            <Route path="news/edit/:id" element={<NewsEdit />} />
            <Route path="news/detail/:id" element={<NewsDetail />} />

            <Route
              path="gallery-category"
              element={<GalleryCategoryManager />}
            />
            <Route
              path="gallery-category/create"
              element={<GalleryCategoryCreate />}
            />
            <Route
              path="gallery-category/edit/:id"
              element={<GalleryCategoryEdit />}
            />
            <Route
              path="gallery-category/detail/:id"
              element={<GalleryCategoryDetail />}
            />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="gallery/create" element={<GalleryCreate />} />
            <Route path="gallery/edit/:id" element={<GalleryEdit />} />
            <Route path="gallery/detail/:id" element={<GalleryDetail />} />

            <Route path="config-basic" element={<SiteConfig />} />

            <Route path="about-us" element={<AboutUsManager />} />

            <Route path="booking-tour" element={<BookingManagement />} />

            {/*  Route Admin Support */}
            <Route path="support" element={<AdminSupportPage />} />

            <Route path="roles" element={<RolesManagement />} />

            <Route path="permissions" element={<PermissionsManagement />} />

            <Route
              path="role-permissions"
              element={<RolePermissionsAssignment />}
            />
            <Route path="accounts" element={<AdminAccountsManagement />} />

            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </div>

      {/* ContactFloating chỉ hiển thị trên trang public */}
      {!hideLayoutComponents && <ContactFloating />}

      {/*  SupportChatWidget - Hiển thị trên tất cả trang PUBLIC (không hiển thị ở admin) */}
      {!location.pathname.startsWith("/admin") && <SupportChatWidget />}

      {/* WeatherWidget chỉ hiển thị trên trang public */}
      {!hideLayoutComponents && <WeatherWidget />}

      {/* Footer chỉ hiển thị trên trang public */}
      {!hideLayoutComponents && <Footer />}
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
