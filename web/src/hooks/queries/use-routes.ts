/**
 * Route React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransport, type Route, type CreateRouteData } from '@/lib/transport';

const transport = getTransport();

// Query Keys
export const routeKeys = {
  all: ['routes'] as const,
  lists: () => [...routeKeys.all, 'list'] as const,
  list: () => [...routeKeys.lists()] as const,
  details: () => [...routeKeys.all, 'detail'] as const,
  detail: (id: number) => [...routeKeys.details(), id] as const,
};

// 获取所有 Routes
export function useRoutes() {
  return useQuery({
    queryKey: routeKeys.list(),
    queryFn: () => transport.getRoutes(),
  });
}

// 获取单个 Route
export function useRoute(id: number) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => transport.getRoute(id),
    enabled: id > 0,
  });
}

// 创建 Route
export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteData) => transport.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

// 更新 Route
export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Route> }) =>
      transport.updateRoute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

// 删除 Route
export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transport.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

// 切换 Route 启用状态
export function useToggleRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      // 先获取当前状态，然后切换
      return transport.getRoute(id).then((route) =>
        transport.updateRoute(id, { isEnabled: !route.isEnabled })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

// 批量更新 Route 位置
export function useUpdateRoutePositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Record<number, number>) => {
      // updates 是 { routeId: position } 的映射
      const promises = Object.entries(updates).map(([id, position]) =>
        transport.updateRoute(Number(id), { position })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}
