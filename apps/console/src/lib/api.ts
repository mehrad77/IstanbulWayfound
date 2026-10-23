export class ApiError extends Error {
  constructor(
    public status: number,
    public body: { error?: string; violations?: string[] } & Record<string, unknown>,
  ) {
    super(body.error ?? `Request failed (${status})`);
  }
}

/** Same-origin call: the console Worker forwards /api/* to the API over a service binding. */
export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...rest,
    headers:
      json !== undefined ? { "content-type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
  if (!res.ok) throw new ApiError(res.status, body as ApiError["body"]);
  return body as T;
}

export const PUBLIC_ORIGIN: string = import.meta.env.VITE_PUBLIC_ORIGIN ?? "http://localhost:8791";
