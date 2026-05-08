import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rantService } from '../services/rant.service';

export function useRants(page = 1) {
  return useQuery({
    queryKey: ['rants', page],
    queryFn: () => rantService.list(page),
  });
}

export function useCreateRant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rantType: string; content: string; intensity: number }) =>
      rantService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rants'] }),
  });
}

export function useDeleteRant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rantService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rants'] }),
  });
}
