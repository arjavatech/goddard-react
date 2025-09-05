// Feature flags for gradual rollout
import { useState, useEffect } from 'react';
export const FeatureFlags = {
  // Parent Dashboard Refactoring
  USE_UNIFIED_API: 'use_unified_api',
  USE_REFACTORED_DASHBOARD: 'use_refactored_dashboard',
  ENABLE_PERFORMANCE_MONITORING: 'enable_performance_monitoring',
  ENABLE_ADVANCED_CACHING: 'enable_advanced_caching',
  
  // File Operations
  USE_ENHANCED_FILE_SERVICE: 'use_enhanced_file_service',
  
  // Migration
  ENABLE_MIGRATION_MANAGER: 'enable_migration_manager'
};

export class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
    this.listeners = new Set();
    this.loadFlags();
  }

  // Load flags from localStorage
  loadFlags() {
    try {
      const storedFlags = localStorage.getItem('feature_flags');
      if (storedFlags) {
        const parsed = JSON.parse(storedFlags);
        Object.entries(parsed).forEach(([key, value]) => {
          this.flags.set(key, value);
        });
      }
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
    }

    // Set defaults for development
    if (import.meta.env?.NODE_ENV === 'development') {
      this.setDefaults();
    }
  }

  // Save flags to localStorage
  saveFlags() {
    try {
      const flagsObject = Object.fromEntries(this.flags.entries());
      localStorage.setItem('feature_flags', JSON.stringify(flagsObject));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  // Set default flags for development
  setDefaults() {
    const defaults = {
      [FeatureFlags.USE_UNIFIED_API]: true,
      [FeatureFlags.USE_REFACTORED_DASHBOARD]: true,
      [FeatureFlags.ENABLE_PERFORMANCE_MONITORING]: true,
      [FeatureFlags.ENABLE_ADVANCED_CACHING]: true,
      [FeatureFlags.USE_ENHANCED_FILE_SERVICE]: true,
      [FeatureFlags.ENABLE_MIGRATION_MANAGER]: true
    };

    Object.entries(defaults).forEach(([flag, value]) => {
      if (!this.flags.has(flag)) {
        this.flags.set(flag, value);
      }
    });

    this.saveFlags();
  }

  // Check if flag is enabled
  isEnabled(flag) {
    return this.flags.get(flag) === true;
  }

  // Enable a flag
  enable(flag) {
    this.flags.set(flag, true);
    this.saveFlags();
    this.notifyListeners(flag, true);
  }

  // Disable a flag
  disable(flag) {
    this.flags.set(flag, false);
    this.saveFlags();
    this.notifyListeners(flag, false);
  }

  // Toggle a flag
  toggle(flag) {
    const current = this.isEnabled(flag);
    if (current) {
      this.disable(flag);
    } else {
      this.enable(flag);
    }
    return !current;
  }

  // Set flag value
  setFlag(flag, value) {
    this.flags.set(flag, value);
    this.saveFlags();
    this.notifyListeners(flag, value);
  }

  // Get all flags
  getAllFlags() {
    return Object.fromEntries(this.flags.entries());
  }

  // Add change listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove change listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify listeners of changes
  notifyListeners(flag, value) {
    this.listeners.forEach(callback => {
      try {
        callback(flag, value);
      } catch (error) {
        console.error('Feature flag listener error:', error);
      }
    });
  }

  // Gradual rollout methods
  enableForPercentage(flag, percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }

    const userId = this.getUserId();
    const hash = this.hashString(userId + flag);
    const bucket = hash % 100;
    
    const enabled = bucket < percentage;
    this.setFlag(flag, enabled);
    
    return enabled;
  }

  // Simple user ID based on Auth0 user or generate one
  getUserId(auth0User = null) {
    // Prefer Auth0 user email if available
    if (auth0User?.email) {
      return auth0User.email;
    }
    
    // Generate anonymous ID for feature flag bucketing
    let userId = sessionStorage.getItem('feature_flag_user_id');
    if (!userId) {
      userId = 'anonymous_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('feature_flag_user_id', userId);
    }
    return userId;
  }

  // Simple string hash function
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Check if user is in beta group (requires Auth0 user)
  isInBetaGroup(auth0User = null) {
    const email = auth0User?.email;
    if (!email) return false;
    
    const betaEmails = [
      'goddard01arjava@gmail.com',
      'admin@goddardschool.com', 
      'beta@goddardschool.com'
    ];
    
    return betaEmails.includes(email);
  }

  // Enable beta features for beta users (requires Auth0 user)
  enableBetaFeatures(auth0User = null) {
    if (this.isInBetaGroup(auth0User)) {
      Object.values(FeatureFlags).forEach(flag => {
        this.enable(flag);
      });
      console.log('Beta features enabled for beta user');
    }
  }

  // Reset all flags
  resetFlags() {
    this.flags.clear();
    localStorage.removeItem('feature_flags');
    this.setDefaults();
  }

  // Export configuration
  exportConfig(auth0User = null) {
    return {
      flags: this.getAllFlags(),
      userId: this.getUserId(auth0User),
      isBeta: this.isInBetaGroup(auth0User),
      timestamp: Date.now()
    };
  }

  // Import configuration
  importConfig(config) {
    if (!config || !config.flags) {
      throw new Error('Invalid configuration');
    }

    this.flags.clear();
    Object.entries(config.flags).forEach(([key, value]) => {
      this.flags.set(key, value);
    });

    this.saveFlags();
  }
}

// Create singleton instance
export const featureFlagManager = new FeatureFlagManager();

// Convenience functions
export const isEnabled = (flag) => featureFlagManager.isEnabled(flag);
export const enable = (flag) => featureFlagManager.enable(flag);
export const disable = (flag) => featureFlagManager.disable(flag);
export const toggle = (flag) => featureFlagManager.toggle(flag);

// React hook for feature flags (requires React to be imported where used)
export const useFeatureFlag = (flag) => {
  // This will be used in components that import React
  const [isEnabled, setIsEnabled] = useState(
    featureFlagManager.isEnabled(flag)
  );

  useEffect(() => {
    const listener = (changedFlag, value) => {
      if (changedFlag === flag) {
        setIsEnabled(value);
      }
    };

    featureFlagManager.addListener(listener);
    return () => featureFlagManager.removeListener(listener);
  }, [flag]);

  return isEnabled;
};

// Initialize beta features on load 
// Note: This will need to be called from components with Auth0 user data
if (typeof window !== 'undefined') {
  // Don't auto-enable beta features without Auth0 user context
  console.log('Feature flag manager initialized. Call enableBetaFeatures(auth0User) from components.');
}