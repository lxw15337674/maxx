import { Wand2, Mail, ChevronLeft, Trash2 } from 'lucide-react';
import { ClientIcon } from '@/components/icons/client-icons';
import type { Provider } from '@/lib/transport';
import { ANTIGRAVITY_COLOR } from '../types';

interface AntigravityProviderViewProps {
  provider: Provider;
  onDelete: () => void;
  onClose: () => void;
}

export function AntigravityProviderView({ provider, onDelete, onClose }: AntigravityProviderViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[73px] flex items-center justify-between p-lg border-b border-border bg-surface-primary">
        <div className="flex items-center gap-md">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-headline font-semibold text-text-primary">{provider.name}</h2>
            <p className="text-caption text-text-secondary">Antigravity Provider</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="btn bg-error/10 text-error hover:bg-error/20 flex items-center gap-2"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-lg">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${ANTIGRAVITY_COLOR}15` }}
              >
                <Wand2 size={24} style={{ color: ANTIGRAVITY_COLOR }} />
              </div>
              <div>
                <div className="font-medium text-text-primary">{provider.name}</div>
                <div className="text-sm text-text-secondary flex items-center gap-1">
                  <Mail size={12} />
                  {provider.config?.antigravity?.email || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-text-muted">Project ID:</span>
                <span className="ml-2 text-text-primary font-mono">{provider.config?.antigravity?.projectID || '-'}</span>
              </div>
              <div>
                <span className="text-text-muted">Endpoint:</span>
                <span className="ml-2 text-text-primary font-mono text-xs">
                  {provider.config?.antigravity?.endpoint || '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-text-primary mb-3">Supported Clients</div>
            <div className="flex items-center gap-2">
              {provider.supportedClientTypes?.length > 0 ? (
                provider.supportedClientTypes.map((ct) => (
                  <div key={ct} className="flex items-center gap-2 bg-surface-secondary rounded-lg px-3 py-2">
                    <ClientIcon type={ct} size={20} />
                    <span className="text-sm text-text-primary capitalize">{ct}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-text-muted">No clients configured</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
