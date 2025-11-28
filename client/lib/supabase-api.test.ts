import { describe, it, expect, beforeAll } from 'vitest';
import { api } from '../lib/supabase-api';

describe('Supabase API Integration Tests', () => {
  // Test Services
  describe('Services', () => {
    it('should fetch all services', async () => {
      const result = await api.services.getAll();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should fetch featured services', async () => {
      const result = await api.services.getFeatured();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // Test Products
  describe('Products', () => {
    it('should fetch all products', async () => {
      const result = await api.products.getAll();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should fetch featured products', async () => {
      const result = await api.products.getFeatured();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // Test Company Info
  describe('Company Info', () => {
    it('should fetch company info', async () => {
      const result = await api.company.getInfo();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('stats');
    });

    it('should fetch company stats', async () => {
      const result = await api.company.getStats();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('established');
      expect(result.data).toHaveProperty('workforce');
    });

    it('should fetch company contacts', async () => {
      const result = await api.company.getContact();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('offices');
      expect(result.data).toHaveProperty('keyPersonnel');
    });

    it('should fetch company registration', async () => {
      const result = await api.company.getRegistration();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('incorporationCertificate');
    });
  });

  // Test Testimonials
  describe('Testimonials', () => {
    it('should fetch all testimonials', async () => {
      const result = await api.testimonials.getAll();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should fetch featured testimonials', async () => {
      const result = await api.testimonials.getFeatured();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // Test Quotes
  describe('Quotes', () => {
    it('should fetch all quotes', async () => {
      const result = await api.quotes.getAll();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
