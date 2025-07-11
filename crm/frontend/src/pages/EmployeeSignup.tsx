// src/pages/EmployeeSignup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Shield, Lock, Mail, User, CheckCircle, AlertCircle, Info } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// Types for better type safety
interface SignupFormData {
    work_email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    agreeToTerms: boolean;
}

interface FormErrors {
    work_email?: string;
    password?: string;
    confirmPassword?: string;
    first_name?: string;
    last_name?: string;
    agreeToTerms?: string;
    general?: string;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    isStrong: boolean;
}

interface ApiErrorResponse {
    error?: string;
    field_errors?: Record<string, string>;
    work_email?: string[];
    password?: string[];
    first_name?: string[];
    last_name?: string[];
    detail?: string;
    message?: string;
}

// Constants
// const CASA_COMMUNITY_DOMAIN = '@casa-community.com';
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;

// Password strength requirements matching Django backend
const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    noWhitespace: true,
    noSequentialNumbers: true,
    noSequentialLetters: true,
    noCommonPatterns: true
};

// Weak patterns to check against (matching Django backend)
const WEAK_PATTERNS = [
    /password/i,
    /12345678/,
    /qwerty/i,
    /admin/i,
    /letmein/i
];

// Sequential patterns
const SEQUENTIAL_NUMBERS = /0123|1234|2345|3456|4567|5678|6789|7890/;
const SEQUENTIAL_LETTERS = /abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i;

