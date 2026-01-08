import { Switch } from '@/components/ui';
import { ClientIcon } from '@/components/icons/client-icons';
import type { ClientType } from '@/lib/transport';
import type { ClientConfig } from '../types';

interface ClientsConfigSectionProps {
  clients: ClientConfig[];
  onUpdateClient: (clientId: ClientType, updates: Partial<ClientConfig>) => void;
}

export function ClientsConfigSection({ clients, onUpdateClient }: ClientsConfigSectionProps) {
  return (
    <div>
      <div className="text-sm font-medium text-text-primary mb-3">Supported Clients</div>
      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`rounded-lg border transition-all ${
              client.enabled ? 'bg-surface-primary border-border shadow-sm' : 'bg-surface-secondary/50 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <ClientIcon type={client.id} size={28} />
                <span className={`text-sm font-medium ${client.enabled ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {client.name}
                </span>
              </div>
              <Switch checked={client.enabled} onCheckedChange={(checked) => onUpdateClient(client.id, { enabled: checked })} />
            </div>
            {client.enabled && (
              <div className="px-3 pb-3">
                <div className="bg-surface-secondary/50 rounded-md p-3">
                  <label className="text-xs text-text-secondary block mb-1">API Endpoint Override (Optional)</label>
                  <input
                    type="text"
                    value={client.urlOverride}
                    onChange={(e) => onUpdateClient(client.id, { urlOverride: e.target.value })}
                    placeholder="Leave empty to use default"
                    className="form-input text-xs w-full"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
