/**
 * Session React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getTransport } from '@/lib/transport';

const transport = getTransport();

// Query Keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: () => [...sessionKeys.lists()] as const,
};

// 获取所有 Sessions
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => transport.getSessions(),
  });
}
