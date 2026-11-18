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

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  if (!baseUrl) {
    throw new ApiError(
      "VITE_API_BASE_URL is not configured",
      0,
      "/",
    )
  }

  return baseUrl.replace(/\/$/, "")
}

/**
 * Fetch wrapper for the future FastAPI backend.
 * Throws `ApiError` on non-OK responses or malformed JSON.
 */
export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${getBaseUrl()}${normalizedPath}`

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
