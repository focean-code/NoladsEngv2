/**
 * Advanced Accessibility System
 * Screen reader optimization, ARIA support, and keyboard navigation
 */

import React from 'react';

// Accessibility configuration
interface AccessibilityConfig {
  enableAnnouncements: boolean;
  enableFocusManagement: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReaderOptimization: boolean;
  announcementDelay: number;
}

// Live region types
type LiveRegionType = 'polite' | 'assertive' | 'off';

// Focus trap configuration
interface FocusTrapConfig {
  returnFocus: boolean;
  clickOutsideDeactivates: boolean;
  escapeDeactivates: boolean;
}

// Accessibility class
export class Accessibility {
  private config: AccessibilityConfig;
  private liveRegions: Map<string, HTMLElement> = new Map();
  private focusHistory: HTMLElement[] = [];
  private isInitialized = false;

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableAnnouncements: true,
      enableFocusManagement: true,
      enableKeyboardNavigation: true,
      enableScreenReaderOptimization: true,
      announcementDelay: 100,
      ...config
    };
  }

  // Initialize accessibility system
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    if (this.config.enableScreenReaderOptimization) {
      this.optimizeForScreenReaders();
    }

    // Create live regions
    this.createLiveRegions();
  }

  // Setup focus management
  private setupFocusManagement() {
    // Track focus history
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target && target !== document.body) {
        this.focusHistory.push(target);
        // Keep only last 10 elements
        if (this.focusHistory.length > 10) {
          this.focusHistory.shift();
        }
      }
    });

    // Handle focus restoration
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.focusHistory.length > 0) {
        const lastFocused = this.focusHistory[this.focusHistory.length - 1];
        if (lastFocused && document.contains(lastFocused)) {
          lastFocused.focus();
        }
      }
    });
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation() {
    // Handle tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }

      // Handle escape key
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }

      // Handle arrow keys for custom navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }
    });
  }

  // Handle tab navigation
  private handleTabNavigation(e: KeyboardEvent) {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (e.shiftKey) {
      // Tab backwards
      if (currentIndex <= 0) {
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
    } else {
      // Tab forwards
      if (currentIndex >= focusableElements.length - 1) {
        e.preventDefault();
        focusableElements[0]?.focus();
      }
    }
  }

  // Handle escape key
  private handleEscapeKey(e: KeyboardEvent) {
    // Close modals, dropdowns, etc.
    const event = new CustomEvent('escapeKey', { detail: { originalEvent: e } });
    window.dispatchEvent(event);
  }

  // Handle arrow navigation
  private handleArrowNavigation(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const role = target.getAttribute('role');
    const isInList = target.closest('[role="listbox"], [role="menu"], [role="tablist"]');

    if (isInList) {
      e.preventDefault();
      this.navigateInList(target, e.key);
    }
  }

  // Navigate within a list
  private navigateInList(currentElement: HTMLElement, direction: string) {
    const list = currentElement.closest('[role="listbox"], [role="menu"], [role="tablist"]');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]')) as HTMLElement[];
    const currentIndex = items.indexOf(currentElement);

    let nextIndex = currentIndex;

    switch (direction) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
    }

    items[nextIndex]?.focus();
  }

  // Get all focusable elements
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]'
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(','))) as HTMLElement[];
  }

  // Optimize for screen readers
  private optimizeForScreenReaders() {


    // Enhance form labels
    this.enhanceFormLabels();

    // Add ARIA landmarks
    this.addAriaLandmarks();

    // Optimize images
    this.optimizeImages();
  }



  // Enhance form labels
  private enhanceFormLabels() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id;
      const type = inputElement.type;

      // Add aria-describedby for help text
      const helpText = inputElement.getAttribute('aria-describedby');
      if (!helpText && inputElement.nextElementSibling?.classList.contains('help-text')) {
        const helpId = `help-${id}`;
        inputElement.nextElementSibling.id = helpId;
        inputElement.setAttribute('aria-describedby', helpId);
      }

      // Add aria-required for required fields
      if (inputElement.required && !inputElement.hasAttribute('aria-required')) {
        inputElement.setAttribute('aria-required', 'true');
      }

      // Add aria-invalid for validation
      if (inputElement.classList.contains('error') && !inputElement.hasAttribute('aria-invalid')) {
        inputElement.setAttribute('aria-invalid', 'true');
      }
    });
  }

  // Add ARIA landmarks
  private addAriaLandmarks() {
    // Main content
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main && !main.id) {
      main.id = 'main-content';
    }

    // Navigation
    const nav = document.querySelector('nav');
    if (nav && !nav.id) {
      nav.id = 'navigation';
    }

    // Footer
    const footer = document.querySelector('footer');
    if (footer && !footer.id) {
      footer.id = 'footer';
    }
  }

  // Optimize images
  private optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      
      // Add alt text if missing
      if (!imgElement.alt && !imgElement.hasAttribute('aria-label')) {
        imgElement.setAttribute('aria-label', 'Image');
      }

      // Mark decorative images
      if (imgElement.alt === '' && !imgElement.hasAttribute('role')) {
        imgElement.setAttribute('role', 'presentation');
      }
    });
  }

  // Create live regions
  private createLiveRegions() {
    const regions = [
      { id: 'status', type: 'polite' as LiveRegionType },
      { id: 'alert', type: 'assertive' as LiveRegionType },
      { id: 'log', type: 'polite' as LiveRegionType }
    ];

    regions.forEach(region => {
      const element = document.createElement('div');
      element.id = region.id;
      element.setAttribute('aria-live', region.type);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;

      document.body.appendChild(element);
      this.liveRegions.set(region.id, element);
    });
  }

  // Announce to screen readers
  announce(message: string, type: LiveRegionType = 'polite', regionId = 'status') {
    if (!this.config.enableAnnouncements) return;

    const region = this.liveRegions.get(regionId);
    if (!region) return;

    // Clear previous content
    region.textContent = '';

    // Add new message after a brief delay
    setTimeout(() => {
      region.textContent = message;
    }, this.config.announcementDelay);
  }

  // Focus trap
  focusTrap(element: HTMLElement, config: Partial<FocusTrapConfig> = {}) {
    const trapConfig: FocusTrapConfig = {
      returnFocus: true,
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
      ...config
    };

    const focusableElements = this.getFocusableElements().filter(el => 
      element.contains(el)
    );

    if (focusableElements.length === 0) return;

    let previouslyFocused = document.activeElement as HTMLElement;

    // Focus first element
    focusableElements[0].focus();

    // Handle tab navigation within trap
    const handleTab = (e: KeyboardEvent) => {
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

      if (e.shiftKey) {
        if (currentIndex <= 0) {
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
      } else {
        if (currentIndex >= focusableElements.length - 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
      }
    };

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (trapConfig.escapeDeactivates) {
        e.preventDefault();
        this.removeFocusTrap();
        if (trapConfig.returnFocus && previouslyFocused) {
          previouslyFocused.focus();
        }
      }
    };

    // Handle click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (trapConfig.clickOutsideDeactivates && !element.contains(e.target as Node)) {
        this.removeFocusTrap();
        if (trapConfig.returnFocus && previouslyFocused) {
          previouslyFocused.focus();
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Store cleanup function
    const cleanup = () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };

    // Store cleanup function on element
    (element as any)._focusTrapCleanup = cleanup;

    return cleanup;
  }

  // Remove focus trap
  removeFocusTrap(element?: HTMLElement) {
    if (element && (element as any)._focusTrapCleanup) {
      (element as any)._focusTrapCleanup();
      delete (element as any)._focusTrapCleanup;
    }
  }

  // Get focus history
  getFocusHistory(): HTMLElement[] {
    return [...this.focusHistory];
  }

  // Restore focus to last focused element
  restoreFocus() {
    if (this.focusHistory.length > 0) {
      const lastFocused = this.focusHistory[this.focusHistory.length - 1];
      if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus();
        return true;
      }
    }
    return false;
  }

  // Check if element is visible to screen readers
  isVisibleToScreenReader(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const isHidden = style.display === 'none' || 
                    style.visibility === 'hidden' || 
                    style.opacity === '0' ||
                    element.hasAttribute('hidden') ||
                    element.getAttribute('aria-hidden') === 'true';

    return !isHidden;
  }

  // Get accessible name
  getAccessibleName(element: HTMLElement): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check for associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    // Fallback to title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Fallback to alt text for images
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      if (alt) return alt;
    }

    return '';
  }

  // Get accessible description
  getAccessibleDescription(element: HTMLElement): string {
    // Check aria-describedby
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descElement = document.getElementById(ariaDescribedBy);
      if (descElement) return descElement.textContent || '';
    }

    // Check aria-description
    const ariaDescription = element.getAttribute('aria-description');
    if (ariaDescription) return ariaDescription;

    return '';
  }

  // Validate ARIA attributes
  validateARIA(element: HTMLElement): string[] {
    const errors: string[] = [];

    // Check for invalid ARIA attributes
    const ariaAttributes = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('aria-'));

    ariaAttributes.forEach(attr => {
      const value = attr.value;
      const name = attr.name;

      // Check for empty values
      if (value === '') {
        errors.push(`Empty ARIA attribute: ${name}`);
      }

      // Check for invalid boolean values
      if (['aria-hidden', 'aria-expanded', 'aria-selected', 'aria-checked', 'aria-pressed'].includes(name)) {
        if (!['true', 'false'].includes(value)) {
          errors.push(`Invalid boolean value for ${name}: ${value}`);
        }
      }

      // Check for invalid role values
      if (name === 'role') {
        const validRoles = [
          'button', 'link', 'menuitem', 'menubar', 'menu', 'listbox', 'option',
          'tab', 'tablist', 'tabpanel', 'dialog', 'alert', 'status', 'log',
          'main', 'navigation', 'banner', 'contentinfo', 'complementary',
          'search', 'form', 'region', 'article', 'section'
        ];
        if (!validRoles.includes(value)) {
          errors.push(`Invalid role: ${value}`);
        }
      }
    });

    return errors;
  }

  // Generate accessibility report
  generateAccessibilityReport(): object {
    const report = {
      focusableElements: this.getFocusableElements().length,
      imagesWithoutAlt: 0,
      formsWithoutLabels: 0,
      ariaErrors: [] as string[],
      landmarks: {
        main: !!document.querySelector('main, [role="main"]'),
        navigation: !!document.querySelector('nav, [role="navigation"]'),
        banner: !!document.querySelector('header, [role="banner"]'),
        contentinfo: !!document.querySelector('footer, [role="contentinfo"]')
      }
    };

    // Check images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      if (!imgElement.alt && !imgElement.hasAttribute('aria-label')) {
        report.imagesWithoutAlt++;
      }
    });

    // Check forms
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      const hasLabel = inputElement.labels?.length > 0 || 
                      inputElement.hasAttribute('aria-label') ||
                      inputElement.hasAttribute('aria-labelledby');
      
      if (!hasLabel) {
        report.formsWithoutLabels++;
      }

      // Check ARIA errors
      const ariaErrors = this.validateARIA(inputElement);
      report.ariaErrors.push(...ariaErrors);
    });

    return report;
  }
}

// Utility functions
export const trapFocus = (element: HTMLElement, config?: Partial<FocusTrapConfig>) => {
  return accessibility.focusTrap(element, config);
};

export const announce = (message: string, type?: LiveRegionType, regionId?: string) => {
  accessibility.announce(message, type, regionId);
};

export const getAccessibleName = (element: HTMLElement): string => {
  return accessibility.getAccessibleName(element);
};

export const getAccessibleDescription = (element: HTMLElement): string => {
  return accessibility.getAccessibleDescription(element);
};

export const isVisibleToScreenReader = (element: HTMLElement): boolean => {
  return accessibility.isVisibleToScreenReader(element);
};

// React hook for accessibility
export const useAccessibility = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      accessibility.init();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return {
    announce,
    trapFocus,
    getAccessibleName,
    getAccessibleDescription,
    isVisibleToScreenReader,
    generateReport: () => accessibility.generateAccessibilityReport()
  };
};

// Export singleton instance
export const accessibility = new Accessibility();

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  accessibility.init();
}