import api from "./api";

// interface is like a class. It creates a blueprint for the objects of its type. Any object of LoginCredentials must have these properties other TypeScript will raise error.
interface LoginCredentials{
    work_email: string;
    password: string;
}


interface LoginResponse {
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
  }
  
  interface SignupData {
    work_email: string;
    password: string;
    first_name: string;
    last_name: string;
  }
  
export const authService = {
    // client login
    clientLogin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/auth/client/signin/', credentials);
        return response.data;
    },

    // employee login
    employeeLogin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/auth/employee/signin/', credentials);
        return response.data;
    },

    // client signup
    clientSignup: async (credentials: SignupData): Promise<LoginResponse> => {
        const response = await api.post('/auth/client/signup/', credentials);
        return response.data;
    },

    // employee signup
    employeeSignup: async (credentials: SignupData): Promise<LoginResponse> => {
        const response = await api.post('/auth/employee/signup/', credentials);
        return response.data;
    },

    // get employees
    getAllEmployees: async () => {
        const response = await api.get('/admin/employees/');
        return response.data;
    },

    // signout
    signout: async () => {
        try {
            await api.post('/auth/signout/');
        } catch (error) {
            // Even if api call fails, clear local storage
            console.error('Logout api call failed:', error);
        } finally {
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_type');
        }
    }
};
