const DEFAULT_ENDPOINT = 'https://poslog.anydo.cloud/api/logs';
const NAMESPACE = 'chrome-responsive-ui-extension';

export function poslog(scenario: string, isError: boolean, message: string, detail?: unknown): void {
  const body = {
    logtype: isError ? 'ERROR' : 'INFO',
    namespace: NAMESPACE,
    scenario,
    message,
    context: detail,
  };

  console.debug('[poslog]', scenario, message, detail);

  fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}
