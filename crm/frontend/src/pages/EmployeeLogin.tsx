// src/pages/EmployeeLogin.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// Types for better type safety
interface LoginFormData {
    work_email: string;
    password: string;
}

interface FormErrors {
    work_email?: string;
    password?: string;
    general?: string;
}

interface ApiErrorResponse {
    error?: string;
    field_errors?: Record<string, string>;
    work_email?: string[];
    password?: string[];
    detail?: string;
    message?: string;
}

// Constants
const CASA_COMMUNITY_DOMAIN = '@casa-community.com';
const MIN_PASSWORD_LENGTH = 6;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const EmployeeLogin: React.FC = () => {
    // Form state
    const [formData, setFormData] = useState<LoginFormData>({
        work_email: '',
        password: ''
    });

    // UI state
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState<number>(0);

    // Hooks
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Memoized values
    const isEmailValid = useMemo(() => {
        return formData.work_email.includes('@') &&
            /\S+@\S+\.\S+/.test(formData.work_email);
    }, [formData.work_email]);

    const isCasaEmail = useMemo(() => {
        return formData.work_email.toLowerCase().endsWith(CASA_COMMUNITY_DOMAIN);
    }, [formData.work_email]);

    // Check for lockout on component mount
    useEffect(() => {
        const lastLockout = localStorage.getItem('employee_login_lockout');
        const attempts = parseInt(localStorage.getItem('employee_login_attempts') || '0', 10);

        if (lastLockout) {
            const lockoutTime = parseInt(lastLockout, 10);
            const timeRemaining = LOCKOUT_DURATION - (Date.now() - lockoutTime);

            if (timeRemaining > 0) {
                setIsLocked(true);
                setLockoutTimer(Math.ceil(timeRemaining / 1000));
                setLoginAttempts(attempts);
            } else {
                // Lockout expired, clear it
                localStorage.removeItem('employee_login_lockout');
                localStorage.removeItem('employee_login_attempts');
            }
        } else {
            setLoginAttempts(attempts);
        }
    }, []);

    // Lockout timer countdown
    useEffect(() => {
        let interval: number;

        if (isLocked && lockoutTimer > 0) {
            interval = setInterval(() => {
                setLockoutTimer(prev => {
                    if (prev <= 1) {
                        setIsLocked(false);
                        setLoginAttempts(0);
                        localStorage.removeItem('employee_login_lockout');
                        localStorage.removeItem('employee_login_attempts');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLocked, lockoutTimer]);

    // Handle input changes with validation
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }
    }, [errors]);

    // Comprehensive form validation
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Work email is required';
        } else if (!isEmailValid) {
            newErrors.work_email = 'Please enter a valid email address';
        } else if (!isCasaEmail) {
            newErrors.work_email = 'Please use your Casa Community email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
            newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, isEmailValid, isCasaEmail]);

    // Handle failed login attempt
    const handleFailedAttempt = useCallback(() => {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('employee_login_attempts', newAttempts.toString());

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setIsLocked(true);
            setLockoutTimer(LOCKOUT_DURATION / 1000);
            localStorage.setItem('employee_login_lockout', Date.now().toString());

            setErrors({
                general: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`
            });
        } else {
            const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
            setErrors({
                general: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
            });
        }
    }, [loginAttempts]);

    // Handle successful login
    const handleSuccessfulLogin = useCallback(() => {
        // Clear login attempts on success
        localStorage.removeItem('employee_login_attempts');
        localStorage.removeItem('employee_login_lockout');
        setLoginAttempts(0);
        setIsLocked(false);

        // Navigate to intended destination or default dashboard
        const from = location.state?.from?.pathname || '/employee/dashboard';
        navigate(from, { replace: true });
    }, [navigate, location]);

    // Parse API errors with robust error handling
    const parseApiError = useCallback((error: any): string => {
        try {
            if (!error?.response?.data) {
                return 'Network error. Please check your connection and try again.';
            }

            const errorData: ApiErrorResponse = error.response.data;

            // Handle different error response formats
            if (errorData.error) {
                return errorData.error;
            }

            if (errorData.detail) {
                return errorData.detail;
            }

            if (errorData.message) {
                return errorData.message;
            }

            if (errorData.field_errors) {
                // Handle field-specific errors
                const fieldErrorMessages = Object.entries(errorData.field_errors)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(', ');
                return fieldErrorMessages;
            }

            // Handle array-style field errors
            if (errorData.work_email?.length) {
                setErrors(prev => ({ ...prev, work_email: errorData.work_email![0] }));
            }

            if (errorData.password?.length) {
                setErrors(prev => ({ ...prev, password: errorData.password![0] }));
            }

            // Fallback for unknown error format
            return 'Login failed. Please verify your credentials and try again.';

        } catch (parseError) {
            console.error('Error parsing API response:', parseError);
            return 'An unexpected error occurred. Please try again.';
        }
    }, []);

    // Form submission handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission if locked out
        if (isLocked) {
            return;
        }

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await login(formData, 'employee');
            handleSuccessfulLogin();

        } catch (error: any) {
            console.error('Employee login error:', error);

            // Handle 401 (unauthorized) specifically
            if (error?.response?.status === 401) {
                handleFailedAttempt();
            } else {
                const errorMessage = parseApiError(error);
                setErrors({ general: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    }, [
        formData,
        isLocked,
        validateForm,
        login,
        handleSuccessfulLogin,
        handleFailedAttempt,
        parseApiError
    ]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Format lockout timer
    const formatLockoutTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md px-2 py-1"
                        aria-label="Back to Portal Selection"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Portal Selection
                    </Link>

                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">Staff Portal</h1>
                    <p className="text-gray-600 mt-2">Casa Community Employee Access</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                    {/* Lockout Warning */}
                    {isLocked && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <div>
                                    <h3 className="text-red-800 font-medium">Account Temporarily Locked</h3>
                                    <p className="text-red-600 text-sm mt-1">
                                        Too many failed login attempts. Try again in {formatLockoutTime(lockoutTimer)}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Login Attempts Warning */}
                    {!isLocked && loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4" role="alert">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                <p className="text-yellow-700 text-sm">
                                    {MAX_LOGIN_ATTEMPTS - loginAttempts} login attempt{MAX_LOGIN_ATTEMPTS - loginAttempts !== 1 ? 's' : ''} remaining
                                </p>
                            </div>
                        </div>
                    )}

                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Email Input */}
                        <div className="relative">
                            <Input
                                type="email"
                                name="work_email"
                                label="Work Email"
                                placeholder="Enter your Casa Community email"
                                value={formData.work_email}
                                onChange={handleChange}
                                error={errors.work_email}
                                required
                                disabled={isLocked}
                                className="pl-10"
                                autoComplete="email"
                                aria-describedby={errors.work_email ? 'email-error' : undefined}
                            />
                            <Mail className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />

                            {/* Email domain hint */}
                            {formData.work_email && !isCasaEmail && !errors.work_email && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Use your @casa-community.com email address
                                </p>
                            )}
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
                                disabled={isLocked}
                                className="pl-10 pr-10"
                                autoComplete="current-password"
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                            <Lock className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                disabled={isLocked}
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm disabled:opacity-50"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={isLocked || !isEmailValid || !formData.password}
                            className="mt-6"
                            aria-describedby="login-button-description"
                        >
                            {loading ? 'Signing In...' : 'Sign In to Staff Portal'}
                        </Button>

                        <p id="login-button-description" className="sr-only">
                            Sign in to access the Casa Community staff portal
                        </p>
                    </form>

                    {/* Additional Links */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Need an employee account?{' '}
                            <Link
                                to="/employee/signup"
                                className="text-green-600 hover:text-green-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                            >
                                Sign up here
                            </Link>
                        </p>

                        <p className="text-sm text-gray-500">
                            Are you an NDIS participant?{' '}
                            <Link
                                to="/client/login"
                                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
                            >
                                Use Participant Portal
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Help Section */}
                <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">Need help accessing your account?</p>
                    <div className="space-x-4">
                        <span>📞 IT Support: 1800-CASA-TECH</span>
                        <span>✉️ Email: help@gododo.com.au</span>
                    </div>
                    <p className="text-xs mt-2 text-gray-400">
                        For security, employee accounts are locked after {MAX_LOGIN_ATTEMPTS} failed attempts
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
