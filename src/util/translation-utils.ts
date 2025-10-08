// Translation utility for easier language management
export interface TranslationKeys {
  heading: string;
  description: string;
  acceptAll: string;
  reject: string;
  changePreference: string;
  moreInfo: string;
  sections: {
    essential: {
      label: string;
      description: string;
    };
    analytics: {
      label: string;
      description: string;
    };
    marketing: {
      label: string;
      description: string;
    };
    preferences: {
      label: string;
      description: string;
    };
  };
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    heading: "Cookie Preferences",
    description: "By clicking, you agree to store cookies on your device to enhance navigation, analyze usage, and support marketing. ",
    acceptAll: "Save Preference",
    reject: "Reject",
    changePreference: "Change Preference",
    moreInfo: "More Info",
    sections: {
      essential: {
        label: "Essential",
        description: "Essential cookies enable core site functions like security and accessibility. They don't store personal data and cant be disabled."
      },
      analytics: {
        label: "Analytics",
        description: "These cookies collect anonymous data to help us improve website functionality and enhance user experience."
      },
      marketing: {
        label: "Marketing",
        description: "These cookies track users across websites to deliver relevant ads and may process personal data, requiring explicit consent."
      },
      preferences: {
        label: "Preferences",
        description: "These cookies remember settings like language or region and store display preferences to offer a more personalized, seamless experience."
      }
    }
  },
  es: {
    heading: "Preferencias de Cookies",
    description: "Al hacer clic, acepta el almacenamiento de cookies en su dispositivo para mejorar la navegación del sitio, analizar el uso del sitio y ayudar en nuestros esfuerzos de marketing como se describe en nuestro.",
    acceptAll: "Aceptar Todo",
    reject: "Rechazar",
    changePreference: "Cambiar Preferencias",
    moreInfo: "Más Información",
    sections: {
      essential: {
        label: "Esenciales",
        description: "Las cookies esenciales permiten funciones básicas del sitio como la seguridad y la accesibilidad. No almacenan datos personales y no se pueden desactivar."
      },
      analytics: {
        label: "Analíticas",
        description: "Estas cookies recopilan datos anónimos para ayudarnos a mejorar la funcionalidad del sitio web y optimizar la experiencia del usuario."
      },
      marketing: {
        label: "Marketing",
        description: "Estas cookies rastrean a los usuarios en diferentes sitios web para ofrecer anuncios relevantes y pueden procesar datos personales, por lo que requieren el consentimiento explícito."
      },
      preferences: {
        label: "Preferencias",
        description: "Estas cookies recuerdan configuraciones como el idioma o la región y almacenan preferencias de visualización para ofrecer una experiencia más personalizada y fluida."
      }
    }
  },
  fr: {
    heading: "Préférences des Cookies",
    description: "Ces cookies sont nécessaires au bon fonctionnement du site web. Ils ne stockent aucune information personnelle.",
    reject: "Refuser",
    acceptAll: "Aceptar Todo",
    changePreference: "Modifier les Préférences",
    moreInfo: "Plus d'Informations",
    sections: {
      essential: {
        label: "Essentiels",
        description: "Les cookies essentiels permettent les fonctions de base du site, comme la sécurité et l'accessibilité. Ils ne stockent pas de données personnelles et ne peuvent pas être désactivés."
      },
      analytics: {
        label: "Analytiques",
        description: "Ces cookies collectent des données anonymes pour nous aider à améliorer les fonctionnalités du site web et à enrichir l'expérience utilisateur."
      },
      marketing: {
        label: "Marketing",
        description: "Ces cookies suivent les utilisateurs sur différents sites web pour diffuser des publicités pertinentes et peuvent traiter des données personnelles, nécessitant ainsi un consentement explicite."
      },
      preferences: {
        label: "Préférences",
        description: "Ces cookies mémorisent des paramètres tels que la langue ou la région et enregistrent les préférences d'affichage afin d'offrir une expérience plus personnalisée et fluide."
      }
    }
  },
  // Add more languages easily
  de: {
    heading: "Cookie-Einstellungen",
    description: "Durch Klicken stimmen Sie zu, Cookies auf Ihrem Gerät zu speichern, um die Navigation zu verbessern, die Nutzung zu analysieren und Marketing zu unterstützen",
    acceptAll: "Einstellungen speichern",
    reject: "Ablehnen",
    changePreference: "Einstellungen ändern",
    moreInfo: "Weitere Informationen",
    sections: {
      essential: {
        label: "Notwendig",
        description: "Notwendige Cookies ermöglichen grundlegende Website-Funktionen wie Sicherheit und Barrierefreiheit. Sie speichern keine persönlichen Daten und können nicht deaktiviert werden."
      },
      analytics: {
        label: "Analytik",
        description: "Diese Cookies sammeln anonyme Daten, um uns zu helfen, die Website-Funktionalität zu verbessern und die Benutzererfahrung zu optimieren."
      },
      marketing: {
        label: "Marketing",
        description: "Diese Cookies verfolgen Benutzer über Websites hinweg, um relevante Anzeigen zu liefern und können persönliche Daten verarbeiten, was eine ausdrückliche Zustimmung erfordert."
      },
      preferences: {
        label: "Einstellungen",
        description: "Diese Cookies merken sich Einstellungen wie Sprache oder Region und speichern Anzeigepräferenzen, um eine personalisiertere, nahtlose Erfahrung zu bieten."
      }
    }
  },
  it: {
    heading: "Preferenze sui Cookie",
    description: "Cliccando, accetti di memorizzare i cookie sul tuo dispositivo per migliorare la navigazione, analizzare l'utilizzo e supportare il marketing",
    acceptAll: "Salva Preferenze",
    reject: "Rifiuta",
    changePreference: "Cambia Preferenze",
    moreInfo: "Maggiori Informazioni",
    sections: {
      essential: {
        label: "Essenziali",
        description: "I cookie essenziali abilitano le funzioni principali del sito come sicurezza e accessibilità. Non memorizzano dati personali e non possono essere disabilitati."
      },
      analytics: {
        label: "Analitica",
        description: "Questi cookie raccolgono dati anonimi per aiutarci a migliorare la funzionalità del sito web e ottimizzare l'esperienza utente."
      },
      marketing: {
        label: "Marketing",
        description: "Questi cookie tracciano gli utenti su diversi siti web per fornire annunci rilevanti e possono elaborare dati personali, richiedendo un consenso esplicito."
      },
      preferences: {
        label: "Preferenze",
        description: "Questi cookie ricordano le impostazioni come lingua o regione e memorizzano le preferenze di visualizzazione per offrire un'esperienza più personalizzata e fluida."
      }
    }
  },
  pt: {
    heading: "Preferências de Cookies",
    description: "Ao clicar, você concorda em armazenar cookies no seu dispositivo para melhorar a navegação, analisar o uso e apoiar o marketing",
    acceptAll: "Salvar Preferências",
    reject: "Rejeitar",
    changePreference: "Alterar Preferências",
    moreInfo: "Mais Informações",
    sections: {
      essential: {
        label: "Essenciais",
        description: "Os cookies essenciais permitem funções básicas do site como segurança e acessibilidade. Eles não armazenam dados pessoais e não podem ser desabilitados."
      },
      analytics: {
        label: "Analíticos",
        description: "Esses cookies coletam dados anônimos para nos ajudar a melhorar a funcionalidade do site e otimizar a experiência do usuário."
      },
      marketing: {
        label: "Marketing",
        description: "Esses cookies rastreiam usuários em diferentes sites para fornecer anúncios relevantes e podem processar dados pessoais, exigindo consentimento explícito."
      },
      preferences: {
        label: "Preferências",
        description: "Esses cookies lembram configurações como idioma ou região e armazenam preferências de exibição para oferecer uma experiência mais personalizada e fluida."
      }
    }
  },
  sv: {
    heading: "Cookie-inställningar",
    description: "Genom att klicka godkänner du att lagra cookies på din enhet för att förbättra navigering, analysera användning och stödja marknadsföring",
    acceptAll: "Spara Inställningar",
    reject: "Avvisa",
    changePreference: "Ändra Inställningar",
    moreInfo: "Mer Information",
    sections: {
      essential: {
        label: "Nödvändiga",
        description: "Nödvändiga cookies aktiverar grundläggande webbplatsfunktioner som säkerhet och tillgänglighet. De lagrar inte personuppgifter och kan inte inaktiveras."
      },
      analytics: {
        label: "Analytik",
        description: "Dessa cookies samlar in anonyma data för att hjälpa oss att förbättra webbplatsens funktionalitet och optimera användarupplevelsen."
      },
      marketing: {
        label: "Marknadsföring",
        description: "Dessa cookies spårar användare över webbplatser för att leverera relevanta annonser och kan behandla personuppgifter, vilket kräver uttryckligt samtycke."
      },
      preferences: {
        label: "Inställningar",
        description: "Dessa cookies kommer ihåg inställningar som språk eller region och lagrar visningspreferenser för att erbjuda en mer personlig och smidig upplevelse."
      }
    }
  },
  nl: {
    heading: "Cookie-instellingen",
    description: "Door te klikken stemt u in met het opslaan van cookies op uw apparaat om navigatie te verbeteren, gebruik te analyseren en marketing te ondersteunen",
    acceptAll: "Instellingen Opslaan",
    reject: "Weigeren",
    changePreference: "Instellingen Wijzigen",
    moreInfo: "Meer Informatie",
    sections: {
      essential: {
        label: "Essentieel",
        description: "Essentiële cookies maken kernwebsite-functies mogelijk zoals beveiliging en toegankelijkheid. Ze slaan geen persoonlijke gegevens op en kunnen niet worden uitgeschakeld."
      },
      analytics: {
        label: "Analytics",
        description: "Deze cookies verzamelen anonieme gegevens om ons te helpen de website-functionaliteit te verbeteren en de gebruikerservaring te optimaliseren."
      },
      marketing: {
        label: "Marketing",
        description: "Deze cookies volgen gebruikers op verschillende websites om relevante advertenties te leveren en kunnen persoonlijke gegevens verwerken, wat expliciete toestemming vereist."
      },
      preferences: {
        label: "Voorkeuren",
        description: "Deze cookies onthouden instellingen zoals taal of regio en slaan weergavevoorkeuren op om een meer gepersonaliseerde, naadloze ervaring te bieden."
      }
    }
  },
  pl: {
    heading: "Ustawienia plików cookie",
    description: "Klikając, wyrażasz zgodę na przechowywanie plików cookie na Twoim urządzeniu w celu poprawy nawigacji, analizy użytkowania i wsparcia marketingu",
    acceptAll: "Zapisz ustawienia",
    reject: "Odrzuć",
    changePreference: "Zmień ustawienia",
    moreInfo: "Więcej informacji",
    sections: {
      essential: {
        label: "Niezbędne",
        description: "Niezbędne pliki cookie umożliwiają podstawowe funkcje strony internetowej, takie jak bezpieczeństwo i dostępność. Nie przechowują danych osobowych i nie można ich wyłączyć."
      },
      analytics: {
        label: "Analityczne",
        description: "Te pliki cookie zbierają anonimowe dane, aby pomóc nam ulepszyć funkcjonalność strony internetowej i zoptymalizować doświadczenie użytkownika."
      },
      marketing: {
        label: "Marketingowe",
        description: "Te pliki cookie śledzą użytkowników na różnych stronach internetowych, aby dostarczać odpowiednie reklamy i mogą przetwarzać dane osobowe, co wymaga wyraźnej zgody."
      },
      preferences: {
        label: "Preferencje",
        description: "Te pliki cookie zapamiętują ustawienia takie jak język lub region oraz przechowują preferencje wyświetlania, aby zapewnić bardziej spersonalizowane, płynne doświadczenie."
      }
    }
}
};

// Language mapping for backward compatibility
export const languageMapping: Record<string, string> = {
  "English": "en",
  "Spanish": "es", 
  "French": "fr",
  "German": "de",
  "Italian": "it",
  "Polish": "pl",
  "Portuguese": "pt",
  "Swedish": "sv",
  "Dutch": "nl"
};

// Function to get translation by language
export function getTranslation(language: string): TranslationKeys {
  const langCode = languageMapping[language] || language.toLowerCase();
  return translations[langCode] || translations.en;
}

// Function to add a new language easily
export function addLanguage(langCode: string, translation: TranslationKeys): void {
  translations[langCode] = translation;
}

// Function to get all available languages
export function getAvailableLanguages(): string[] {
  return Object.keys(translations);
}

// Function to get language name from code
export function getLanguageName(langCode: string): string {
  const languageNames: Record<string, string> = {
    "en": "English",
    "es": "Spanish",
    "fr": "French", 
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "sv": "Swedish",
    "nl": "Dutch"
  };
  return languageNames[langCode] || langCode;
} 