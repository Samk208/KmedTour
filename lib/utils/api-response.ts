import { NextResponse } from 'next/server'

export function createErrorId(prefix = 'err'): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}_${Date.now().toString(36)}_${random}`
}

export function apiError(
  message: string,
  status: number,
  options: { errorId?: string; code?: string } = {},
) {
  const errorId = options.errorId ?? createErrorId()

  return NextResponse.json(
    {
      success: false,
      message,
      code: options.code,
      errorId,
    },
    { status },
  )
}
