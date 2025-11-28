// PWA utilities and service worker registration

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const showUpdateNotification = () => {
  // You can integrate this with your notification system
  if (confirm('A new version is available. Would you like to update?')) {
    window.location.reload();
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('Service Worker unregistered');
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

// Check if app is running as PWA
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Install prompt handling
let deferredPrompt: any = null;

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallButton();
    deferredPrompt = null;
  });
};

const showInstallButton = () => {
  // Show install button in your UI
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'block';
  }
};

const hideInstallButton = () => {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
};

export const promptInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);
    deferredPrompt = null;
    hideInstallButton();
  }
};

// Background sync for offline form submissions
export const scheduleBackgroundSync = (tag: string, data?: any) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (data) {
        // Store data for background sync
        localStorage.setItem(`sync-${tag}`, JSON.stringify(data));
      }
      // Check if background sync is supported
      if ('sync' in registration) {
        return (registration as any).sync.register(tag);
      }
      return Promise.resolve();
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
    });
  }
};

// Network status monitoring
export const setupNetworkMonitoring = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('networkstatus', {
      detail: { isOnline }
    }));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
};

// Initialize PWA features
export const initializePWA = () => {
  // Only enable SW and install prompt in production
  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
    setupInstallPrompt();
  } else {
    // In dev: proactively unregister any existing SW controlling this origin
    unregisterServiceWorker();
  }
  setupNetworkMonitoring();
};