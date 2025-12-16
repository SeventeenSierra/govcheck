/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Performance Utilities
 *
 * Implements caching strategies and performance optimizations
 * for the GovCheck application.
 *
 * Requirement 5.1: Load time performance optimization
 */

/**
 * Simple in-memory cache with TTL support
 */
class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

/**
 * Browser storage cache with fallback to memory
 */
class BrowserCache<T> {
  private memoryCache: MemoryCache<T>;
  private storageKey: string;

  constructor(storageKey: string, defaultTTL = 30 * 60 * 1000) {
    // 30 minutes default
    this.storageKey = storageKey;
    this.memoryCache = new MemoryCache<T>(defaultTTL);
  }

  private isStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && window.localStorage !== undefined;
    } catch {
      return false;
    }
  }

  private getStorageKey(key: string): string {
    return `${this.storageKey}:${key}`;
  }

  set(key: string, value: T, ttl?: number): void {
    // Always set in memory cache
    this.memoryCache.set(key, value, ttl);

    // Try to set in localStorage if available
    if (this.isStorageAvailable()) {
      try {
        const expires = Date.now() + (ttl ?? 30 * 60 * 1000);
        const item = { value, expires };
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  get(key: string): T | null {
    // Try memory cache first (fastest)
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue !== null) {
      return memoryValue;
    }

    // Try localStorage if available
    if (this.isStorageAvailable()) {
      try {
        const stored = localStorage.getItem(this.getStorageKey(key));
        if (stored) {
          const item = JSON.parse(stored);
          if (Date.now() <= item.expires) {
            // Restore to memory cache for faster access
            this.memoryCache.set(key, item.value);
            return item.value;
          } else {
            // Clean up expired item
            localStorage.removeItem(this.getStorageKey(key));
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    if (this.isStorageAvailable()) {
      try {
        localStorage.removeItem(this.getStorageKey(key));
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error);
      }
    }
  }

  clear(): void {
    this.memoryCache.clear();
    if (this.isStorageAvailable()) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(`${this.storageKey}:`)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoization with cache for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Preload resources for better performance
 */
export function preloadResource(href: string, as: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    img.src = src;
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(img);
}

/**
 * Performance monitoring utilities
 */
export namespace PerformanceMonitor {
  const marks = new Map<string, number>();

  export function mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
      marks.set(name, Date.now());
    }
  }

  export function measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window === 'undefined' || !window.performance) {
      // Fallback measurement
      const startTime = marks.get(startMark);
      const endTime = endMark ? marks.get(endMark) : Date.now();
      return startTime && endTime ? endTime - startTime : null;
    }

    try {
      if (endMark) {
        window.performance.measure(name, startMark, endMark);
      } else {
        window.performance.measure(name, startMark);
      }

      const entries = window.performance.getEntriesByName(name, 'measure');
      return entries.length > 0 ? entries[entries.length - 1].duration : null;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  export function getNavigationTiming(): Record<string, number> | null {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return null;
    }

    const timing = window.performance.timing;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      firstPaint: timing.responseEnd - timing.navigationStart,
    };
  }
}

// Export cache instances for common use cases
export const apiCache = new BrowserCache<unknown>('govcheck-api', 10 * 60 * 1000); // 10 minutes
export const uiStateCache = new MemoryCache<unknown>(60 * 1000); // 1 minute
export const resultsCache = new BrowserCache<unknown>('govcheck-results', 60 * 60 * 1000); // 1 hour

// Export cache classes for custom instances
export { MemoryCache, BrowserCache };
