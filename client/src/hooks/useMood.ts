import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodService } from '../services/mood.service';
import type { MoodType } from '../types';

export function useMoods(page = 1) {
  return useQuery({
    queryKey: ['moods', page],
    queryFn: () => moodService.list(page),
  });
}

export function useCreateMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { moodType: MoodType; emoji: string; content: string }) =>
      moodService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moods'] }),
  });
}

export function useDeleteMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => moodService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moods'] }),
  });
}
