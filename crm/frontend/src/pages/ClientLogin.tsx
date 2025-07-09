import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Users, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

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

            // Success! Redirect to client dashboard
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

                // Handle specific redirect cases
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Portal Selection
                    </Link>

                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900">NDIS Participant Login</h2>
                    <p className="text-gray-600 mt-2">Access your support services and care plan</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                className="pl-10"
                            />
                            <Mail className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
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
                                className="pl-10 pr-10"
                            />
                            <Lock className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Login Button */}
                        <Button type="submit" loading={loading} className="mt-6">
                            Sign In to Your Account
                        </Button>
                    </form>

                    {/* Additional Links */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/client/signup/" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign up here
                            </Link>
                        </p>

                        <p className="text-sm text-gray-500">
                            Are you a Casa Community staff member?{' '}
                            <Link to="/employee/signin/" className="text-green-600 hover:text-green-800 font-medium">
                                Use Staff Portal
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Help Section */}
                <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">Need help signing in?</p>
                    <div className="space-x-4">
                        <span>📞 Call: 1800-CASA-HELP</span>
                        <span>✉️ Email: help@gododo.com.au</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLogin;
