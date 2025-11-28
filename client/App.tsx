import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NotificationSystem from "./components/NotificationSystem";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoading from "./components/LoadingStates";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransitionWrapper from './components/PageTransitionWrapper';
import { router } from "./router";
import { AuthProvider } from "./hooks/useAuth";
import { initializePWA } from "./lib/pwa";
import "./lib/auth-debug"; // Import debug utility


// Lazy load pages for code splitting
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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationSystem />
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </Suspense>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

// Ensure no direct usage of <App />; use <Root /> instead
export default App;
