import { describe, it, expect } from 'vitest'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'

describe('chat-guards', () => {
  describe('isEmergency', () => {
    it('detects chest pain', () => {
      expect(isEmergency('I have chest pain')).toBe(true)
    })

    it('detects heart attack', () => {
      expect(isEmergency('heart attack symptoms')).toBe(true)
    })

    it('detects difficulty breathing', () => {
      expect(isEmergency('difficulty breathing after surgery')).toBe(true)
    })

    it('detects emergency keyword', () => {
      expect(isEmergency('This is an emergency!')).toBe(true)
    })

    it('returns false for non-emergency queries', () => {
      expect(isEmergency('How much does rhinoplasty cost?')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isEmergency('CHEST PAIN')).toBe(true)
    })
  })

  describe('isMedicalAdvice', () => {
    it('detects "should i get"', () => {
      expect(isMedicalAdvice('Should I get dental implants?')).toBe(true)
    })

    it('detects "do i need"', () => {
      expect(isMedicalAdvice('Do I need a visa?')).toBe(true)
    })

    it('detects "what medication"', () => {
      expect(isMedicalAdvice('What medication should I take?')).toBe(true)
    })

    it('returns false for informational queries', () => {
      expect(isMedicalAdvice('What is included in the health checkup?')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isMedicalAdvice('SHOULD I HAVE SURGERY')).toBe(true)
    })
  })
})
