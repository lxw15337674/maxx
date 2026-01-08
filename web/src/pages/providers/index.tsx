import { useState } from 'react';
import { Plus, Server, Wand2, Layers } from 'lucide-react';
import { useProviders } from '@/hooks/queries';
import { useStreamingRequests } from '@/hooks/use-streaming';
import type { Provider } from '@/lib/transport';
import { ANTIGRAVITY_COLOR } from './types';
import { AntigravityProviderCard, CustomProviderCard } from './components/provider-card';
import { ProviderCreateFlow } from './components/provider-create-flow';
import { ProviderEditFlow } from './components/provider-edit-flow';

export function ProvidersPage() {
  const { data: providers, isLoading } = useProviders();
  const { countsByProvider } = useStreamingRequests();
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const antigravityProviders = providers?.filter((p) => p.type === 'antigravity') || [];
  const customProviders = providers?.filter((p) => p.type !== 'antigravity') || [];

  // Show edit flow
  if (editingProvider) {
    return <ProviderEditFlow provider={editingProvider} onClose={() => setEditingProvider(null)} />;
  }

  // Show create flow
  if (showCreateFlow) {
    return <ProviderCreateFlow onClose={() => setShowCreateFlow(false)} />;
  }

  // Provider list
  return (
    <div className="flex flex-col h-full">
      <div className="h-[73px] flex items-center justify-between p-lg border-b border-border bg-surface-primary">
        <div className="flex items-center gap-md">
          <Layers size={20} className="text-accent" />
          <h2 className="text-headline font-semibold text-text-primary">Providers</h2>
          <span className="text-caption text-text-secondary">{providers?.length || 0} configured</span>
        </div>
        <button onClick={() => setShowCreateFlow(true)} className="btn btn-primary flex items-center gap-xs">
          <Plus size={14} />
          <span>Add Provider</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted">Loading...</div>
          </div>
        ) : providers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <Layers size={48} className="mb-md opacity-50" />
            <p className="text-body">No providers configured</p>
            <p className="text-caption mt-sm">Click "Add Provider" to create one</p>
            <button onClick={() => setShowCreateFlow(true)} className="btn btn-primary mt-lg flex items-center gap-xs">
              <Plus size={14} />
              <span>Add Provider</span>
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {antigravityProviders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 size={16} style={{ color: ANTIGRAVITY_COLOR }} />
                  <h3 className="text-sm font-medium text-text-primary">Antigravity</h3>
                  <span className="text-xs text-text-muted">({antigravityProviders.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {antigravityProviders.map((provider) => (
                    <AntigravityProviderCard
                      key={provider.id}
                      provider={provider}
                      onClick={() => setEditingProvider(provider)}
                      streamingCount={countsByProvider.get(provider.id) || 0}
                    />
                  ))}
                </div>
              </section>
            )}

            {customProviders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Server size={16} className="text-text-secondary" />
                  <h3 className="text-sm font-medium text-text-primary">Custom</h3>
                  <span className="text-xs text-text-muted">({customProviders.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customProviders.map((provider) => (
                    <CustomProviderCard
                      key={provider.id}
                      provider={provider}
                      onClick={() => setEditingProvider(provider)}
                      streamingCount={countsByProvider.get(provider.id) || 0}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
