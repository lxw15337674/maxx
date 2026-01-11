import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Snowflake,
  Clock,
  AlertCircle,
  Server,
  Wifi,
  Zap,
  Ban,
  HelpCircle,
  X,
  Thermometer,
  Calendar,
  Activity,
  Info,
  TrendingUp,
  DollarSign,
  Hash,
  CheckCircle2,
  XCircle,
  Trash2,
} from 'lucide-react';
import type { Cooldown, CooldownReason, ProviderStats, ClientType } from '@/lib/transport/types';
import type { ProviderConfigItem } from '@/pages/client-routes/types';
import { useCooldowns } from '@/hooks/use-cooldowns';
import { Switch } from '@/components/ui';
import { getProviderColor } from '@/lib/provider-colors';
import { cn } from '@/lib/utils';

interface ProviderDetailsDialogProps {
  item: ProviderConfigItem | null;
  clientType: ClientType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats?: ProviderStats;
  cooldown?: Cooldown | null;
  streamingCount: number;
  onToggle: () => void;
  isToggling: boolean;
  onDelete?: () => void;
  onClearCooldown?: () => void;
  isClearingCooldown?: boolean;
}

// Reason 中文说明和图标
const REASON_INFO: Record<CooldownReason, { label: string; description: string; icon: typeof Server; color: string; bgColor: string }> = {
  server_error: {
    label: '服务器错误',
    description: '上游服务器返回 5xx 错误，系统自动进入冷却保护',
    icon: Server,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10 border-red-400/20',
  },
  network_error: {
    label: '网络错误',
    description: '无法连接到上游服务器，可能是网络故障或服务器宕机',
    icon: Wifi,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10 border-amber-400/20',
  },
  quota_exhausted: {
    label: '配额耗尽',
    description: 'API 配额已用完，等待配额重置',
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10 border-red-400/20',
  },
  rate_limit_exceeded: {
    label: '速率限制',
    description: '请求速率超过限制，触发了速率保护',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10 border-yellow-400/20',
  },
  concurrent_limit: {
    label: '并发限制',
    description: '并发请求数超过限制',
    icon: Ban,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10 border-orange-400/20',
  },
  unknown: {
    label: '未知原因',
    description: '因未知原因进入冷却状态',
    icon: HelpCircle,
    color: 'text-text-muted',
    bgColor: 'bg-surface-secondary border-border',
  },
};

// 格式化 Token 数量
function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

