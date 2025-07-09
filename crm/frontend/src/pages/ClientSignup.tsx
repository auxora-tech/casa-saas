// src/pages/ClientSignup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Users, Lock, Mail, User, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// Password validation patterns matching Django backend
const WEAK_PATTERNS = [
    /password/i,
    /12345678/,
    /qwerty/i,
    /admin/i,
    /letmein/i
];

const SEQUENTIAL_NUMBERS = /0123|1234|2345|3456|4567|5678|6789|7890/;
const SEQUENTIAL_LETTERS = /abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i;

interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

const ClientSignup: React.FC = () => {
    const [formData, setFormData] = useState({
        work_email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        agreeToTerms: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // const { login } = useAuth();
    const navigate = useNavigate();

    // Comprehensive password validation matching Django backend
    const validatePassword = useCallback((password: string): PasswordValidation => {
        const errors: string[] = [];

        if (password.length === 0) {
            return { isValid: false, errors: [] };
        }

        // Check minimum length
        if (password.length < 8) {
            errors.push('Password must be 8 characters long');
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter (a-z)');
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter (A-Z)');
        }

        // Check for at least one digit
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one digit (0-9)');
        }

        // Check for at least one special character
        if (!/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*()_+=[]{};:\'",./<>?\\|-)');
        }

        // Check for no whitespace
        if (/\s/.test(password)) {
            errors.push('Password must not contain whitespace');
        }

        // Check against sequential numbers
        if (SEQUENTIAL_NUMBERS.test(password)) {
            errors.push('Password must not contain sequential numbers');
        }

        // Check against sequential letters
        if (SEQUENTIAL_LETTERS.test(password)) {
            errors.push('Password must not contain sequential letters');
        }

        // Check against weak patterns
        for (const pattern of WEAK_PATTERNS) {
            if (pattern.test(password)) {
                errors.push('Password is too easy. Please make a strong password');
                break; // Only show this error once
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, []);

    // Real-time password validation
    const passwordValidation = useMemo(() => {
        return validatePassword(formData.password);
    }, [formData.password, validatePassword]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

        // First Name validation
        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (formData.first_name.trim().length < 2) {
            newErrors.first_name = 'First name must be at least 2 characters';
        }

        // Last Name validation
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (formData.last_name.trim().length < 2) {
            newErrors.last_name = 'Last name must be at least 2 characters';
        }

        // Email validation
        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.work_email)) {
            newErrors.work_email = 'Please enter a valid email address';
        }

        // Password validation using Django-matching function
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors[0] || 'Password does not meet security requirements';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            // Create account using clientSignup which returns tokens
            const signupData = {
                work_email: formData.work_email,
                password: formData.password,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim()
            };

            const { authService } = await import('../services/authService');
            const signupResponse = await authService.clientSignup(signupData);

            // Store tokens and user info from signup response
            localStorage.setItem('access_token', signupResponse.tokens.access);
            localStorage.setItem('refresh_token', signupResponse.tokens.refresh);
            localStorage.setItem('user_type', 'client');

            // Show success message briefly
            setSignupSuccess(true);

            // Redirect to client dashboard after a short delay
            setTimeout(() => {
                navigate('/client/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error('Signup error:', error);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.error) {
                    setErrors({ general: errorData.error });
                } else if (errorData.field_errors) {
                    setErrors(errorData.field_errors);
                } else if (errorData.work_email) {
                    setErrors({ work_email: errorData.work_email[0] || 'Email already exists' });
                } else {
                    setErrors({ general: 'Registration failed. Please try again.' });
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (signupSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">Welcome to Casa Community!</h2>
                        <p className="text-gray-600">
                            Your account has been created successfully. Redirecting you to your dashboard...
                        </p>

                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                    <h2 className="text-3xl font-bold text-gray-900">Join Casa Community</h2>
                    <p className="text-gray-600 mt-2">Create your NDIS participant account</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="first_name"
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    error={errors.first_name}
                                    required
                                    className="pl-10"
                                />
                                <User className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="text"
                                    name="last_name"
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    error={errors.last_name}
                                    required
                                    className="pl-10"
                                />
                                <User className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

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
                                placeholder="Create a secure password"
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

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                required
                                className="pl-10 pr-10"
                            />
                            <Shield className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Enhanced Password Requirements */}
                        <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
                            <p className="font-medium mb-2">Password Requirements:</p>
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    At least 8 characters
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    One lowercase letter (a-z)
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    One uppercase letter (A-Z)
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    One number (0-9)
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    One special character (!@#$%^&*)
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${formData.password && !/\s/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    No spaces allowed
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${formData.password && !SEQUENTIAL_NUMBERS.test(formData.password) && !SEQUENTIAL_LETTERS.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                    No sequential patterns
                                </div>
                            </div>

                            {/* Show specific validation errors */}
                            {formData.password && passwordValidation.errors.length > 0 && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-800 font-medium text-xs mb-1">Issues to fix:</p>
                                    <ul className="space-y-1">
                                        {passwordValidation.errors.map((error, index) => (
                                            <li key={index} className="text-red-700 text-xs flex items-start">
                                                <span className="text-red-500 mr-1">•</span>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Success message */}
                            {formData.password && passwordValidation.isValid && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-green-800 font-medium text-xs flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Password meets all requirements!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div className="space-y-1">
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
                                        Terms and Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                                        Privacy Policy
                                    </Link>
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!passwordValidation.isValid || !formData.agreeToTerms}
                            className="mt-6"
                        >
                            Create My Account
                        </Button>
                    </form>

                    {/* Additional Links */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/client/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign in here
                            </Link>
                        </p>

                        <p className="text-sm text-gray-500">
                            Are you a Casa Community staff member?{' '}
                            <Link to="/employee/login" className="text-green-600 hover:text-green-800 font-medium">
                                Use Staff Portal
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Help Section */}
                <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">Need help with registration?</p>
                    <div className="space-x-4">
                        <span>📞 Call: 1800-CASA-HELP</span>
                        <span>✉️ Email: help@gododo.com.au</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientSignup;
