// Example: How to add a new language easily
import { addLanguage, TranslationKeys } from './translation-utils';

// Example: Adding Japanese language
const japaneseTranslation: TranslationKeys = {
  heading: "Cookie設定",
  description: "クリックすることで、ナビゲーションの向上、使用状況の分析、マーケティングのサポートのためにデバイスにCookieを保存することに同意します",
  acceptAll: "設定を保存",
  reject: "拒否",
  changePreference: "設定を変更",
  moreInfo: "詳細情報",
  sections: {
    essential: {
      label: "必須",
      description: "必須Cookieは、セキュリティやアクセシビリティなどのサイトの基本機能を有効にします。個人データを保存せず、無効にすることはできません。"
    },
    analytics: {
      label: "分析",
      description: "これらのCookieは、サイトの機能を改善し、ユーザーエクスペリエンスを向上させるために匿名データを収集します。"
    },
    marketing: {
      label: "マーケティング",
      description: "これらのCookieは、関連する広告を配信するためにウェブサイト間でユーザーを追跡し、個人データを処理する場合があり、明示的な同意が必要です。"
    },
    preferences: {
      label: "設定",
      description: "これらのCookieは、言語や地域などの設定を記憶し、よりパーソナライズされたシームレスな体験を提供するために表示設定を保存します。"
    }
  }
};

// Add the new language
addLanguage('ja', japaneseTranslation);

// Example: Adding Dutch language
const dutchTranslation: TranslationKeys = {
  heading: "Cookie Voorkeuren",
  description: "Door te klikken stemt u in met het opslaan van cookies op uw apparaat om navigatie te verbeteren, gebruik te analyseren en marketing te ondersteunen",
  acceptAll: "Voorkeuren Opslaan",
  reject: "Afwijzen",
  changePreference: "Voorkeuren Wijzigen",
  moreInfo: "Meer Informatie",
  sections: {
    essential: {
      label: "Essentieel",
      description: "Essentiële cookies maken kernfuncties van de site mogelijk zoals beveiliging en toegankelijkheid. Ze slaan geen persoonlijke gegevens op en kunnen niet worden uitgeschakeld."
    },
    analytics: {
      label: "Analytics",
      description: "Deze cookies verzamelen anonieme gegevens om ons te helpen de website-functionaliteit te verbeteren en de gebruikerservaring te optimaliseren."
    },
    marketing: {
      label: "Marketing",
      description: "Deze cookies volgen gebruikers op verschillende websites om relevante advertenties te leveren en kunnen persoonlijke gegevens verwerken, waarvoor expliciete toestemming vereist is."
    },
    preferences: {
      label: "Voorkeuren",
      description: "Deze cookies onthouden instellingen zoals taal of regio en slaan weergavevoorkeuren op om een meer gepersonaliseerde, naadloze ervaring te bieden."
    }
  }
};

// Add the new language
addLanguage('nl', dutchTranslation);

 