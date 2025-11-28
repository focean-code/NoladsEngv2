import { useEffect } from "react";

// Safe, conditional loader for Tawk chat widget
// Loads only when env vars are configured and in production by default

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkLoader = () => {
  useEffect(() => {
    const enabledFlag = String(import.meta.env.VITE_ENABLE_TAWK || "production");
    const isProd = import.meta.env.MODE === "production";
    const shouldEnable = enabledFlag === "true" || (enabledFlag === "production" && isProd);

    const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined;
    const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined;

    if (!shouldEnable || !propertyId || !widgetId) {
      console.warn("[TawkLoader] Skipping load (flag/env not set)");
      return;
    }

    try {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const s1 = document.createElement("script");
      const s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s1.addEventListener("error", () => {
        console.warn("[TawkLoader] Failed to load widget script");
      });
      s0?.parentNode?.insertBefore(s1, s0);

      return () => {
        // Best-effort cleanup: remove script tag
        try {
          s1.remove();
        } catch {}
      };
    } catch (err) {
      console.warn("[TawkLoader] Error initializing:", err);
    }
  }, []);

  return null;
};

export default TawkLoader;
