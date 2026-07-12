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

    it('detects "do i need" with a clinical object', () => {
      expect(isMedicalAdvice('Do I need surgery?')).toBe(true)
    })

    it('ignores "do i need" for logistics (visa, flights, hotel)', () => {
      expect(isMedicalAdvice('What visa do I need for medical treatment in Korea?')).toBe(false)
      expect(isMedicalAdvice('Do I need a visa?')).toBe(false)
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

  describe('isEmergency — multilingual (Africa audience: FR / PT / AR)', () => {
    it('detects French chest pain, accented or not', () => {
      expect(isEmergency("j'ai une douleur thoracique sévère")).toBe(true)
      expect(isEmergency('jai une douleur thoracique severe')).toBe(true)
    })

    it('detects French "can\'t breathe" variants', () => {
      expect(isEmergency("je n'arrive pas à respirer")).toBe(true)
      expect(isEmergency('je narrive pas a respirer')).toBe(true)
    })

    it('detects French heart attack', () => {
      expect(isEmergency('je fais une crise cardiaque')).toBe(true)
    })

    it('detects Portuguese chest pain and breathlessness', () => {
      expect(isEmergency('estou com dor no peito')).toBe(true)
      expect(isEmergency('não consigo respirar')).toBe(true)
    })

    it('detects Arabic chest pain and breathlessness (orthographic variants)', () => {
      expect(isEmergency('لدي ألم في الصدر')).toBe(true)
      expect(isEmergency('لا استطيع التنفس')).toBe(true)
    })

    it('does not fire on benign non-English queries', () => {
      expect(isEmergency('combien coûte la rhinoplastie')).toBe(false)
      expect(isEmergency('quanto custa o implante dentário')).toBe(false)
    })
  })

  describe('isMedicalAdvice — multilingual', () => {
    it('detects French "should I get surgery"', () => {
      expect(isMedicalAdvice('devrais-je faire une chirurgie ?')).toBe(true)
    })

    it('detects Portuguese "should I have surgery"', () => {
      expect(isMedicalAdvice('devo fazer uma cirurgia?')).toBe(true)
    })

    it('does not fire on French logistics questions', () => {
      expect(isMedicalAdvice('de quel visa ai-je besoin pour venir en Corée ?')).toBe(false)
    })
  })
})
