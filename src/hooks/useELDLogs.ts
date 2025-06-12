import { useQuery, useMutation, useQueryClient } from 'react-query';
import { eldLogsAPI } from '../services/api';

export const useELDLogs = (tripId: number) => {
  return useQuery(['eldLogs', tripId], () => eldLogsAPI.getELDLogs(tripId), {
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateELDLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ tripId, date }: { tripId: number; date: string }) => 
      eldLogsAPI.generateELDLog(tripId, date),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['eldLogs', data.trip]);
      },
    }
  );
};