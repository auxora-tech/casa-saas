import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Shield,
    Lock,
    Mail,
    User,
    CheckCircle,
    AlertCircle,
    Check,
    UserCheck
} from 'lucide-react';
import { authService } from '../../services/authService';

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

interface FormData {
    work_email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
}

interface FormErrors {
    work_email?: string;
    password?: string;
    confirmPassword?: string;
    first_name?: string;
    last_name?: string;
    general?: string;
}

interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

const EmployeeSignup: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        work_email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

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

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // First name validation
        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (formData.first_name.trim().length < 2) {
            newErrors.first_name = 'First name must be at least 2 characters';
        }

        // Last name validation
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (formData.last_name.trim().length < 2) {
            newErrors.last_name = 'Last name must be at least 2 characters';
        }

        // Email validation
        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Work email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.work_email)) {
            newErrors.work_email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors[0] || 'Password does not meet security requirements';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const signupData = {
                work_email: formData.work_email.trim(),
                password: formData.password,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim()
            };

            const response = await authService.employeeSignup(signupData);

            console.log('Employee signup successful:', response);
            setSignupSuccess(true);

            setTimeout(() => {
                navigate('/employee/login', {
                    state: {
                        message: 'Account created successfully! Please log in with your credentials.',
                        email: formData.work_email
                    }
                });
            }, 1500);

        } catch (error: any) {
            console.error('Employee signup error:', error);

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
                setErrors({
                    general: 'Network error. Please check your connection and try again.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (signupSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900">Welcome to Casa Community!</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your employee account has been created successfully. You're being redirected to the login page.
                        </p>

                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                        <p className="text-sm text-gray-500">Redirecting...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Portal Selection
                    </Link>

                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UserCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Team</h2>
                        <p className="text-gray-600">Create your employee account</p>
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
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`appearance-none relative block w-full px-4 py-3 pl-12 border ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                                        } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors`}
                                    placeholder="First name"
                                />
                                <User className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                                {errors.first_name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
                                )}
                            </div>

                            <div className="relative">
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`appearance-none relative block w-full px-4 py-3 pl-12 border ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                                        } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors`}
                                    placeholder="Last name"
                                />
                                <User className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                                {errors.last_name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <label htmlFor="work_email" className="block text-sm font-medium text-gray-700 mb-2">
                                Work Email
                            </label>
                            <input
                                id="work_email"
                                name="work_email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.work_email}
                                onChange={handleChange}
                                className={`appearance-none relative block w-full px-4 py-3 pl-12 border ${errors.work_email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="you@company.com"
                            />
                            <Mail className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                            {errors.work_email && (
                                <p className="mt-2 text-sm text-red-600">{errors.work_email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`appearance-none relative block w-full px-4 py-3 pl-12 pr-12 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="Create a secure password"
                            />
                            <Lock className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`appearance-none relative block w-full px-4 py-3 pl-12 pr-12 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="Confirm your password"
                            />
                            <Shield className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
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

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={loading || !passwordValidation.isValid}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${loading || !passwordValidation.isValid
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                                } transition duration-150 ease-in-out`}
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
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
                                to="/employee/login"
                                className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                            >
                                Sign In Instead
                            </Link>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Are you an NDIS participant?{' '}
                                <Link to="/client/signup" className="text-emerald-600 hover:text-emerald-800 font-medium">
                                    Use Client Portal
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

export default EmployeeSignup;
