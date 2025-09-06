// Progressive loading Forms Repository with optimized UX
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOptimizedFormsRepository } from '../../hooks/useOptimizedFormsRepository';
import { performanceMonitor } from '../../services/monitoring/performanceMonitor';
import HeaderNew from '../HeaderNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  BookOpen,
  Users,
  School,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

// Skeleton components for progressive loading
const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-40" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Performance indicator component
const PerformanceIndicator = ({ metrics, isLoading }) => {
  if (!metrics || isLoading) return null;

  const loadTime = metrics.loadMetrics?.[0]?.value || 0;
  const getIndicatorColor = () => {
    if (loadTime < 1000) return 'text-green-600';
    if (loadTime < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <TrendingUp className={`w-4 h-4 ${getIndicatorColor()}`} />
      <span>Load time: {loadTime.toFixed(0)}ms</span>
      {loadTime > 2000 && (
        <span className="text-red-600 text-xs">(Slow)</span>
      )}
    </div>
  );
};

const ProgressiveFormsRepository = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('classroom');
  const [refreshing, setRefreshing] = useState(false);
  
  // Use optimized hook with performance monitoring
  const {
    data,
    loading,
    error,
    isStale,
    lastUpdated,
    refresh,
    smartRefresh,
    getPerformanceMetrics,
    classrooms,
    forms,
    studentForms,
    stats
  } = useOptimizedFormsRepository({
    autoLoad: true,
    enablePerformanceMonitoring: true,
    enableBackgroundRefresh: true
  });

  // Performance metrics for monitoring
  const performanceMetrics = useMemo(() => {
    try {
      return getPerformanceMetrics();
    } catch {
      return null;
    }
  }, [getPerformanceMetrics, lastUpdated]);

  // Track component render performance
  useEffect(() => {
    const renderStart = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStart;
      performanceMonitor.trackRender('ProgressiveFormsRepository', renderStart, {
        dataLoaded: !!data,
        hasError: !!error
      });
    };
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    const startTime = performance.now();
    
    try {
      await refresh();
      
      const refreshTime = performance.now() - startTime;
      toast.success(`Data refreshed in ${refreshTime.toFixed(0)}ms`);
      
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle smart refresh (only if needed)
  const handleSmartRefresh = async () => {
    const startTime = performance.now();
    
    try {
      await smartRefresh();
      toast.success('Data synchronized');
    } catch (err) {
      console.error('Smart refresh failed:', err);
    }
  };

  // Auto smart refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && data) {
        handleSmartRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [data]);

  if (!isAuthenticated) {
    return null;
  }

  // Error state with retry option
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNew onSignOut={signOut} sidebar={true} component="ClassroomFormManage" />
        <div className="container mx-auto pt-6 px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
              <p className="text-gray-600 mb-4">
                Unable to load forms repository data. This might be due to network issues.
              </p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNew onSignOut={signOut} sidebar={true} component="ClassroomFormManage" />

      <div className="container mx-auto pt-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header with Performance Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forms & Classroom Repository</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">Manage classrooms, forms, and educational resources</p>
              {isStale && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Data may be stale
                </Badge>
              )}
            </div>
            <PerformanceIndicator metrics={performanceMetrics} isLoading={loading} />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSmartRefresh} size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Smart Sync
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing} size="sm">
              {refreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards with Progressive Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading && !data ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalClassrooms || 0}</p>
                    </div>
                    <School className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalChildren || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Classrooms</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activeClassrooms || 0}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Tabs with Progressive Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classroom" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Classroom Repository
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Forms Repository
            </TabsTrigger>
            <TabsTrigger value="student-forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Form Repo
            </TabsTrigger>
          </TabsList>

          {/* Classroom Repository Tab */}
          <TabsContent value="classroom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classroom Management</CardTitle>
                <CardDescription>View and manage all classroom information</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && !data ? (
                  <TableSkeleton />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Classroom Name</TableHead>
                          <TableHead>Student Count</TableHead>
                          <TableHead>Forms</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classrooms.map((classroom) => (
                          <TableRow key={classroom.class_id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#002e4d]" />
                                {classroom.class_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {classroom.count || 0} students
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {(classroom.processedForms || []).length > 0 ? (
                                  classroom.processedForms.map((form, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                                      {form}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm">No forms assigned</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {classroom.class_name === 'Unassign' ? (
                                <Badge variant="outline" className="text-gray-600 border-gray-600">
                                  Unassigned
                                </Badge>
                              ) : (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={classroom.class_name === 'Unassign' || (classroom.count || 0) > 0}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {classrooms.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No classrooms found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would follow similar pattern... */}
        </Tabs>

        {/* Performance Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && performanceMetrics && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm">Performance Metrics (Dev Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Load Time</p>
                  <p className="text-gray-600">
                    {performanceMetrics.loadMetrics?.[0]?.value?.toFixed(0) || 0}ms
                  </p>
                </div>
                <div>
                  <p className="font-medium">Cache Hit Rate</p>
                  <p className="text-gray-600">
                    {(performanceMetrics.summary?.cacheHit?.count || 0) > 0 ? '✓' : '✗'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Data Freshness</p>
                  <p className="text-gray-600">
                    {isStale ? 'Stale' : 'Fresh'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProgressiveFormsRepository;