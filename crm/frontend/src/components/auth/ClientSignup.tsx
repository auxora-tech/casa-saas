// components/auth/ClientSignup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Users,
    Lock,
    Mail,
    User,
    Shield,
    CheckCircle,
    AlertCircle,
    Check
} from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

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

    const navigate = useNavigate();

    // Comprehensive password validation matching Django backend
    const validatePassword = useCallback((password: string): PasswordValidation => {
        const errors: string[] = [];

        if (password.length === 0) {
            return { isValid: false, errors: [] };
        }

        if (password.length < 8) {
            errors.push('Password must be 8 characters long');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter (a-z)');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter (A-Z)');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one digit (0-9)');
        }

        if (!/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*()_+=[]{};:\'",./<>?\\|-)');
        }

        if (/\s/.test(password)) {
            errors.push('Password must not contain whitespace');
        }

        if (SEQUENTIAL_NUMBERS.test(password)) {
            errors.push('Password must not contain sequential numbers');
        }

        if (SEQUENTIAL_LETTERS.test(password)) {
            errors.push('Password must not contain sequential letters');
        }

        for (const pattern of WEAK_PATTERNS) {
            if (pattern.test(password)) {
                errors.push('Password is too easy. Please make a strong password');
                break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, []);

    const passwordValidation = useMemo(() => {
        return validatePassword(formData.password);
    }, [formData.password, validatePassword]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (formData.first_name.trim().length < 2) {
            newErrors.first_name = 'First name must be at least 2 characters';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (formData.last_name.trim().length < 2) {
            newErrors.last_name = 'Last name must be at least 2 characters';
        }

        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.work_email)) {
            newErrors.work_email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors[0] || 'Password does not meet security requirements';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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
            const signupData = {
                work_email: formData.work_email,
                password: formData.password,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim()
            };

            const { authService } = await import('../../services/authService');
            const signupResponse = await authService.clientSignup(signupData);

            localStorage.setItem('access_token', signupResponse.tokens.access);
            localStorage.setItem('refresh_token', signupResponse.tokens.refresh);
            localStorage.setItem('user_type', 'client');

            setSignupSuccess(true);

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
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900">Welcome to Casa Community!</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your NDIS participant account has been created successfully. You're being redirected to your personalized dashboard.
                        </p>

                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                        <p className="text-sm text-gray-500">Setting up your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Casa Community</h2>
                        <p className="text-gray-600">Create your NDIS participant account</p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-6">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">Secure Registration</span>
                    </div>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-red-800 font-medium">Registration Failed</h4>
                                    <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="first_name"
                                    label="First Name"
                                    placeholder="First name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    error={errors.first_name}
                                    required
                                    className="pl-12"
                                />
                                <User className="absolute left-4 top-9 w-5 h-5 text-gray-400" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="text"
                                    name="last_name"
                                    label="Last Name"
                                    placeholder="Last name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    error={errors.last_name}
                                    required
                                    className="pl-12"
                                />
                                <User className="absolute left-4 top-9 w-5 h-5 text-gray-400" />
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
                                placeholder="Create a secure password"
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
                                className="pl-12 pr-12"
                            />
                            <Shield className="absolute left-4 top-9 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                            <p className="font-semibold text-gray-900 mb-3">Password Requirements:</p>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        {formData.password.length >= 8 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={formData.password.length >= 8 ? 'text-green-700' : 'text-gray-600'}>
                                        At least 8 characters
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        {/[a-z]/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={/[a-z]/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>
                                        One lowercase letter
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        {/[A-Z]/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={/[A-Z]/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>
                                        One uppercase letter
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        {/\d/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={/\d/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>
                                        One number
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        {/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>
                                        One special character
                                    </span>
                                </div>
                            </div>

                            {/* Password validation feedback */}
                            {formData.password && passwordValidation.errors.length > 0 && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 font-medium text-xs mb-2">Issues to fix:</p>
                                    <ul className="space-y-1">
                                        {passwordValidation.errors.slice(0, 3).map((error, index) => (
                                            <li key={index} className="text-red-700 text-xs flex items-start">
                                                <span className="text-red-500 mr-2 mt-0.5">•</span>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {formData.password && passwordValidation.isValid && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800 font-medium text-xs flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Password meets all requirements!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div className="space-y-2">
                            <label className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 leading-relaxed">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline font-medium">
                                        Terms and Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline font-medium">
                                        Privacy Policy
                                    </Link>
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="text-sm text-red-600 ml-7">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!passwordValidation.isValid || !formData.agreeToTerms}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {loading ? 'Creating Account...' : 'Create My Account'}
                        </Button>
                    </form>

                    {/* Additional Links */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/client/login"
                                className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                            >
                                Sign In Instead
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Need Help with Registration?</h4>
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

export default ClientSignup;
