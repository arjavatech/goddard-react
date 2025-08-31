// Wrapper component to handle feature flag routing
import React from 'react';
import { FeatureFlags, isEnabled } from '../utils/featureFlags.js';
import { migrationManager } from '../services/migration/migrationManager.js';
import { performanceMonitor } from '../services/monitoring/performanceMonitor.js';

// Import both versions
import ParentDashboardRefactored from './ParentDashboardRefactored';
import ParentDashboardLegacy from './ParentDashboardNew';

const ParentDashboardWrapper = () => {
  const [migrationStatus, setMigrationStatus] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Performance monitoring hooks - must be called unconditionally
  const startTime = React.useMemo(() => performance.now(), []);
  const shouldUseRefactored = isEnabled(FeatureFlags.USE_REFACTORED_DASHBOARD) && 
                              isEnabled(FeatureFlags.USE_UNIFIED_API);

  React.useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if migration is needed
        if (migrationManager.isMigrationNeeded() && isEnabled(FeatureFlags.ENABLE_MIGRATION_MANAGER)) {
          console.log('Migration needed, starting migration process...');
          
          try {
            const result = await migrationManager.executeMigration();
            if (result?.status === 'already_running') {
              setMigrationStatus('completed'); // Treat as completed to avoid blocking
            } else {
              setMigrationStatus('completed');
            }
          } catch (error) {
            console.error('Migration failed:', error);
            setMigrationStatus('failed');
          }
        } else {
          setMigrationStatus('not_needed');
        }

        // Enable performance monitoring if flag is set
        if (isEnabled(FeatureFlags.ENABLE_PERFORMANCE_MONITORING)) {
          performanceMonitor.enable();
          performanceMonitor.startContinuousMonitoring();
        }

      } catch (error) {
        console.error('Dashboard initialization failed:', error);
        setMigrationStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Performance monitoring effect
  React.useEffect(() => {
    if (isEnabled(FeatureFlags.ENABLE_PERFORMANCE_MONITORING)) {
      performanceMonitor.trackDashboardLoad(startTime, {
        version: shouldUseRefactored ? 'refactored' : 'legacy',
        migration: migrationStatus
      });
    }
  }, [startTime, shouldUseRefactored, migrationStatus]);

  // Show loading screen during migration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D52] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[#0F2D52] mb-2">
            Initializing Dashboard...
          </h3>
          <p className="text-sm text-gray-600">
            Setting up your improved experience
          </p>
        </div>
      </div>
    );
  }

  // Show migration error if failed
  if (migrationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md mx-4 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Setup Error
          </h3>
          <p className="text-gray-600 mb-4">
            There was an issue setting up the dashboard. Falling back to the previous version.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#0F2D52] text-white px-4 py-2 rounded hover:bg-[#0F2D52]/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard
  if (shouldUseRefactored) {
    console.log('Using refactored dashboard with unified API');
    return <ParentDashboardRefactored />;
  } else {
    console.log('Using legacy dashboard');
    return <ParentDashboardLegacy />;
  }
};

export default ParentDashboardWrapper;