// components/auth/ClientLogin.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Users, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const ClientLogin: React.FC = () => {
    const [formData, setFormData] = useState({
        work_email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.work_email)) {
            newErrors.work_email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await login(formData, 'client');
            localStorage.setItem('user_wok_email', JSON.stringify(formData.work_email))
            navigate('/client/dashboard/');
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.error) {
                    setErrors({ general: errorData.error });
                } else if (errorData.field_errors) {
                    setErrors(errorData.field_errors);
                } else {
                    setErrors({ general: 'Login failed. Please try again.' });
                }

                if (errorData.redirect) {
                    setTimeout(() => {
                        window.location.href = errorData.redirect;
                    }, 2000);
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Portal Selection
                    </Link>

                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                        <p className="text-gray-600">Sign in to your NDIS participant portal</p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-6">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">Secure Login</span>
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-red-800 font-medium">Sign In Failed</h4>
                                    <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="relative">
                            <Input
                                type="email"
                                name="work_email"
                                label="Email Address"
                                placeholder="Enter your email address"
                                value={formData.work_email}
                                onChange={handleChange}
                                error={errors.work_email}
                                required
                                className="pl-12"
                            />
                            <Mail className="absolute left-4 top-9 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                                className="pl-12 pr-12"
                            />
                            <Lock className="absolute left-4 top-9 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {loading ? 'Signing in...' : 'Sign In to Your Account'}
                        </Button>
                    </form>

                    {/* Additional Links */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New to Casa Community?</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/client/signup"
                                className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                            >
                                Create New Account
                            </Link>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Are you a Casa Community staff member?{' '}
                                <Link to="/employee/signin" className="text-green-600 hover:text-green-800 font-medium">
                                    Use Staff Portal
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="text-center">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>📞 Call: 1800-CASA-HELP</p>
                            <p>✉️ Email: help@casa-community.com.au</p>
                            <p className="text-xs text-gray-500 mt-2">Available Mon-Fri, 8AM-6PM AEST</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLogin;
