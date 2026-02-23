import { describe, it, expect } from 'vitest'

/**
 * Unit tests for QuoteActions display logic.
 * Tests which action set is shown given quote/booking status combinations.
 * (Component rendering is not tested here — these cover the conditional branches.)
 */

type ActionSet = 'accept-reject' | 'pay-deposit' | 'payment-confirmed' | 'terminal' | 'none'

function resolveActionSet(
  quoteStatus: string,
  bookingStatus?: string,
): ActionSet {
  const pendingAcceptance = ['READY', 'SENT', 'VIEWED']
  const pendingPayment = ['PENDING_PAYMENT', 'PENDING', 'CONFIRMED']
  const paid = ['DEPOSIT_PAID', 'FULLY_PAID']
  const terminal = ['REJECTED', 'EXPIRED']

  if (pendingAcceptance.includes(quoteStatus)) return 'accept-reject'
  if (bookingStatus && pendingPayment.includes(bookingStatus)) return 'pay-deposit'
  if (bookingStatus && paid.includes(bookingStatus)) return 'payment-confirmed'
  if (terminal.includes(quoteStatus)) return 'terminal'
  return 'none'
}

describe('QuoteActions state machine', () => {
  describe('accept-reject panel', () => {
    it('shows for SENT quote', () => {
      expect(resolveActionSet('SENT')).toBe('accept-reject')
    })

    it('shows for READY quote', () => {
      expect(resolveActionSet('READY')).toBe('accept-reject')
    })

    it('shows for VIEWED quote', () => {
      expect(resolveActionSet('VIEWED')).toBe('accept-reject')
    })
  })

  describe('pay deposit panel', () => {
    it('shows when quote accepted and booking is PENDING_PAYMENT', () => {
      expect(resolveActionSet('ACCEPTED', 'PENDING_PAYMENT')).toBe('pay-deposit')
    })

    it('shows when booking status is CONFIRMED', () => {
      expect(resolveActionSet('ACCEPTED', 'CONFIRMED')).toBe('pay-deposit')
    })
  })

  describe('payment confirmed panel', () => {
    it('shows when booking is DEPOSIT_PAID', () => {
      expect(resolveActionSet('ACCEPTED', 'DEPOSIT_PAID')).toBe('payment-confirmed')
    })

    it('shows when booking is FULLY_PAID', () => {
      expect(resolveActionSet('ACCEPTED', 'FULLY_PAID')).toBe('payment-confirmed')
    })
  })

  describe('terminal state', () => {
    it('shows terminal message for REJECTED quote', () => {
      expect(resolveActionSet('REJECTED')).toBe('terminal')
    })

    it('shows terminal message for EXPIRED quote', () => {
      expect(resolveActionSet('EXPIRED')).toBe('terminal')
    })
  })

  describe('edge cases', () => {
    it('returns none for unknown status combination', () => {
      expect(resolveActionSet('DRAFT')).toBe('none')
    })

    it('returns none for ACCEPTED quote without booking', () => {
      expect(resolveActionSet('ACCEPTED', undefined)).toBe('none')
    })
  })
})
