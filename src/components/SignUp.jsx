import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

import { school_id, api_base_url } from '@/utils/const';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// import { loginFunction } from '../utils/login';
import Header from './Header';
import ForgotPasswordModal from './ForgotPasswordModal';

// Form validation schema
const signupSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check invite_id on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const inviteId = urlParams.get('invite_id');

        if (!inviteId) {
            navigate('/login');
        } else {
            localStorage.setItem('inviteData', inviteId);
        }
    }, [location, navigate]);

    // Email validation function
    const emailValidation = (email) => {
        const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return reg.test(email);
    };

    // Password validation function
    const validatePassword = (password1, password2) => {
        return password1 === password2;
    };

    const form = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    // Main signup function
    const onSubmit = async (data) => {
        setIsLoading(true);

        // Validate email format
        if (!emailValidation(data.email)) {
            toast.error('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        // Validate password match
        if (!validatePassword(data.password, data.confirmPassword)) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Check if all fields are filled
        if (!data.email || !data.password || !data.confirmPassword) {
            toast.error('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            // Hash the password
            const hashedPassword = CryptoJS.SHA256(data.password).toString(CryptoJS.enc.Hex);

            const obj = {
                email: data.email,
                password: hashedPassword,
                invite_id: `http://localhost:5173/signUp?invite_id=${localStorage.getItem('inviteData')}`
            };

            const response = await fetch(`${api_base_url}/sign_up/${school_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            });

            const result = await response.json();

            if (result.message === "SignUp Data successfully updated") {
                toast.success('Account created successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else if (result.error === `signup_id with email ${data.email} Already Registered`) {
                toast.error('Email already registered');
            } else if (result.error === "Already registered with another mail-id. (Invalid URL)") {
                toast.error('Invalid URL - Already registered with another email');
            } else {
                toast.error('Signup failed');
            }
        } catch (error) {
            toast.error('Network error occurred');
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
                            Welcome
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Sign up to access your dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
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

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Confirm your password"
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
                                        'Sign Up'
                                    )}
                                </Button>


                            </form>
                        </Form>
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

export default SignUp;