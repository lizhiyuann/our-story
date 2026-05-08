import type { Photo } from '../types';
import { get, del, upload } from './api.client';

export const photoService = {
  list: (page = 1, limit = 20) => get<Photo[]>('/photos', { page, limit }),
  upload: (formData: FormData) => upload<Photo>('/photos/upload', formData),
  delete: (id: number) => del<null>(`/photos/${id}`),
};
