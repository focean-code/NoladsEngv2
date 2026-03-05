type EventCallback = (...args: any[]) => void;

class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  publish(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }
}

// Create a singleton instance
const eventBus = new EventBus();
export default eventBus;

// Event types
export const CONTENT_UPDATED = {
  PRODUCTS: 'products-updated',
  SERVICES: 'services-updated',
  BLOG: 'blog-updated',
} as const;
