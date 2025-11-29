import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import PageLoading from "./components/LoadingStates";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransitionWrapper from "./components/PageTransitionWrapper";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DatabaseDemo = lazy(() => import("./components/examples/DatabaseDemo"));
const ConnectionTestPage = lazy(() => import("./pages/ConnectionTestPage"));
const AnimationDemo = lazy(() => import("./components/examples/AnimationDemo"));
const TypographyDemoPage = lazy(() => import("./pages/TypographyDemoPage"));
const CityServicesPage = lazy(() => import("./pages/CityServicesPage"));

// Wrapper component that includes PageTransitionWrapper
const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
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
  { path: "/database-demo", element: <RouteWrapper><DatabaseDemo /></RouteWrapper> },
  { path: "/connection-test", element: <RouteWrapper><ConnectionTestPage /></RouteWrapper> },
  { path: "/animation-demo", element: <RouteWrapper><AnimationDemo /></RouteWrapper> },
  { path: "/typography-demo", element: <RouteWrapper><TypographyDemoPage /></RouteWrapper> },
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
