import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getTransport } from '@/lib/transport';
import type { Cooldown } from '@/lib/transport';
import { useEffect, useRef } from 'react';

export function useCooldowns() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);
  const transport = getTransport();

  const { data: cooldowns = [], isLoading, error } = useQuery({
    queryKey: ['cooldowns'],
    queryFn: () => transport.getCooldowns(),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000,
  });

  // Mutation for clearing cooldown
  const clearCooldownMutation = useMutation({
    mutationFn: (providerId: number) => transport.clearCooldown(providerId),
    onSuccess: () => {
      // Invalidate and refetch cooldowns after successful deletion
      queryClient.invalidateQueries({ queryKey: ['cooldowns'] });
    },
  });

  // Calculate remaining time for each cooldown
  useEffect(() => {
    if (cooldowns.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update countdown every second
    intervalRef.current = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['cooldowns'] });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cooldowns.length, queryClient]);

  // Helper to get cooldown for a specific provider
  const getCooldownForProvider = (providerId: number, clientType?: string) => {
    return cooldowns.find(
      (cd: Cooldown) =>
        cd.providerID === providerId &&
        (cd.clientType === 'all' || (clientType && cd.clientType === clientType))
    );
  };

  // Helper to check if provider is in cooldown
  const isProviderInCooldown = (providerId: number, clientType?: string) => {
    return !!getCooldownForProvider(providerId, clientType);
  };

  // Helper to get remaining time as seconds
  const getRemainingSeconds = (cooldown: Cooldown) => {
    const until = new Date(cooldown.until);
    const now = new Date();
    const diff = until.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  };

  // Helper to format remaining time
  const formatRemaining = (cooldown: Cooldown) => {
    const seconds = getRemainingSeconds(cooldown);

    if (seconds === 0) return 'Expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Helper to clear cooldown
  const clearCooldown = (providerId: number) => {
    clearCooldownMutation.mutate(providerId);
  };

  return {
    cooldowns,
    isLoading,
    error,
    getCooldownForProvider,
    isProviderInCooldown,
    getRemainingSeconds,
    formatRemaining,
    clearCooldown,
    isClearingCooldown: clearCooldownMutation.isPending,
  };
}
