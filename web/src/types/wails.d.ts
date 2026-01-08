/**
 * Wails 全局类型声明
 */

declare global {
  interface Window {
    /**
     * Wails v3 环境标识
     */
    __WAILS__?: boolean;

    /**
     * Wails v3 运行时 API
     */
    wails?: {
      /**
       * 调用 Go 服务方法
       * @param method 方法名，格式: ServiceName.MethodName
       * @param args 参数列表
       */
      Call<T = unknown>(method: string, ...args: unknown[]): Promise<T>;
    };
  }
}

export {};
