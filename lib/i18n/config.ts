import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ar from '../../messages/ar.json'
import en from '../../messages/en.json'
import fr from '../../messages/fr.json'
import id from '../../messages/id.json'
import ms from '../../messages/ms.json'
import sw from '../../messages/sw.json'
import th from '../../messages/th.json'
import vi from '../../messages/vi.json'

const resources = {
  en: { common: en },
  fr: { common: fr },
  ar: { common: ar },
  id: { common: id },
  vi: { common: vi },
  th: { common: th },
  ms: { common: ms },
  sw: { common: sw },
}

// Initialize i18n immediately (synchronous)
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common'],
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n
