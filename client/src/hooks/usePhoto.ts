// 相册模块 React Query hooks：查询、上传、删除
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { photoService } from '../services/photo.service';

export function usePhotos(page = 1) {
  return useQuery({
    queryKey: ['photos', page],
    queryFn: () => photoService.list(page),
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => photoService.upload(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => photoService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  });
}
