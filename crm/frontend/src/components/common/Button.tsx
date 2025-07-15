// components/common/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent';
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'w-full py-3 px-6 rounded-xl font-medium font-subheading transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-dodo-black hover:bg-dodo-gray text-white focus:ring-dodo-gray shadow-sm hover:shadow-md',
        secondary: 'bg-dodo-cream hover:bg-dodo-gray hover:text-white text-dodo-black focus:ring-dodo-gray border border-dodo-gray/20',
        accent: 'bg-dodo-red hover:bg-red-700 text-white focus:ring-dodo-red shadow-sm hover:shadow-md'
    };

    const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    <span className="font-body">Loading...</span>
                </div>
            ) : (
                <span className="font-body">{children}</span>
            )}
        </button>
    );
};
