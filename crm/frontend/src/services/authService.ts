// src/services/authService.ts
import api from './api';

interface LoginCredentials {
  work_email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    work_email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    role: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

interface SignupData {
  work_email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  user_type: string;
  user: {
    id: number;
    work_email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  redirect_url: string;
}

interface CurrentUserResponse {
  user: {
    id: number;
    work_email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  user_type: string;
  membership: {
    company: string;
    role: string;
    is_active: boolean;
  };
}

interface EmployeeProfileData {
  // User info (auto-filled from auth context)
  first_name: string;
  last_name: string;
  work_email: string;

  // Basic Info (REQUIRED)
  date_of_birth: string;
  address: string;
  phone: string;
  tfn: string;

  // Location (OPTIONAL)
  suburb?: string;
  state_territory?: string;
  postcode?: string;

  // Superannuation (OPTIONAL)
  fund_name?: string;
  abn?: string;
  member_number?: number | null;

  // Bank Details (REQUIRED)
  bank_name: string;
  account_name: string;
  bsb: string;
  account_number: string;

  // Emergency Contact (REQUIRED)
  emergency_contact_first_name: string;
  emergency_contact_last_name?: string;
  emergency_contact_number: string;
  emergency_contact_home?: string;
  emergency_contact_relationship: string;
}

interface EmployeeProfileResponse {
  success: boolean;
  message: string;
  profile: {
    id: number;
    uuid: string;
    tfn: string; // Masked for security
    bank_account: string; // Masked for security
  };
  action: 'created' | 'updated';
  next_steps: string[];
}


export const authService = {
  // Client login
  clientLogin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/client/signin/', credentials);
    return response.data;
  },

  // Employee login  
  employeeLogin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/employee/signin/', credentials);
    return response.data;
  },

  // Client signup
  clientSignup: async (signupData: SignupData): Promise<SignupResponse> => {
    const response = await api.post('/auth/client/signup/', signupData);
    return response.data;
  },

  // Employee signup
  employeeSignup: async (signupData: SignupData): Promise<SignupResponse> => {
    const response = await api.post('/auth/employee/signup/', signupData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await api.get('/user/profile/');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/signout/', {
          refresh: refreshToken
        });
      }
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
    }
  },

  // Admin functions (for future use)
  addEmployee: async (employeeData: SignupData & { role: string }) => {
    const response = await api.post('/admin/add-employee/', employeeData);
    return response.data;
  },

  getEmployees: async () => {
    const response = await api.get('/admin/employees/');
    return response.data;
  },

  updateEmployee: async (employeeId: number, updateData: { role?: string; is_active?: boolean }) => {
    const response = await api.patch(`/admin/employees/${employeeId}/`, updateData);
    return response.data;
  },

  // Employee Profile Management
  createOrUpdateEmployeeProfile: async (profileData: EmployeeProfileData): Promise<EmployeeProfileResponse> => {
    try {
      const response = await api.post('/employee/profile/create-update/', profileData);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for employee profile
      if (error.response?.data) {
        throw {
          message: error.response.data.error || 'Failed to save employee profile',
          missing_fields: error.response.data.missing_fields,
          details: error.response.data.details,
          status: error.response.status
        };
      }
      throw error;
    }
  },

   // Get employee profile
   getEmployeeProfile: async (): Promise<EmployeeProfileData> => {
    try {
      const response = await api.get('/employee/profile/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile doesn't exist yet, return empty profile
        return {
          date_of_birth: '',
          address: '',
          phone: '',
          tfn: '',
          suburb: '',
          state_territory: '',
          postcode: '',
          fund_name: '',
          abn: '',
          member_number: null,
          bank_name: '',
          account_name: '',
          bsb: '',
          account_number: '',
          emergency_contact_first_name: '',
          emergency_contact_last_name: '',
          emergency_contact_number: '',
          emergency_contact_home: '',
          emergency_contact_relationship: ''
        };
      }
      throw error;
    }
  },

  // Update employee profile picture
  updateEmployeeProfilePicture: async (file: File): Promise<{ success: boolean; photo_url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/employee/profile/picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
