import { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";

// verbatimModuleSyntax is a stricter TypeScript mode that clearly separates:
// Runtime code (regular imports)
// Type-only code (type imports)

// Type	            Usage	                                        Example
// ReactNode	    Accepts anything React can render	            "Hello", <Component />, [1, 2, 3]
// ReactElement	    Only accepts JSX elements	                    <Component />
// JSX.Element	    Similar to ReactElement (specific to JSX)	    <div />

interface User {
    id: number;
    work_email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    login: (credentials: any, userType: 'client' | 'employee') => Promise<any>;
    logout: () => void;
    isAuthenticated: boolean;
    userType: string | null;
}

// createContext - Creates a new React Context object (the "shared box")
// <AuthContextType | undefined> - box can hold either auth data (AuthContextType) or undefined (when not yet initialized)
// (undefined) - sets the initial value of the box to undefined (empty)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));

    useEffect(() => {
        // check if user is logged in on app start
        const token = localStorage.getItem('access_token');
        if (token) {
            authService.getCurrentUser()
                .then(userData => {
                    setUser(userData.user);
                    setAccessToken(token);
                })
                .catch(() => {
                    // token invalid, clear it
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_type');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials: any, userType: 'client' | 'employee') => {
        try {
            const response = userType === 'client' ? await authService.clientLogin(credentials) : await authService.employeeLogin(credentials);
            setUser(response.user);
            setAccessToken(response.tokens.access);
            localStorage.setItem('access_token', response.tokens.access);
            localStorage.setItem('refresh', response.tokens.refresh);
            localStorage.setItem('user_type', userType);

            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setAccessToken(null);
    };

    const value = {
        user,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        userType: localStorage.getItem('user_type')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// createContext() → Creates the "group chat"
// <Context.Provider> → Shares the data
// useContext() → Lets components read the data
// Analogy:
// Provider = Parent texting the family group
// useContext() = Kids reading the message without asking each parent individually
