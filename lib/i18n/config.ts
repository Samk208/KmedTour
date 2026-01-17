import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    common: {
      // Navigation
      nav: {
        home: 'Home',
        about: 'About',
        howItWorks: 'How It Works',
        forClinics: 'For Clinics',
        contact: 'Contact',
        content: 'Content Hub',
        treatments: 'Treatments',
        countries: 'Countries',
        articles: 'Articles',
        dashboard: 'Dashboard',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        treatmentAdvisor: 'Treatment Advisor', // Added Treatment Advisor nav link
      },
      // Common UI
      ui: {
        learnMore: 'Learn More',
        getStarted: 'Get Started',
        submit: 'Submit',
        cancel: 'Cancel',
        next: 'Next',
        previous: 'Previous',
        finish: 'Finish',
        close: 'Close',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
      },
      // Footer
      footer: {
        tagline: 'Trusted medical tourism from Africa to Korea',
        copyright: '© 2025 Kmedtour. All rights reserved.',
        company: 'Company',
        support: 'Support',
        legal: 'Legal',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
      },
      // Treatment Advisor translations
      advisor: {
        title: 'Treatment Advisor',
        subtitle: 'Answer a few questions to find the right treatment for you',
        step1: {
          title: 'What are your symptoms?',
          subtitle: 'Select all that apply',
          infertility: 'Infertility or difficulty conceiving',
          cosmeticConcerns: 'Cosmetic concerns or appearance enhancement',
          dentalIssues: 'Dental issues or missing teeth',
          cancer: 'Cancer diagnosis requiring treatment',
          jointPain: 'Joint pain or mobility issues',
          heartCondition: 'Heart condition or cardiac issues',
          other: 'Other medical condition',
        },
        step2: {
          title: 'How long can you stay?',
          subtitle: 'Select your available duration',
          oneWeek: '1 week',
          twoWeeks: '2 weeks',
          threeWeeks: '3 weeks',
          fourWeeks: '4+ weeks',
          flexible: 'Flexible',
        },
        step3: {
          title: 'What is your budget?',
          subtitle: 'Select your estimated budget range',
          low: 'Under $5,000',
          medium: '$5,000 - $15,000',
          high: '$15,000 - $30,000',
          veryHigh: '$30,000+',
          unsure: 'Not sure yet',
        },
        step4: {
          title: 'Language preferences',
          subtitle: 'Do you need language assistance?',
          english: 'English-speaking staff required',
          french: 'French-speaking staff preferred',
          translator: 'I need a translator',
          noPreference: 'No preference',
        },
        results: {
          title: 'Recommended Treatments',
          subtitle: 'Based on your answers, we recommend:',
          noMatches: 'No exact matches found. Our concierge team can help you find the right treatment.',
          requestConcierge: 'Request Concierge Service',
          viewDetails: 'View Details',
          startOver: 'Start Over',
          confidence: 'Match confidence',
        },
      },
      // Landing page translations
      landing: {
        meta: {
          title: "Korea's Trusted Medical Tourism Platform for International Patients | Kmedtour",
          description: "Connect with Korea's top medical clinics for world-class treatments. Expert concierge support, transparent pricing, and multilingual assistance for international patients.",
        },
        hero: {
          badge: "Trusted by Patients Worldwide",
          title: "Access World-Class Korean Healthcare With Ease",
          subtitle: "Premium, transparent, multilingual support for global patients seeking advanced medical treatments in Korea",
          ctaPrimary: "Explore Treatments",
          ctaSecondary: "Request Concierge Support",
          stats: {
            patients: "International Patients",
            clinics: "Partner Clinics",
            satisfaction: "Satisfaction Rate",
          },
        },
        benefits: {
          badge: "Why Korea",
          title: "Why Patients Worldwide Choose Korea",
          subtitle: "Korea has become a global leader in medical tourism, offering unmatched quality and value",
          items: {
            technology: {
              title: "Advanced Technology",
              description: "State-of-the-art medical equipment and cutting-edge treatment techniques",
            },
            specialists: {
              title: "Expert Specialists",
              description: "Highly trained doctors with international experience and certifications",
            },
            outcomes: {
              title: "Excellent Safety Outcomes",
              description: "World-class success rates with rigorous safety standards and protocols",
            },
            pricing: {
              title: "Transparent Pricing",
              description: "Clear, upfront costs with significant savings compared to Western countries",
            },
            support: {
              title: "Multilingual Support",
              description: "English, French, and other language support throughout your journey",
            },
            accreditation: {
              title: "International Accreditation",
              description: "JCI-accredited facilities meeting the highest global standards",
            },
          },
        },
        treatments: {
          badge: "Popular Treatments",
          title: "World-Class Treatments for Every Need",
          subtitle: "From fertility to cosmetic procedures, Korea offers excellence across all specialties",
          viewAll: "View All Treatments",
          from: "From",
        },
        howItWorks: {
          badge: "Simple Process",
          title: "How Kmedtour Works",
          subtitle: "Your journey to world-class healthcare in four simple steps",
          steps: {
            explore: {
              title: "Explore Options",
              description: "Browse treatments, clinics, and read patient stories to find the right fit",
            },
            matched: {
              title: "Get Matched",
              description: "Our experts connect you with the best clinics for your specific needs",
            },
            plan: {
              title: "Plan Your Trip",
              description: "We handle visas, travel, accommodation, and all logistics for you",
            },
            care: {
              title: "Receive Care",
              description: "Get world-class treatment with full concierge support from arrival to recovery",
            },
          },
        },
        global: {
          badge: "Global Reach",
          title: "Trusted by Patients Worldwide",
          subtitle: "We serve international patients from Africa, Southeast Asia, GCC, Europe, and diaspora communities around the world",
          regions: "Patients from 50+ countries trust Kmedtour",
        },
        testimonials: {
          badge: "Success Stories",
          title: "What Our Patients Say",
          subtitle: "Real experiences from patients who found quality care through Kmedtour",
        },
        faq: {
          badge: "FAQ",
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know about medical tourism in Korea",
          items: {
            q1: {
              question: "Why is Korea a top destination for medical tourism?",
              answer: "Korea combines advanced medical technology, highly skilled doctors, international accreditation, and affordable pricing. Korean hospitals have some of the highest success rates globally, and the country has invested heavily in becoming a medical tourism hub with excellent patient support infrastructure.",
            },
            q2: {
              question: "Do you provide multilingual support?",
              answer: "Yes! We offer support in English, French, and other languages. Our partner clinics have multilingual staff, and we can arrange interpreters for your consultations and procedures to ensure clear communication throughout your treatment.",
            },
            q3: {
              question: "How long does planning and booking take?",
              answer: "Initial consultation and clinic matching typically takes 3-5 business days. Once you select a clinic, booking and travel arrangements can be completed within 2-4 weeks, depending on your treatment type and preferred dates. We work efficiently to accommodate your timeline.",
            },
            q4: {
              question: "What does Kmedtour's concierge service include?",
              answer: "Our concierge service includes clinic matching, appointment scheduling, medical record translation, visa support letters, travel booking assistance, accommodation recommendations, airport pickup, interpretation services, and 24/7 support throughout your stay in Korea.",
            },
            q5: {
              question: "How are clinics selected and vetted?",
              answer: "We partner only with JCI-accredited or equivalent facilities that meet international standards. We evaluate clinics based on success rates, specialist credentials, patient reviews, facility quality, and language support capabilities. Regular audits ensure continued excellence.",
            },
            q6: {
              question: "What if I need follow-up care after returning home?",
              answer: "We coordinate with your local healthcare providers for follow-up care and ensure you receive detailed medical records and care instructions. Many of our partner clinics offer telemedicine consultations for post-treatment support, and we remain available to assist with any questions.",
            },
          },
        },
        finalCta: {
          badge: "Ready to Begin?",
          title: "Start Your Medical Tourism Journey Today",
          subtitle: "Join thousands of satisfied patients who found quality, affordable healthcare in Korea",
          ctaPrimary: "Get Started Free",
          ctaSecondary: "Browse Treatments",
        },
      },
    },
  },
  fr: {
    common: {
      // Navigation
      nav: {
        home: 'Accueil',
        about: 'À propos',
        howItWorks: 'Comment ça marche',
        forClinics: 'Pour les cliniques',
        contact: 'Contact',
        content: 'Hub de contenu',
        treatments: 'Traitements',
        countries: 'Pays',
        articles: 'Articles',
        dashboard: 'Tableau de bord',
        login: 'Connexion',
        signup: 'S\'inscrire',
        logout: 'Déconnexion',
        treatmentAdvisor: 'Conseiller de Traitement', // Added Treatment Advisor nav link
      },
      // Common UI
      ui: {
        learnMore: 'En savoir plus',
        getStarted: 'Commencer',
        submit: 'Soumettre',
        cancel: 'Annuler',
        next: 'Suivant',
        previous: 'Précédent',
        finish: 'Terminer',
        close: 'Fermer',
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite',
        success: 'Succès',
      },
      // Footer
      footer: {
        tagline: 'Tourisme médical de confiance d\'Afrique vers la Corée',
        copyright: '© 2025 Kmedtour. Tous droits réservés.',
        company: 'Entreprise',
        support: 'Assistance',
        legal: 'Juridique',
        privacyPolicy: 'Politique de confidentialité',
        termsOfService: 'Conditions d\'utilisation',
      },
      // Treatment Advisor translations
      advisor: {
        title: 'Conseiller de Traitement',
        subtitle: 'Répondez à quelques questions pour trouver le bon traitement',
        step1: {
          title: 'Quels sont vos symptômes ?',
          subtitle: 'Sélectionnez tout ce qui s\'applique',
          infertility: 'Infertilité ou difficulté à concevoir',
          cosmeticConcerns: 'Préoccupations esthétiques ou amélioration de l\'apparence',
          dentalIssues: 'Problèmes dentaires ou dents manquantes',
          cancer: 'Diagnostic de cancer nécessitant un traitement',
          jointPain: 'Douleurs articulaires ou problèmes de mobilité',
          heartCondition: 'Condition cardiaque ou problèmes cardiaques',
          other: 'Autre condition médicale',
        },
        step2: {
          title: 'Combien de temps pouvez-vous rester ?',
          subtitle: 'Sélectionnez votre durée disponible',
          oneWeek: '1 semaine',
          twoWeeks: '2 semaines',
          threeWeeks: '3 semaines',
          fourWeeks: '4+ semaines',
          flexible: 'Flexible',
        },
        step3: {
          title: 'Quel est votre budget ?',
          subtitle: 'Sélectionnez votre fourchette budgétaire estimée',
          low: 'Moins de 5 000 $',
          medium: '5 000 $ - 15 000 $',
          high: '15 000 $ - 30 000 $',
          veryHigh: '30 000 $+',
          unsure: 'Pas encore sûr',
        },
        step4: {
          title: 'Préférences linguistiques',
          subtitle: 'Avez-vous besoin d\'aide linguistique ?',
          english: 'Personnel anglophone requis',
          french: 'Personnel francophone préféré',
          translator: 'J\'ai besoin d\'un traducteur',
          noPreference: 'Aucune préférence',
        },
        results: {
          title: 'Traitements Recommandés',
          subtitle: 'Basé sur vos réponses, nous recommandons :',
          noMatches: 'Aucune correspondance exacte trouvée. Notre équipe de conciergerie peut vous aider.',
          requestConcierge: 'Demander le Service de Conciergerie',
          viewDetails: 'Voir les Détails',
          startOver: 'Recommencer',
          confidence: 'Confiance de correspondance',
        },
      },
      // Landing page translations
      landing: {
        meta: {
          title: "Plateforme de Tourisme Médical de Confiance en Corée pour Patients Internationaux | Kmedtour",
          description: "Connectez-vous avec les meilleures cliniques médicales coréennes pour des traitements de classe mondiale. Support de conciergerie expert, tarification transparente et assistance multilingue pour patients internationaux.",
        },
        hero: {
          badge: "Approuvé par des Patients du Monde Entier",
          title: "Accédez aux Soins de Santé Coréens de Classe Mondiale Facilement",
          subtitle: "Support multilingue premium et transparent pour les patients internationaux recherchant des traitements médicaux avancés en Corée",
          ctaPrimary: "Explorer les Traitements",
          ctaSecondary: "Demander le Support de Conciergerie",
          stats: {
            patients: "Patients Internationaux",
            clinics: "Cliniques Partenaires",
            satisfaction: "Taux de Satisfaction",
          },
        },
        benefits: {
          badge: "Pourquoi la Corée",
          title: "Pourquoi les Patients du Monde Entier Choisissent la Corée",
          subtitle: "La Corée est devenue un leader mondial du tourisme médical, offrant qualité et valeur inégalées",
          items: {
            technology: {
              title: "Technologie Avancée",
              description: "Équipement médical de pointe et techniques de traitement innovantes",
            },
            specialists: {
              title: "Spécialistes Experts",
              description: "Médecins hautement qualifiés avec expérience internationale et certifications",
            },
            outcomes: {
              title: "Excellents Résultats de Sécurité",
              description: "Taux de réussite de classe mondiale avec normes et protocoles de sécurité rigoureux",
            },
            pricing: {
              title: "Tarification Transparente",
              description: "Coûts clairs et initiaux avec économies significatives par rapport aux pays occidentaux",
            },
            support: {
              title: "Support Multilingue",
              description: "Support en anglais, français et autres langues tout au long de votre parcours",
            },
            accreditation: {
              title: "Accréditation Internationale",
              description: "Installations accréditées JCI répondant aux normes mondiales les plus élevées",
            },
          },
        },
        treatments: {
          badge: "Traitements Populaires",
          title: "Traitements de Classe Mondiale pour Tous les Besoins",
          subtitle: "De la fertilité aux procédures cosmétiques, la Corée offre l'excellence dans toutes les spécialités",
          viewAll: "Voir Tous les Traitements",
          from: "À partir de",
        },
        howItWorks: {
          badge: "Processus Simple",
          title: "Comment Fonctionne Kmedtour",
          subtitle: "Votre voyage vers des soins de santé de classe mondiale en quatre étapes simples",
          steps: {
            explore: {
              title: "Explorer les Options",
              description: "Parcourez les traitements, cliniques et lisez des témoignages pour trouver ce qui vous convient",
            },
            matched: {
              title: "Être Jumelé",
              description: "Nos experts vous connectent avec les meilleures cliniques pour vos besoins spécifiques",
            },
            plan: {
              title: "Planifier Votre Voyage",
              description: "Nous gérons les visas, voyages, hébergement et toute la logistique pour vous",
            },
            care: {
              title: "Recevoir des Soins",
              description: "Obtenez un traitement de classe mondiale avec support de conciergerie complet de l'arrivée à la récupération",
            },
          },
        },
        global: {
          badge: "Portée Mondiale",
          title: "Approuvé par des Patients du Monde Entier",
          subtitle: "Nous servons des patients internationaux d'Afrique, d'Asie du Sud-Est, du CCG, d'Europe et des communautés de la diaspora du monde entier",
          regions: "Des patients de plus de 50 pays font confiance à Kmedtour",
        },
        testimonials: {
          badge: "Témoignages de Réussite",
          title: "Ce Que Disent Nos Patients",
          subtitle: "Expériences réelles de patients qui ont trouvé des soins de qualité grâce à Kmedtour",
        },
        faq: {
          badge: "FAQ",
          title: "Questions Fréquemment Posées",
          subtitle: "Tout ce que vous devez savoir sur le tourisme médical en Corée",
          items: {
            q1: {
              question: "Pourquoi la Corée est-elle une destination de choix pour le tourisme médical?",
              answer: "La Corée combine technologie médicale avancée, médecins hautement qualifiés, accréditation internationale et tarification abordable. Les hôpitaux coréens ont certains des taux de réussite les plus élevés au monde, et le pays a massivement investi pour devenir un pôle de tourisme médical avec une excellente infrastructure de support patient.",
            },
            q2: {
              question: "Offrez-vous un support multilingue?",
              answer: "Oui! Nous offrons un support en anglais, français et autres langues. Nos cliniques partenaires ont du personnel multilingue, et nous pouvons organiser des interprètes pour vos consultations et procédures afin d'assurer une communication claire tout au long de votre traitement.",
            },
            q3: {
              question: "Combien de temps prend la planification et la réservation?",
              answer: "La consultation initiale et le jumelage de clinique prennent généralement 3 à 5 jours ouvrables. Une fois que vous sélectionnez une clinique, la réservation et les arrangements de voyage peuvent être complétés en 2 à 4 semaines, selon votre type de traitement et dates préférées. Nous travaillons efficacement pour accommoder votre calendrier.",
            },
            q4: {
              question: "Qu'inclut le service de conciergerie de Kmedtour?",
              answer: "Notre service de conciergerie inclut le jumelage de clinique, la planification de rendez-vous, la traduction de dossiers médicaux, les lettres de support de visa, l'assistance de réservation de voyage, les recommandations d'hébergement, la prise en charge à l'aéroport, les services d'interprétation et le support 24/7 pendant votre séjour en Corée.",
            },
            q5: {
              question: "Comment les cliniques sont-elles sélectionnées et vérifiées?",
              answer: "Nous nous associons uniquement avec des installations accréditées JCI ou équivalentes qui répondent aux normes internationales. Nous évaluons les cliniques en fonction des taux de réussite, des qualifications des spécialistes, des avis des patients, de la qualité des installations et des capacités de support linguistique. Des audits réguliers garantissent une excellence continue.",
            },
            q6: {
              question: "Que se passe-t-il si j'ai besoin de soins de suivi après mon retour?",
              answer: "Nous coordonnons avec vos prestataires de soins de santé locaux pour les soins de suivi et nous assurons que vous recevez des dossiers médicaux détaillés et des instructions de soins. Beaucoup de nos cliniques partenaires offrent des consultations de télémédecine pour le support post-traitement, et nous restons disponibles pour vous aider avec toute question.",
            },
          },
        },
        finalCta: {
          badge: "Prêt à Commencer?",
          title: "Commencez Votre Voyage de Tourisme Médical Aujourd'hui",
          subtitle: "Rejoignez des milliers de patients satisfaits qui ont trouvé des soins de santé de qualité et abordables en Corée",
          ctaPrimary: "Commencer Gratuitement",
          ctaSecondary: "Parcourir les Traitements",
        },
      },
    },
  },
}

// Initialize i18n immediately (synchronous)
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n
