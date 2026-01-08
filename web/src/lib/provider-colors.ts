/**
 * Provider brand colors
 */

const providerColors = {
  anthropic: '#D4A574',
  openai: '#10A37F',
  deepseek: '#4A90D9',
  google: '#4285F4',
  azure: '#0089D6',
  aws: '#FF9900',
  cohere: '#D97706',
  mistral: '#F97316',
  custom: '#8C8C8C',
} as const;

export function getProviderColor(type: string): string {
  const key = type.toLowerCase() as keyof typeof providerColors;
  return providerColors[key] || providerColors.custom;
}
