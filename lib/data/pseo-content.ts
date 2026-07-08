export type PseoFaq = {
  question: string
  answer: string
}

export type ProcedureGuide = {
  candidateFor: string[]
  whatToExpect: Array<{ step: string; duration: string; detail: string }>
  whyKorea: string[]
  faqs: PseoFaq[]
}

/**
 * Procedure-level content for high-traffic pSEO pages.
 * City-agnostic — displayed on all /[city]/[procedure] routes for a given procedure.
 *
 * Guides live as JSON sidecars in lib/data/pseo-guides/<slug>.json; the map is
 * assembled by scripts/build-pseo-guides-index.js into pseo-guides/index.ts
 * (static imports — runtime fs reads are not bundled into the Netlify
 * serverless function). Content rules enforced by scripts/qa-pseo-guides.js:
 * no fabricated statistics or expert quotes, factory paragraph/FAQ word caps,
 * each entry unique and medically accurate to general knowledge.
 */
export { pseoGuides as procedureGuides } from './pseo-guides'
