import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    UserPlus,
    FileText,
    MessageCircle,
    LogOut,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Home,
    Plus
} from 'lucide-react';

interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'SUPPORT_WORKER';
    profile_completed: boolean;
    last_login?: string;
    created_at: string;
}

interface DashboardStats {
    total_support_workers: number;
    active_clients: number;
    pending_documents: number;
    recent_activities: number;
}

const EmployeeDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        total_support_workers: 0,
        active_clients: 0,
        pending_documents: 0,
        recent_activities: 0
    });
    const [supportWorkers, setSupportWorkers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

    // Mock data - replace with actual API calls
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setEmployee({
                id: '1',
                first_name: 'John',
                last_name: 'Smith',
                email: 'john.smith@casacommunity.com.au',
                role: 'ADMIN', // Change to 'SUPPORT_WORKER' to test support worker view
                profile_completed: true,
                last_login: '2025-01-17T10:30:00Z',
                created_at: '2025-01-01T00:00:00Z'
            });

            setStats({
                total_support_workers: 12,
                active_clients: 45,
                pending_documents: 8,
                recent_activities: 23
            });

            setSupportWorkers([
                {
                    id: '2',
                    first_name: 'Sarah',
                    last_name: 'Johnson',
                    email: 'sarah.johnson@casacommunity.com.au',
                    role: 'SUPPORT_WORKER',
                    profile_completed: true,
                    last_login: '2025-01-16T15:45:00Z',
                    created_at: '2025-01-05T00:00:00Z'
                },
                {
                    id: '3',
                    first_name: 'Mike',
                    last_name: 'Brown',
                    email: 'mike.brown@casacommunity.com.au',
                    role: 'SUPPORT_WORKER',
                    profile_completed: false,
                    created_at: '2025-01-10T00:00:00Z'
                }
            ]);

            setLoading(false);
        }, 1000);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
        navigate('/');
    };

    // const handleProfileClick = () => {
    //     setActiveTab('profile');
    // };

    // const handleDocumentsClick = () => {
    //     if (!employee?.profile_completed) {
    //         alert('Please complete your profile first to access documents.');
    //         return;
    //     }
    //     setActiveTab('documents');
    // };

    const sidebarItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard', available: true },
        { id: 'profile', icon: User, label: 'Profile', available: true },
        { id: 'notes', icon: FileText, label: 'Notes', available: true },
        { id: 'documents', icon: FileText, label: 'Documents', available: employee?.profile_completed || false },
        { id: 'chat', icon: MessageCircle, label: 'Chat', available: false, comingSoon: true },
    ];

    if (employee?.role === 'ADMIN') {
        sidebarItems.splice(1, 0, { id: 'support-workers', icon: Users, label: 'Support Workers', available: true });
    }

    const renderDashboardContent = () => {
        if (employee?.role === 'ADMIN') {
            return (
                <div className="space-y-6">
                    {/* Admin Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Support Workers</p>
                                    <p className="text-3xl font-bold text-emerald-600">{stats.total_support_workers}</p>
                                </div>
                                <Users className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Clients</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.active_clients}</p>
                                </div>
                                <User className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.pending_documents}</p>
                                </div>
                                <FileText className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Recent Activities</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.recent_activities}</p>
                                </div>
                                <Clock className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setShowAddWorkerModal(true)}
                                className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                                <UserPlus className="w-6 h-6 text-emerald-600" />
                                <span className="font-medium text-emerald-700">Add Support Worker</span>
                            </button>

                            <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <span className="font-medium text-blue-700">Review Documents</span>
                            </button>

                            <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                                <Calendar className="w-6 h-6 text-purple-600" />
                                <span className="font-medium text-purple-700">Schedule Meeting</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Support Workers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Support Workers</h3>
                            <button
                                onClick={() => setActiveTab('support-workers')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {supportWorkers.slice(0, 3).map((worker) => (
                                <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{worker.first_name} {worker.last_name}</p>
                                            <p className="text-sm text-gray-500">{worker.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {worker.profile_completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-orange-500" />
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {worker.profile_completed ? 'Complete' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        } else {
            // Support Worker Dashboard
            return (
                <div className="space-y-6">
                    {/* Support Worker Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">My Clients</p>
                                    <p className="text-3xl font-bold text-blue-600">8</p>
                                </div>
                                <User className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                                    <p className="text-3xl font-bold text-orange-600">5</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Week's Hours</p>
                                    <p className="text-3xl font-bold text-emerald-600">32</p>
                                </div>
                                <Calendar className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-blue-600 font-medium">9:00 AM</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Client Visit - Sarah Mitchell</p>
                                    <p className="text-sm text-gray-500">Personal care assistance</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="text-emerald-600 font-medium">2:00 PM</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Team Meeting</p>
                                    <p className="text-sm text-gray-500">Weekly case review</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <Clock className="w-6 h-6 text-blue-600" />
                                <span className="font-medium text-blue-700">Log Hours</span>
                            </button>

                            <button className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                <span className="font-medium text-emerald-700">Add Note</span>
                            </button>

                            <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                                <User className="w-6 h-6 text-purple-600" />
                                <span className="font-medium text-purple-700">View Clients</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboardContent();
            case 'profile':
                return <EmployeeProfile employee={employee} />;
            case 'support-workers':
                return employee?.role === 'ADMIN' ? <SupportWorkersManagement workers={supportWorkers} /> : null;
            case 'notes':
                return <NotesSection />;
            case 'documents':
                return <DocumentsSection />;
            case 'chat':
                return <ComingSoonSection feature="Chat" />;
            default:
                return renderDashboardContent();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg border-r border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-emerald-600">Casa Community</h2>
                    <p className="text-sm text-gray-500">Employee Portal</p>
                </div>

                <nav className="mt-6 px-3">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => item.available ? setActiveTab(item.id) : null}
                            disabled={!item.available}
                            className={`w-full flex items-center space-x-3 px-3 py-3 mb-2 rounded-lg text-left transition-colors ${activeTab === item.id
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : item.available
                                        ? 'text-gray-700 hover:bg-gray-100'
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {item.comingSoon && (
                                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                                    Coming Soon
                                </span>
                            )}
                            {!item.available && !item.comingSoon && (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-3 right-3">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Casa Community</h1>
                            <p className="text-sm text-gray-500">Employee Portal</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {employee?.first_name} {employee?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {employee?.role?.toLowerCase().replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>
            </div>

            {/* Add Support Worker Modal */}
            {showAddWorkerModal && (
                <AddSupportWorkerModal
                    onClose={() => setShowAddWorkerModal(false)}
                    onSuccess={() => {
                        setShowAddWorkerModal(false);
                        // Refresh support workers list
                    }}
                />
            )}
        </div>
    );
};

// Employee Profile Component
const EmployeeProfile: React.FC<{ employee: Employee | null }> = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Profile</h3>
                <p className="text-gray-600">Complete your employee profile to access all features.</p>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium">Profile completion is required for:</p>
                    <ul className="mt-2 text-blue-700 text-sm space-y-1">
                        <li>• Access to documents</li>
                        <li>• Payroll setup</li>
                        <li>• Employee benefits</li>
                        <li>• Emergency contact information</li>
                    </ul>
                </div>

                <button className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    Complete Profile
                </button>
            </div>
        </div>
    );
};

