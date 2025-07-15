// components/common/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    required,
    ...props
}) => {
    const baseInputClasses = 'block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 font-body';

    const normalClasses = 'border-dodo-gray/30 focus:border-dodo-black focus:ring-dodo-gray/30 bg-white text-dodo-black placeholder-dodo-gray';

    const errorClasses = 'border-dodo-red focus:border-dodo-red focus:ring-dodo-red/30 bg-red-50';

    const inputClasses = error ? errorClasses : normalClasses;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-dodo-black font-subheading">
                    {label}
                    {required && <span className="text-dodo-red ml-1">*</span>}
                </label>
            )}
            <input
                className={`${baseInputClasses} ${inputClasses} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-dodo-red font-body flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                </p>
            )}
        </div>
    );
};
