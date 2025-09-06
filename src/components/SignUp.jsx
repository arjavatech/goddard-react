import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import {api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';


import Header from './Header';


const SignUp = () => {
    const { loginWithPopup, isAuthenticated, isLoading, user, logout, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const location = useLocation();

    // Check invite_id on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const inviteId = urlParams.get('invite_id');

        if (inviteId) {
            localStorage.setItem('inviteData', inviteId);
            localStorage.setItem('pending_invite_id', inviteId);
        }
    }, []);

    // Handle Auth0 signup after authentication
    useEffect(() => {
        if (isAuthenticated && user) {
            handleSignupAPI(user.email);
        }
    }, [isAuthenticated, user]);

    const handleSignupAPI = async (email) => {
        const inviteId = localStorage.getItem('inviteData') || localStorage.getItem('pending_invite_id');
        
        try {
            const obj = {
                email: email,
                invite_id: inviteId ? `http://localhost:5173/signUp?invite_id=${inviteId}` : null
            };

            const headers = await getAuthHeaders(getAccessTokenSilently);
            const response = await fetch(`${api_base_url}/sign_up/${school_id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(obj)
            });

            const result = await response.json();

            if (result.message === "SignUp Data successfully updated") {
                toast.success('Account created successfully!');
                
                // Check permissions using the same API as login
                await checkUserPermissionsAfterSignup(email);
            } else if (result.error === `signup_id with email ${email} Already Registered`) {
                // User exists, check permissions
                await checkUserPermissionsAfterSignup(email);
            } else {
                toast.error('Signup failed');
                logout({ logoutParams: { returnTo: window.location.origin } });
            }
        } catch (error) {
            toast.error('Network error occurred');
            navigate('/login');
        }
    };

    const checkUserPermissionsAfterSignup = async (email) => {
        try {
            const headers = await getAuthHeaders(getAccessTokenSilently);
            const response = await fetch(`${api_base_url}/sign_in`, {
                method: 'GET',
                headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Signup permission check data:', data);
                
                if (data.isAdmin === true) {
                    localStorage.setItem('logged_in_email', email);
                    localStorage.setItem('is_admin', 'true');
                    navigate('/admin-dashboard');
                } else if (data.isParent === true) {
                    localStorage.setItem('logged_in_email', email);
                    navigate('/parent-dashboard');
                } else {
                    // Invalid user
                    alert('Invalid user - You do not have permission to access this application');
                    logout({ logoutParams: { returnTo: window.location.origin } });
                }
            } else {
                alert('Unable to verify user permissions after signup');
                logout({ logoutParams: { returnTo: window.location.origin } });
            }
        } catch (error) {
            console.error('Permission check error after signup:', error);
            alert('Network error occurred during permission check');
            logout({ logoutParams: { returnTo: window.location.origin } });
        }
    };

    const handleSignup = async () => {
        try {
            const inviteId = localStorage.getItem('inviteData');
            console.log('Opening Auth0 signup popup with invite_id:', inviteId);
            
            await loginWithPopup({
                authorizationParams: {
                    screen_hint: 'signup'
                }
            });
            console.log('Signup popup completed successfully');
        } catch (error) {
            console.error('Signup popup error:', error);
            if (error.error !== 'popup_closed_by_user') {
                toast.error('Signup failed. Please try again.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="flex justify-center items-center py-8 px-4">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    <div className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <img
                                src="image/gs_logo_tab.png"
                                className="w-20 h-20"
                                alt="The Goddard School Logo"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-[#002e4d]">
                            Welcome
                        </h2>
                        <p className="text-gray-600">
                            Sign up to access your dashboard
                        </p>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleSignup}
                            className="w-full py-3 px-4 bg-[#002e4d] hover:bg-[#0F2D52] text-white font-semibold rounded-md transition-colors"
                        >
                            Sign Up with Auth0
                        </button>
                        
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-[#002e4d] hover:underline font-medium"
                                >
                                    Log In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;