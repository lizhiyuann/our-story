import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { countdownService } from '../services/countdown.service';

export function useCountdowns() {
  return useQuery({
    queryKey: ['countdowns'],
    queryFn: () => countdownService.list(),
    refetchInterval: 1000, // update every second for live countdown
  });
}

export function useCreateCountdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; targetDate: string; icon?: string }) =>
      countdownService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['countdowns'] }),
  });
}

export function useDeleteCountdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => countdownService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['countdowns'] }),
  });
}
