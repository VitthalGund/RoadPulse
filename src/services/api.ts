import axios from "axios";

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Exclude login and register endpoints from refresh logic
    const isAuthEndpoint =
      originalRequest.url?.includes("/api/auth/login") ||
      originalRequest.url?.includes("/api/auth/register");
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          localStorage.setItem("access_token", access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.log({ refreshError });
          // Refresh failed, redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          // window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin?: boolean;
}

export interface Driver {
  id: number;
  full_name: string;
  license_number: string;
  carrier: number;
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  license_plate: string;
  state: string;
  carrier: number;
}

export interface Trip {
  id: number;
  driver: Driver;
  vehicle: Vehicle;
  current_location: [number, number];
  pickup_location: [number, number];
  dropoff_location: [number, number];
  current_cycle_hours: number;
  start_time: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  created_at: string;
  updated_at: string;
}

export interface DutyStatus {
  id: number;
  trip: number;
  status: "ON_DUTY_NOT_DRIVING" | "DRIVING" | "OFF_DUTY" | "SLEEPER_BERTH";
  start_time: string;
  end_time: string;
  location: [number, number];
  location_description: string;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface ELDLog {
  id: number;
  trip: number;
  date: string;
  total_miles: number;
  duty_statuses: DutyStatus[];
  created_at: string;
  updated_at: string;
}

export interface Carrier {
  id: number;
  name: string;
  main_office_address: string;
}

export interface RouteResponse {
  duty_statuses: DutyStatus[];
  geometry: string; // GeoJSON
  total_miles: number;
}

// Auth API
export const authAPI = {
  login: async (
    username: string,
    password: string
  ): Promise<{ access: string; refresh: string }> => {
    const response = await api.post("/api/auth/login/", { username, password });
    console.log({ response });
    return response.data;
  },

  register: async (userData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    license_number: string;
    carrier_name: string;
    carrier_address: string;
  }): Promise<{ access: string; refresh: string }> => {
    const response = await api.post("/api/auth/register/", userData);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post("/api/auth/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },
};

// Trips API
export const tripsAPI = {
  getTrips: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Trip[]> => {
    const response = await api.get("/api/trips/", {
      params,
      // Removed manual Authorization header; interceptor will handle it
    });
    return response.data;
  },

  getTrip: async (id: number): Promise<Trip> => {
    const response = await api.get(`/api/trips/${id}/`);
    return response.data;
  },

  createTrip: async (tripData: {
    vehicle: number;
    current_location: [number, number];
    pickup_location: [number, number];
    dropoff_location: [number, number];
    current_cycle_hours: number;
    start_time: string;
    status?: string;
  }): Promise<Trip> => {
    const response = await api.post("/api/trips/", {
      ...tripData,
      status: tripData.status || "PLANNED",
    });
    return response.data;
  },

  updateTrip: async (id: number, updates: Partial<Trip>): Promise<Trip> => {
    const response = await api.patch(`/api/trips/${id}/`, updates);
    return response.data;
  },

  deleteTrip: async (id: number): Promise<void> => {
    await api.delete(`/api/trips/${id}/`);
  },

  calculateRoute: async (tripId: number): Promise<RouteResponse> => {
    const response = await api.post(`/api/trips/${tripId}/route/`);
    return response.data;
  },
};

// Duty Status API
export const dutyStatusAPI = {
  getDutyStatuses: async (tripId: number): Promise<DutyStatus[]> => {
    const response = await api.get(`/api/trips/${tripId}/duty-status/`);
    return response.data;
  },

  createDutyStatus: async (
    tripId: number,
    dutyStatusData: {
      status: string;
      start_time: string;
      end_time: string;
      location: [number, number];
      location_description: string;
      remarks?: string;
    }
  ): Promise<DutyStatus> => {
    const response = await api.post(
      `/api/trips/${tripId}/duty-status/`,
      dutyStatusData
    );
    return response.data;
  },
};

// Vehicles API
export const vehiclesAPI = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get("/api/vehicles/");
    return response.data;
  },

  createVehicle: async (vehicleData: {
    vehicle_number: string;
    license_plate: string;
    state: string;
    carrier: number;
  }): Promise<Vehicle> => {
    const response = await api.post("/api/vehicles/", vehicleData);
    return response.data;
  },
};

// ELD Logs API
export const eldLogsAPI = {
  getELDLogs: async (tripId: number): Promise<ELDLog[]> => {
    const response = await api.get(`/api/trips/${tripId}/eld-logs/`);
    return response.data;
  },

  generateELDLog: async (tripId: number, date: string): Promise<ELDLog> => {
    const response = await api.post(`/api/trips/${tripId}/eld-logs/generate/`, {
      date,
    });
    return response.data;
  },
};

// Carriers API (Admin only)
export const carriersAPI = {
  getCarriers: async (): Promise<Carrier[]> => {
    const response = await api.get("/api/carriers/");
    return response.data;
  },

  createCarrier: async (carrierData: {
    name: string;
    main_office_address: string;
  }): Promise<Carrier> => {
    const response = await api.post("/api/carriers/", carrierData);
    return response.data;
  },
};

export default api;
