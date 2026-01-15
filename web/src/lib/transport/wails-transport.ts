/**
 * Wails Transport 实现
 * 使用 window.wails.Call() 直接调用 Go 方法，不依赖生成的绑定文件
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Transport, TransportConfig } from './interface';
import type {
  Provider,
  CreateProviderData,
  Project,
  CreateProjectData,
  Session,
  Route,
  CreateRouteData,
  RetryConfig,
  CreateRetryConfigData,
  RoutingStrategy,
  CreateRoutingStrategyData,
  ProxyRequest,
  ProxyUpstreamAttempt,
  ProxyStatus,
  ProviderStats,
  CursorPaginationParams,
  CursorPaginationResult,
  WSMessageType,
  EventCallback,
  UnsubscribeFn,
  AntigravityTokenValidationResult,
  AntigravityBatchValidationResult,
  AntigravityQuotaData,
  Cooldown,
  ImportResult,
} from './types';

// Wails 事件 API 类型
type WailsEventCallback = (data: unknown) => void;
type WailsUnsubscribeFn = () => void;

// Wails v2 runtime 类型（用于事件监听）
declare global {
  interface Window {
    runtime?: {
      EventsOn: (eventName: string, callback: WailsEventCallback) => WailsUnsubscribeFn;
      EventsOff: (eventName: string) => void;
    };
  }
}

export class WailsTransport implements Transport {
  private connected = false;
  private eventUnsubscribers: Map<string, WailsUnsubscribeFn> = new Map();
  private eventCallbacks: Map<WSMessageType, Set<EventCallback>> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config: TransportConfig = {}) {
    // Wails 模式下配置通常不需要
  }

  /**
   * 辅助方法：调用 Go DesktopApp 服务方法
   */
  private async call<T>(method: string, ...args: unknown[]): Promise<T> {
    if (!window.wails?.Call) {
      throw new Error('Wails runtime not available');
    }
    return window.wails.Call<T>(`DesktopApp.${method}`, ...args);
  }

  // ===== Provider API =====

  async getProviders(): Promise<Provider[]> {
    return this.call<Provider[]>('GetProviders');
  }

  async getProvider(id: number): Promise<Provider> {
    return this.call<Provider>('GetProvider', id);
  }

  async createProvider(data: CreateProviderData): Promise<Provider> {
    await this.call<void>('CreateProvider', data);
    // Wails CreateProvider returns void, need to get the created provider
    const providers = await this.getProviders();
    return providers[providers.length - 1];
  }

  async updateProvider(id: number, data: Partial<Provider>): Promise<Provider> {
    await this.call<void>('UpdateProvider', { ...data, id });
    return this.getProvider(id);
  }

  async deleteProvider(id: number): Promise<void> {
    await this.call<void>('DeleteProvider', id);
  }

  async exportProviders(): Promise<Provider[]> {
    return this.call<Provider[]>('ExportProviders');
  }

  async importProviders(providers: Provider[]): Promise<ImportResult> {
    return this.call<ImportResult>('ImportProviders', providers);
  }

  // ===== Project API =====

  async getProjects(): Promise<Project[]> {
    return this.call<Project[]>('GetProjects');
  }

  async getProject(id: number): Promise<Project> {
    return this.call<Project>('GetProject', id);
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    return this.call<Project>('GetProjectBySlug', slug);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    await this.call<void>('CreateProject', data);
    const projects = await this.getProjects();
    return projects[projects.length - 1];
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    await this.call<void>('UpdateProject', { ...data, id });
    return this.getProject(id);
  }

  async deleteProject(id: number): Promise<void> {
    await this.call<void>('DeleteProject', id);
  }

  // ===== Route API =====

  async getRoutes(): Promise<Route[]> {
    return this.call<Route[]>('GetRoutes');
  }

  async getRoute(id: number): Promise<Route> {
    return this.call<Route>('GetRoute', id);
  }

  async createRoute(data: CreateRouteData): Promise<Route> {
    await this.call<void>('CreateRoute', data);
    const routes = await this.getRoutes();
    return routes[routes.length - 1];
  }

  async updateRoute(id: number, data: Partial<Route>): Promise<Route> {
    await this.call<void>('UpdateRoute', { ...data, id });
    return this.getRoute(id);
  }

  async deleteRoute(id: number): Promise<void> {
    await this.call<void>('DeleteRoute', id);
  }

  // ===== Session API =====

  async getSessions(): Promise<Session[]> {
    return this.call<Session[]>('GetSessions');
  }

  async updateSessionProject(
    sessionID: string,
    projectID: number
  ): Promise<{ session: Session; updatedRequests: number }> {
    return this.call<{ session: Session; updatedRequests: number }>('UpdateSessionProject', sessionID, projectID);
  }

  async rejectSession(sessionID: string): Promise<Session> {
    return this.call<Session>('RejectSession', sessionID);
  }

  // ===== RetryConfig API =====

  async getRetryConfigs(): Promise<RetryConfig[]> {
    return this.call<RetryConfig[]>('GetRetryConfigs');
  }

  async getRetryConfig(id: number): Promise<RetryConfig> {
    return this.call<RetryConfig>('GetRetryConfig', id);
  }

  async createRetryConfig(data: CreateRetryConfigData): Promise<RetryConfig> {
    await this.call<void>('CreateRetryConfig', data);
    const configs = await this.getRetryConfigs();
    return configs[configs.length - 1];
  }

  async updateRetryConfig(id: number, data: Partial<RetryConfig>): Promise<RetryConfig> {
    await this.call<void>('UpdateRetryConfig', { ...data, id });
    return this.getRetryConfig(id);
  }

  async deleteRetryConfig(id: number): Promise<void> {
    await this.call<void>('DeleteRetryConfig', id);
  }

  // ===== RoutingStrategy API =====

  async getRoutingStrategies(): Promise<RoutingStrategy[]> {
    return this.call<RoutingStrategy[]>('GetRoutingStrategies');
  }

  async getRoutingStrategy(id: number): Promise<RoutingStrategy> {
    return this.call<RoutingStrategy>('GetRoutingStrategy', id);
  }

  async createRoutingStrategy(data: CreateRoutingStrategyData): Promise<RoutingStrategy> {
    await this.call<void>('CreateRoutingStrategy', data);
    const strategies = await this.getRoutingStrategies();
    return strategies[strategies.length - 1];
  }

  async updateRoutingStrategy(id: number, data: Partial<RoutingStrategy>): Promise<RoutingStrategy> {
    await this.call<void>('UpdateRoutingStrategy', { ...data, id });
    return this.getRoutingStrategy(id);
  }

  async deleteRoutingStrategy(id: number): Promise<void> {
    await this.call<void>('DeleteRoutingStrategy', id);
  }

  // ===== ProxyRequest API =====

  async getProxyRequests(params?: CursorPaginationParams): Promise<CursorPaginationResult<ProxyRequest>> {
    return this.call<CursorPaginationResult<ProxyRequest>>(
      'GetProxyRequestsCursor',
      params?.limit ?? 100,
      params?.before ?? 0,
      params?.after ?? 0
    );
  }

  async getProxyRequestsCount(): Promise<number> {
    return this.call<number>('GetProxyRequestsCount');
  }

  async getProxyRequest(id: number): Promise<ProxyRequest> {
    return this.call<ProxyRequest>('GetProxyRequest', id);
  }

  async getProxyUpstreamAttempts(proxyRequestId: number): Promise<ProxyUpstreamAttempt[]> {
    return this.call<ProxyUpstreamAttempt[]>('GetProxyUpstreamAttempts', proxyRequestId);
  }

  // ===== Proxy Status API =====

  async getProxyStatus(): Promise<ProxyStatus> {
    return this.call<ProxyStatus>('GetProxyStatus');
  }

  // ===== Provider Stats API =====

  async getProviderStats(clientType?: string, projectId?: number): Promise<Record<number, ProviderStats>> {
    return this.call<Record<number, ProviderStats>>('GetProviderStats', clientType ?? '', projectId ?? 0);
  }

  // ===== Settings API =====

  async getSettings(): Promise<Record<string, string>> {
    return this.call<Record<string, string>>('GetSettings');
  }

  async getSetting(key: string): Promise<{ key: string; value: string }> {
    const value = await this.call<string>('GetSetting', key);
    return { key, value };
  }

  async updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
    await this.call<void>('UpdateSetting', key, value);
    return { key, value };
  }

  async deleteSetting(key: string): Promise<void> {
    await this.call<void>('DeleteSetting', key);
  }

  // ===== Logs API =====

  async getLogs(limit = 100): Promise<{ lines: string[]; count: number }> {
    return this.call<{ lines: string[]; count: number }>('GetLogs', limit);
  }

  // ===== Antigravity API =====

  async validateAntigravityToken(refreshToken: string): Promise<AntigravityTokenValidationResult> {
    return this.call<AntigravityTokenValidationResult>('ValidateAntigravityToken', refreshToken);
  }

  async validateAntigravityTokens(tokens: string[]): Promise<AntigravityBatchValidationResult> {
    return this.call<AntigravityBatchValidationResult>('ValidateAntigravityTokens', tokens);
  }

  async validateAntigravityTokenText(tokenText: string): Promise<AntigravityBatchValidationResult> {
    return this.call<AntigravityBatchValidationResult>('ValidateAntigravityTokenText', tokenText);
  }

  async getAntigravityProviderQuota(providerId: number, forceRefresh?: boolean): Promise<AntigravityQuotaData> {
    return this.call<AntigravityQuotaData>('GetAntigravityProviderQuota', providerId, forceRefresh ?? false);
  }

  async startAntigravityOAuth(): Promise<{ authURL: string; state: string }> {
    return this.call<{ authURL: string; state: string }>('StartAntigravityOAuth');
  }

  // ===== Cooldown API =====

  async getCooldowns(): Promise<Cooldown[]> {
    return this.call<Cooldown[]>('GetCooldowns');
  }

  async clearCooldown(providerId: number): Promise<void> {
    await this.call<void>('ClearCooldown', providerId);
  }

  // ===== Wails Events 订阅 =====

  subscribe<T = unknown>(eventType: WSMessageType, callback: EventCallback<T>): UnsubscribeFn {
    // 保存回调
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, new Set());
    }
    this.eventCallbacks.get(eventType)!.add(callback as EventCallback);

    // 如果这是该事件类型的第一个订阅者，设置 Wails 事件监听
    if (!this.eventUnsubscribers.has(eventType)) {
      this.setupWailsEventListener(eventType);
    }

    return () => {
      this.eventCallbacks.get(eventType)?.delete(callback as EventCallback);

      // 如果没有更多订阅者，取消 Wails 事件监听
      if (this.eventCallbacks.get(eventType)?.size === 0) {
        this.eventUnsubscribers.get(eventType)?.();
        this.eventUnsubscribers.delete(eventType);
      }
    };
  }

  private setupWailsEventListener(eventType: WSMessageType): void {
    if (!window.runtime?.EventsOn) {
      console.warn('[WailsTransport] runtime.EventsOn not available');
      return;
    }

    const unsubscribe = window.runtime.EventsOn(eventType, (data: unknown) => {
      const callbacks = this.eventCallbacks.get(eventType);
      callbacks?.forEach((callback) => callback(data));
    });

    this.eventUnsubscribers.set(eventType, unsubscribe);
  }

  // ===== 生命周期 =====

  async connect(): Promise<void> {
    this.connected = true;
  }

  disconnect(): void {
    // 清理所有事件监听
    this.eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.eventUnsubscribers.clear();
    this.eventCallbacks.clear();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
