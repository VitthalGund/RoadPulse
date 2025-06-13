import { useQuery } from "react-query";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface Driver {
  id: number;
  user: { id: number; username: string };
  license_number: string;
  carrier: { id: number; name: string };
}

interface Vehicle {
  id: number;
  vehicle_number: string;
  license_plate: string;
}

interface Trip {
  id: number;
  driver: Driver;
  vehicle: Vehicle;
  current_location: [number, number];
  current_location_name: string;
  pickup_location: [number, number];
  pickup_location_name: string;
  dropoff_location: [number, number];
  dropoff_location_name: string;
  current_cycle_hours: number;
  start_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DutyStatus {
  id: number;
  trip: number;
  status: string;
  start_time: string;
  end_time: string;
  location_description: string;
  remarks?: string;
}

interface ELDLog {
  id: number;
  trip: number;
  timestamp: string;
  status: string;
  location: string;
}

const fetchWithAuth = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh }
        );
        const { access } = refreshResponse.data;
        localStorage.setItem("access_token", access);
        headers.Authorization = `Bearer ${access}`;
        return axios.get(url, { headers }).then((res) => res.data);
      } else {
        throw new Error("No refresh token available.");
      }
    }
    throw error;
  }
};

export const useTripDetails = (tripId: string) => {
  const tripQuery = useQuery<Trip, Error>({
    queryKey: ["trip", tripId],
    queryFn: () => fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/`),
    enabled: !!tripId,
  });

  const dutyStatusQuery = useQuery<DutyStatus[], Error>({
    queryKey: ["dutyStatuses", tripId],
    queryFn: () =>
      fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/duty-status/`),
    enabled: !!tripId,
  });

  const eldLogQuery = useQuery<ELDLog[], Error>({
    queryKey: ["eldLogs", tripId],
    queryFn: () => fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/eld-logs/`),
    enabled: !!tripId,
  });

  return {
    trip: tripQuery.data,
    tripLoading: tripQuery.isLoading,
    tripError: tripQuery.error,
    dutyStatuses: dutyStatusQuery.data,
    dutyStatusLoading: dutyStatusQuery.isLoading,
    dutyStatusError: dutyStatusQuery.error,
    eldLogs: eldLogQuery.data,
    eldLogLoading: eldLogQuery.isLoading,
    eldLogError: eldLogQuery.error,
  };
};
