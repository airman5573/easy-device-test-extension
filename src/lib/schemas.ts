import { z } from 'zod';

export const deviceSourceSchema = z.enum(['default', 'preset', 'custom']);
export const deviceCategorySchema = z.enum(['mobile', 'foldable', 'tablet', 'desktop']);

export const devicePresetSchema = z.object({
  presetId: z.string().min(1),
  name: z.string().trim().min(1),
  width: z.number().int().min(100).max(10000),
  height: z.number().int().min(100).max(10000),
  category: deviceCategorySchema.default('mobile'),
});

export const deviceInstanceSchema = z.object({
  id: z.string().min(1),
  presetId: z.string().min(1).optional(),
  name: z.string().trim().min(1),
  width: z.number().int().min(100).max(10000),
  height: z.number().int().min(100).max(10000),
  baseWidth: z.number().int().min(100).max(10000),
  baseHeight: z.number().int().min(100).max(10000),
  category: deviceCategorySchema.default('mobile'),
  source: deviceSourceSchema,
  reloadKey: z.number().int().min(0),
});

export const customDeviceInputSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력하세요'),
  width: z.coerce.number().int('너비는 정수여야 합니다').min(100).max(10000),
  height: z.coerce.number().int('높이는 정수여야 합니다').min(100).max(10000),
  category: deviceCategorySchema.default('mobile'),
});

export const urlInputSchema = z.string().trim().min(1, '주소를 입력하세요');

export const normalizedUrlSchema = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'http:// 또는 https:// 주소만 지원합니다');

export const persistedAppStateSchema = z.object({
  urlInput: z.string(),
  activeUrl: normalizedUrlSchema.nullable(),
  zoom: z.number().int().min(10).max(200),
  syncScroll: z.boolean(),
  devices: z.array(deviceInstanceSchema),
  customDevices: z.array(devicePresetSchema),
});

export const contentReadyMessageSchema = z.object({
  source: z.literal('responsive-lab-content'),
  type: z.literal('ready'),
});

export const contentScrollMessageSchema = z.object({
  source: z.literal('responsive-lab-content'),
  type: z.literal('scroll'),
  ratio: z.number().min(0).max(1),
});

export const appScrollToMessageSchema = z.object({
  source: z.literal('responsive-lab-app'),
  type: z.literal('scrollTo'),
  ratio: z.number().min(0).max(1),
});

export const responsiveLabMessageSchema = z.discriminatedUnion('type', [
  contentReadyMessageSchema,
  contentScrollMessageSchema,
  appScrollToMessageSchema,
]);

export type DevicePresetSchema = z.infer<typeof devicePresetSchema>;
export type DeviceInstanceSchema = z.infer<typeof deviceInstanceSchema>;
export type CustomDeviceInputSchema = z.infer<typeof customDeviceInputSchema>;
export type PersistedAppStateSchema = z.infer<typeof persistedAppStateSchema>;
