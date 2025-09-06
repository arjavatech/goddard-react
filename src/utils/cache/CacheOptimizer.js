/**
 * Cache optimization utilities for memory efficiency and performance
 */
class CacheOptimizer {
  constructor(options = {}) {
    this.compressionEnabled = options.compression !== false;
    this.compressionThreshold = options.compressionThreshold || 1024; // 1KB
    this.analyticsEnabled = options.analytics !== false;
    this.optimizationInterval = options.optimizationInterval || 300000; // 5 minutes
    
    // Analytics data
    this.accessPatterns = new Map();
    this.hitRateHistory = [];
    this.memoryUsageHistory = [];
    this.optimizationHistory = [];
    
    // Optimization strategies
    this.strategies = {
      TTL_OPTIMIZATION: 'ttl_optimization',
      SIZE_OPTIMIZATION: 'size_optimization', 
      ACCESS_PATTERN_OPTIMIZATION: 'access_pattern_optimization',
      COMPRESSION_OPTIMIZATION: 'compression_optimization'
    };
    
    // Start optimization loop
    if (this.analyticsEnabled) {
      this.optimizationTimer = setInterval(() => {
        this._performOptimization();
      }, this.optimizationInterval);
    }
  }

  /**
   * Optimize cache configuration based on usage patterns
   * @param {TTLCache} cache - Cache instance to optimize
   * @returns {Object} Optimization results
   */
  optimizeCache(cache) {
    const stats = cache.getStats();
    const recommendations = [];
    const applied = [];

    // Analyze hit rate
    const hitRate = stats.hitRate;
    if (hitRate < 0.5) {
      recommendations.push({
        type: this.strategies.TTL_OPTIMIZATION,
        description: 'Low hit rate detected - consider increasing TTL',
        priority: 'high',
        action: () => this._optimizeTTL(cache, 'increase')
      });
    } else if (hitRate > 0.9) {
      recommendations.push({
        type: this.strategies.TTL_OPTIMIZATION,
        description: 'Very high hit rate - TTL might be too long',
        priority: 'medium',
        action: () => this._optimizeTTL(cache, 'decrease')
      });
    }

    // Analyze memory usage
    const memoryUsageMB = parseFloat(stats.memoryUsageMB);
    if (memoryUsageMB > cache.maxMemoryMB * 0.8) {
      recommendations.push({
        type: this.strategies.SIZE_OPTIMIZATION,
        description: 'High memory usage - consider compression or size reduction',
        priority: 'high',
        action: () => this._optimizeMemory(cache)
      });
    }

    // Analyze access patterns
    const accessPatternInsights = this._analyzeAccessPatterns();
    if (accessPatternInsights.hotKeys.length > 0) {
      recommendations.push({
        type: this.strategies.ACCESS_PATTERN_OPTIMIZATION,
        description: 'Hot keys detected - optimize for frequent access',
        priority: 'medium',
        action: () => this._optimizeAccessPatterns(cache, accessPatternInsights)
      });
    }

    // Apply high-priority recommendations automatically
    recommendations.forEach(rec => {
      if (rec.priority === 'high' && rec.action) {
        try {
          rec.action();
          applied.push(rec.type);
        } catch (error) {
          console.warn(`Failed to apply optimization ${rec.type}:`, error);
        }
      }
    });

    const result = {
      hitRate,
      memoryUsageMB,
      recommendations,
      applied,
      timestamp: Date.now()
    };

    this.optimizationHistory.push(result);
    return result;
  }

  /**
   * Compress data for storage
   * @param {*} data - Data to compress
   * @returns {Object} Compressed data object
   */
  compressData(data) {
    if (!this.compressionEnabled) {
      return { data, compressed: false };
    }

    const jsonStr = JSON.stringify(data);
    if (jsonStr.length < this.compressionThreshold) {
      return { data, compressed: false };
    }

    try {
      // Simple compression using string manipulation
      // In production, you might want to use a proper compression library
      const compressed = this._simpleCompress(jsonStr);
      
      if (compressed.length < jsonStr.length * 0.8) {
        return {
          data: compressed,
          compressed: true,
          originalSize: jsonStr.length,
          compressedSize: compressed.length,
          ratio: compressed.length / jsonStr.length
        };
      }
    } catch (error) {
      console.warn('Compression failed:', error);
    }

    return { data, compressed: false };
  }

  /**
   * Decompress data
   * @param {Object} compressedObj - Compressed data object
   * @returns {*} Original data
   */
  decompressData(compressedObj) {
    if (!compressedObj.compressed) {
      return compressedObj.data;
    }

    try {
      const decompressed = this._simpleDecompress(compressedObj.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Decompression failed:', error);
      return null;
    }
  }

  /**
   * Track access pattern for optimization
   * @param {string} key - Cache key
   * @param {string} operation - Operation type (get, set, delete)
   */
  trackAccess(key, operation) {
    if (!this.analyticsEnabled) return;

    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, {
        gets: 0,
        sets: 0,
        deletes: 0,
        firstAccess: Date.now(),
        lastAccess: Date.now(),
        frequency: 0
      });
    }

