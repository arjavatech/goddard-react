// Tests for UnifiedParentService
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedParentService, ValidationError, DashboardDataError } from '../../services/parentDashboard/unifiedParentService.js';
import { cacheManager } from '../../services/cache/multiLayerCache.js';
import { apiClient } from '../../services/api/client.js';

// Mock dependencies
vi.mock('../../services/cache/multiLayerCache.js');
vi.mock('../../services/api/client.js');

describe('UnifiedParentService', () => {
  const mockEmail = 'test@example.com';
  const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('mock-token');
  
  const mockApiResponse = [
    {
      child_id: 1,
      parent_name: 'Test Parent',
      child_first_name: 'John',
      child_last_name: 'Doe',
      child_information: {
        class_name: 'Rainbow',
        class_id: 1,
        bank_account: '1234567890',
        bank_routing: '123456789'
      },
      CompletedFormStatus: [
        {
          formname: 'admission_form',
          completedTimestamp: 1640995200000
        }
      ],
      InCompletedFormStatus: ['authorization_form']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    cacheManager.get = vi.fn().mockResolvedValue(null);
    cacheManager.set = vi.fn().mockResolvedValue(true);
    apiClient.get = vi.fn().mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getParentDashboardData', () => {
    it('should return cached data when available', async () => {
      const cachedData = { cached: true };
      cacheManager.get.mockResolvedValue(cachedData);

      const result = await UnifiedParentService.getParentDashboardData(
        mockEmail,
        mockGetAccessTokenSilently
      );

      expect(result).toEqual(cachedData);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await UnifiedParentService.getParentDashboardData(
        mockEmail,
        mockGetAccessTokenSilently
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        `/admission_child_personal/parent_email/1/${mockEmail}`,
        { getAccessTokenSilently: mockGetAccessTokenSilently }
      );

      expect(result).toMatchObject({
        parentName: 'Test Parent',
        children: expect.arrayContaining([
          expect.objectContaining({
            childId: 1,
            firstName: 'John',
            lastName: 'Doe'
          })
        ])
      });
    });

    it('should cache successful responses', async () => {
      cacheManager.get.mockResolvedValue(null);

      await UnifiedParentService.getParentDashboardData(
        mockEmail,
        mockGetAccessTokenSilently
      );

      expect(cacheManager.set).toHaveBeenCalledWith(
        `parent_dashboard:${mockEmail}`,
        expect.any(Object),
        300000,
        expect.objectContaining({
          persistToSession: true,
          persistToStorage: false
        })
      );
    });

    it('should throw DashboardDataError on API failure', async () => {
      cacheManager.get.mockResolvedValue(null);
      apiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(
        UnifiedParentService.getParentDashboardData(
          mockEmail,
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow(DashboardDataError);
    });

    it('should serve stale data on API error if available', async () => {
      const staleData = { stale: true };
      cacheManager.get
        .mockResolvedValueOnce(null) // First call - no fresh cache
        .mockResolvedValueOnce(staleData); // Second call - stale cache available
      
      apiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await UnifiedParentService.getParentDashboardData(
        mockEmail,
        mockGetAccessTokenSilently
      );

      expect(result).toEqual({
        ...staleData,
        isStale: true,
        lastError: 'API Error'
      });
    });

    it('should handle force refresh correctly', async () => {
      const cachedData = { cached: true };
      cacheManager.get.mockResolvedValue(cachedData);

      await UnifiedParentService.getParentDashboardData(
        mockEmail,
        mockGetAccessTokenSilently,
        { forceRefresh: true }
      );

      expect(apiClient.get).toHaveBeenCalled(); // Should call API despite cache
    });
  });

  describe('validateAndTransformData', () => {
    it('should validate array input', () => {
      expect(() => 
        UnifiedParentService.validateAndTransformData('not an array')
      ).toThrow(ValidationError);
    });

    it('should validate empty array', () => {
      expect(() => 
        UnifiedParentService.validateAndTransformData([])
      ).toThrow(ValidationError);
    });

    it('should validate missing child_id', () => {
      const invalidData = [{ child_first_name: 'Test' }];
      
      expect(() => 
        UnifiedParentService.validateAndTransformData(invalidData)
      ).toThrow(ValidationError);
    });

    it('should transform valid data correctly', () => {
      const result = UnifiedParentService.validateAndTransformData(mockApiResponse);

      expect(result).toMatchObject({
        parentName: 'Test Parent',
        children: [
          expect.objectContaining({
            childId: 1,
            firstName: 'John',
            lastName: 'Doe',
            className: 'Rainbow',
            stats: expect.objectContaining({
              total: 4,
              completed: 1,
              incomplete: 1,
              progress: 25
            })
          })
        ],
        totalChildren: 1
      });
    });

    it('should sanitize sensitive data', () => {
      const result = UnifiedParentService.validateAndTransformData(mockApiResponse);
      const child = result.children[0];
      
      expect(child.formData.bank_account).toBe('******7890');
      expect(child.formData.bank_routing).toBe('*****6789');
    });
  });

  describe('calculateFormStats', () => {
    it('should calculate stats correctly', () => {
      const completed = [
        { formname: 'admission_form' },
        { formname: 'authorization_form' }
      ];
      const incomplete = ['parent_handbook'];

      const stats = UnifiedParentService.calculateFormStats(completed, incomplete);

      expect(stats).toEqual({
        total: 4,
        completed: 2,
        incomplete: 1,
        progress: 50,
        isComplete: false
      });
    });

    it('should handle 100% completion', () => {
      const completed = [
        { formname: 'admission_form' },
        { formname: 'authorization_form' },
        { formname: 'parent_handbook' },
        { formname: 'enrollment_form' }
      ];

      const stats = UnifiedParentService.calculateFormStats(completed, []);

      expect(stats.progress).toBe(100);
      expect(stats.isComplete).toBe(true);
    });
  });

  describe('refreshParentData', () => {
    it('should invalidate cache and fetch fresh data', async () => {
      const invalidateParentData = vi.fn();
      cacheManager.invalidateParentData = invalidateParentData;

      await UnifiedParentService.refreshParentData(
        mockEmail,
        mockGetAccessTokenSilently
      );

      expect(invalidateParentData).toHaveBeenCalledWith(mockEmail);
      expect(apiClient.get).toHaveBeenCalled();
    });
  });

  describe('getChildData', () => {
    it('should return specific child data', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await UnifiedParentService.getChildData(
        mockEmail,
        1,
        mockGetAccessTokenSilently
      );

      expect(result).toMatchObject({
        childId: 1,
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should throw error for non-existent child', async () => {
      cacheManager.get.mockResolvedValue(null);

      await expect(
        UnifiedParentService.getChildData(
          mockEmail,
          999,
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Child with ID 999 not found');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask long strings correctly', () => {
      expect(UnifiedParentService.maskSensitiveData('1234567890')).toBe('******7890');
    });

    it('should mask short strings', () => {
      expect(UnifiedParentService.maskSensitiveData('123')).toBe('****');
    });

    it('should handle null/undefined', () => {
      expect(UnifiedParentService.maskSensitiveData(null)).toBe(null);
      expect(UnifiedParentService.maskSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle non-strings', () => {
      expect(UnifiedParentService.maskSensitiveData(123)).toBe(123);
    });
  });
});