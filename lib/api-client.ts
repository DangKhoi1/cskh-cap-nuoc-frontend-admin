export class ApiError extends Error {
  readonly status: number;
  readonly errors?: string[];

  constructor(status: number, message: string, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "/api/backend"
).replace(/\/+$/, "");

let unauthorizedHandler: (() => void) | null = null;
let forbiddenHandler: ((message: string) => void) | null = null;

export function registerApiAuthHandlers(handlers: {
  onUnauthorized: () => void;
  onForbidden: (message: string) => void;
}): void {
  unauthorizedHandler = handlers.onUnauthorized;
  forbiddenHandler = handlers.onForbidden;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuthHandlers?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, skipAuthHandlers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const errorObj = (payload ?? {}) as {
      EM?: string;
      message?: string | string[];
      errors?: string[];
    };

    const rawMessage =
      errorObj.EM ||
      (Array.isArray(errorObj.message)
        ? errorObj.message[0]
        : errorObj.message) ||
      `Yêu cầu thất bại (${response.status})`;

    if (!skipAuthHandlers) {
      if (response.status === 401) {
        unauthorizedHandler?.();
      } else if (response.status === 403) {
        forbiddenHandler?.(rawMessage);
      }
    }

    throw new ApiError(response.status, rawMessage, errorObj.errors);
  }

  return payload as T;
}
