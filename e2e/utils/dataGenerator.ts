export const randomSuffix = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const resolvePlaceholders = (value: string, suffix = randomSuffix()): string =>
  value.replaceAll('{RANDOM}', suffix);

