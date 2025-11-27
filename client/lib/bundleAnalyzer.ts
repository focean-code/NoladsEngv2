/**
 * Bundle Analysis and Performance Monitoring
 * Real-time bundle size tracking and performance metrics
 */

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  assetCount: number;
}

// Bundle analysis interface
interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  brotliSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    dependencies: string[];
  }>;
  assets: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  duplicates: Array<{
    name: string;
    count: number;
    totalSize: number;
  }>;
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.metrics = {
      loadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      bundleSize: 0,
      assetCount: 0
    };
  }

  // Start monitoring performance
  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Measure page load time
    this.measureLoadTime();
    
    // Measure Core Web Vitals
    this.measureCoreWebVitals();
    
    // Measure bundle size
    this.measureBundleSize();
    
    // Monitor resource loading
    this.monitorResourceLoading();
  }

  // Measure page load time
  private measureLoadTime() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now();
      });
    } else {
      this.metrics.domContentLoaded = performance.now();
    }

    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      this.logMetrics();
    });
  }

  // Measure Core Web Vitals
  private measureCoreWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          if (fidEntry.processingStart) {
            this.metrics.firstInputDelay = fidEntry.processingStart - entry.startTime;
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += clsEntry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  // Measure bundle size
  private measureBundleSize() {
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    let assetCount = 0;

    resources.forEach((resource) => {
      const resourceTiming = resource as PerformanceResourceTiming;
      if (resourceTiming.initiatorType === 'script' || resourceTiming.initiatorType === 'link') {
        totalSize += resourceTiming.transferSize || 0;
        assetCount++;
      }
    });

    this.metrics.bundleSize = totalSize;
    this.metrics.assetCount = assetCount;
  }

  // Monitor resource loading
  private monitorResourceLoading() {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.analyzeResource(entry as PerformanceResourceTiming);
        }
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  // Analyze individual resource
  private analyzeResource(resource: PerformanceEntry) {
    const resourceTiming = resource as PerformanceResourceTiming;
    const size = (resourceTiming as any).transferSize || 0;
    const duration = resource.duration;
    const name = resource.name;

    // Log slow resources
    if (duration > 1000) {
      console.warn(`Slow resource: ${name} took ${duration.toFixed(2)}ms`);
    }

    // Log large resources
    if (size > 100 * 1024) { // 100KB
      console.warn(`Large resource: ${name} is ${(size / 1024).toFixed(2)}KB`);
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Log metrics to console
  private logMetrics() {
    console.group('🚀 Performance Metrics');
    console.log(`📊 Load Time: ${this.metrics.loadTime.toFixed(2)}ms`);
    console.log(`📊 DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`📊 First Contentful Paint: ${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`📊 Largest Contentful Paint: ${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
    console.log(`📊 First Input Delay: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
    console.log(`📊 Cumulative Layout Shift: ${this.metrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`📦 Bundle Size: ${(this.metrics.bundleSize / 1024).toFixed(2)}KB`);
    console.log(`📦 Asset Count: ${this.metrics.assetCount}`);
    console.groupEnd();
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Bundle analyzer class
export class BundleAnalyzer {
  private analysis: BundleAnalysis;

  constructor() {
    this.analysis = {
      totalSize: 0,
      gzippedSize: 0,
      brotliSize: 0,
      chunks: [],
      assets: [],
      duplicates: []
    };
  }

  // Analyze current bundle
  async analyzeBundle(): Promise<BundleAnalysis> {
    const resources = performance.getEntriesByType('resource');
    const assets: Array<{ name: string; size: number; type: string }> = [];
    const duplicates: Map<string, number> = new Map();

    resources.forEach((resource) => {
      const name = resource.name;
      const size = (resource as PerformanceResourceTiming).transferSize || 0;
      const type = this.getAssetType(name);

      assets.push({ name, size, type });

      // Track duplicates
      const count = duplicates.get(name) || 0;
      duplicates.set(name, count + 1);
    });

    // Calculate totals
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const gzippedSize = totalSize * 0.3; // Rough estimate
    const brotliSize = totalSize * 0.2; // Rough estimate

    // Find actual duplicates
    const actualDuplicates = Array.from(duplicates.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => ({
        name,
        count,
        totalSize: assets.filter(asset => asset.name === name).reduce((sum, asset) => sum + asset.size, 0)
      }));

    this.analysis = {
      totalSize,
      gzippedSize,
      brotliSize,
      chunks: this.analyzeChunks(assets),
      assets,
      duplicates: actualDuplicates
    };

    return this.analysis;
  }

  // Analyze chunks
  private analyzeChunks(assets: Array<{ name: string; size: number; type: string }>) {
    const chunks = new Map<string, { size: number; dependencies: string[] }>();

    assets.forEach(asset => {
      if (asset.type === 'script') {
        const chunkName = this.getChunkName(asset.name);
        const existing = chunks.get(chunkName) || { size: 0, dependencies: [] };
        
        existing.size += asset.size;
        existing.dependencies.push(asset.name);
        
        chunks.set(chunkName, existing);
      }
    });

    return Array.from(chunks.entries()).map(([name, data]) => ({
      name,
      size: data.size,
      gzippedSize: data.size * 0.3,
      dependencies: data.dependencies
    }));
  }

  // Get asset type
  private getAssetType(name: string): string {
    if (name.includes('.js')) return 'script';
    if (name.includes('.css')) return 'style';
    if (name.includes('.woff') || name.includes('.ttf')) return 'font';
    if (name.includes('.png') || name.includes('.jpg') || name.includes('.webp')) return 'image';
    return 'other';
  }

  // Get chunk name
  private getChunkName(name: string): string {
    const match = name.match(/([^/]+)\.js$/);
    return match ? match[1] : 'unknown';
  }

  // Get analysis report
  getReport(): string {
    const { totalSize, gzippedSize, brotliSize, chunks, assets, duplicates } = this.analysis;
    
    let report = '📦 Bundle Analysis Report\n\n';
    report += `Total Size: ${(totalSize / 1024).toFixed(2)}KB\n`;
    report += `Gzipped Size: ${(gzippedSize / 1024).toFixed(2)}KB\n`;
    report += `Brotli Size: ${(brotliSize / 1024).toFixed(2)}KB\n`;
    report += `Asset Count: ${assets.length}\n\n`;

    report += '📊 Chunks:\n';
    chunks.forEach(chunk => {
      report += `  ${chunk.name}: ${(chunk.size / 1024).toFixed(2)}KB\n`;
    });

    if (duplicates.length > 0) {
      report += '\n⚠️ Duplicates:\n';
      duplicates.forEach(dup => {
        report += `  ${dup.name}: ${dup.count}x (${(dup.totalSize / 1024).toFixed(2)}KB)\n`;
      });
    }

    return report;
  }

  // Log analysis to console
  logAnalysis() {
    console.group('📦 Bundle Analysis');
    console.log(this.getReport());
    console.groupEnd();
  }
}

// Performance budget checker
export class PerformanceBudget {
  private budgets: {
    loadTime: number;
    bundleSize: number;
    assetCount: number;
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };

  constructor(budgets = {
    loadTime: 3000,
    bundleSize: 500 * 1024, // 500KB
    assetCount: 20,
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1
  }) {
    this.budgets = budgets;
  }

  // Check if metrics are within budget
  checkBudget(metrics: PerformanceMetrics): Array<{ metric: string; current: number; budget: number; status: 'pass' | 'warn' | 'fail' }> {
    const results = [];

    // Load time
    results.push({
      metric: 'Load Time',
      current: metrics.loadTime,
      budget: this.budgets.loadTime,
      status: this.getStatus(metrics.loadTime, this.budgets.loadTime)
    });

    // Bundle size
    results.push({
      metric: 'Bundle Size',
      current: metrics.bundleSize,
      budget: this.budgets.bundleSize,
      status: this.getStatus(metrics.bundleSize, this.budgets.bundleSize)
    });

    // Asset count
    results.push({
      metric: 'Asset Count',
      current: metrics.assetCount,
      budget: this.budgets.assetCount,
      status: this.getStatus(metrics.assetCount, this.budgets.assetCount)
    });

    // Core Web Vitals
    if (metrics.firstContentfulPaint > 0) {
      results.push({
        metric: 'First Contentful Paint',
        current: metrics.firstContentfulPaint,
        budget: this.budgets.fcp,
        status: this.getStatus(metrics.firstContentfulPaint, this.budgets.fcp)
      });
    }

    if (metrics.largestContentfulPaint > 0) {
      results.push({
        metric: 'Largest Contentful Paint',
        current: metrics.largestContentfulPaint,
        budget: this.budgets.lcp,
        status: this.getStatus(metrics.largestContentfulPaint, this.budgets.lcp)
      });
    }

    if (metrics.firstInputDelay > 0) {
      results.push({
        metric: 'First Input Delay',
        current: metrics.firstInputDelay,
        budget: this.budgets.fid,
        status: this.getStatus(metrics.firstInputDelay, this.budgets.fid)
      });
    }

    if (metrics.cumulativeLayoutShift > 0) {
      results.push({
        metric: 'Cumulative Layout Shift',
        current: metrics.cumulativeLayoutShift,
        budget: this.budgets.cls,
        status: this.getStatus(metrics.cumulativeLayoutShift, this.budgets.cls, true)
      });
    }

    return results;
  }

  // Get status based on current vs budget
  private getStatus(current: number, budget: number, lowerIsBetter = false): 'pass' | 'warn' | 'fail' {
    const ratio = current / budget;
    
    if (lowerIsBetter) {
      if (ratio <= 0.8) return 'pass';
      if (ratio <= 1.0) return 'warn';
      return 'fail';
    } else {
      if (ratio >= 1.2) return 'pass';
      if (ratio >= 1.0) return 'warn';
      return 'fail';
    }
  }

  // Log budget check results
  logBudgetCheck(metrics: PerformanceMetrics) {
    const results = this.checkBudget(metrics);
    
    console.group('💰 Performance Budget Check');
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      const unit = result.metric.includes('Size') ? 'KB' : 
                   result.metric.includes('Time') || result.metric.includes('Paint') || result.metric.includes('Delay') ? 'ms' : '';
      
      console.log(`${icon} ${result.metric}: ${result.current.toFixed(2)}${unit} / ${result.budget.toFixed(2)}${unit}`);
    });
    console.groupEnd();
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const bundleAnalyzer = new BundleAnalyzer();
export const performanceBudget = new PerformanceBudget();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring();
  
  // Analyze bundle after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      bundleAnalyzer.analyzeBundle().then(() => {
        bundleAnalyzer.logAnalysis();
        performanceBudget.logBudgetCheck(performanceMonitor.getMetrics());
      });
    }, 1000);
  });
}
