import { browser } from '#imports';
import * as z from 'zod';

// 定义配置类型
export const ConfigSchema = z.object({
  apiUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  enableThinking: z.boolean().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

// 默认配置
export const DEFAULT_CONFIG: Config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiKey: import.meta.env.VITE_API_KEY || '',
  model: 'gemini-2.5-flash-preview-09-2025',
  enableThinking: false,
};

const STORAGE_KEY = 'chaonima_config';

/**
 * 从存储中读取配置
 */
export async function getConfig(): Promise<Config> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    
    if (!stored) {
      return DEFAULT_CONFIG;
    }
    
    const parsed = ConfigSchema.parse(stored);
    // 合并默认配置，确保所有字段都有值
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (error) {
    console.error('Error loading config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 保存配置到存储
 */
export async function saveConfig(config: Partial<Config>): Promise<void> {
  try {
    const currentConfig = await getConfig();
    const newConfig = { ...currentConfig, ...config };
    const validated = ConfigSchema.parse(newConfig);
    await browser.storage.local.set({ [STORAGE_KEY]: validated });
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

/**
 * 重置配置为默认值
 */
export async function resetConfig(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}
