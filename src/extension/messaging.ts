import { appScrollToMessageSchema, responsiveLabMessageSchema } from '../lib/schemas';
import type { ResponsiveLabMessage, ResponsiveLabReadyMessage, ResponsiveLabScrollMessage, ResponsiveLabScrollToMessage } from '../lib/types';

export const CONTENT_MESSAGE_SOURCE = 'responsive-lab-content' as const;
export const APP_MESSAGE_SOURCE = 'responsive-lab-app' as const;

export const createReadyMessage = (): ResponsiveLabReadyMessage => ({
  source: CONTENT_MESSAGE_SOURCE,
  type: 'ready',
});

export const createScrollMessage = (ratio: number): ResponsiveLabScrollMessage => ({
  source: CONTENT_MESSAGE_SOURCE,
  type: 'scroll',
  ratio,
});

export const createScrollToMessage = (ratio: number): ResponsiveLabScrollToMessage => ({
  source: APP_MESSAGE_SOURCE,
  type: 'scrollTo',
  ratio,
});

export const parseResponsiveLabMessage = (value: unknown): ResponsiveLabMessage | null => {
  const result = responsiveLabMessageSchema.safeParse(value);
  return result.success ? result.data : null;
};

export const parseAppScrollToMessage = (value: unknown): ResponsiveLabScrollToMessage | null => {
  const result = appScrollToMessageSchema.safeParse(value);
  return result.success ? result.data : null;
};
