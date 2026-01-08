import type { Provider, Route } from '@/lib/transport';

// 合并的 Provider 配置项
export type ProviderConfigItem = {
  id: string; // for dnd-kit
  provider: Provider;
  route: Route | null;
  enabled: boolean;
  isNative: boolean; // Provider 是否原生支持此 ClientType
};
