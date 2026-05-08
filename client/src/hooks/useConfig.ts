// 配置 React Query hook：获取应用配置（纪念日、图标列表等）
import { useQuery } from '@tanstack/react-query';
import { configService } from '../services/config.service';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => configService.get(),
    staleTime: Infinity,        // 配置很少变化，缓存不淘汰
    gcTime: Infinity,
  });
}
