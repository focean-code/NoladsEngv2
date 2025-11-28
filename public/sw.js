/**
 * Service Worker for Nolads Engineering
 * Provides offline support and caching strategy
 */

const CACHE_NAME = "nolads-engineering-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/client/App.tsx",
  "/client/global.css",
];

// Note: API routes now handled by Supabase, no local /api caching needed

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("Service Worker: Static files cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Bypass API requests entirely (no SW caching/interception)
  if (url.pathname.startsWith("/api")) {
    return;
  }

  // Handle different types of requests
  if (url.pathname === "/") {
    // Homepage - cache first, then network
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith("/uploads/")) {
    // Uploaded files - cache first, then network
    event.respondWith(cacheFirst(request));
  } else {
    // Other static files - cache first, then network
    event.respondWith(cacheFirst(request));
  }
});

// Cache First Strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Cache First Strategy Error:", error);

    // Return offline page for navigation requests
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }

    throw error;
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Network First Strategy Error:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response for API requests
    return new Response(
      JSON.stringify({
        error: "Network error",
        message: "Please check your connection and try again",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any pending offline actions
    console.log("Service Worker: Performing background sync");

    // Example: Sync offline form submissions
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      for (const data of offlineData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body,
          });
          await removeOfflineData(data.id);
        } catch (error) {
          console.error("Background sync error:", error);
        }
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data
      ? event.data.text()
      : "New notification from Nolads Engineering",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon.ico",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Nolads Engineering", options),
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Utility functions for offline data management
async function getOfflineData() {
  // Implementation for storing/retrieving offline data
  // This would typically use IndexedDB or localStorage
  return [];
}

async function removeOfflineData(id) {
  // Implementation for removing offline data
  console.log("Removing offline data:", id);
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log("Service Worker: Loaded");
