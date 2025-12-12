/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  apiCache,
  BrowserCache,
  debounce,
  MemoryCache,
  memoize,
  PerformanceMonitor,
  resultsCache,
  throttle,
  uiStateCache,
} from './performance';

describe('Performance Utilities', () => {
  describe('MemoryCache', () => {
    let cache: MemoryCache<string>;

    beforeEach(() => {
      cache = new MemoryCache<string>(1000); // 1 second TTL
    });

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should expire values after TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      expect(cache.get('key1')).toBe('value1');

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should report correct size', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('BrowserCache', () => {
    let cache: BrowserCache<string>;

    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      cache = new BrowserCache<string>('test-cache', 1000);
    });

    it('should store and retrieve values from memory', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should attempt to use localStorage when available', () => {
      cache.set('key1', 'value1');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw error
      expect(() => cache.set('key1', 'value1')).not.toThrow();
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('should limit function execution rate', async () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 150));
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const expensiveFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(expensiveFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('should use custom key generator', () => {
      const fn = vi.fn((obj: { id: number }) => obj.id * 2);
      const memoizedFn = memoize(fn, (obj) => `id:${obj.id}`);

      memoizedFn({ id: 1 });
      memoizedFn({ id: 1 });

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerformanceMonitor', () => {
    beforeEach(() => {
      // Mock performance API
      Object.defineProperty(window, 'performance', {
        value: {
          mark: vi.fn(),
          measure: vi.fn(),
          getEntriesByName: vi.fn(() => [{ duration: 100 }]),
          timing: {
            navigationStart: 1000,
            domContentLoadedEventEnd: 2000,
            loadEventEnd: 3000,
            domInteractive: 1500,
            responseEnd: 1200,
          },
        },
        writable: true,
      });
    });

    it('should create performance marks', () => {
      PerformanceMonitor.mark('test-mark');
      expect(window.performance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should measure performance between marks', () => {
      const duration = PerformanceMonitor.measure('test-measure', 'start', 'end');
      expect(window.performance.measure).toHaveBeenCalledWith('test-measure', 'start', 'end');
      expect(duration).toBe(100);
    });

    it('should get navigation timing', () => {
      const timing = PerformanceMonitor.getNavigationTiming();
      expect(timing).toEqual({
        domContentLoaded: 1000,
        loadComplete: 2000,
        domInteractive: 500,
        firstPaint: 200,
      });
    });
  });

  describe('Cache Instances', () => {
    it('should export pre-configured cache instances', () => {
      expect(apiCache).toBeInstanceOf(BrowserCache);
      expect(uiStateCache).toBeInstanceOf(MemoryCache);
      expect(resultsCache).toBeInstanceOf(BrowserCache);
    });

    it('should allow setting and getting from cache instances', () => {
      apiCache.set('test-key', { data: 'test' });
      expect(apiCache.get('test-key')).toEqual({ data: 'test' });

      uiStateCache.set('ui-key', 'ui-value');
      expect(uiStateCache.get('ui-key')).toBe('ui-value');

      resultsCache.set('results-key', { results: 'data' });
      expect(resultsCache.get('results-key')).toEqual({ results: 'data' });
    });
  });
});
