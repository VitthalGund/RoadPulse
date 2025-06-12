import { useQuery, useMutation, useQueryClient } from 'react-query';
import { dutyStatusAPI } from '../services/api';

export const useDutyStatuses = (tripId: number) => {
  return useQuery(['dutyStatuses', tripId], () => dutyStatusAPI.getDutyStatuses(tripId), {
    enabled: !!tripId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateDutyStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ tripId, dutyStatusData }: { 
      tripId: number; 
      dutyStatusData: {
        status: string;
        start_time: string;
        end_time: string;
        location: [number, number];
        location_description: string;
        remarks?: string;
      }
    }) => dutyStatusAPI.createDutyStatus(tripId, dutyStatusData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['dutyStatuses', data.trip]);
      },
    }
  );
};