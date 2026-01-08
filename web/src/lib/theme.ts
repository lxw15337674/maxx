/**
 * 主题配置
 * 与 maxx 项目保持一致的设计系统
 */

// 颜色系统
export const colors = {
  // 背景色
  background: '#1E1E1E',

  // 表面色
  surfacePrimary: '#252526',
  surfaceSecondary: '#2D2D30',
  surfaceHover: '#3C3C3C',

  // 边框色
  border: '#3C3C3C',

  // 文本色
  textPrimary: '#CCCCCC',
  textSecondary: '#8C8C8C',
  textMuted: '#5A5A5A',

  // 强调色
  accent: '#0078D4',
  accentHover: '#1084D9',
  accentSubtle: 'rgba(0, 120, 212, 0.15)',

  // 状态色
  success: '#4EC9B0',
  warning: '#DDB359',
  error: '#F14C4C',
  info: '#4FC1FF',

  // Provider 品牌色
  providers: {
    anthropic: '#D4A574',
    openai: '#10A37F',
    deepseek: '#4A90D9',
    google: '#4285F4',
    azure: '#0089D6',
    aws: '#FF9900',
    cohere: '#D97706',
    mistral: '#F97316',
    custom: '#8C8C8C',
  },
} as const;

// 间距系统
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
} as const;

// 排版系统
export const typography = {
  caption: { size: '11px', lineHeight: '1.4', weight: 400 },
  body: { size: '13px', lineHeight: '1.5', weight: 400 },
  headline: { size: '15px', lineHeight: '1.4', weight: 600 },
  title3: { size: '17px', lineHeight: '1.3', weight: 600 },
  title2: { size: '20px', lineHeight: '1.2', weight: 700 },
  title1: { size: '24px', lineHeight: '1.2', weight: 700 },
  largeTitle: { size: '28px', lineHeight: '1.1', weight: 700 },
} as const;

// 圆角
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const;

// 阴影
export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.3)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.4)',
} as const;

/**
 * 获取 Provider 颜色
 */
export function getProviderColor(type: string): string {
  const key = type.toLowerCase() as keyof typeof colors.providers;
  return colors.providers[key] || colors.providers.custom;
}

/**
 * 获取 Provider 显示名称
 */
export function getProviderDisplayName(type: string): string {
  const names: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    google: 'Google',
    azure: 'Azure',
    aws: 'AWS Bedrock',
    cohere: 'Cohere',
    mistral: 'Mistral',
    custom: 'Custom',
  };
  return names[type.toLowerCase()] || type;
}

/**
 * Client 类型颜色映射
 */
export const clientColors: Record<string, string> = {
  claude: colors.providers.anthropic,
  openai: colors.providers.openai,
  codex: colors.providers.openai,
  gemini: colors.providers.google,
};

/**
 * 获取 Client 颜色
 */
export function getClientColor(clientType: string): string {
  return clientColors[clientType.toLowerCase()] || colors.providers.custom;
}
