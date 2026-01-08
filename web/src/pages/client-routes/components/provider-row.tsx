import { GripVertical, Settings, Zap, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getProviderColor } from '@/lib/provider-colors';
import type { ClientType } from '@/lib/transport';
import type { ProviderConfigItem } from '../types';

// Sortable Provider Row
type SortableProviderRowProps = {
  item: ProviderConfigItem;
  index: number;
  clientType: ClientType;
  streamingCount: number;
  isToggling: boolean;
  onToggle: () => void;
};

export function SortableProviderRow({
  item,
  index,
  clientType,
  streamingCount,
  isToggling,
  onToggle,
}: SortableProviderRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    transition: {
      duration: 200,
      easing: 'ease',
    },
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? 'none' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onToggle()}
      className="cursor-pointer active:cursor-grabbing"
    >
      <ProviderRowContent
        item={item}
        index={index}
        clientType={clientType}
        streamingCount={streamingCount}
        isToggling={isToggling}
        onToggle={onToggle}
      />
    </div>
  );
}

// Provider Row Content (used both in sortable and overlay)
type ProviderRowContentProps = {
  item: ProviderConfigItem;
  index: number;
  clientType: ClientType;
  streamingCount: number;
  isToggling: boolean;
  isOverlay?: boolean;
  onToggle: () => void;
};

export function ProviderRowContent({
  item,
  index,
  clientType,
  streamingCount,
  isToggling,
  isOverlay,
  onToggle,
}: ProviderRowContentProps) {
  const { provider, enabled, route, isNative } = item;
  const color = getProviderColor(provider.type);

  return (
    <div
      className={`
        flex items-center gap-md p-md rounded-lg border transition-all duration-200 relative
        ${
          enabled
            ? 'bg-emerald-400/[0.03] border-emerald-400/30 shadow-sm'
            : 'bg-surface-secondary/50 border-dashed border-border opacity-95'
        }
        ${isOverlay ? 'shadow-xl ring-2 ring-accent opacity-100' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className={`flex flex-col items-center gap-1 w-6 ${enabled ? '' : 'opacity-40'}`}>
        <GripVertical size={14} className="text-text-muted" />
        <span className="text-[10px] font-bold px-1 rounded" style={{ backgroundColor: `${color}20`, color }}>
          {index + 1}
        </span>
      </div>

      {/* Provider Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity ${
          enabled ? '' : 'opacity-30 grayscale'
        }`}
        style={{ backgroundColor: `${color}15`, color }}
      >
        <span className="text-lg font-bold">{provider.name.charAt(0).toUpperCase()}</span>
      </div>

      {/* Provider Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-body font-medium transition-colors ${enabled ? 'text-text-primary' : 'text-text-muted'}`}>
            {provider.name}
          </span>
          {/* Native/Converted badge */}
          {isNative ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-400/10 text-emerald-400"
              title="原生支持"
            >
              <Zap size={10} />
              原生
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-400"
              title="API 转换"
            >
              <RefreshCw size={10} />
              转换
            </span>
          )}
        </div>
        <div className={`text-caption truncate transition-colors ${enabled ? 'text-text-muted' : 'text-text-muted/50'}`}>
          {provider.config?.custom?.clientBaseURL?.[clientType] ||
            provider.config?.custom?.baseURL ||
            provider.config?.antigravity?.endpoint ||
            'Default endpoint'}
        </div>
      </div>

      {/* Settings button */}
      {route && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Navigate to route settings
          }}
          className={`p-2 rounded-md transition-colors ${
            enabled
              ? 'text-text-muted hover:text-text-primary hover:bg-emerald-400/10'
              : 'text-text-muted/30 cursor-not-allowed'
          }`}
          title="Route Settings"
          disabled={!enabled}
        >
          <Settings size={16} />
        </button>
      )}

      {/* Streaming count badge */}
      {streamingCount > 0 && enabled && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-medium animate-pulse-soft"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {streamingCount}
        </span>
      )}

      {/* Toggle indicator */}
      <div className="flex items-center gap-3">
        <span
          className={`text-[10px] font-bold tracking-wider transition-colors ${
            enabled ? 'text-emerald-400' : 'text-text-muted/40'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </span>
        <Switch checked={enabled} onCheckedChange={() => onToggle()} disabled={isToggling} />
      </div>
    </div>
  );
}
