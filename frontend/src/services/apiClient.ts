export class ApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(message: string, status: number, path: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.path = path
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:8000/api"

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  const baseUrl =
    configured && configured.trim().length > 0
      ? configured
      : DEFAULT_API_BASE_URL

  return baseUrl.replace(/\/$/, "")
}

function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api$/, "")
}

/**
 * Fetch wrapper for the FastAPI backend.
 * Throws `ApiError` on non-OK responses or malformed JSON.
 */
export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${getApiBaseUrl()}${normalizedPath}`

  let response: Response

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError("Network request failed", 0, normalizedPath)
  }

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      normalizedPath,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError("Response was not valid JSON", response.status, normalizedPath)
  }
}

/** Lightweight liveness check against the API origin `/health` endpoint. */
export async function pingHealth(): Promise<void> {
  const path = "/health"
  const url = `${getApiOrigin()}${path}`

  let response: Response

  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    })
  } catch {
    throw new ApiError("Network request failed", 0, path)
  }

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      path,
    )
  }
}
