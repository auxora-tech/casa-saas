// Create this file temporarily to test Tailwind: src/TestTailwind.tsx

import React from 'react';

const TestTailwind: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 text-center">
                    Tailwind CSS Test
                </h1>

                {/* Test Basic Colors First */}
                <div className="space-y-2">
                    <div className="bg-red-500 text-white p-4 rounded">Basic Red (should work)</div>
                    <div className="bg-blue-600 text-white p-4 rounded">Basic Blue (should work)</div>
                    <div className="bg-green-500 text-white p-4 rounded">Basic Green (should work)</div>
                </div>

                {/* Test Custom Dodo Colors */}
                <div className="space-y-2">
                    <div className="bg-dodo-black text-white p-4 rounded">Dodo Black (custom)</div>
                    <div className="bg-dodo-gray text-white p-4 rounded">Dodo Gray (custom)</div>
                    <div className="bg-dodo-cream text-dodo-black p-4 rounded">Dodo Cream (custom)</div>
                    <div className="bg-dodo-red text-white p-4 rounded">Dodo Red (custom)</div>
                </div>

                {/* Status Indicator */}
                <div className="text-center">
                    <p className="text-green-600 font-semibold">
                        ✅ If you can see both basic AND custom colors, Tailwind is working!
                    </p>
                    <p className="text-red-600 font-semibold">
                        ❌ If only basic colors work, there's a config issue
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestTailwind;
