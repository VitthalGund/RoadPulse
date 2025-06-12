import { useQuery, useMutation, useQueryClient } from 'react-query';
import { carriersAPI } from '../services/api';

export const useCarriers = () => {
  return useQuery('carriers', carriersAPI.getCarriers, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();
  
  return useMutation(carriersAPI.createCarrier, {
    onSuccess: () => {
      queryClient.invalidateQueries('carriers');
    },
  });
};