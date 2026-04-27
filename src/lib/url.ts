import { normalizedUrlSchema, urlInputSchema } from './schemas';

const UNSUPPORTED_PROTOCOL_MESSAGE = 'http:// 또는 https:// 주소만 지원합니다.';

export type NormalizeUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const hasProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);

const addDefaultProtocol = (value: string) => {
  if (hasProtocol(value)) {
    return value;
  }

  if (/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$)/i.test(value)) {
    return `http://${value}`;
  }

  return `https://${value}`;
};

export const normalizeUrl = (input: string): NormalizeUrlResult => {
  const inputResult = urlInputSchema.safeParse(input);

  if (!inputResult.success) {
    return { ok: false, error: inputResult.error.issues[0]?.message ?? '주소를 입력하세요' };
  }

  const candidate = addDefaultProtocol(inputResult.data);

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: '올바른 주소를 입력하세요.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: UNSUPPORTED_PROTOCOL_MESSAGE };
  }

  const normalized = parsed.toString();
  const normalizedResult = normalizedUrlSchema.safeParse(normalized);

  if (!normalizedResult.success) {
    return { ok: false, error: normalizedResult.error.issues[0]?.message ?? UNSUPPORTED_PROTOCOL_MESSAGE };
  }

  return { ok: true, url: normalizedResult.data };
};