const EmployeeSignup: React.FC = () => {
    // Form state
    const [formData, setFormData] = useState<SignupFormData>({
        work_email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        agreeToTerms: false
    });

    // UI state
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Hooks
    // const { login } = useAuth();
    const navigate = useNavigate();

    // Memoized password strength calculation matching Django backend
    const passwordStrength = useMemo((): PasswordStrength => {
        const password = formData.password;
        let score = 0;
        const feedback: string[] = [];

        if (password.length === 0) {
            return { score: 0, feedback: [], isStrong: false };
        }

        // Check minimum length (Django: 8 characters)
        if (password.length >= 8) {
            score += 15;
        } else {
            feedback.push('Password must be 8 characters long');
        }

        // Check for lowercase letter
        if (/[a-z]/.test(password)) {
            score += 15;
        } else {
            feedback.push('Password must contain at least one lowercase letter (a-z)');
        }

        // Check for uppercase letter
        if (/[A-Z]/.test(password)) {
            score += 15;
        } else {
            feedback.push('Password must contain at least one uppercase letter (A-Z)');
        }

        // Check for digit
        if (/\d/.test(password)) {
            score += 15;
        } else {
            feedback.push('Password must contain at least one digit (0-9)');
        }

        // Check for special character (required in Django)
        if (/[!@#$%^&*()_+=\[\]{};:'",.<>/?\\|-]/.test(password)) {
            score += 15;
        } else {
            feedback.push('Password must contain at least one special character (!@#$%^&*()_+=[]{};:\'",./<>?\\|-)');
        }

        // Check for no whitespace
        if (!/\s/.test(password)) {
            score += 10;
        } else {
            feedback.push('Password must not contain whitespace');
        }

        // Check against sequential numbers
        if (!SEQUENTIAL_NUMBERS.test(password)) {
            score += 5;
        } else {
            feedback.push('Password must not contain sequential numbers');
        }

        // Check against sequential letters
        if (!SEQUENTIAL_LETTERS.test(password)) {
            score += 5;
        } else {
            feedback.push('Password must not contain sequential letters');
        }

        // Check against weak patterns
        let hasWeakPattern = false;
        for (const pattern of WEAK_PATTERNS) {
            if (pattern.test(password)) {
                hasWeakPattern = true;
                break;
            }
        }

        if (!hasWeakPattern) {
            score += 5;
        } else {
            feedback.push('Password is too easy. Please make a strong password');
        }

        return {
            score: Math.min(score, 100),
            feedback,
            isStrong: feedback.length === 0 && score >= 95
        };
    }, [formData.password]);

    // Memoized email validation
    const emailValidation = useMemo(() => {
        const email = formData.work_email.toLowerCase();
        return {
            isValid: /\S+@\S+\.\S+/.test(email),
            // isCasaEmail: email.endsWith(CASA_COMMUNITY_DOMAIN),
            isEmpty: email.trim() === ''
        };
    }, [formData.work_email]);

    // Handle input changes with real-time validation
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear specific field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }

        // Real-time email validation
        if (name === 'work_email' && value.trim()) {
            setErrors(prev => ({
                ...prev,
                work_email: 'Please use your Casa Community email address'
            }));
        }
    }, [errors]);

    // Handle name input with character filtering
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Filter out non-alphabetic characters and limit length
        const filteredValue = value
            .replace(/[^a-zA-Z\s'-]/g, '')
            .substring(0, MAX_NAME_LENGTH);

        setFormData(prev => ({
            ...prev,
            [name]: filteredValue
        }));

        // Clear error if exists
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

        // First Name validation
        const firstName = formData.first_name.trim();
        if (!firstName) {
            newErrors.first_name = 'First name is required';
        } else if (firstName.length < MIN_NAME_LENGTH) {
            newErrors.first_name = `First name must be at least ${MIN_NAME_LENGTH} characters`;
        } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
            newErrors.first_name = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }

        // Last Name validation
        const lastName = formData.last_name.trim();
        if (!lastName) {
            newErrors.last_name = 'Last name is required';
        } else if (lastName.length < MIN_NAME_LENGTH) {
            newErrors.last_name = `Last name must be at least ${MIN_NAME_LENGTH} characters`;
        } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
            newErrors.last_name = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }

        // Email validation
        if (!formData.work_email.trim()) {
            newErrors.work_email = 'Work email is required';
        } else if (!emailValidation.isValid) {
            newErrors.work_email = 'Please enter a valid email address';
        } // else if (!emailValidation.isCasaEmail) {
        //     newErrors.work_email = 'Please use your Casa Community email address (@casa-community.com)';
        // }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordStrength.isStrong) {
            newErrors.password = 'Password does not meet security requirements';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions to create an account';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, emailValidation, passwordStrength]);

    // Parse API errors with robust error handling
    const parseApiError = useCallback((error: any): void => {
        try {
            if (!error?.response?.data) {
                setErrors({ general: 'Network error. Please check your connection and try again.' });
                return;
            }

            const errorData: ApiErrorResponse = error.response.data;
            const newErrors: FormErrors = {};

            // Handle different error response formats
            if (errorData.error) {
                newErrors.general = errorData.error;
            } else if (errorData.detail) {
                newErrors.general = errorData.detail;
            } else if (errorData.message) {
                newErrors.general = errorData.message;
            }

            // Handle field-specific errors
            if (errorData.field_errors) {
                Object.entries(errorData.field_errors).forEach(([field, message]) => {
                    newErrors[field as keyof FormErrors] = message;
                });
            }

            // Handle array-style field errors
            if (errorData.work_email?.length) {
                newErrors.work_email = errorData.work_email[0];
            }
            if (errorData.password?.length) {
                newErrors.password = errorData.password[0];
            }
            if (errorData.first_name?.length) {
                newErrors.first_name = errorData.first_name[0];
            }
            if (errorData.last_name?.length) {
                newErrors.last_name = errorData.last_name[0];
            }

            // Fallback for unknown error format
            if (Object.keys(newErrors).length === 0) {
                newErrors.general = 'Registration failed. Please verify your information and try again.';
            }

            setErrors(newErrors);

        } catch (parseError) {
            console.error('Error parsing API response:', parseError);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        }
    }, []);

    // Form submission handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            // Focus on first error field
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.querySelector(`[name="${firstError}"]`) as HTMLInputElement;
                element?.focus();
            }
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Prepare signup data
            const signupData = {
                work_email: formData.work_email.trim().toLowerCase(),
                password: formData.password,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim()
            };

            // Import auth service dynamically
            const { authService } = await import('../services/authService');
            const signupResponse = await authService.employeeSignup(signupData);

            // Store tokens and user info from signup response
            localStorage.setItem('access_token', signupResponse.tokens.access);
            localStorage.setItem('refresh_token', signupResponse.tokens.refresh);
            localStorage.setItem('user_type', 'employee');

            // Show success message
            setSignupSuccess(true);

            // Redirect to employee dashboard after delay
            setTimeout(() => {
                navigate('/employee/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error('Employee signup error:', error);
            parseApiError(error);
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, parseApiError, navigate, errors]);

    // Password visibility toggles
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    // Password strength color and text
    const getPasswordStrengthColor = useCallback((score: number): string => {
        if (score < 25) return 'bg-red-500';
        if (score < 50) return 'bg-orange-500';
        if (score < 75) return 'bg-yellow-500';
        if (score < 100) return 'bg-blue-500';
        return 'bg-green-500';
    }, []);

    const getPasswordStrengthText = useCallback((score: number): string => {
        if (score < 25) return 'Weak';
        if (score < 50) return 'Fair';
        if (score < 75) return 'Good';
        if (score < 100) return 'Strong';
        return 'Excellent';
    }, []);

    // Success screen
    if (signupSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome to the Team!</h2>
                            <p className="text-gray-600">
                                Your Casa Community staff account has been created successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting you to the staff dashboard...
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                    <h1 className="text-3xl font-bold text-gray-900">Join Our Team</h1>
                    <p className="text-gray-600 mt-2">Create your Casa Community staff account</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                    {/* Info Banner */}
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="text-blue-800 font-medium">Employee Account Registration</p>
                                <p className="text-blue-600 mt-1">
                                    You must use your @casa-community.com email address to create a staff account.
                                </p>
                            </div>
                        </div>
                    </div> */}

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
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="first_name"
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={formData.first_name}
                                    onChange={handleNameChange}
                                    error={errors.first_name}
                                    required
                                    className="pl-10"
                                    maxLength={MAX_NAME_LENGTH}
                                    autoComplete="given-name"
                                    aria-describedby={errors.first_name ? 'first-name-error' : undefined}
                                />
                                <User className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="text"
                                    name="last_name"
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={formData.last_name}
                                    onChange={handleNameChange}
                                    error={errors.last_name}
                                    required
                                    className="pl-10"
                                    maxLength={MAX_NAME_LENGTH}
                                    autoComplete="family-name"
                                    aria-describedby={errors.last_name ? 'last-name-error' : undefined}
                                />
                                <User className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <Input
                                type="email"
                                name="work_email"
                                label="Work Email"
                                placeholder="your.name@casa-community.com"
                                value={formData.work_email}
                                onChange={handleChange}
                                error={errors.work_email}
                                required
                                className="pl-10"
                                autoComplete="email"
                                aria-describedby={errors.work_email ? 'email-error' : 'email-help'}
                            />
                            <Mail className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />

                            {/* Email validation feedback */}
                            {formData.work_email && !emailValidation.isEmpty && (
                                <div className="mt-1">
                                    {
                                    //     emailValidation.isCasaEmail ? (
                                    //     <p className="text-xs text-green-600 flex items-center">
                                    //         <CheckCircle className="w-3 h-3 mr-1" />
                                    //         Valid Casa Community email
                                    //     </p>
                                    // ) :
                                        emailValidation.isValid ? (
                                        <p className="text-xs text-orange-600">
                                            Please use your @casa-community.com email address
                                        </p>
                                    ) : (
                                        <p className="text-xs text-red-600">
                                            Please enter a valid email address
                                        </p>
                                    )}
                                </div>
                            )}
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
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                error={errors.password}
                                required
                                className="pl-10 pr-10"
                                autoComplete="new-password"
                                aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
                            />
                            <Lock className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            {/* Password Strength Indicator */}
                            {(formData.password || passwordFocused) && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                                                style={{ width: `${passwordStrength.score}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">
                                            {getPasswordStrengthText(passwordStrength.score)}
                                        </span>
                                    </div>

                                    {passwordStrength.feedback.length > 0 && (
                                        <div className="text-xs text-red-600 mt-2">
                                            <p className="font-medium mb-1">Password requirements not met:</p>
                                            <ul className="space-y-1">
                                                {passwordStrength.feedback.map((item, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-red-500 mr-1 mt-0.5">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {passwordStrength.isStrong && (
                                        <div className="text-xs text-green-600 mt-2">
                                            <p className="font-medium flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Password meets all security requirements!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                autoComplete="new-password"
                                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                            />
                            <Shield className="absolute left-3 top-8 w-4 h-4 text-gray-400" aria-hidden="true" />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            {/* Password Match Indicator */}
                            {formData.confirmPassword && (
                                <div className="mt-1">
                                    {formData.password === formData.confirmPassword ? (
                                        <p className="text-xs text-green-600 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Passwords match
                                        </p>
                                    ) : (
                                        <p className="text-xs text-red-600">
                                            Passwords do not match
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div className="space-y-1">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
                                />
                                <span className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link
                                        to="/terms"
                                        className="text-green-600 hover:text-green-800 underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Terms and Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link
                                        to="/privacy"
                                        className="text-green-600 hover:text-green-800 underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="text-sm text-red-600" id="terms-error">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!formData.agreeToTerms || !passwordStrength.isStrong}
                            className="mt-6"
                            aria-describedby="signup-button-description"
                        >
                            {loading ? 'Creating Account...' : 'Create Staff Account'}
                        </Button>

                        <p id="signup-button-description" className="sr-only">
                            Create your Casa Community staff account
                        </p>
                    </form>

                    {/* Additional Links */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Already have a staff account?{' '}
                            <Link
                                to="/employee/login"
                                className="text-green-600 hover:text-green-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 rounded-sm"
                            >
                                Sign in here
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
                    <p className="mb-2">Need help with registration?</p>
                    <div className="space-x-4">
                        <span>📞 HR: 1800-CASA-HR</span>
                        <span>✉️ Email: hr@casa-community.com</span>
                    </div>
                    <p className="text-xs mt-2 text-gray-400">
                        Employee accounts require verification by HR before activation
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSignup;