// 格式化成本 (微美元 → 美元)
function formatCost(microUsd: number): string {
  const usd = microUsd / 1_000_000;
  if (usd >= 1) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(3)}`;
  }
  return `$${usd.toFixed(4)}`;
}

// 计算缓存利用率
function calcCacheRate(stats: ProviderStats): number {
  const cacheTotal = stats.totalCacheRead + stats.totalCacheWrite;
  const total = stats.totalInputTokens + stats.totalOutputTokens + cacheTotal;
  if (total === 0) return 0;
  return (cacheTotal / total) * 100;
}

export function ProviderDetailsDialog({
  item,
  clientType,
  open,
  onOpenChange,
  stats,
  cooldown,
  streamingCount,
  onToggle,
  isToggling,
  onDelete,
  onClearCooldown,
  isClearingCooldown,
}: ProviderDetailsDialogProps) {
  const { formatRemaining } = useCooldowns();
  const [liveCountdown, setLiveCountdown] = useState<string>('');

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleKeyDown]);

  // 每秒更新倒计时
  useEffect(() => {
    if (!cooldown) {
      setLiveCountdown('');
      return;
    }

    setLiveCountdown(formatRemaining(cooldown));
    const interval = setInterval(() => {
      setLiveCountdown(formatRemaining(cooldown));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown, formatRemaining]);

  if (!open || !item) return null;

  const { provider, enabled, route, isNative } = item;
  const color = getProviderColor(provider.type);
  const isInCooldown = !!cooldown;

  const formatUntilTime = (until: string) => {
    const date = new Date(until);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const endpoint = provider.config?.custom?.clientBaseURL?.[clientType] ||
    provider.config?.custom?.baseURL ||
    provider.config?.antigravity?.endpoint ||
    'Default endpoint';

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="dialog-overlay backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
        style={{ zIndex: 99998 }}
      />

      {/* Content */}
      <div
        className="dialog-content overflow-hidden"
        style={{
          zIndex: 99999,
          width: '100%',
          maxWidth: '32rem',
          padding: 0,
          background: 'var(--color-surface-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Provider Color Gradient */}
        <div
          className="relative p-6 pb-4"
          style={{
            background: `linear-gradient(to bottom, ${color}15, transparent)`,
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            {/* Provider Icon */}
            <div
              className={cn(
                "relative w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg",
                isInCooldown ? "bg-cyan-900/40 border-cyan-500/30" : "bg-surface-secondary border-border"
              )}
              style={!isInCooldown ? { color } : {}}
            >
              <span className={cn(
                "text-3xl font-black",
                isInCooldown ? "text-cyan-400 opacity-20 scale-150 blur-[1px]" : ""
              )}>
                {provider.name.charAt(0).toUpperCase()}
              </span>
              {isInCooldown && (
                <Snowflake size={28} className="absolute text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-text-primary truncate mb-1">
                {provider.name}
              </h2>
              <div className="flex items-center gap-2">
                {isNative ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Zap size={10} className="fill-emerald-500/20" /> NATIVE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Activity size={10} /> CONVERTED
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-hover text-text-secondary">
                  {provider.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 pb-6 space-y-4">

          {/* Provider Basic Info Card */}
          <div className="rounded-xl border border-border bg-surface-secondary p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Endpoint</div>
                <div className="text-xs text-text-secondary font-mono truncate">{endpoint}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Client Type</div>
                <div className="text-xs text-text-primary font-semibold">{clientType}</div>
              </div>
              {route && (
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Priority</div>
                  <div className="text-xs text-text-primary font-semibold">#{route.position + 1}</div>
                </div>
              )}
            </div>
          </div>

          {/* Cooldown Warning (if in cooldown) */}
          {isInCooldown && cooldown && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Snowflake size={16} className="animate-spin-slow" />
                <span className="text-sm font-bold">冷却保护激活</span>
              </div>

              {/* Reason Section */}
              <div className={`rounded-xl border p-4 ${REASON_INFO[cooldown.reason]?.bgColor || REASON_INFO.unknown.bgColor}`}>
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${REASON_INFO[cooldown.reason]?.color || REASON_INFO.unknown.color}`}>
                    {(() => {
                      const Icon = REASON_INFO[cooldown.reason]?.icon || REASON_INFO.unknown.icon;
                      return <Icon size={18} />;
                    })()}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${REASON_INFO[cooldown.reason]?.color || REASON_INFO.unknown.color} mb-1`}>
                      {REASON_INFO[cooldown.reason]?.label || REASON_INFO.unknown.label}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {REASON_INFO[cooldown.reason]?.description || REASON_INFO.unknown.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer Section */}
              <div className="grid grid-cols-3 gap-2">
                {/* Countdown */}
                <div className="col-span-3 relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950/30 to-transparent border border-cyan-500/20 p-4 flex flex-col items-center justify-center group">
                  <div className="absolute inset-0 bg-cyan-400/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-1.5 text-cyan-500 mb-1">
                    <Thermometer size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Remaining</span>
                  </div>
                  <div className="relative font-mono text-3xl font-bold text-cyan-400 tracking-widest tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                    {liveCountdown}
                  </div>
                </div>

                {/* Time Details */}
                {(() => {
                  const untilDateStr = formatUntilTime(cooldown.until);
                  const [datePart, timePart] = untilDateStr.split(' ');
                  return (
                    <>
                      <div className="p-2 rounded-lg bg-surface-secondary border border-border flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold flex items-center gap-1">
                          <Clock size={9} /> Time
                        </span>
                        <div className="font-mono text-xs font-semibold text-text-primary">
                          {timePart}
                        </div>
                      </div>

                      <div className="col-span-2 p-2 rounded-lg bg-surface-secondary border border-border flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold flex items-center gap-1">
                          <Calendar size={9} /> Date
                        </span>
                        <div className="font-mono text-xs font-semibold text-text-primary">
                          {datePart}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Statistics Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <TrendingUp size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Statistics</span>
              {streamingCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {streamingCount} Streaming
                </span>
              )}
            </div>

            {stats && stats.totalRequests > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {/* Requests */}
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Hash size={12} className="text-text-muted" />
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Requests</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Total</span>
                      <span className="font-mono font-bold text-text-primary">{stats.totalRequests}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Success
                      </span>
                      <span className="font-mono font-bold text-emerald-500">{stats.successfulRequests}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle size={10} /> Failed
                      </span>
                      <span className="font-mono font-bold text-red-400">{stats.failedRequests}</span>
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity size={12} className="text-text-muted" />
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Success Rate</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-16">
                    <div className={cn(
                      "text-3xl font-black font-mono",
                      stats.successRate >= 95 ? "text-emerald-500" :
                      stats.successRate >= 90 ? "text-blue-400" : "text-amber-500"
                    )}>
                      {Math.round(stats.successRate)}%
                    </div>
                  </div>
                </div>

                {/* Tokens */}
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={12} className="text-text-muted" />
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Tokens</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Input</span>
                      <span className="font-mono font-bold text-blue-400">{formatTokens(stats.totalInputTokens)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Output</span>
                      <span className="font-mono font-bold text-purple-400">{formatTokens(stats.totalOutputTokens)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Cache</span>
                      <span className="font-mono font-bold text-cyan-400">{formatTokens(stats.totalCacheRead + stats.totalCacheWrite)}</span>
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <DollarSign size={12} className="text-text-muted" />
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Cost</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-16">
                    <div className="text-2xl font-black font-mono text-purple-400">
                      {formatCost(stats.totalCost)}
                    </div>
                    <div className="text-[9px] text-text-muted mt-1">
                      Cache: {calcCacheRate(stats).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center gap-2 text-text-muted/30 rounded-lg bg-surface-secondary border border-border">
                <Activity size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">No Statistics Available</span>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-3 pt-2">
            {/* Cooldown Actions (if in cooldown) */}
            {isInCooldown && (
              <button
                onClick={onClearCooldown}
                disabled={isClearingCooldown || isToggling}
                className="w-full relative overflow-hidden rounded-xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl" />
                <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-surface-primary group-hover:bg-transparent px-4 py-3 transition-colors">
                  {isClearingCooldown ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span className="text-sm font-bold text-white">Thawing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="text-cyan-400 group-hover:text-white transition-colors" />
                      <span className="text-sm font-bold text-cyan-400 group-hover:text-white transition-colors">立即解冻 (Force Thaw)</span>
                    </>
                  )}
                </div>
              </button>
            )}

            {/* Toggle Switch */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              enabled
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-surface-secondary border-border"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border",
                  enabled ? "bg-emerald-500/10 border-emerald-500/20" : "bg-surface-hover border-border"
                )}>
                  {enabled ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <Ban size={20} className="text-text-muted" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary">
                    {enabled ? 'Provider 已启用' : 'Provider 已禁用'}
                  </div>
                  <div className="text-xs text-text-muted">
                    {enabled ? '此 Route 正在接收请求' : '此 Route 不会接收请求'}
                  </div>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                disabled={isToggling || isInCooldown}
              />
            </div>

            {/* Delete Button (for converted routes only) */}
            {!isNative && onDelete && (
              <button
                onClick={onDelete}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors"
              >
                <Trash2 size={16} />
                删除此路由 (Delete Route)
              </button>
            )}

            {/* Warning Note */}
            {isInCooldown && (
              <div className="flex items-start gap-2 rounded-lg bg-surface-secondary/50 p-2.5 text-[11px] text-text-muted">
                <Activity size={12} className="mt-0.5 shrink-0" />
                <p>强制解冻可能导致请求因根本原因未解决而再次失败。建议等待自动解冻或先禁用此路由。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
