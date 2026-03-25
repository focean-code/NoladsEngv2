import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransitionWrapper from "./components/PageTransitionWrapper";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import CityServicesPage from "./pages/CityServicesPage";

// Wrapper component that includes PageTransitionWrapper
const RouteWrapper = ({ children }: { children: ReactNode }) => (
  <PageTransitionWrapper>
    {children}
  </PageTransitionWrapper>
);

export const router = createBrowserRouter([
  { path: "/", element: <RouteWrapper><Index /></RouteWrapper> },
  { path: "/services", element: <RouteWrapper><ServicesPage /></RouteWrapper> },
  { path: "/services/city/:city", element: <RouteWrapper><CityServicesPage /></RouteWrapper> },
  { path: "/services/:serviceId", element: <RouteWrapper><ServiceDetailPage /></RouteWrapper> },
  { path: "/products", element: <RouteWrapper><ProductsPage /></RouteWrapper> },
  { path: "/about", element: <RouteWrapper><AboutPage /></RouteWrapper> },
  { path: "/contact", element: <RouteWrapper><ContactPage /></RouteWrapper> },
  { path: "/blog", element: <RouteWrapper><BlogPage /></RouteWrapper> },
  { path: "/blog/:slug", element: <RouteWrapper><BlogPostPage /></RouteWrapper> },
  { path: "/login", element: <RouteWrapper><LoginPage /></RouteWrapper> },
  {
    path: "/admin",
    element: (
      <RouteWrapper>
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </RouteWrapper>
    ),
  },
  { path: "*", element: <RouteWrapper><NotFound /></RouteWrapper> },
]);
