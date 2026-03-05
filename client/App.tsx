import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NotificationSystem from "./components/NotificationSystem";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoading from "./components/LoadingStates";
import { router } from "./router";
import { AuthProvider } from "./hooks/useAuth";
import { initializePWA } from "./lib/pwa";
import { initPostHog } from "./lib/posthog";
// auth-debug only runs in development via its own guard
import "./lib/auth-debug";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
    // Initialize PostHog analytics
    initPostHog();
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
