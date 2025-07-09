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
    email: string;
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
    email: string;
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
    email: string;
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
  }
};
