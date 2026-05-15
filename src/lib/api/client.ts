type ApiSuccess<T> = {
  success: true
  data: T
}

type ApiFailure = {
  success: false
  error?: {
    message?: string
    details?: unknown
  }
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const buildUrl = (path: string) => `${API_BASE_URL}${path}`

export const buildAssetUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const isFormData = options.body instanceof FormData

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.success === false && payload.error?.message
        ? payload.error.message
        : 'API request failed.',
      response.status,
      payload?.success === false ? payload.error?.details : undefined,
    )
  }

  if (!payload || payload.success !== true) {
    throw new ApiError('Invalid API response.', response.status)
  }

  return payload.data
}
