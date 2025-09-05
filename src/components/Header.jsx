import React, { useCallback, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Sidebar from './Sidebar';
import SignOutModal from './SignOutModal';

function Header({ onSignOut, sidebar = true, component }) {
  const { logout } = useAuth0();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // For now, we'll determine admin status from onSignOut prop presence
  // This could be enhanced with proper role checking later
  const isAdmin = Boolean(onSignOut);

  const handleSignOutClick = useCallback(() => {
    setShowSignOutModal(true);
  }, []);

  const handleConfirmSignOut = useCallback(async () => {
    try {
      // Close modal immediately
      setShowSignOutModal(false);
      
      // Call parent's onSignOut if provided (for additional cleanup)
      if (onSignOut) {
        onSignOut();
      }
      
      // Logout with Auth0
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect as fallback
      window.location.href = '/login';
    }
  }, [logout, onSignOut]);

  const handleCancelSignOut = useCallback(() => {
    setShowSignOutModal(false);
  }, []);

  // Only show sidebar for admin users
  const shouldShowSidebar = sidebar && isAdmin;

  return (
    <>
    <nav className="bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] relative w-full">
      {/* Desktop / Tablet View */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Sidebar - Only for admin users */}
        {shouldShowSidebar && (
          <div className="flex-shrink-0">
            <Sidebar activeItem={component} />
          </div>
        )}

        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <a href="/admin-dashboard" className="block">
            <img
              src="image/gs_logo_lynnwood.png"
              alt="gs_logo_lynnwood"
              className="h-16 w-auto sm:h-20 lg:h-28 max-w-full object-contain"
            />
          </a>
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <div className="flex-shrink-0">
            <button
              onClick={handleSignOutClick}
              className="px-4 py-2 text-goddard-blue rounded-md shadow-sm shadow-[#002e4d] border border-[#002e4d] hover:border-goddard-blue hover:bg-goddard-light-blue transition-all duration-200 text-base"
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
              <span className="font-bold">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden px-4 py-2 space-y-3">
        {/* Logo centered */}
        <div className="flex justify-center border-b-2 border-b-gray-100">
          <a href="/admin-dashboard">
            <img
              src="image/gs_logo_lynnwood.png"
              alt="gs_logo_lynnwood"
              className="h-16 w-auto max-w-full object-contain"
            />
          </a>
        </div>

        {/* Sidebar + Sign Out horizontally or stacked */}
        <div className="flex flex-row xs:flex-col  justify-between gap-3 ">
          {/* Sidebar - Only for admin users */}
          {shouldShowSidebar && (
            <div >
              <Sidebar activeItem={component} />
            </div>
          )}

          {/* Sign Out Button */}
          {onSignOut && (
            <div >
              <button
                onClick={handleSignOutClick}
                className="w-full items-center justify-center flex max-w-[150px] px-4 py-2 text-goddard-blue text-sm font-semibold rounded-md shadow-sm shadow-[#002e4d] border border-[#002e4d] hover:border-goddard-blue hover:bg-goddard-light-blue transition-all duration-200"
              >
                <i className="fa-solid fa-arrow-right-from-bracket "></i>
                
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>

    <SignOutModal 
      isOpen={showSignOutModal}
      onClose={handleCancelSignOut}
      onConfirm={handleConfirmSignOut}
    />
    </>
  );
}

export default Header;
