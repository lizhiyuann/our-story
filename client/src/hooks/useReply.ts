// 回复 React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { replyService } from '../services/reply.service';

export function useReplies(targetType: string, targetId: number) {
  return useQuery({
    queryKey: ['replies', targetType, targetId],
    queryFn: () => replyService.list(targetType, targetId),
    enabled: !!targetType && !!targetId,
  });
}

export function useCreateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { targetType: string; targetId: number; content: string }) =>
      replyService.create(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['replies', variables.targetType, variables.targetId] });
    },
  });
}

export function useDeleteReply(targetType: string, targetId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => replyService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['replies', targetType, targetId] }),
  });
}
