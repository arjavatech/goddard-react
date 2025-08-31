// Tests for useParentDashboard hook
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useParentDashboard } from '../../hooks/useParentDashboard.js';
import { UnifiedParentService } from '../../services/parentDashboard/unifiedParentService.js';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../services/parentDashboard/unifiedParentService.js');
vi.mock('@auth0/auth0-react');
vi.mock('sonner');

// Mock useAuth0
const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('mock-token');
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently
  })
}));

describe('useParentDashboard', () => {
  const mockEmail = 'test@example.com';
  const mockDashboardData = {
    parentName: 'Test Parent',
    children: [
      {
        childId: 1,
        firstName: 'John',
        lastName: 'Doe',
        stats: { total: 4, completed: 2, incomplete: 2, progress: 50 },
        incompleteForms: ['authorization_form'],
        formData: { child_first_name: 'John' }
      },
      {
        childId: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        stats: { total: 4, completed: 1, incomplete: 3, progress: 25 },
        incompleteForms: ['authorization_form', 'parent_handbook'],
        formData: { child_first_name: 'Jane' }
      }
    ],
    totalChildren: 2,
    overallStats: { progress: 37.5 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Default successful API response
    UnifiedParentService.getParentDashboardData.mockResolvedValue(mockDashboardData);
    UnifiedParentService.refreshParentData.mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should load dashboard data on mount', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.parentName).toBe('Test Parent');
      expect(result.current.children).toHaveLength(2);
      expect(UnifiedParentService.getParentDashboardData).toHaveBeenCalledWith(
        mockEmail,
        mockGetAccessTokenSilently
      );
    });

    it('should handle missing email', async () => {
      const { result } = renderHook(() => useParentDashboard(''));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Email is required');
    });

    it('should set error state on API failure', async () => {
      const error = new Error('API Error');
      UnifiedParentService.getParentDashboardData.mockRejectedValue(error);

      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API Error');
      expect(toast.error).toHaveBeenCalled();
    });

    it('should auto-select first child', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.activeChildId).toBe(1);
        expect(result.current.activeChild).toMatchObject({
          childId: 1,
          firstName: 'John'
        });
      });
    });

    it('should restore child from session storage', async () => {
      window.sessionStorage.getItem.mockReturnValue('2');

      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.activeChildId).toBe(2);
        expect(result.current.activeChild).toMatchObject({
          childId: 2,
          firstName: 'Jane'
        });
      });
    });
  });

  describe('switchChild', () => {
    it('should switch to different child instantly', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const startTime = performance.now();

      act(() => {
        result.current.switchChild(2);
      });

      const endTime = performance.now();
      const switchTime = endTime - startTime;

      expect(switchTime).toBeLessThan(10); // Should be nearly instant
      expect(result.current.activeChildId).toBe(2);
      expect(result.current.activeChild.firstName).toBe('Jane');
      
      // Should update localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith('child_name', 'Jane');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('child_id', '2');
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('putcallId', '2');
      
      expect(toast.success).toHaveBeenCalledWith('Selected child: Jane', { duration: 2000 });
    });

    it('should handle invalid child ID', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      act(() => {
        result.current.switchChild(999);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Child with ID 999 not found');
      expect(result.current.activeChildId).not.toBe(999);

      consoleSpy.mockRestore();
    });
  });

  describe('refreshData', () => {
    it('should refresh data successfully', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.refreshData();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(UnifiedParentService.refreshParentData).toHaveBeenCalledWith(
        mockEmail,
        mockGetAccessTokenSilently
      );
      expect(toast.success).toHaveBeenCalledWith('Dashboard data refreshed');
    });

    it('should handle refresh errors', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error = new Error('Refresh failed');
      UnifiedParentService.refreshParentData.mockRejectedValue(error);

      act(() => {
        result.current.refreshData();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Refresh failed');
      expect(toast.error).toHaveBeenCalledWith('Failed to refresh data. Please try again.');
    });

    it('should re-select active child after refresh', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Switch to second child
      act(() => {
        result.current.switchChild(2);
      });

      expect(result.current.activeChildId).toBe(2);

      // Refresh data
      act(() => {
        result.current.refreshData();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still have second child selected
      expect(result.current.activeChildId).toBe(2);
    });
  });

  describe('computed values', () => {
    it('should calculate hasData correctly', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.hasData).toBe(true);
      });
    });

    it('should calculate hasMultipleChildren correctly', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.hasMultipleChildren).toBe(true);
      });
    });

    it('should get welcome message for admin', async () => {
      window.localStorage.getItem.mockReturnValue('goddard01arjava@gmail.com');

      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.getWelcomeMessage()).toBe('Welcome Admin');
      });
    });

    it('should get welcome message for regular parent', async () => {
      window.localStorage.getItem.mockReturnValue('parent@example.com');

      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.getWelcomeMessage()).toBe('Welcome Test Parent');
      });
    });

    it('should check if child has incomplete forms', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.hasIncompleteForms(1)).toBe(true);
        expect(result.current.hasIncompleteForms(999)).toBe(false);
      });
    });

    it('should get child progress', async () => {
      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.getChildProgress(1)).toBe(50);
        expect(result.current.getChildProgress(2)).toBe(25);
        expect(result.current.getChildProgress(999)).toBe(0);
      });
    });
  });

  describe('stale data handling', () => {
    it('should show stale data warning', async () => {
      const staleData = { ...mockDashboardData, isStale: true };
      UnifiedParentService.getParentDashboardData.mockResolvedValue(staleData);

      const { result } = renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(result.current.isStale).toBe(true);
      });

      expect(toast.warning).toHaveBeenCalledWith(
        'Showing cached data - some information may be outdated',
        { duration: 5000 }
      );
    });
  });

  describe('localStorage integration', () => {
    it('should update localStorage on successful load', async () => {
      renderHook(() => useParentDashboard(mockEmail));

      await waitFor(() => {
        expect(window.localStorage.setItem).toHaveBeenCalledWith('parent_name', 'Test Parent');
        expect(window.localStorage.setItem).toHaveBeenCalledWith('number_of_children', '2');
      });
    });
  });
});