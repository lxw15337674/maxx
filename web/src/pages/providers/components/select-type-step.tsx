import { Server, Wand2, ChevronLeft, Layers, Grid3X3 } from 'lucide-react';
import { ANTIGRAVITY_COLOR, quickTemplates, type ProviderFormData } from '../types';

interface SelectTypeStepProps {
  formData: ProviderFormData;
  onSelectType: (type: 'custom' | 'antigravity') => void;
  onApplyTemplate: (templateId: string) => void;
  onSkipToConfig: () => void;
  onBack: () => void;
}

export function SelectTypeStep({
  formData,
  onSelectType,
  onApplyTemplate,
  onSkipToConfig,
  onBack,
}: SelectTypeStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[73px] flex items-center gap-md p-lg border-b border-border bg-surface-primary">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-headline font-semibold text-text-primary">Add Provider</h2>
          <p className="text-caption text-text-secondary">Choose a service provider to get started</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-lg">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <div className="text-sm font-medium text-text-primary mb-4">Service Provider</div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onSelectType('antigravity')}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  formData.type === 'antigravity'
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-secondary hover:bg-surface-hover'
                }`}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${ANTIGRAVITY_COLOR}15` }}
                >
                  <Wand2 size={28} style={{ color: ANTIGRAVITY_COLOR }} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">Antigravity</div>
                  <div className="text-xs text-text-secondary mt-1">OAuth Authentication</div>
                </div>
              </button>

              <button
                onClick={() => onSelectType('custom')}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  formData.type === 'custom'
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-secondary hover:bg-surface-hover'
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-surface-hover flex items-center justify-center">
                  <Server size={28} className="text-text-secondary" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">Custom</div>
                  <div className="text-xs text-text-secondary mt-1">API Key Authentication</div>
                </div>
              </button>
            </div>
          </div>

          {formData.type === 'custom' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-text-primary">Quick Templates</div>
                <button onClick={onSkipToConfig} className="text-xs text-accent hover:text-accent-hover">
                  Skip, configure manually →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickTemplates.map((template) => {
                  const Icon = template.icon === 'grid' ? Grid3X3 : Layers;
                  return (
                    <button
                      key={template.id}
                      onClick={() => onApplyTemplate(template.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                        formData.selectedTemplate === template.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-surface-secondary hover:bg-surface-hover'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon size={20} className="text-accent" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-text-primary">{template.name}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{template.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
