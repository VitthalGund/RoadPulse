import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api, { authAPI, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
  carrier_name: string;
  carrier_address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/api/user-info/");

      const userInfo = response.data;
      const user: User = {
        id: userInfo.user_id,
        username: userInfo.username,
        email: userInfo.email,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        has_driver: userInfo.has_driver,
      };

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);

      // Store tokens
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      setToken(response.access);

      // Fetch user info from API
      await fetchUserInfo();
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Login failed";
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);

      // Store tokens
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      setToken(response.access);

      // Fetch user info from API
      await fetchUserInfo();
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Registration failed";
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: true,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
