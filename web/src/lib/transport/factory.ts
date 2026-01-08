/**
 * Transport 工厂函数和环境检测
 */

import type { Transport, TransportType, TransportConfig } from './interface';
import { HttpTransport } from './http-transport';

/**
 * 检测当前运行环境
 */
export function detectTransportType(): TransportType {
  if (typeof window !== 'undefined' && window.__WAILS__) {
    return 'wails';
  }
  return 'http';
}

/**
 * 检测是否在 Wails 环境中运行
 */
export function isWailsEnvironment(): boolean {
  return detectTransportType() === 'wails';
}

/**
 * 创建 Transport 实例
 * 注意：Wails 环境下使用动态导入，避免在 web 模式下导入 @wailsio/runtime
 */
export async function createTransportAsync(config?: TransportConfig): Promise<Transport> {
  const type = detectTransportType();

  if (type === 'wails') {
    // 动态导入 WailsTransport，只在 Wails 环境下加载
    const { WailsTransport } = await import('./wails-transport');
    return new WailsTransport(config);
  }

  return new HttpTransport(config);
}

/**
 * 创建 Transport 实例（同步版本，仅支持 HTTP）
 * 在 Wails 环境下会抛出错误，需要使用 createTransportAsync
 */
export function createTransport(config?: TransportConfig): Transport {
  const type = detectTransportType();

  if (type === 'wails') {
    // 在 Wails 环境下，同步创建时使用 HTTP 作为临时方案
    // 实际使用时应该调用 initializeTransport() 来异步初始化
    console.warn('Wails environment detected but using sync createTransport. Call initializeTransport() for proper Wails support.');
    return new HttpTransport(config);
  }

  return new HttpTransport(config);
}

/**
 * 单例 Transport 实例
 */
let transportInstance: Transport | null = null;
let initPromise: Promise<Transport> | null = null;

/**
 * 初始化全局 Transport 单例（异步）
 * 在应用启动时调用一次
 */
export async function initializeTransport(config?: TransportConfig): Promise<Transport> {
  if (transportInstance) {
    return transportInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = createTransportAsync(config).then((transport) => {
    transportInstance = transport;
    return transport;
  });

  return initPromise;
}

/**
 * 获取全局 Transport 单例
 * 注意：在 Wails 环境下，必须先调用 initializeTransport()
 */
export function getTransport(config?: TransportConfig): Transport {
  if (!transportInstance) {
    // 同步创建（仅支持 HTTP）
    transportInstance = createTransport(config);
  }
  return transportInstance;
}

/**
 * 重置 Transport 单例（用于测试）
 */
export function resetTransport(): void {
  if (transportInstance) {
    transportInstance.disconnect();
    transportInstance = null;
  }
  initPromise = null;
}
