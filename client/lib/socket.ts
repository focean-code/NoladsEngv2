// Safe socket wrapper for the client.
// - If `socket.io-client` is installed, we use it.
// - If not, we provide a minimal in-memory mock so imports never fail in dev.

// Minimal socket-like interface used across the app
export interface MinimalSocket {
  on: (event: string, cb: (...args: any[]) => void) => void;
  off: (event: string, cb?: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
  connected?: boolean;
}

// In-memory event registry for the mock implementation
const subscribers: Record<string, Set<(...args: any[]) => void>> = {};

// Start with a mock socket that works even without socket.io-client
const mockSocket: MinimalSocket = {
  on(event, cb) {
    (subscribers[event] ||= new Set()).add(cb);
  },
  off(event, cb) {
    if (!cb) {
      delete subscribers[event];
      return;
    }
    subscribers[event]?.delete(cb);
  },
  emit(event, ...args) {
    subscribers[event]?.forEach((fn) => fn(...args));
  },
  connected: false,
};

let singletonSocket: MinimalSocket = mockSocket;

// Only attempt real Socket.IO connection if explicitly enabled.
// This prevents production consoles from being spammed when no Socket.IO server exists.
const enableRealSocket =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env &&
  (import.meta as any).env.VITE_ENABLE_SOCKET === 'true';

if (enableRealSocket) {
  // Attempt to dynamically load socket.io-client if available.
  // This runs in the background; if it succeeds, we replace the mock with the real socket.
  (async () => {
    try {
      // Dynamically import to avoid build-time resolution errors when package is missing
      const { io } = await import('socket.io-client');
      const real = io('/', { transports: ['websocket'] });

      // Replace methods with real socket methods while keeping the same reference
      // so consumers don’t need to re-import
      singletonSocket.on = real.on.bind(real);
      singletonSocket.off = real.off.bind(real);
      singletonSocket.emit = real.emit.bind(real);

      Object.defineProperty(singletonSocket, 'connected', {
        get() {
          return (real as any).connected;
        },
        configurable: true,
      });
    } catch (err) {
      if (typeof console !== 'undefined' && (import.meta as any).env?.DEV) {
        console.warn('[socket] socket.io-client not installed or Socket.IO server not available; using mock socket.');
      }
    }
  })();
}

export function getSocket(): MinimalSocket {
  return singletonSocket;
}
