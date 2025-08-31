// Simple child tabs component - NO page reload!
// Pure React state update for instant child switching
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const ChildTabsSimple = ({ children, activeChildId, onChildSelect }) => {
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0F2D52] border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-4">
          {children.map((child) => (
            <Button
              key={child.id}
              variant={activeChildId === child.id ? "secondary" : "ghost"}
              className={`min-w-fit whitespace-nowrap transition-colors ${
                activeChildId === child.id
                  ? 'bg-white text-[#0F2D52] hover:bg-gray-100'
                  : 'text-white hover:bg-[#0F2D52]/80'
              }`}
              onClick={() => {
                console.log('🔄 Child tab clicked:', child.firstName, '- Pure state update!');
                onChildSelect(child.id);
                // NO window.location.reload() here! ✅
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              {child.firstName} {child.lastName}
              {child.stats && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeChildId === child.id ? 'bg-[#0F2D52] text-white' : 'bg-white/20 text-white'
                }`}>
                  {child.stats.completed}/{child.stats.total}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Progress indicator for active child */}
      {children.find(c => c.id === activeChildId) && (
        <div className="bg-[#0F2D52]/90 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-white text-sm">
              <span>
                Forms Progress: {children.find(c => c.id === activeChildId)?.stats.completed || 0} of{' '}
                {children.find(c => c.id === activeChildId)?.stats.total || 4} completed
              </span>
              <span>
                {children.find(c => c.id === activeChildId)?.stats.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-1">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${children.find(c => c.id === activeChildId)?.stats.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildTabsSimple;