import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineService } from '../services/timeline.service';

export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: () => timelineService.list(),
  });
}

export function useCreateTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventDate: string; title: string; description?: string; icon?: string }) =>
      timelineService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  });
}

export function useDeleteTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => timelineService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  });
}
