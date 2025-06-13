import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ELDLog {
  id: number;
  trip: number;
  timestamp: string;
  status: string;
  location: string;
  total_miles?: number; // Optional, not in API but used in UI
  date?: string; // Derived from timestamp
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

interface GenerateELDLogResponse {
  message: string;
  logs: ELDLog[];
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

const mutationWithAuth = async (
  url: string,
  method: "POST" | "PATCH",
  data?: unknown
) => {
  const token = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios({ url, method, headers, data });
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
        return axios({ url, method, headers, data }).then((res) => res.data);
      } else {
        throw new Error("No refresh token available.");
      }
    }
    throw error;
  }
};

export const useELDLogs = (tripId: string) => {
  const queryClient = useQueryClient();

  const eldLogQuery = useQuery<ELDLog[], Error>({
    queryKey: ["eldLogs", tripId],
    queryFn: () => fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/eld-logs/`),
    enabled: !!tripId,
    select: (data) =>
      data.map((log) => ({
        ...log,
        date: new Date(log.timestamp).toISOString().split("T")[0],
        total_miles: 185.2, // Hardcoded as not provided by API
      })),
  });

  const dutyStatusQuery = useQuery<DutyStatus[], Error>({
    queryKey: ["dutyStatuses", tripId],
    queryFn: () =>
      fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/duty-status/`),
    enabled: !!tripId,
  });

  const generateELDLog = useMutation<
    GenerateELDLogResponse,
    Error,
    { date: string }
  >({
    mutationFn: ({ date }) =>
      mutationWithAuth(
        `${API_BASE_URL}/trips/${tripId}/eld-logs/generate/`,
        "POST",
        { date }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eldLogs", tripId] });
    },
  });

  return {
    eldLogs: eldLogQuery.data,
    eldLogLoading: eldLogQuery.isLoading,
    eldLogError: eldLogQuery.error,
    dutyStatuses: dutyStatusQuery.data,
    dutyStatusLoading: dutyStatusQuery.isLoading,
    dutyStatusError: dutyStatusQuery.error,
    generateELDLog,
  };
};
