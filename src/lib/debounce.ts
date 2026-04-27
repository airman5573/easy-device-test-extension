export type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  flush: () => void;
  cancel: () => void;
};

export const debounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs: number,
): DebouncedFunction<TArgs> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = ((...args: TArgs) => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      const argsToUse = lastArgs;
      lastArgs = null;

      if (argsToUse) {
        callback(...argsToUse);
      }
    }, waitMs);
  }) as DebouncedFunction<TArgs>;

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    const argsToUse = lastArgs;
    lastArgs = null;

    if (argsToUse) {
      callback(...argsToUse);
    }
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    lastArgs = null;
  };

  return debounced;
};
