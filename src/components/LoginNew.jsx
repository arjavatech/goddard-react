import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { loginFunction } from '../utils/login';
import Header from './Header';
import ForgotPasswordModal from './ForgotPasswordModal';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';

// Form validation schema
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginNew = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useAuth0Login, setUseAuth0Login] = useState(true); // Toggle between Auth0 and traditional login
  const navigate = useNavigate();
  const { loginWithPopup, isAuthenticated, user, logout, getAccessTokenSilently } = useAuth0();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check permissions after Auth0 login
  const checkUserPermissions = async (email) => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          auth0_user: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.isAdmin === true) {
          localStorage.setItem('logged_in_email', email);
          localStorage.setItem('is_admin', 'true');
          navigate('/admin-dashboard');
        } else if (data.isParent === true) {
          localStorage.setItem('logged_in_email', email);
          navigate('/parent-dashboard');
        } else {
          toast.error('Access denied', {
            description: 'You do not have permission to access this application.',
          });
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      } else {
        toast.error('Verification failed', {
          description: 'Unable to verify user permissions.',
        });
        logout({ logoutParams: { returnTo: window.location.origin } });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  // Effect to check permissions after Auth0 authentication
  useEffect(() => {
    if (isAuthenticated && user && useAuth0Login) {
      checkUserPermissions(user.email);
    }
  }, [isAuthenticated, user, useAuth0Login]);

  // Auth0 login handler
  const handleAuth0Login = async () => {
    setIsLoading(true);
    try {
      await loginWithPopup({
        authorizationParams: {
          prompt: 'login'
        }
      });
    } catch (error) {
      if (error.error !== 'popup_closed_by_user') {
        toast.error('Login failed', {
          description: 'Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Traditional login handler (with Auth0 token if available)
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Pass getAccessTokenSilently if authenticated with Auth0
      const result = await loginFunction(
        data.email, 
        data.password,
        isAuthenticated ? getAccessTokenSilently : null
      );

      if (result.success) {
        toast.success('Login successful! Redirecting...', {
          description: 'You have been signed in successfully.',
        });
        
        setTimeout(() => {
          navigate(result.redirect);
        }, 1500);
      } else {
        const errorMessages = {
          'empty': 'Please fill in all fields',
          'invalid': 'Invalid email or password',
          'network': 'Network error. Please try again.'
        };
        
        toast.error('Login failed', {
          description: errorMessages[result.error] || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex justify-center items-center py-8 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="image/gs_logo_tab.png" 
                className="w-20 h-20" 
                alt="The Goddard School Logo" 
              />
            </div>
            <CardTitle className="text-2xl font-bold text-goddard-blue">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Auth0 Login Button */}
            {useAuth0Login ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleAuth0Login}
                  className="w-full h-11 bg-[#002e4d] hover:bg-[#0F2D52] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In with Auth0'
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setUseAuth0Login(false)}
                >
                  Use Email & Password
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="link"
                  className="mb-4 p-0 h-auto"
                  onClick={() => setUseAuth0Login(true)}
                >
                  ← Back to Auth0 Login
                </Button>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-11 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#002e4d] hover:bg-[#0F2D52] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="text-[#0F2D52] hover:text-[#002e4d] p-0 h-auto font-medium"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot your password?
                  </Button>
                </div>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};

export default LoginNew;