const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 2;

export class InstagramApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "InstagramApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new InstagramApiError("INSTAGRAM_ACCESS_TOKEN is not configured.", 500, null);
  }
  return token;
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function igFetch<T>(pathOrUrl: string, params: Record<string, string> = {}, retry = 0): Promise<T> {
  const token = getToken();
  const isAbsolute = pathOrUrl.startsWith("http");
  const url = isAbsolute ? new URL(pathOrUrl) : new URL(`${GRAPH_BASE}${pathOrUrl}`);
  if (!isAbsolute) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    if (!url.searchParams.has("access_token")) {
      url.searchParams.set("access_token", token);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const json = (await response.json()) as T & { error?: { message?: string; code?: number } };
    if (!response.ok || (json as { error?: { message?: string } }).error) {
      const status = response.status;
      const message = (json as { error?: { message?: string } }).error?.message || `Instagram request failed (${status})`;
      const retryable = status === 429 || status >= 500;
      if (retryable && retry < MAX_RETRIES) {
        const wait = status === 429 ? 2000 * (retry + 1) : 800 * (retry + 1);
        await delay(wait);
        return igFetch<T>(pathOrUrl, params, retry + 1);
      }
      throw new InstagramApiError(message, status, json);
    }
    return json;
  } catch (error) {
    if (error instanceof InstagramApiError) throw error;
    if (retry < MAX_RETRIES) {
      await delay(800 * (retry + 1));
      return igFetch<T>(pathOrUrl, params, retry + 1);
    }
    const message = error instanceof Error ? error.message : "Instagram request failed";
    throw new InstagramApiError(message, 502, null);
  } finally {
    clearTimeout(timeout);
  }
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  async function run(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
      done += 1;
      onProgress?.(done);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(workers);
  return results;
}