// Support Workers Management Component
const SupportWorkersManagement: React.FC<{ workers: Employee[] }> = ({ workers }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Support Workers</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Support Worker</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workers.map((worker) => (
                                <tr key={worker.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {worker.first_name} {worker.last_name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {worker.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {worker.profile_completed ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Complete
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(worker.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-emerald-600 hover:text-emerald-900">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Notes Section Component
const NotesSection: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-600">Manage your notes and observations here.</p>

                <button className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    Add New Note
                </button>
            </div>
        </div>
    );
};

// Documents Section Component
const DocumentsSection: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <p className="text-gray-600">Access your employee documents and forms here.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Employment Contract</h4>
                        <p className="text-sm text-gray-500">PDF • 2.3 MB</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Tax File Number</h4>
                        <p className="text-sm text-gray-500">PDF • 1.1 MB</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Bank Details</h4>
                        <p className="text-sm text-gray-500">PDF • 0.8 MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Coming Soon Component
const ComingSoonSection: React.FC<{ feature: string }> = ({ feature }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature} Coming Soon</h3>
                <p className="text-gray-600">We're working hard to bring you this feature. Stay tuned!</p>
            </div>
        </div>
    );
};

// Add Support Worker Modal Component
const AddSupportWorkerModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Adding support worker:', formData);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Support Worker</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    title='first-name'
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    title='last-name'
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Work Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="employee@casacommunity.com.au"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Temporary Password
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Employee will be asked to change on first login"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                                <strong>Note:</strong> The new support worker will receive an email with their login credentials and will be required to complete their profile and change their password on first login.
                            </p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Add Support Worker
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