    const pattern = this.accessPatterns.get(key);
    pattern[operation + 's']++;
    pattern.lastAccess = Date.now();
    pattern.frequency = pattern.gets / ((Date.now() - pattern.firstAccess) / 1000 / 60); // per minute
  }

  /**
   * Get optimization recommendations based on analytics
   * @returns {Array} Array of recommendations
   */
  getRecommendations() {
    const patterns = this._analyzeAccessPatterns();
    const recommendations = [];

    // Hot keys recommendations
    if (patterns.hotKeys.length > 0) {
      recommendations.push({
        type: 'hot_keys',
        description: `${patterns.hotKeys.length} frequently accessed keys could benefit from longer TTL`,
        keys: patterns.hotKeys.slice(0, 5),
        action: 'increase_ttl'
      });
    }

    // Cold keys recommendations  
    if (patterns.coldKeys.length > 0) {
      recommendations.push({
        type: 'cold_keys',
        description: `${patterns.coldKeys.length} rarely accessed keys could use shorter TTL`,
        keys: patterns.coldKeys.slice(0, 5),
        action: 'decrease_ttl'
      });
    }

    // Memory optimization
    const memoryInsights = this._analyzeMemoryUsage();
    if (memoryInsights.shouldCompress) {
      recommendations.push({
        type: 'compression',
        description: 'Enable compression for large values to reduce memory usage',
        estimatedSavings: memoryInsights.potentialSavings,
        action: 'enable_compression'
      });
    }

    return recommendations;
  }

  /**
   * Get comprehensive analytics report
   * @returns {Object} Analytics report
   */
  getAnalytics() {
    return {
      accessPatterns: this._analyzeAccessPatterns(),
      memoryAnalysis: this._analyzeMemoryUsage(),
      hitRateHistory: this.hitRateHistory.slice(-100),
      memoryUsageHistory: this.memoryUsageHistory.slice(-100),
      optimizationHistory: this.optimizationHistory.slice(-20),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }
    
    this.accessPatterns.clear();
    this.hitRateHistory = [];
    this.memoryUsageHistory = [];
    this.optimizationHistory = [];
  }

  /**
   * Private: Simple compression implementation
   */
  _simpleCompress(str) {
    // Simple RLE (Run Length Encoding) compression
    return str.replace(/(.)\1{2,}/g, (match, char) => {
      return `${char}*${match.length}`;
    });
  }

  /**
   * Private: Simple decompression implementation
   */
  _simpleDecompress(str) {
    // Decompress RLE
    return str.replace(/(.)\*(\d+)/g, (match, char, count) => {
      return char.repeat(parseInt(count));
    });
  }

  /**
   * Private: Analyze access patterns
   */
  _analyzeAccessPatterns() {
    const patterns = Array.from(this.accessPatterns.entries());
    const now = Date.now();
    
    // Calculate frequency scores
    const scored = patterns.map(([key, pattern]) => {
      const ageMinutes = (now - pattern.firstAccess) / 1000 / 60;
      const frequency = pattern.gets / Math.max(ageMinutes, 1);
      
      return {
        key,
        frequency,
        gets: pattern.gets,
        lastAccess: pattern.lastAccess,
        age: ageMinutes
      };
    });

    // Sort by frequency
    scored.sort((a, b) => b.frequency - a.frequency);

    const hotThreshold = scored.length > 0 ? scored[Math.floor(scored.length * 0.2)]?.frequency || 1 : 1;
    const coldThreshold = scored.length > 0 ? scored[Math.floor(scored.length * 0.8)]?.frequency || 0 : 0;

    return {
      hotKeys: scored.filter(s => s.frequency >= hotThreshold).map(s => s.key),
      coldKeys: scored.filter(s => s.frequency <= coldThreshold).map(s => s.key),
      totalKeys: patterns.length,
      avgFrequency: scored.reduce((sum, s) => sum + s.frequency, 0) / scored.length || 0
    };
  }

  /**
   * Private: Analyze memory usage patterns
   */
  _analyzeMemoryUsage() {
    const recentHistory = this.memoryUsageHistory.slice(-50);
    
    if (recentHistory.length === 0) {
      return { shouldCompress: false, potentialSavings: 0 };
    }

    const avgMemoryUsage = recentHistory.reduce((sum, usage) => sum + usage, 0) / recentHistory.length;
    const maxMemoryUsage = Math.max(...recentHistory);
    const trend = recentHistory.length > 1 ? 
      recentHistory[recentHistory.length - 1] - recentHistory[0] : 0;

    return {
      avgMemoryUsage,
      maxMemoryUsage,
      trend,
      shouldCompress: avgMemoryUsage > 50 || maxMemoryUsage > 80, // MB thresholds
      potentialSavings: Math.round(avgMemoryUsage * 0.3) // Estimated 30% compression
    };
  }

  /**
   * Private: Optimize TTL based on patterns
   */
  _optimizeTTL(cache, direction) {
    const multiplier = direction === 'increase' ? 1.5 : 0.7;
    cache.defaultTTL = Math.round(cache.defaultTTL * multiplier);
    
    // Ensure reasonable bounds
    cache.defaultTTL = Math.max(60000, Math.min(3600000, cache.defaultTTL)); // 1 min to 1 hour
  }

  /**
   * Private: Optimize memory usage
   */
  _optimizeMemory(cache) {
    // Enable compression if not already enabled
    this.compressionEnabled = true;
    
    // Reduce max size slightly
    cache.maxSize = Math.round(cache.maxSize * 0.9);
    
    // Trigger cleanup
    cache._cleanup();
  }

  /**
   * Private: Optimize access patterns
   */
  _optimizeAccessPatterns(cache, insights) {
    // Increase TTL for hot keys (would need cache key-specific TTLs)
    // This is a simplified example
    insights.hotKeys.forEach(key => {
      if (cache.has(key)) {
        // In a real implementation, you'd need to support per-key TTLs
        console.log(`Hot key detected: ${key}`);
      }
    });
  }

  /**
   * Private: Perform periodic optimization
   */
  _performOptimization() {
    // This would be called with actual cache instances in a real implementation
    // For now, just update analytics
    this.hitRateHistory.push(Math.random()); // Placeholder
    this.memoryUsageHistory.push(Math.random() * 100); // Placeholder
  }
}

export default CacheOptimizer;