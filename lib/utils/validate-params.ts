import { NextResponse } from 'next/server'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

/**
 * Validate that a route param is a valid UUID.
 * Returns null if valid, or a 400 response if not.
 */
export function validateUUID(
  value: string,
  paramName: string,
): NextResponse | null {
  const result = uuidSchema.safeParse(value)
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: `Invalid ${paramName}: must be a valid UUID` },
      { status: 400 },
    )
  }
  return null
}
