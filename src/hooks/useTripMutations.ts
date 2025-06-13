import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Trip } from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const mutationWithAuth = async (
  url: string,
  method: "PATCH" | "DELETE" | "POST",
  data?: unknown
) => {
  const token = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios({
      url,
      method,
      headers,
      data,
    });
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

interface GenerateELDLogResponse {
  message: string;
  logs: Array<{
    id: number;
    trip: number;
    timestamp: string;
    status: string;
    location: string;
  }>;
}

export const useTripMutations = (tripId: string) => {
  const queryClient = useQueryClient();

  const startTrip = useMutation<Trip, Error, { status: string }>({
    mutationFn: (data) =>
      mutationWithAuth(`${API_BASE_URL}/trips/${tripId}/`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  const deleteTrip = useMutation<void, Error>({
    mutationFn: () =>
      mutationWithAuth(`${API_BASE_URL}/trips/${tripId}/`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  const generateELDLog = useMutation<GenerateELDLogResponse, Error>({
    mutationFn: () =>
      mutationWithAuth(
        `${API_BASE_URL}/trips/${tripId}/eld-logs/generate/`,
        "POST"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eldLogs", tripId] });
    },
  });

  return {
    startTrip,
    deleteTrip,
    generateELDLog,
  };
};
