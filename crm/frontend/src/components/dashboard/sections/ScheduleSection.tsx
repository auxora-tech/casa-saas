// components/dashboard/sections/ScheduleSection.tsx
import React from 'react';
import { Calendar, Clock, MapPin, User, Plus } from 'lucide-react';

const ScheduleSection: React.FC = () => {
    const upcomingAppointments = [
        // Mock data - replace with real API data
        {
            id: 1,
            title: "Support Session",
            date: "2025-07-15",
            time: "10:00 AM - 12:00 PM",
            location: "Home Visit",
            supporter: "Sarah Johnson",
            type: "support",
            status: "confirmed"
        },
        {
            id: 2,
            title: "Plan Review Meeting",
            date: "2025-07-18",
            time: "2:00 PM - 3:00 PM",
            location: "Casa Community Office",
            supporter: "Michael Chen",
            type: "review",
            status: "pending"
        }
    ];

    const getTypeColor = (type: string) => {
        const colors = {
            support: 'bg-blue-100 text-blue-800',
            review: 'bg-purple-100 text-purple-800',
            therapy: 'bg-green-100 text-green-800'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
                        <p className="text-gray-600 mt-1">
                            Manage your appointments and support sessions
                        </p>
                    </div>
                    <button className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Request Appointment
                    </button>
                </div>
            </div>

            {/* Calendar View */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Upcoming Appointments
                        </h3>

                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(appointment.type)}`}>
                                                    {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                {new Date(appointment.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-green-500" />
                                                {appointment.time}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                                {appointment.location}
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                Support Worker: <span className="font-medium">{appointment.supporter}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Appointments Scheduled
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Your support sessions and appointments will appear here.
                                </p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                    Schedule First Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                <div className="flex items-center">
                                    <Plus className="w-5 h-5 text-blue-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Request Support</p>
                                        <p className="text-xs text-gray-600">Schedule a support session</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Plan Review</p>
                                        <p className="text-xs text-gray-600">Schedule plan review meeting</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* This Week Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Sessions</span>
                                <span className="font-semibold">2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Hours Scheduled</span>
                                <span className="font-semibold">3 hrs</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Next Session</span>
                                <span className="font-semibold text-blue-600">Tomorrow</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleSection;
