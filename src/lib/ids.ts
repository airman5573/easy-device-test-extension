const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'device';

export const createDeviceInstanceId = (nameOrPresetId: string, existingIds: Iterable<string> = []) => {
  const existing = new Set(existingIds);
  const base = slugify(nameOrPresetId);

  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  let candidate = `${base}-${suffix}`;

  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
};

export const createCustomPresetId = (name: string, existingIds: Iterable<string> = []) =>
  createDeviceInstanceId(`custom-${name}`, existingIds);
