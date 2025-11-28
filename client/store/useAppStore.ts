import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface QuoteItem {
  productId: string;
  quantity: number;
  customizations?: Record<string, any>;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface AppState {
  // UI State
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  theme: 'light' | 'dark';
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Cart/Quote State
  selectedProducts: string[];
  quoteItems: QuoteItem[];
  
  // Notifications
  notifications: Notification[];
  
  // Form State
  contactFormData: Record<string, any>;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // User Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Product Actions
  addSelectedProduct: (productId: string) => void;
  removeSelectedProduct: (productId: string) => void;
  clearSelectedProducts: () => void;
  
  // Quote Actions
  addToQuote: (item: QuoteItem) => void;
  removeFromQuote: (productId: string) => void;
  updateQuoteItem: (productId: string, updates: Partial<QuoteItem>) => void;
  clearQuote: () => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Form Actions
  updateContactForm: (data: Record<string, any>) => void;
  clearContactForm: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      isLoading: false,
      isMobileMenuOpen: false,
      theme: 'light',
      user: null,
      isAuthenticated: false,
      selectedProducts: [],
      quoteItems: [],
      notifications: [],
      contactFormData: {},
      
      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setTheme: (theme) => set({ theme }),
      
      // User Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        selectedProducts: [],
        quoteItems: [],
        contactFormData: {}
      }),
      
      // Product Actions
      addSelectedProduct: (productId) => set((state) => ({
        selectedProducts: state.selectedProducts.includes(productId)
          ? state.selectedProducts
          : [...state.selectedProducts, productId]
      })),
      removeSelectedProduct: (productId) => set((state) => ({
        selectedProducts: state.selectedProducts.filter(id => id !== productId)
      })),
      clearSelectedProducts: () => set({ selectedProducts: [] }),
      
      // Quote Actions
      addToQuote: (item) => set((state) => {
        const existingIndex = state.quoteItems.findIndex(
          qi => qi.productId === item.productId
        );
        
        if (existingIndex >= 0) {
          const updatedItems = [...state.quoteItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + item.quantity
          };
          return { quoteItems: updatedItems };
        }
        
        return { quoteItems: [...state.quoteItems, item] };
      }),
      removeFromQuote: (productId) => set((state) => ({
        quoteItems: state.quoteItems.filter(item => item.productId !== productId)
      })),
      updateQuoteItem: (productId, updates) => set((state) => ({
        quoteItems: state.quoteItems.map(item =>
          item.productId === productId ? { ...item, ...updates } : item
        )
      })),
      clearQuote: () => set({ quoteItems: [] }),
      
      // Notification Actions
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Date.now().toString(),
            timestamp: Date.now(),
            read: false
          },
          ...state.notifications
        ]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(notif => notif.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Form Actions
      updateContactForm: (data) => set((state) => ({
        contactFormData: { ...state.contactFormData, ...data }
      })),
      clearContactForm: () => set({ contactFormData: {} })
    }),
    {
      name: 'nolads-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        selectedProducts: state.selectedProducts,
        quoteItems: state.quoteItems,
        contactFormData: state.contactFormData,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useSelectedProducts = () => useAppStore(state => state.selectedProducts);
export const useQuoteItems = () => useAppStore(state => state.quoteItems);
export const useNotifications = () => useAppStore(state => state.notifications);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useTheme = () => useAppStore(state => state.theme);