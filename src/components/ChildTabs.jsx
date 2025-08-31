// Child selection tabs
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ChildTabs = ({ children, activeChildId, onChildSelect }) => {
  if (!children || children.length === 0) return null;

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-[#0F2D52] border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop tabs */}
        <div className="hidden md:flex space-x-1 overflow-x-auto py-4">
          {children.map((child) => (
            <Button
              key={child.childId}
              variant={activeChildId === child.childId ? "secondary" : "ghost"}
              className={`min-w-fit whitespace-nowrap relative ${
                activeChildId === child.childId
                  ? 'bg-white text-[#0F2D52] hover:bg-gray-100'
                  : 'text-white hover:bg-[#0F2D52]/80'
              }`}
              onClick={() => onChildSelect(child.childId)}
            >
              <Users className="h-4 w-4 mr-2" />
              <span>{child.firstName} {child.lastName}</span>
              {child.className && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${
                    activeChildId === child.childId 
                      ? 'border-[#0F2D52] text-[#0F2D52]' 
                      : 'border-white text-white'
                  }`}
                >
                  {child.className}
                </Badge>
              )}
              <div 
                className={`absolute top-1 right-1 h-2 w-2 rounded-full ${getProgressColor(child.stats.progress)}`}
                title={`${child.stats.progress}% complete`}
              />
            </Button>
          ))}
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden py-4">
          <Select onValueChange={onChildSelect} value={activeChildId?.toString()}>
            <SelectTrigger 
              className="w-full bg-white text-[#0F2D52]"
              aria-label="Select child"
            >
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem 
                  key={child.childId} 
                  value={child.childId.toString()}
                  className="flex items-center"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">{child.firstName} {child.lastName}</span>
                      {child.className && (
                        <span className="text-sm text-gray-500 ml-2">({child.className})</span>
                      )}
                    </div>
                    <div className="flex items-center ml-2">
                      <div 
                        className={`h-2 w-2 rounded-full mr-1 ${getProgressColor(child.stats.progress)}`}
                        title={`${child.stats.progress}% complete`}
                      />
                      <span className="text-xs text-gray-500">
                        {child.stats.completed}/{child.stats.total}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ChildTabs;