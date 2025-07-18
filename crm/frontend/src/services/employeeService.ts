// services/employeeService.ts
import api from './api';

export interface EmployeeProfileData {
  // Basic Info (Required)
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  address: string;
  phone: string;
  tfn: string;

  // Location (Optional)
  suburb?: string;
  state_territory?: string;
  postcode?: string;

  // Superannuation (Optional)
  fund_name?: string;
  abn?: string;
  member_number?: string;

  // Bank Details (Required)
  bank_name: string;
  account_name: string;
  bsb: string;
  account_number: string;

  // Emergency Contact (Required)
  emergency_contact_first_name: string;
  emergency_contact_last_name?: string;
  emergency_contact_number: string;
  emergency_contact_home?: string;
  emergency_contact_relationship: string;
}

export interface EmployeeProfileResponse {
  success: boolean;
  message: string;
  profile: {
    id: string;
    uuid: string;
    tfn: string; // Masked for security
    bank_account: string; // Masked for security
  };
  action: 'created' | 'updated';
  next_steps: string[];
}

export interface EmployeeProfile extends EmployeeProfileData {
  id: string;
  uuid: string;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
}

export const employeeService = {
  // Get employee profile
  getProfile: async (): Promise<EmployeeProfile | null> => {
    try {
      const response = await api.get('/api/employee/profile/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile doesn't exist yet
        return null;
      }
      throw error;
    }
  },

  // Create or update employee profile
  createUpdateProfile: async (profileData: EmployeeProfileData): Promise<EmployeeProfileResponse> => {
    try {
      const response = await api.post('/api/employee/profile/', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Employee profile error:', error);
      throw error;
    }
  },

  // Get employee dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/employee/dashboard/stats/');
      return response.data;
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  // Support worker management (Admin only)
  getSupportWorkers: async () => {
    try {
      const response = await api.get('/api/employee/support-workers/');
      return response.data;
    } catch (error: any) {
      console.error('Support workers error:', error);
      throw error;
    }
  },

  // Create support worker (Admin only)
  createSupportWorker: async (workerData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/api/employee/support-workers/', workerData);
      return response.data;
    } catch (error: any) {
      console.error('Create support worker error:', error);
      throw error;
    }
  },

  // Get employee's assigned clients (Support Worker)
  getAssignedClients: async () => {
    try {
      const response = await api.get('/api/employee/clients/');
      return response.data;
    } catch (error: any) {
      console.error('Assigned clients error:', error);
      throw error;
    }
  },

  // Get employee's schedule
  getSchedule: async (date?: string) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/api/employee/schedule/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Schedule error:', error);
      throw error;
    }
  },

  // Log work hours
  logHours: async (hoursData: {
    client_id: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    try {
      const response = await api.post('/api/employee/hours/', hoursData);
      return response.data;
    } catch (error: any) {
      console.error('Log hours error:', error);
      throw error;
    }
  },

  // Get employee notes
  getNotes: async () => {
    try {
      const response = await api.get('/api/employee/notes/');
      return response.data;
    } catch (error: any) {
      console.error('Notes error:', error);
      throw error;
    }
  },

  // Create note
  createNote: async (noteData: {
    title: string;
    content: string;
    client_id?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  }) => {
    try {
      const response = await api.post('/api/employee/notes/', noteData);
      return response.data;
    } catch (error: any) {
      console.error('Create note error:', error);
      throw error;
    }
  },

  // Get employee documents
  getDocuments: async () => {
    try {
      const response = await api.get('/api/employee/documents/');
      return response.data;
    } catch (error: any) {
      console.error('Documents error:', error);
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (documentData: FormData) => {
    try {
      const response = await api.post('/api/employee/documents/', documentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId: string) => {
    try {
      const response = await api.get(`/api/employee/documents/${documentId}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Download document error:', error);
      throw error;
    }
  },

  // Update employee user details (name, email)
  updateUserDetails: async (userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }) => {
    try {
      const response = await api.patch('/api/employee/user/', userData);
      return response.data;
    } catch (error: any) {
      console.error('Update user details error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData: {
    old_password: string;
    new_password: string;
  }) => {
    try {
      const response = await api.post('/api/employee/change-password/', passwordData);
      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Get employee profile completion status
  getProfileCompletion: async () => {
    try {
      const response = await api.get('/api/employee/profile/completion/');
      return response.data;
    } catch (error: any) {
      console.error('Profile completion error:', error);
      throw error;
    }
  },
};
