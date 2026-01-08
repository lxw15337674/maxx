/**
 * Wails Runtime 模块声明
 * 用于在 Web 模式下编译通过
 */

declare module '@wailsio/runtime' {
  export const Events: {
    On: (eventName: string, callback: (data: unknown) => void) => () => void;
    Emit: (eventName: string, data?: unknown) => void;
  };
}
