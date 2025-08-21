import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen,
  UserPlus,
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

function SidebarNew({ activeItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'Dashboard',
      href: '/admin-dashboard',
      label: 'Admin Dashboard',
      description: 'Overview and statistics',
      icon: <LayoutDashboard className="h-5 w-5" />,
      badge: 'Main'
    },
    {
      id: 'Application Status',
      href: '/application-status',
      label: 'Application Status',
      description: 'Review and manage applications',
      icon: <FileText className="h-5 w-5" />,
      badge: 'Active'
    },
    {
      id: 'ParentDetails',
      href: '/parent-details',
      label: 'Parent Details',
      description: 'Manage parent information',
      icon: <Users className="h-5 w-5" />,
      badge: null
    },
    {
      id: 'InviteParent',
      href: '/invite-parent',
      label: 'Invite Parent',
      description: 'Send enrollment invitations',
      icon: <UserPlus className="h-5 w-5" />,
      badge: 'New'
    },
    {
      id: 'ClassroomFormManage',
      href: '/forms-repository',
      label: 'Forms Repository',
      description: 'Manage classrooms and forms',
      icon: <FolderOpen className="h-5 w-5" />,
      badge: null
    }
  ];

  const handleMenuClick = (item) => {
    setIsOpen(false);
    // Add a small delay for smooth transition
    setTimeout(() => {
      window.location.href = item.href;
      toast.success(`Navigating to ${item.label}`);
    }, 150);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-[#0F2D52] text-xl">
            <LayoutDashboard className="h-6 w-6" />
            Admin Navigation
          </SheetTitle>
          <SheetDescription>
            Access all administrative functions and pages
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <Button
                variant={activeItem === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-4 text-left transition-all ${
                  activeItem === item.id
                    ? 'bg-[#0F2D52] hover:bg-[#0F2D52]/90 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <div className="flex items-start w-full gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${
                    activeItem === item.id ? 'text-white' : 'text-[#0F2D52]'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        {item.label}
                      </h4>
                      {item.badge && (
                        <Badge 
                          variant={activeItem === item.id ? "secondary" : "outline"}
                          className="text-xs ml-2 flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      activeItem === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  <ExternalLink className={`h-3 w-3 flex-shrink-0 mt-0.5 ${
                    activeItem === item.id ? 'text-blue-200' : 'text-gray-400'
                  }`} />
                </div>
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-[#0F2D52] text-sm mb-1">
              Navigation Help
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              All pages have been redesigned with modern shadcn/ui components for a better user experience.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 text-sm mb-1">
              Current Page
            </h4>
            <p className="text-xs text-gray-600">
              {menuItems.find(item => item.id === activeItem)?.label || 'Unknown Page'}
            </p>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SidebarNew;