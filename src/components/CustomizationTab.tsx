import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "../style/styless.css";
import Customization from "./Customization";
import Script from "./Script";
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const openeye = new URL("../assets/closedeye.svg", import.meta.url).href;
const eye = new URL("../assets/eye.svg", import.meta.url).href;
const dots = new URL("../assets/3 dots.svg", import.meta.url).href;
const checkedcatogry = new URL("../assets/tick-square catogeries.svg", import.meta.url).href;
const tickmark = new URL("../assets/tickmark.svg", import.meta.url).href;
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const errorsheild = new URL("../assets/warning-2.svg", import.meta.url).href;
const crossmark = new URL("../assets/group.svg", import.meta.url).href;
const rightarrow = new URL("../assets/up arrow.svg", import.meta.url).href;
const uparrow = new URL("../assets/blue up arrow.svg", import.meta.url).href;
const copyScript = new URL("../assets/copy script.svg", import.meta.url).href;

import { customCodeApi } from "../services/api";
import { useAuth } from "../hooks/userAuth";
import webflow, { WebflowAPI } from '../types/webflowtypes';
import { CodeApplication } from "../types/types";
import createCookiePreferences from "../hooks/gdprPreference";
import createCookieccpaPreferences from "../hooks/ccpaPreference";
import { usePersistentState } from "../hooks/usePersistentState";
import { Script as ScriptType } from "../types/types";
import { useQueryClient } from "@tanstack/react-query";
import PulseAnimation from "./PulseAnimation";
import NeedHelp from "./NeedHelp";
import ChoosePlan from "./ChoosePlan";
import CSVExportAdvanced from "./CSVExportAdvanced";
import WelcomeScreen from "./WelcomeScreen";
// Add at the top, after other imports
import pkg from '../../package.json';
const appVersion = pkg.version;
import { getSessionTokenFromLocalStorage } from '../util/Session'; 
import DonotShare from "./donotshare";



type Orientation = "left" | "center" | "right";
type BannerStyle = "align" | "alignstyle" | "bigstyle" | "centeralign" | "fullwidth" | "";
interface HelpItem {
  label: string;
  href: string;
  icon: string;
}

type BreakpointAndPseudo = {
  breakpoint: string;
  pseudoClass: string;
};

type UserData = {
  firstName: string;
  email: string;
  exp: number;
  sessionToken: string;
};

interface CustomizationTabProps {
  onAuth: () => void;
  initialActiveTab?: string;
  isAuthenticated?: boolean;
}

const CustomizationTab: React.FC<CustomizationTabProps> = ({ onAuth, initialActiveTab = "Settings", isAuthenticated = false }) => {
  const [color, setColor] = usePersistentState("color", "#ffffff");
  const [bgColor, setBgColor] = usePersistentState("bgColor", "#ffffff");
  const [btnColor, setBtnColor] = usePersistentState("btnColor", "#C9C9C9");
  const [paraColor, setParaColor] = usePersistentState("paraColor", "#4C4A66");
  const [secondcolor, setSecondcolor] = usePersistentState("secondcolor", "#000000");
  const [bgColors, setBgColors] = usePersistentState("bgColors", "#798EFF");
  const [headColor, setHeadColor] = usePersistentState("headColor", "#000000");
  const [secondbuttontext, setsecondbuttontext] = usePersistentState("secondbuttontext", "#000000");
  const [primaryButtonText, setPrimaryButtonText] = usePersistentState("primaryButtonText", "#FFFFFF");
  const [activeTab, setActiveTab] = usePersistentState("activeTab", initialActiveTab);
  
  // Override activeTab with initialActiveTab prop when provided (only on mount)
  useEffect(() => {
    if (initialActiveTab && initialActiveTab !== activeTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]); // Remove activeTab and setActiveTab from dependencies
  const [expires, setExpires] = usePersistentState("expires", "");
  const [size, setSize] = usePersistentState("size", "12");
  const [isActive, setIsActive] = usePersistentState("isActive", false);
  const [Font, SetFont] = usePersistentState("Font", "Montserrat");
  const [selectedtext, settextSelected] = usePersistentState("selectedtext", "left");
  const [style, setStyle] = usePersistentState<BannerStyle>("style", "align");
  // Removed activeMode - all features are now available by default
  const [selected, setSelected] = usePersistentState<Orientation>("selected", "right");
  const [selectedOption, setSelectedOption] = usePersistentState("selectedOption", "U.S. State Laws");
  const [weight, setWeight] = usePersistentState("weight", "semibold");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOptions, setSelectedOptions] = usePersistentState("selectedOptions", ["GDPR", "U.S. State Laws"]);

  // Ensure default state is properly set on component mount
  useEffect(() => {
    // Force set default values if not already set
    if (selectedOptions.length === 0 || !selectedOptions.includes("GDPR") || !selectedOptions.includes("U.S. State Laws")) {
      setSelectedOptions(["GDPR", "U.S. State Laws"]);
    }
  }, [selectedOptions, setSelectedOptions]);
  const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);
  const [accessToken, setAccessToken] = usePersistentState<string>("accessToken", '');
  const [pages, setPages] = usePersistentState("pages", []);
  const [fetchScripts, setFetchScripts] = usePersistentState("fetchScripts", false);
  const [borderRadius, setBorderRadius] = usePersistentState<number>("borderRadius", 4);
  const [buttonRadius, setButtonRadius] = usePersistentState<number>("buttonRadius", 3);
  const [isLoading, setIsLoading] = usePersistentState("isLoading", false);
  const [userlocaldata, setUserlocaldata] = useState<UserData | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Reset loading states when component mounts to prevent stuck loading animations
  React.useEffect(() => {
    setIsLoading(false);
    setShowLoadingPopup(false);
    setIsExporting(false);
    setIsCSVButtonLoading(false);
  }, []);

  // Handle auth checking with 2-3 second delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [buttonText, setButtonText] = usePersistentState("buttonText", "Scan Project");
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cookieExpiration, setCookieExpiration] = usePersistentState("cookieExpiration", "120");
  const [showTooltip, setShowTooltip] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const userinfo = localStorage.getItem("consentbit-userinfo");
  const tokenss = JSON.parse(userinfo);
  const [sessionTokenFromLocalStorage, setSessionToken] = useState(getSessionTokenFromLocalStorage());
  const [showChoosePlan, setShowChoosePlan] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBannerAdded, setIsBannerAdded] = usePersistentState("isBannerAdded", false);
  const [isCSVButtonLoading, setIsCSVButtonLoading] = useState(false);
  const [showCSVExportAdvanced, setShowCSVExportAdvanced] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);




  const base_url = "https://cb-server.web-8fb.workers.dev"

  // Welcome screen handlers - removed since this component is accessed via Customize link
  const handleWelcomeAuthorize = () => {
    // This function is not needed in CustomizationTab
  };

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };


  const [toggleStates, setToggleStates] = usePersistentState('toggleStates', {
    customToggle: false,
    resetInteractions: false,
    disableScroll: false,
    storeConsents: false,
    globalvariable: false,
    closebutton: false,
    donotshare: false,
  });


  // Your default states
  const defaultState = {
    animation: "fade",
    easing: "Ease",
    language: "English",
  };

  const [animation, setAnimation] = usePersistentState('animation', defaultState.animation);
  const [easing, setEasing] = usePersistentState('easing', defaultState.easing);
  const [language, setLanguage] = usePersistentState('language', defaultState.language);

  const handleToggle = (toggleName: keyof typeof toggleStates) => {
    setToggleStates((prev) => {
      const newState = { ...prev, [toggleName]: !prev[toggleName] };

      // If resetInteractions is turned ON, reset to default values
      if (toggleName === "resetInteractions" && newState.resetInteractions) {
        resetToDefaults();
      }

      return newState;
    });
  };


  const resetToDefaults = () => {
    setAnimation(defaultState.animation);
    setEasing(defaultState.easing);
    setLanguage(defaultState.language);
  };

  const translations = {
    English: {
      heading: "Cookie Settings",
      description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.",
      accept: "Accept",
      reject: "Reject",
      preferences: "Preference",
      ccpa: {
        heading: "We value your privacy",
        description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.",
        doNotShare: "Do Not Share My Personal Information"
      }
    },
    Spanish: {
      heading: "Configuración de Cookies",
      description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted.",
      accept: "Aceptar",
      reject: "Rechazar",
      preferences: "Preferencias",
      ccpa: {
        heading: "Valoramos tu Privacidad",
        description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted.",
        doNotShare: "No Compartir Mi Información Personal"
      }
    },
    French: {
      heading: "Paramètres des Cookies",
      description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous.",
      accept: "Accepter",
      reject: "Refuser",
      preferences: "Préférences",
      ccpa: {
        heading: "Nous Respectons Votre Vie Privée",
        description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous.",
        doNotShare: "Ne Pas Partager Mes Informations Personnelles"
      }
    },
    German: {
      heading: "Cookie-Einstellungen",
      description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern.",
      accept: "Akzeptieren",
      reject: "Ablehnen",
      preferences: "Einstellungen",
      ccpa: {
        heading: "Wir Respektieren Ihre Privatsphäre",
        description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern.",
        doNotShare: "Meine persönlichen Informationen nicht weitergeben"
      }
    },
    Swedish: {
      heading: "Cookie-inställningar",
      description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig.",
      accept: "Acceptera",
      reject: "Avvisa",
      preferences: "Inställningar",
      ccpa: {
        heading: "Vi Värdesätter Din Integritet",
        description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig.",
        doNotShare: "Dela Inte Min Personliga Information"
      }
    },
    Dutch: {
      heading: "Cookie-instellingen",
      description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren.",
      accept: "Accepteren",
      reject: "Weigeren",
      preferences: "Voorkeuren",
      ccpa: {
        heading: "We Waarderen Uw Privacy",
        description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren.",
        doNotShare: "Deel Mijn Persoonlijke Informatie Niet"
      }
    },
    // Add these after the Dutch translations and before the closing brace
    Italian: {
      heading: "Impostazioni Cookie",
      description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te.",
      accept: "Accetta",
      reject: "Rifiuta",
      preferences: "Preferenze",
      ccpa: {
        heading: "Rispettiamo la Tua Privacy",
        description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te.",
        doNotShare: "Non Condividere Le Mie Informazioni Personali"
      }
    },
    Portuguese: {
      heading: "Configurações de Cookies",
      description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você.",
      accept: "Aceitar",
      reject: "Rejeitar",
      preferences: "Preferências",
      ccpa: {
        heading: "Valorizamos Sua Privacidade",
        description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você.",
        doNotShare: "Não Compartilhar Minhas Informações Pessoais"
      }
    }

  };



  const [cookiePreferences, setCookiePreferences] = useState(() => {
    // Get stored preferences from localStorage or use default values
    const savedPreferences = localStorage.getItem("cookiePreferences");
    return savedPreferences
      ? JSON.parse(savedPreferences)
      : {
        marketing: true,
        preferences: true,
        analytics: true,
      };
  });

  useEffect(() => {
    // Only save cookie preferences if user is authenticated
    const userInfo = localStorage.getItem('consentbit-userinfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.sessionToken && parsed?.email) {
          localStorage.setItem("cookiePreferences", JSON.stringify(cookiePreferences));
        }
      } catch (error) {
        // Invalid auth data, don't save
      }
    }
  }, [cookiePreferences]);

  const toggleCategory = (category) => {
    setCookiePreferences((prev) => {
      const updatedPreferences = {
        ...prev,
        [category]: !prev[category],
      };

      // Save new state to localStorage
      localStorage.setItem("cookiePreferences", JSON.stringify(updatedPreferences));

      return updatedPreferences;
    });
  };



  const handleToggles = (option) => {
    setSelectedOptions((prev) => {
      const updatedOptions = prev.includes(option)
        ? prev.filter((item) => item !== option) // Remove if already selected
        : [...prev, option]; // Add if not selected

      localStorage.setItem("selectedOptions", JSON.stringify(updatedOptions)); // Save immediately
      return updatedOptions;
    });
  };

  useEffect(() => {
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
  }, [selectedOptions]);


  useEffect(() => {
    setIsActive(false);
    setTimeout(() => setIsActive(true), 50);
  }, [animation]);


     useEffect(() => {
     // Force re-render to ensure UI updates
     setTimeout(() => setIsActive(true), 50);
   }, []);


  //page fetch
  useEffect(() => {
    const fetchPages = async () => {
      try {

        const localstoragedata = localStorage.getItem("consentbit-userinfo");
        if (localstoragedata) {
          try {
            const parsed = JSON.parse(localstoragedata);

            setUserlocaldata(parsed);
          } catch (error) {
            // Error parsing localStorage
          }
        }


        const pagesAndFolders = await webflow.getAllPagesAndFolders();


        if (Array.isArray(pagesAndFolders) && pagesAndFolders.length > 0) {
          // Filter only "Page" types
          const pages = pagesAndFolders.filter(i => i.type === "Page");

          // Fetch page names asynchronously
          const pageDetails = await Promise.all(
            pages.map(async page => ({
              id: page.id,
              name: await page.getName(),
            }))
          );

          setPages(pageDetails);

        }
      } catch (error) {
        // Error fetching pages
      }
    };

    fetchPages();
  }, [webflow]);

  //banner details
  useEffect(() => {
    const fetchbannerdetails = async () => {
      const token = getSessionTokenFromLocalStorage();
      try {
        if (token) {
          const response = await customCodeApi.getBannerStyles(token);

          if (response) {

            // Set all the values with proper checks
            if (response.cookieExpiration !== undefined) setCookieExpiration(response.cookieExpiration);
            if (response.bgColor !== undefined) setBgColor(response.bgColor);
            if (response.activeTab !== undefined) setActiveTab(response.activeTab);
                         // Removed activeMode setting - no longer needed
            if (response.selectedtext !== undefined) settextSelected(response.selectedtext);
            if (response.fetchScripts !== undefined) setFetchScripts(response.fetchScripts);
            if (response.btnColor !== undefined) setBtnColor(response.btnColor);
            if (response.paraColor !== undefined) setParaColor(response.paraColor);
            if (response.secondcolor !== undefined) setSecondcolor(response.secondcolor);
            if (response.bgColors !== undefined) setBgColors(response.bgColors);
            if (response.headColor !== undefined) setHeadColor(response.headColor);
            if (response.secondbuttontext !== undefined) setsecondbuttontext(response.secondbuttontext);
            if (response.primaryButtonText !== undefined) setPrimaryButtonText(response.primaryButtonText);
            if (response.Font !== undefined) SetFont(response.Font);
            if (response.style !== undefined) setStyle(response.style);
            if (response.selected !== undefined) setSelected(response.selected);
            if (response.weight !== undefined) setWeight(response.weight);
            if (response.borderRadius !== undefined) setBorderRadius(response.borderRadius);
            if (response.buttonRadius !== undefined) setButtonRadius(response.buttonRadius);
            if (response.animation !== undefined) setAnimation(response.animation);
            if (response.easing !== undefined) setEasing(response.easing);
            if (response.language !== undefined) setLanguage(response.language);
            if (response.buttonText !== undefined) setButtonText(response.buttonText);
            if (response.isBannerAdded !== undefined) setIsBannerAdded(response.isBannerAdded);
            if (response.color !== undefined) setColor(response.color);

          } else {
            openAuthScreen();
          }
        } else {
          openAuthScreen();
        }
      } catch (error) {
        // Error fetching banner details
      }
    };

    fetchbannerdetails();
  }, []);

  //main function for adding custom code to the head
  const fetchAnalyticsBlockingsScripts = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        openAuthScreen();
        return;
      }

      const siteIdinfo = await webflow.getSiteInfo();
      setSiteInfo(siteIdinfo);

      const hostingScript = await customCodeApi.registerAnalyticsBlockingScript(token);

      if (hostingScript) {
        try {
          const scriptId = hostingScript.result.id;
          const version = hostingScript.result.version;

          const params: CodeApplication = {
            targetType: 'site',
            targetId: siteIdinfo.siteId,
            scriptId: scriptId,
            location: 'header',
            version: version
          };
          
          const applyScriptResponse = await customCodeApi.applyScript(params, token);

        }
        catch (error) {
          throw error;
        }
      }
    }
    catch (error) {
      // Component Error
    }
  }

  // const { user } = useAuth();
  const { user, exchangeAndVerifyIdToken, isAuthenticatedForCurrentSite, openAuthScreen: openAuthScreenHook } = useAuth();




  // Use the authorization function from useAuth hook (includes automatic silent auth)
  const openAuthScreen = openAuthScreenHook;

  const queryClient = useQueryClient();



  //GDPR preferences banner
  const handleCreatePreferences = async (skipCommonDiv: boolean = false) => {
    try {
      const selectedPreferences = Object.entries(cookiePreferences)
        .filter(([_, isChecked]) => isChecked)
        .map(([category]) => category);

      if (!selectedPreferences.includes("essential")) {
        selectedPreferences.push("essential");
      }

      await createCookiePreferences(
        selectedPreferences, language, color, btnColor, headColor, paraColor, secondcolor, buttonRadius, animation, toggleStates.customToggle, primaryButtonText, secondbuttontext, skipCommonDiv, toggleStates.disableScroll, toggleStates.closebutton, borderRadius , Font
      );
    } catch (error) {
      // Error creating cookie preferences
    }
  };


  //CCPA preferences banner
  const handleCreatePreferencesccpa = async () => {
    try {
      await createCookieccpaPreferences(language, color, btnColor, headColor, paraColor, secondcolor, buttonRadius, animation, primaryButtonText, secondbuttontext, toggleStates.disableScroll, toggleStates.closebutton, false, Font, borderRadius);
    } catch (error) {
      // Error creating cookie preferences
    }
  };

  //banner style
  const previewDimensions = React.useMemo(() => {
    switch (style) {
      case "bigstyle":
        return { width: "250px", minHeight: "151px" };
      case "fullwidth":
        return { width: "445px", dislay: "flex" };
      case "centeralign":
        return { width: "303px" };
      default:
        return { width: "318px" }; // Default
    }
  }, [style]);


  //ccpa banner
  const ccpabanner = async () => {
    setShowPopup(false); // close the first popup
    setShowLoadingPopup(true); // show loading popup
    setIsLoading(true);
    // const isBannerAlreadyAdded = localStorage.getItem("cookieBannerAdded") === "true";
    try {

      const allElements = await webflow.getAllElements();
      const idsToCheck = ["initial-consent-banner", "main-consent-banner", "toggle-consent-btn"];

      // Run domId checks in parallel
      const domIdPromises = allElements.map(async (el) => {
        const domId = await el.getDomId?.();
        return { el, domId };
      });

      const elementsWithDomIds = await Promise.all(domIdPromises);

      // Filter matching elements
      const matchingElements = elementsWithDomIds
        .filter(({ domId }) => domId && idsToCheck.includes(domId))
        .map(({ el, domId }) => el);


      // Remove matching elements and children
      await Promise.all(matchingElements.map(async (el) => {
        try {
          const domId = await el.getDomId?.();
          const children = await el.getChildren?.();

          if (children?.length) {
            await Promise.all(children.map(child => child.remove()));
          }

                     await el.remove();
         } catch (err) {
           webflow.notify({ type: "error", message: "Failed to remove a banner." });
         }
      }));


             const selectedElement = await webflow.getSelectedElement();
       if (!selectedElement) {
         webflow.notify({ type: "error", message: "No element selected in the Designer." });
         return;
       }

      const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        webflow.notify({ type: "error", message: "Failed to create div." });
        return;
      }

      if ((newDiv as any).setDomId) {
        await (newDiv as any).setDomId("initial-consent-banner"); // Type assertion
      }

      const styleNames = {
        divStyleName: "consentbit-ccpa-banner-div",
        paragraphStyleName: "consentbit-ccpa-banner-text",
        buttonContainerStyleName: "consentbit-ccpa-button-container",
        headingStyleName: "consentbit-ccpa-banner-heading",
        linktextstyle: "consentbit-ccpa-linkblock",
        innerDivStyleName: "consentbit-ccpa-innerdiv",
        secondBackgroundStyleName: "consentbit-banner-ccpasecond-bg",
        closebutton: `close-consentbit`,
      };


      const styles = await Promise.all(
        Object.values(styleNames).map(async (name) => {
          return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
        })
      );

      const [
        divStyle,
        paragraphStyle,
        buttonContainerStyle,
        headingStyle,
        Linktext,
        innerDivStyle,
        secondBackgroundStyle,
        closebutton
      ] = styles;


      const collection = await webflow.getDefaultVariableCollection();
      const webflowBlue = await collection?.createColorVariable("Webflow Blue", "rgba(255, 255, 255, 1)");
      const webflowBlueValue = (webflowBlue as any)?.value || "rgba(255, 255, 255, 1)";

      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select", // No attribute if "select"
      };

      const animationAttribute = animationAttributeMap[animation] || "";

      const divPropertyMap: Record<string, string> = {
        "background-color": color,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `${borderRadius}px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": Font,
      };

      if (window.innerWidth <= 768) {
        divPropertyMap["width"] = "100%";
        divPropertyMap["height"] = "40%";
      }

      divPropertyMap["bottom"] = "3%";

      switch (selected) {
        case "left":
          divPropertyMap["left"] = "3%";
          divPropertyMap["right"] = "auto";
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          break;

        case "center":
          divPropertyMap["left"] = "50%";
          delete divPropertyMap["right"];
          divPropertyMap["transform"] = "translate3d(-50%, 0, 0)";

          break;
        case "right":
        default:
          divPropertyMap["right"] = "3%";
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          divPropertyMap["left"] = "auto";
          break;
      }
      switch (style) {
        case "bigstyle":
          divPropertyMap["width"] = "370px";
          divPropertyMap["min-height"] = "284px";
          break;
        case "fullwidth":
          divPropertyMap["width"] = "100%";
          divPropertyMap["min-height"] = "167px";
          divPropertyMap["left"] = "0px";
          divPropertyMap["right"] = "0px";
          divPropertyMap["bottom"] = "0px"
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          break;
        case "centeralign":
          divPropertyMap["width"] = "566px";
          divPropertyMap["min-height"] = "167px";

          break;
        case "align":
        case "alignstyle":
        default:
          divPropertyMap["width"] = "438px";
          divPropertyMap["min-height"] = "220px";
          break;
      }
      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const paragraphPropertyMap: Record<string, string> = {
        "color": paraColor,
        "font-size": "16px",
        "font-weight": `${weight}`,
        "line-height": "1.5",
        "text-align": `${selectedtext}`,
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          paragraphPropertyMap["text-align"] = "center";
          break;
      }

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "left",
        "margin-top": "10px",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          buttonContainerPropertyMap["justify-content"] = "center";
          break;
      }

      const declineButtonPropertyMap: Record<string, string> = {
        "border-radius": "48px",
        "cursor": "pointer",
        "background-color": "rgba(241, 241, 241, 1)",
        "color": "rgba(72, 57, 153, 1)",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
      };


      const headingPropertyMap: Record<string, string> = {
        "color": headColor,
        "font-size": "20px",
        "font-weight": `${weight}`,
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          headingPropertyMap["text-align"] = "center";
          break;
      }
      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": bgColors,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `${borderRadius}px`,
        "border-top-right-radius": `${borderRadius}px`
      };

      const CloseButtonPropertyMap: Record<string, string> = {
        "color": "#000",
        "justify-content": "center",
        "align-items": "center",
        "width": "25px",
        "height": "25px",
        "display": "flex",
        "position": "absolute",
        "top": "5%",
        "left": "auto",
        "right": "2%",
        "z-index": "99",
        "cursor": "pointer",
        "font-family": "'Montserrat', sans-serif",
      };


      await divStyle.setProperties(divPropertyMap);
      await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
      await paragraphStyle.setProperties(paragraphPropertyMap);
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      await Linktext.setProperties(declineButtonPropertyMap);
      await headingStyle.setProperties(headingPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap)

      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }

             if (newDiv.setCustomAttribute) {
         await newDiv.setCustomAttribute("data-animation", animationAttribute);
         await newDiv.setCustomAttribute("data-cookie-banner", toggleStates.disableScroll ? "true" : "false");
       }

      const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      await innerdiv.setStyles([innerDivStyle]);


      try {
        let SecondDiv;
        if (style === "alignstyle") {
          SecondDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
          if (SecondDiv.setStyles) {
            await SecondDiv.setStyles([secondBackgroundStyle]);
          }
        }

        const tempHeading = await selectedElement.before(webflow.elementPresets.Heading);
        if (!tempHeading) {
          throw new Error("Failed to create heading");
        }
        if (tempHeading.setHeadingLevel) {
          await tempHeading.setHeadingLevel(2);
        }
        if (tempHeading.setStyles) {
          await tempHeading.setStyles([headingStyle]);
        }
                 if (tempHeading.setTextContent) {
           await tempHeading.setTextContent(translations[language as keyof typeof translations].ccpa.heading);
         }

        // Conditionally add close button only if toggleStates.closebutton is true
        let Closebuttons = null;
        if (toggleStates.closebutton) {
          Closebuttons = await selectedElement.before(webflow.elementPresets.Paragraph);
          if (!Closebuttons) {
            throw new Error("Failed to create paragraph");
          }

          if (Closebuttons.setStyles) {
            await Closebuttons.setStyles([closebutton]);
            await Closebuttons.setTextContent("X");
            await Closebuttons.setCustomAttribute("consentbit", "close");
          }
        }

        const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!tempParagraph) {
          throw new Error("Failed to create paragraph");
        }

        if (tempParagraph.setStyles) {
          await tempParagraph.setStyles([paragraphStyle]);
        }

                 if (tempParagraph.setTextContent) {
           await tempParagraph.setTextContent(translations[language as keyof typeof translations].ccpa.description);
         }

        const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
        if (!buttonContainer) {
          throw new Error("Failed to create button container");
        }
        await buttonContainer.setStyles([buttonContainerStyle]);

        const prefrenceButton = await selectedElement.before(webflow.elementPresets.LinkBlock);
        if (!prefrenceButton) {
          throw new Error("Failed to create decline button");
        }
        await prefrenceButton.setStyles([Linktext])
        await prefrenceButton.setTextContent(translations[language as keyof typeof translations].ccpa.doNotShare);


                 if ((prefrenceButton as any).setDomId) {
           await (prefrenceButton as any).setDomId("do-not-share-link"); // Type assertion
         }

        if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {
          await newDiv.append(innerdiv);
          if (Closebuttons) await newDiv.append(Closebuttons);
          if (SecondDiv) await innerdiv.append(SecondDiv);
          await innerdiv.append(tempHeading);
          await innerdiv.append(tempParagraph);
          await innerdiv.append(buttonContainer);

                     if (buttonContainer.append && prefrenceButton) {

             await buttonContainer.append(prefrenceButton)
           }
         }



        handleCreatePreferencesccpa()
        
        // Script registration for CCPA banners
        if (appVersion === '1.0.0') {
          fetchAnalyticsBlockingsScripts();
        } else if (appVersion === '2.0.0'|| appVersion === '2.0.1') {
          fetchAnalyticsBlockingsScriptsV2();
        }
        setTimeout(() => {
          setShowPopup(false);
          setIsBannerAdded(true);
          setShowSuccessPopup(true);
          setIsLoading(false);
        }, 40000);
        saveBannerDetails()

             } catch (error) {
         webflow.notify({ type: "error", message: "An error occurred while creating the cookie banner." });
       }
     } catch (error) {
       webflow.notify({ type: "error", message: "Unexpected error occurred." });
     }
  }




  const fetchAnalyticsBlockingsScriptsV2 = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        openAuthScreen();
        return;
      }

      const siteIdinfo = await webflow.getSiteInfo();
      setSiteInfo(siteIdinfo);

      const hostingScript = await customCodeApi.registerV2BannerCustomCode(token);

      if (hostingScript) {
        try {
          const scriptId = hostingScript.result.id;
          const version = hostingScript.result.version;

          const params: CodeApplication = {
            targetType: 'site',
            targetId: siteIdinfo.siteId,
            scriptId: scriptId,
            location: 'header',
            version: version
          };
          
          const applyScriptResponse = await customCodeApi.applyV2Script(params, token);

        }
        catch (error) {
          throw error;
        }
      }
    }
    catch (error) {
      // Component error handling
    }
  }


  //gdpr banner
  const gdpr = async (skipCommonDiv: boolean = false) => {
    setShowPopup(false);
    setShowLoadingPopup(true);
    setIsLoading(true);
    // const isBannerAlreadyAdded = localStorage.getItem("cookieBannerAdded") === "true";
    try {

      const allElements = await webflow.getAllElements();
      const idsToCheck = ["consent-banner", "main-banner", "toggle-consent-btn"];


      // Run domId checks in parallel
      const domIdPromises = allElements.map(async (el) => {
        const domId = await el.getDomId?.();
        return { el, domId };
      });

      const elementsWithDomIds = await Promise.all(domIdPromises);

      // Filter matching elements
      const matchingElements = elementsWithDomIds
        .filter(({ domId }) => domId && idsToCheck.includes(domId))
        .map(({ el, domId }) => el);


      // Remove matching elements and children
      await Promise.all(matchingElements.map(async (el) => {
        try {
          const domId = await el.getDomId?.();
          const children = await el.getChildren?.();

          if (children?.length) {
            await Promise.all(children.map(child => child.remove()));
          }

          await el.remove();
        } catch (err) {
          webflow.notify({ type: "error", message: "Failed to remove a banner." });
        }
      }));

      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        webflow.notify({ type: "error", message: "No element selected in the Designer." });
        setIsLoading(false); // Reset loading state
        return;
      }


      const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);

      if (!newDiv) {
        webflow.notify({ type: "error", message: "Failed to create div." });
        return;
      }


             if ((newDiv as any).setDomId) {
         await (newDiv as any).setDomId("consent-banner"); // Type assertion
       }


      const styleNames = {
        divStyleName: "consentbit-gdpr_banner_div",
        paragraphStyleName: "consentbit-gdpr_banner_text",
        buttonContainerStyleName: "consentbit-banner_button_container",
        prefrenceButtonStyleName: "consentbit-banner_button_preference",
        declineButtonStyleName: "consentbit-banner_button_decline",
        buttonStyleName: "consentbit-banner_accept",
        headingStyleName: "consentbit-banner_headings",
        innerDivStyleName: "consentbit-innerdiv",
        secondBackgroundStyleName: "consentbit-banner_second-bg",
        closebutton: 'close-consent'
      };

      const styles = await Promise.all(
        Object.values(styleNames).map(async (name) => {
          return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
        })
      );

      const [
        divStyle, paragraphStyle, buttonContainerStyle, prefrenceButtonStyle, declineButtonStyle, buttonStyle, headingStyle, innerDivStyle, secondBackgroundStyle, closebutton
      ] = styles;


      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select", // No attribute if "select"
      };

      const animationAttribute = animationAttributeMap[animation] || "";

      const divPropertyMap: Record<string, string> = {
        "background-color": color,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `${borderRadius}px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": Font,

      };

      if (window.innerWidth <= 768) {
        divPropertyMap["width"] = "100%";
        divPropertyMap["height"] = "40%";
      }
      divPropertyMap["bottom"] = "3%";

      switch (selected) {
        case "left":
          divPropertyMap["left"] = "3%";
          divPropertyMap["right"] = "auto";
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          break;

        case "center":
          divPropertyMap["left"] = "50%";
          delete divPropertyMap["right"];
          divPropertyMap["transform"] = "translate3d(-50%, 0, 0)";

          break;
        case "right":
        default:
          divPropertyMap["right"] = "3%";
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          divPropertyMap["left"] = "auto";
          break;
      }
      switch (style) {
        case "bigstyle":
          divPropertyMap["width"] = "370px";
          divPropertyMap["min-height"] = "284px";
          break;
        case "fullwidth":
          divPropertyMap["width"] = "100%";
          divPropertyMap["min-height"] = "167px";
          divPropertyMap["left"] = "0px";
          divPropertyMap["right"] = "0px";
          divPropertyMap["bottom"] = "0px"
          divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
          break;
        case "centeralign":
          divPropertyMap["width"] = "566px";
          divPropertyMap["min-height"] = "167px";

          break;
        case "align":
        case "alignstyle":
        default:
          divPropertyMap["width"] = "438px";
          divPropertyMap["min-height"] = "220px";
          break;
      }

      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const paragraphPropertyMap: Record<string, string> = {
        "color": paraColor,
        "font-size": "16px",
        "font-weight": `${weight}`,
        "line-height": "1.5",
        "text-align": `${selectedtext}`,
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          paragraphPropertyMap["text-align"] = "center";
          break;
      }

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "right",
        "margin-top": "10px",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          buttonContainerPropertyMap["justify-content"] = "center";
          break;
      }

      const buttonPropertyMap: Record<string, string> = {
        "border-radius": `${buttonRadius}px`,
        "cursor": "pointer",
        "background-color": secondcolor,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "color": primaryButtonText,
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };

      const responsivebuttonPropertyMap: Record<string, string> = {
        "margin-bottom": "10px",
        "flex-direction": "column",
        "justify-content": "center",
        "text-align": "center",
        "display": "flex",
        "row-gap": "12px"

      };
      const responsivebuttonOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const declineButtonPropertyMap: Record<string, string> = {
        "border-radius": `${buttonRadius}px`,
        "cursor": "pointer",
        "background-color": btnColor,
        "color": secondbuttontext,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": bgColors,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `${borderRadius}px`,
        "border-top-right-radius": `${borderRadius}px`
      };


      const headingPropertyMap: Record<string, string> = {
        "color": headColor,
        "font-size": "20px",
        "font-weight": `${weight}`,
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      switch (style) {
        case "centeralign":
          headingPropertyMap["text-align"] = "center";
          break;
      }

      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      const CloseButtonPropertyMap: Record<string, string> = {
        "color": "#000",
        "justify-content": "center",
        "align-items": "center",
        "width": "25px",
        "height": "25px",
        "display": "flex",
        "position": "absolute",
        "top": "5%;",
        "left": "auto",
        "right": "2%",
        "z-index": "99",
        "cursor": "pointer",
        "font-family": "'Montserrat', sans-serif",
      };


      await divStyle.setProperties(divPropertyMap);
      await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
      await paragraphStyle.setProperties(paragraphPropertyMap);
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      await buttonContainerStyle.setProperties(responsivebuttonPropertyMap, responsivebuttonOptions);
      await buttonStyle.setProperties(buttonPropertyMap);
      await declineButtonStyle.setProperties(declineButtonPropertyMap);
      await prefrenceButtonStyle.setProperties(declineButtonPropertyMap);
      await headingStyle.setProperties(headingPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap)


      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }
      if (newDiv.setCustomAttribute) {
        await newDiv.setCustomAttribute("data-animation", animationAttribute);
        await newDiv.setCustomAttribute("data-cookie-banner", toggleStates.disableScroll ? "true" : "false");
      }
      try {
        let SecondDiv;
        if (style === "alignstyle") {
          SecondDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
          if (SecondDiv.setStyles) {
            await SecondDiv.setStyles([secondBackgroundStyle]);
          }
        }
        const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);
        await innerdiv.setStyles([innerDivStyle]);

        const tempHeading = await selectedElement.before(webflow.elementPresets.Heading);
        if (!tempHeading) {
          throw new Error("Failed to create heading");
        }
        if (tempHeading.setHeadingLevel) {
          await tempHeading.setHeadingLevel(2);
        }
        if (tempHeading.setStyles) {
          await tempHeading.setStyles([headingStyle]);
        }
                 if (tempHeading.setTextContent) {
           await tempHeading.setTextContent(translations[language as keyof typeof translations].heading);
         }

        // Conditionally add close button only if toggleStates.closebutton is true
        let Closebuttons = null;
        if (toggleStates.closebutton) {
          Closebuttons = await selectedElement.before(webflow.elementPresets.Paragraph);
          if (!Closebuttons) {
            throw new Error("Failed to create paragraph");
          }

          if (Closebuttons.setStyles) {
            await Closebuttons.setStyles([closebutton]);
            await Closebuttons.setTextContent("X");
            await Closebuttons.setCustomAttribute("consentbit", "close");
          }
        }

        const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!tempParagraph) {
          throw new Error("Failed to create paragraph");
        }
        if (tempParagraph.setStyles) {
          await tempParagraph.setStyles([paragraphStyle]);

        }

                 if (tempParagraph.setTextContent) {
           await tempParagraph.setTextContent(translations[language as keyof typeof translations].description);
         }

        const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
        if (!buttonContainer) {
          throw new Error("Failed to create button container");
        }
        await buttonContainer.setStyles([buttonContainerStyle]);

        const prefrenceButton = await selectedElement.before(webflow.elementPresets.Button);
        if (!prefrenceButton) {
          throw new Error("Failed to create decline button");
        }
        await prefrenceButton.setStyles([prefrenceButtonStyle]);
        await prefrenceButton.setTextContent(translations[language as keyof typeof translations].preferences);


                 if ((prefrenceButton as any).setDomId) {
           await (prefrenceButton as any).setDomId("preferences-btn"); // Type assertion
         }

        const acceptButton = await selectedElement.before(webflow.elementPresets.Button);
        if (!acceptButton) {
          throw new Error("Failed to create accept button");
        }
        await acceptButton.setStyles([buttonStyle]);
        await acceptButton.setTextContent(translations[language as keyof typeof translations].accept);


                 if ((acceptButton as any).setDomId) {
           await (acceptButton as any).setDomId("accept-btn"); // Type assertion
         }

        const declineButton = await selectedElement.before(webflow.elementPresets.Button);
        if (!declineButton) {
          throw new Error("Failed to create decline button");
        }
        await declineButton.setStyles([declineButtonStyle]);
        await declineButton.setTextContent(translations[language as keyof typeof translations].reject);


                 if ((declineButton as any).setDomId) {
           await (declineButton as any).setDomId("decline-btn"); // Type assertion
         }



        if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {
          // Append elements inside innerDiv
          await newDiv.append(innerdiv);
          if (Closebuttons) await newDiv.append(Closebuttons);
          if (SecondDiv) await innerdiv.append(SecondDiv);
          await innerdiv.append(tempHeading);
          await innerdiv.append(tempParagraph);
          await innerdiv.append(buttonContainer);

                     if (buttonContainer.append && prefrenceButton && declineButton && acceptButton) {
             await buttonContainer.append(prefrenceButton)
             await buttonContainer.append(declineButton);
             await buttonContainer.append(acceptButton);
           }
         }


        handleCreatePreferences(skipCommonDiv);
        
        // Script registration for GDPR banners
        if (appVersion === '1.0.0') {
          fetchAnalyticsBlockingsScripts();
        } else if (appVersion === '2.0.0'|| appVersion === '2.0.1') {
          fetchAnalyticsBlockingsScriptsV2();
        }
        setTimeout(() => {
          setShowPopup(false);
          setIsBannerAdded(true);
          // setShowSuccessPopup(true);
          setIsLoading(false);
        }, 45000);

        saveBannerDetails()

             } catch (error) {

         webflow.notify({ type: "error", message: "An error occurred while creating the cookie banner." });

       }
     } catch (error) {
       webflow.notify({ type: "error", message: "Unexpected error occurred." });
       setIsLoading(false);
     }
  }



  //both banners
  const handleBothBanners = async () => {
    await gdpr(true);
    await ccpabanner();
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCookieExpiration(e.target.value);
  };

  //banner details
  const saveBannerDetails = async () => {
    try {
      const userinfo = localStorage.getItem("consentbit-userinfo");
      if (!userinfo) {
        return;
      }
      const tokenss = JSON.parse(userinfo);
      const tokewern = tokenss.sessionToken;
      const siteIdinfo = await webflow.getSiteInfo();
      setSiteInfo(siteIdinfo);
      if (!tokewern) {
        return;
      }
             const bannerData = {
         cookieExpiration: cookieExpiration,
         bgColor: bgColor,
         activeTab: activeTab,
         activeMode: "Advanced", // Add back to satisfy type requirement
         selectedtext: selectedtext,
        fetchScripts: fetchScripts,
        btnColor: btnColor,
        paraColor: paraColor,
        secondcolor: secondcolor,
        bgColors: bgColors,
        headColor: headColor,
        secondbuttontext: secondbuttontext,
        primaryButtonText: primaryButtonText,
        Font: Font,
        style: style,
        selected: selected,
        weight: weight,
        borderRadius: borderRadius,
        buttonRadius: buttonRadius,
        animation: animation,
        easing: easing,
        language: language,
        buttonText: buttonText,
        isBannerAdded: isBannerAdded,
        color: color

      }
      const response = await customCodeApi.saveBannerStyles(tokewern, bannerData);
      if (response.ok) {
      }
    }
    catch (error) {
      throw error; // or handle it differently based on your needs
    }
  }


  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        setIsExporting(false);
        openAuthScreen();
        return;
      }
      const { csvData, response } = await customCodeApi.exportCSV(token);

      // Enhanced validation: Check if we actually have consent data
      const lines = csvData.trim().split('\n');
      const hasHeader = lines.length > 0 && lines[0].includes('#');
      const hasDataRows = lines.length > 1;
      const isEmptyDataMessage = csvData.includes('No consent data found') ||
        csvData.includes('empty') ||
        csvData.includes('No user consent data');

      // More comprehensive check for no data
      if (!hasDataRows || lines.length <= 1 || isEmptyDataMessage ||
        (hasHeader && lines.length === 2 && lines[1].trim().startsWith('#'))) {
        alert('No user consent data found for export. CSV file will not be generated.');
        setIsExporting(false);
        return; // Exit without generating CSV
      }

      // Additional check: ensure we have actual data rows (not just headers)
      const dataRowsCount = lines.filter(line =>
        line.trim() &&
        !line.startsWith('#') &&
        !line.includes('Visitor ID') // Skip header row
      ).length;

      if (dataRowsCount === 0) {
        alert('No user consent data found for export. CSV file will not be generated.');
        setIsExporting(false);
        return; // Exit without generating CSV
      }

      // Create blob and download only if we have valid data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

      // Get filename from response headers
      let filename = 'consent_report.csv';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      alert(`Failed to export CSV report: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Add this function near handleExportCSV
  const handleExportCSVAdvanced = async () => {

    setIsExporting(true);
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        setIsExporting(false);
        openAuthScreen();
        return;
      }
      const { csvData, response } = await customCodeApi.exportCSVAdvanced(token);

      // Enhanced validation: Check if we actually have consent data
      const lines = csvData.trim().split('\n');
      const hasHeader = lines.length > 0 && lines[0].includes('#');
      const hasDataRows = lines.length > 1;
      const isEmptyDataMessage = csvData.includes('No consent data found') ||
        csvData.includes('empty') ||
        csvData.includes('No user consent data');

      // More comprehensive check for no data
      if (!hasDataRows || lines.length <= 1 || isEmptyDataMessage ||
        (hasHeader && lines.length === 2 && lines[1].trim().startsWith('#'))) {
        alert('No user consent data found for export. CSV file will not be generated.');
        setIsExporting(false);
        return; // Exit without generating CSV
      }

      // Additional check: ensure we have actual data rows (not just headers)
      const dataRowsCount = lines.filter(line =>
        line.trim() &&
        !line.startsWith('#') &&
        !line.includes('Visitor ID') // Skip header row
      ).length;

      if (dataRowsCount === 0) {
        alert('No user consent data found for export. CSV file will not be generated.');
        setIsExporting(false);
        return; // Exit without generating CSV
      }



      // Create blob and download only if we have valid data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

      // Get filename from response headers
      let filename = 'consent_report.csv';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }



      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);



    } catch (error) {
      alert(`Failed to export CSV report: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }


  };

  async function checkSubscription(accessToken: string) {
    try {
      const response = await fetch('https://cb-server.web-8fb.workers.dev/api/payment/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to check subscription');
      }

      return data;
         } catch (error) {
       throw error;
     }
  }


  useEffect(() => {
    const accessToken = getSessionTokenFromLocalStorage();
    const fetchSubscription = async () => {
      try {
        if (!accessToken) {
          openAuthScreen();
          return;
        }
        const result = await checkSubscription(accessToken);

        // Check if any domain has isSubscribed === true
        const hasSubscription = result.subscriptionStatuses?.some(
          (status: { isSubscribed: boolean }) => status.isSubscribed === true
        );

                 setIsSubscribed(Boolean(hasSubscription));
       } catch (error) {
         // Error handling
       }
    };

    fetchSubscription();
  }, []);

  // Removed early return to prevent hooks order issues
  const checkAndRegisterV2ConsentScript = async () => {
    if (appVersion !== "2.0.0" && appVersion !== "2.0.1") return;

    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        openAuthScreen();
        return;
      }

      // Ensure siteInfo is available
      let currentSiteInfo = siteInfo;
      if (!currentSiteInfo) {
        currentSiteInfo = await webflow.getSiteInfo();
        setSiteInfo(currentSiteInfo);
      }
             if (!currentSiteInfo?.siteId) {
         return;
       }



      const v2Response = await customCodeApi.registerV2CustomCode(token);
      if (!v2Response || !v2Response.result) {

        return;
      }
      if (v2Response) {

        try {

          const scriptId = v2Response.result.id;
          const version = v2Response.result.version;

          const params: CodeApplication = {
            targetType: 'site',
            targetId: currentSiteInfo.siteId,
            scriptId: scriptId,
            location: 'header',
            version: version
          };
          const applyScriptResponse = await customCodeApi.applyV2Script(params, token);

                 }
         catch (error) {
           // Error handling
         }
       }
     }

     catch (error) {
       // Error handling
     }
  }

  useEffect(() => {

         // Check if the script has already been registered in this browser
     checkAndRegisterV2ConsentScript();
  }, []);


  // Welcome screen logic removed - this component is accessed via Customize link
  // No need to show welcome screen when coming from ConfirmPublish

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);


  const dropdownRefs = {
    language: useRef<HTMLDivElement>(null),
    animation: useRef<HTMLDivElement>(null),
    easing: useRef<HTMLDivElement>(null),
  };

  const animationOptions = [
    { label: "Fade", value: "fade" },
    { label: "Slide Up", value: "slide-up" },
    { label: "Slide Down", value: "slide-down" },
    { label: "Slide Left", value: "slide-left" },
    { label: "Slide Right", value: "slide-right" },
  ];

  const easingOptions = [
    { label: "Ease", value: "ease" },
    { label: "Linear", value: "linear" },
    { label: "Ease-In", value: "ease-in" },
    { label: "Ease-Out", value: "ease-out" },
    { label: "Ease-In-Out", value: "ease-in-out" },
  ];

  const languageOptions = [
    "English",
    "Dutch",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Spanish",
    "Swedish",
  ];

  const tooltips = {
    language: "Indicates the language preference for the cookie banner.",
    animation: "Shows different types of animations to apply to the banner.",
    easing: "Controls the smoothness of the animation.",
  };

  const getLabel = (opts: any[], val: string) =>
    (opts.find((o) => o.value === val) || {}).label || val;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          if (openDropdown === key) setOpenDropdown(null);
        }
      });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const renderDropdown = (
    type: "language" | "animation" | "easing",
    label: string,
    value: string,
    options: any[],
    onPick: (val: string) => void
  ) => (
    <div className="settings-group">
      <div className="flex">
        <label>{label}</label>
        <div className="tooltip-container">
          <img src={questionmark} alt="info" className="tooltip-icon" />
          <span className="tooltip-text">{tooltips[type]}</span>
        </div>
      </div>

<div
  className={`custom-select ${openDropdown === type ? "open" : ""}`}
  ref={dropdownRefs[type]}
>
  <div
    className="selected"
    onClick={() =>
      setOpenDropdown(openDropdown === type ? null : type)
    }
  >
    <span>
      {typeof options[0] === "string"
        ? value
        : getLabel(options, value)}
    </span>
    <svg
      className="dropdown-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>

  {openDropdown === type && (
    <ul className="options">
      {typeof options[0] === "string"
        ? options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onPick(opt);
                setOpenDropdown(null);
              }}
            >
              {opt}
            </li>
          ))
        : options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onPick(opt.value);
                setOpenDropdown(null);
              }}
            >
              {opt.label}
            </li>
          ))}
    </ul>
  )}
</div>

    </div>
  );

  return (
    <div className="app">
      {/* CSV Export Loading Overlay */}
      {(isExporting || isCSVButtonLoading) && (
        <div className="pulse-overlays">
          <div className="popup-loading-content">
            <PulseAnimation />
            <p className="popup-message">Exporting CSV data...</p>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="navbar">
        <div>
          {(() => {
            // Show loading during auth check period
            if (isCheckingAuth) {
              return (
                <button className="publish-buttons" disabled>
                  Loading...
                </button>
              );
            }

            // Check if user is authenticated and has session token for current site
            const hasValidAuth = (isAuthenticated && user?.firstName) || 
              (sessionTokenFromLocalStorage && siteInfo && tokenss?.siteId === siteInfo.siteId);
            
            return hasValidAuth ? (
              <p className="hello">Hello{user?.firstName ? `, ${user.firstName}` : ''}!</p>
            ) : (
              <button className="publish-buttons" onClick={openAuthScreen}>
                Authorize
              </button>
            );
          })()}
        </div>

        <NeedHelp />
      </div>

                                         {/* Tab Navigation Section */}
         <div className="configuration">
           <div className="tabs">
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Settings" ? "active" : ""}`}
                 onClick={() => setActiveTab("Settings")}
               >
                 Settings
               </button>
             </div>
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Customization" ? "active" : ""}`}
                 onClick={() => setActiveTab("Customization")}
               >
                 Customization
               </button>
             </div>
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Script" ? "active" : ""}`}
                 onClick={() => setActiveTab("Script")}
               >
                 Script
               </button>
             </div>
           </div>
        <div className="component-width">
          {!isSubscribed ? (
            <div className="subscribe">
              <a className="link" href="#" onClick={(e) => {
                e.preventDefault();
                setShowChoosePlan(true);
              }}>
                You need a subscription to publish the production <i><img src={uparrow} alt="" /></i>
              </a>
            </div>) : <div className="subscribe">You have already subscribed, <a className="link" href="https://billing.stripe.com/p/login/00gbIJclf5nz4Hm8ww" target="_blank">Cancel Subscription <img src={uparrow} alt="" /> </a></div>}
          {activeTab !== "Script" && (
            <div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  className="publish-button"
                  onClick={async () => {
                    const isUserValid = await isAuthenticatedForCurrentSite();
                    try {
                      const selectedElement = await webflow.getSelectedElement() as { type?: string };

                      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

                      if (isUserValid && !isInvalidElement) {
                        setShowTooltip(false);
                        setShowPopup(true);
                      } else {
                        setShowPopup(false);
                        if (!isUserValid) {
                          setShowTooltip(false);
                          setShowAuthPopup(true);
                        } else if (isInvalidElement) {
                          setShowTooltip(true);
                        }
                      }
                                         } catch (error) {
                       setShowTooltip(false);
                     }
                  }}
                >
                  {isBannerAdded ? "Publish your changes" : "Create Component"}
                </button>

              </div>
            </div>

          )}

          {activeTab === "Script" && (
            <div>
              <button
                className="publish-buttons"
                onClick={async () => {
                  const isUserValid = await isAuthenticatedForCurrentSite();
                  if (isUserValid) {
                    setFetchScripts(true);
                    setButtonText("Rescan Project");
                  } else {
                    setShowAuthPopup(true);
                  }
                }}
              >
                {buttonText}
              </button>
            </div>
          )}
        </div>
      </div>

      {showAuthPopup && (
        <div className="popup-overlay">
          <div className="success-popup">
            <div className="popup-content">
              <h3>Authentication Required</h3>
              <button onClick={() => setShowAuthPopup(false)}>Close</button>
            </div>
          </div>

          {/* <PulseAnimation /> */}
        </div>
      )}

      {showTooltip && (
        <div className={`global-error-banner ${fadeOut ? 'fade-out' : 'fade-in'}`}>
          <img src={errorsheild} alt="errorsheild" />
          <div className="global-error-content">
            <text>To continue, choose an element inside the page Body.</text>
          </div>
          <img src={crossmark} onClick={() => { setShowTooltip(false); setFadeOut(false); }} alt="" />
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay1">
          <div className="popup-box">
            {/* <div>Are you sure you want to add a cookie banner to your website?</div> */}
            <div className="flex down">
              {isBannerAdded ? (
                <>
                  <span className="spanbox">Before proceeding, make sure you're not selecting the Consentbit element in the Webflow Designer.</span>
                  <span className="spanbox">Hang tight! We're updating your banner with the latest changes.</span>
                  <span className="spanbox">Applying your updates to the project now!</span>
                </>
              ) : (
                <>
                  {/* <span className="spanbox">Before proceeding, make sure you're not selecting the Consentbit element in the Webflow Designer.</span> */}
                  <span className="spanbox">We are installing the script in your site custom code.</span>
                  <span className="spanbox">We are adding a banner on your project.</span>
                </>
              )}
            </div>

            <div className="gap">

              {selectedOptions.includes("GDPR") && selectedOptions.includes("U.S. State Laws") ?
                (<button
                  className="confirm-button"
                  onClick={handleBothBanners}
                >
                  Confirm
                </button>) : selectedOptions.includes("GDPR") ?
                  (<button
                    className={`confirm-button ${isLoading ? "loading" : ""}`}
                    onClick={() => gdpr()}
                  >
                    {isLoading ? (
                      <span>wait...</span>
                    ) : (
                      "Confirm"
                    )}
                  </button>) : selectedOptions.includes("U.S. State Laws") ?
                    (<button
                      className="confirm-button"
                      onClick={ccpabanner}
                    >
                      Confirm
                    </button>) : <div className="confirm-button1"> Nothing Selected</div>
              }

              <button className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLoadingPopup && isLoading && (
        <div className="popup">
          <div className="popup-loading-content">
            <PulseAnimation />
            <p className="popup-message">
              Almost there… your cookie banner is in the oven. Nothing's breaking, just baking!
            </p>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="success-popup">
            <p>To make the banner live, click the 'Publish' button in the top-right corner of the Webflow interface and publish your site.</p>
            <button onClick={() => setShowSuccessPopup(false)}>Close</button>
          </div>
        </div>
      )}
             


      {/* Main Container */}
      <div className="container">
        {/* Settings Panel */}
        <div className="settings-panel">
                     {activeTab === "Settings" && (
            <div className="general">
              <div className="width-cust">
                <div className="settings-group">
                  <div className="flex">
                    <label htmlFor="expires">Expires</label>
                    <div className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text1">The Amount of days to remember user's consent preferences.</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    id="expires"
                    placeholder="120"
                    value={cookieExpiration}
                    onChange={handleExpirationChange}
                  />
                </div>

                {/* <div className="settings-group">
                  <div className="flex">
                    <label htmlFor="animation">Animation</label>
                    <div className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text">Shows different types of animations to apply to the banner.</span>
                    </div>
                  </div>
                  <select
                    id="animation"
                    value={animation}
                    onChange={(e) => setAnimation(e.target.value)}
                  >
                    <option value="fade">Fade</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                  </select>
                </div>

                <div className="settings-group">
                  <div className="flex">
                    <label htmlFor="easing">Easing</label>
                    <div className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text">Controls the smoothness  of the animation.</span>
                    </div>
                  </div>
                  <select
                    id="easing"
                    value={easing}
                    onChange={(e) => setEasing(e.target.value.toLowerCase())}
                  >

                    <option value="ease">Ease</option>
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease-In</option>
                    <option value="ease-out">Ease-Out</option>
                    <option value="ease-in-out">Ease-In-Out</option>
                  </select>
                </div>

                <div className="settings-group">
                  <div className="flex">
                    <label htmlFor="language">Languages</label>
                    <div className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text">Indicates the language preference for the cookie
                        banner.</span>
                    </div>
                  </div>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Dutch</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Italian</option>
                    <option>Portuguese</option>
                    <option>Spanish</option>
                    <option>Swedish</option>
                  </select>
                </div> */}

                {renderDropdown("animation", "Animation", animation, animationOptions, setAnimation)}
                {renderDropdown("easing", "Easing", easing, easingOptions, setEasing)}                
                {renderDropdown("language", "Languages", language, languageOptions, setLanguage)}

                <div className="compliance-container">
                  <label className="compliance">
                    <span className="compliance">Compliance</span>
                    <span className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text">Specifies the type of cookie compliance standard, like GDPR or CCPA.</span>
                    </span>
                  </label>

                  <div className="checkbox-group">
                    {["U.S. State Laws", "GDPR"].map((option) => { //U.S. State Laws
                                             const isChecked = selectedOptions.includes(option);
                       return (
                        <label key={option} className="custom-checkboxs">
                          <input
                            type="checkbox"
                            value={option}
                            checked={isChecked}
                            onChange={() => handleToggles(option)}
                          />
                          <span className="checkbox-box"></span>
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>

                                 {/* Cookie Settings */}
                 <div className={`cookie-settings ${selectedOptions.includes("GDPR") ? "active" : ""}`}>
                  <h3 className="cookie-title">Categories</h3>

                  {/* Essentials - Always active */}
                  <div className="cookie-category">
                    <img src={checkedcatogry} alt="checkedcatogry" />
                    <span className="category-name">Essentials</span>
                    <span className="category-status">Always active</span>
                  </div>

                  {/* Dynamically render other categories */}
                  {Object.keys(cookiePreferences).map((category) => {
                    const isChecked = cookiePreferences[category];

                    return (
                      <label key={category} className="cookie-category">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(category)}
                        />
                        <span className="custom-checkbox"> {isChecked && <img src={tickmark} alt="checked" className="tick-icon" />}</span>
                        <span className="category-name">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <img
                          src={isChecked ? eye : openeye}
                          alt={isChecked ? "Enabled" : "Disabled"}
                          className="category-icon"
                        />
                      </label>
                    );
                  })}
                </div>


                                 <div className="export-csv">
                    <div className="flex">
                      {/* Export CSV Buttons - Only show one based on version */}
                      {(appVersion === '1.0.0' || (appVersion !== '2.0.0' && appVersion !== '2.0.1')) && (
                        <button
                          className="exportbutton"
                          onClick={handleExportCSV}
                          disabled={isExporting}
                        >
                          {isExporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                      )}
                                             {appVersion === '2.0.0'||appVersion ==='2.0.1'&& (
                         <button
                           className="exportbutton"
                           onClick={() => {
                             if (!sessionTokenFromLocalStorage) {
                               setShowAuthPopup(true);
                               return;
                             }
                             setShowCSVExportAdvanced(true);
                           }}
                           style={{ marginLeft: '10px' }}
                           disabled={isCSVButtonLoading}
                         >
                           {isCSVButtonLoading ? 'Loading...' : 'Export CSV'}
                         </button>
                       )}

                      <div className="tooltip-containers">
                        <img src={questionmark} alt="info" className="tooltip-icon" />
                        <span className="tooltip-text">Download consents in CSV format for easy analysis and sharing.</span>
                      </div>
                    </div>
                                     </div>


                                 {/* Use Custom Toggle Button */}
                 <div className="togglediv">
                    <label className="toggle-container">
                      <div className="flex">
                        <span className="toggle-label">Use Custom Toggle Button</span>

                        <div className="tooltip-containers">
                          <img src={questionmark} alt="info" className="tooltip-icon" />
                          <span className="tooltip-text"> Enables a toggle switch. Off = standard checkbox.</span>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        className="toggle-checkbox"
                        checked={toggleStates.customToggle}
                        onChange={() => handleToggle("customToggle")}
                      />

                      <div className={`toggle ${toggleStates.customToggle ? "toggled" : ""}`}></div>
                    </label>
                  </div>

                {/* Reset Interactions - Available in BOTH Simple & Advanced Modes */}
                <div className="togglediv">
                  <label className="toggle-container">
                    <div className="flex">
                      <span className="toggle-label">Reset Interactions</span>

                      <div className="tooltip-containers">
                        <img src={questionmark} alt="info" className="tooltip-icons" />
                        <span className="tooltip-text">this will reset the interactions that you have added.</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      className="toggle-checkbox"
                      checked={toggleStates.resetInteractions}
                      onChange={() => handleToggle("resetInteractions")}
                    />
                    <div className={`toggle ${toggleStates.resetInteractions ? "toggled" : ""}`}></div>
                  </label>
                </div>

                {/* Disable Scroll */}
                <div className="togglediv">
                  <label className="toggle-container">
                    <div className="flex">
                      <span className="toggle-label">Disable Scroll</span>

                      <div className="tooltip-containers">
                        <img src={questionmark} alt="info" className="tooltip-icon" />
                        <span className="tooltip-text">This option disables the scroll of the page when banner is shown.</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      className="toggle-checkbox"
                      checked={toggleStates.disableScroll}
                      onChange={() => {
                        handleToggle("disableScroll");

                      }}
                    />

                    <div className={`toggle ${toggleStates.disableScroll ? "toggled" : ""}`}></div>
                  </label>
                </div>

                                 {/* Close Button */}
                 <div className="togglediv">
                   <label className="toggle-container">
                     <div className="flex">
                       <span className="toggle-label">Enable Close Button</span>

                       <div className="tooltip-containers">
                         <img src={questionmark} alt="info" className="tooltip-icon" />
                         <span className="tooltip-text">This option Enable the option to close the Banner</span>
                       </div>
                     </div>

                     <input
                       type="checkbox"
                       className="toggle-checkbox"
                       checked={toggleStates.closebutton}
                       onChange={() => {
                         handleToggle("closebutton");

                       }}
                     />
                     <div className={`toggle ${toggleStates.closebutton ? "toggled" : ""}`}></div>
                   </label>
                 </div>

                                 {/* Do Not share Link */}

                 {selectedOptions.includes("U.S. State Laws") ?
                   <div className="togglediv">
                     <label className="toggle-container">
                       <div className="flex">
                         <span className="toggle-label">Do Not Share Link</span>

                         <div className="tooltip-containers">
                           <img src={questionmark} alt="info" className="tooltip-icons" />
                           <span className="tooltip-text">
                             Show/hide the 'Do not share my personal information' link content.
                           </span>
                         </div>
                       </div>

                       <button
                         className="toggle-replace-button"
                         onClick={() => handleToggle("donotshare")}
                       >
                         Open Guide
                         <img src={rightarrow} alt="icon" className="button-icon" />

                       </button>
                     </label>
                   </div>
                   : null}
              </div>



              <div className="settings-group-preview">
                <h3>Preview</h3>
                <div className="preview-area">
                  <div className="topbar">
                    <img src={dots} alt="dots" className="threedots" />
                  </div>
                  <div className="consentbit-logo">
                    <img src={logo} alt="dots" />
                  </div>
                  <div
                    className={`cookie-banner ${animation} ${isActive ? "active" : ""}`}
                    style={{
                      transition: `transform 0.5s ${easing}, opacity 0.5s ${easing}`,
                      position: "absolute",
                      ...(style !== "fullwidth" && {
                        bottom: "16px",
                        left: selected === "left" ? "16px" : selected === "center" ? "17%" : "auto",
                        right: selected === "right" ? "16px" : "auto",
                        // transform: selected === "center" ? "translateX(-50%)" : "none",
                      }),
                      // transform: selected === "center" ? "translateX(-50%)" : "none",
                      fontFamily: Font,
                      textAlign: selectedtext as "left" | "center" | "right",
                      alignItems: style === "centeralign" ? "center" : undefined,
                      fontWeight: weight,
                      width: previewDimensions.width,
                      height: previewDimensions.minHeight,
                      borderRadius: `${borderRadius}px`,
                      backgroundColor: color,
                      fontSize: `${size}px`,
                    }}
                  >

                    {style === "alignstyle" && <div className="secondclass" style={{ backgroundColor: bgColors, borderBottomRightRadius: `${borderRadius}px`, borderTopRightRadius: `${borderRadius}px` }}></div>}
                    <div className="space" style={{ color: headColor, fontWeight: weight, display: "flex", justifyContent: "space-between" }}>
                      <h4 style={{ textAlign: selectedtext as "left" | "center" | "right", fontFamily: Font }}>

                        {translations[language as keyof typeof translations]?.heading || "Cookie Settings"}
                      </h4>
                      {toggleStates.closebutton ? <p className="closebutton">X</p> : ""}
                    </div>
                    <div className="padding" style={{ color: paraColor }}>
                      <span>

                        {translations[language as keyof typeof translations]?.description || "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you."}
                      </span>
                    </div>
                    <div className="button-wrapp" style={{ justifyContent: style === "centeralign" ? "center" : undefined, }}>
                      <button className="btn-preferences" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: btnColor, color: secondbuttontext, fontFamily: Font }} >{translations[language as keyof typeof translations]?.preferences || "Preferences"}</button>
                      <button className="btn-reject" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: btnColor, color: secondbuttontext, fontFamily: Font }} >{translations[language as keyof typeof translations]?.reject || "Reject"}</button>
                      <button className="btn-accept" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: secondcolor, color: primaryButtonText, fontFamily: Font }} >{translations[language as keyof typeof translations]?.accept || "Accept"}</button>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Customization" && (
            <Customization
              animation={animation}
              setAnimation={setAnimation}
              easing={easing}
              setEasing={setEasing}
              language={language}
              setLanguage={setLanguage}
              weight={weight}
              SetWeight={setWeight}
              size={size}
              SetSize={setSize}
              selected={selected}
              setSelected={setSelected}
              Font={Font}
              SetFont={SetFont}
              selectedtext={selectedtext as "left" | "right" | "center"}
              settextSelected={settextSelected}
              style={style}
              setStyle={setStyle}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              buttonRadius={buttonRadius}
              setButtonRadius={setButtonRadius}
              color={color}
              setColor={setColor}
              bgColor={bgColor}
              setBgColor={setBgColor}
              btnColor={btnColor}
              setBtnColor={setBtnColor}
              headColor={headColor}
              setHeadColor={setHeadColor}
              paraColor={paraColor}
              setParaColor={setParaColor}
              secondcolor={secondcolor}
              setSecondcolor={setSecondcolor}
              bgColors={bgColors}
              setBgColors={setBgColors}
              secondbuttontext={secondbuttontext}
              setsecondbuttontext={setsecondbuttontext}
              primaryButtonText={primaryButtonText}
              setPrimaryButtonText={setPrimaryButtonText}
              closebutton={toggleStates.closebutton}
            />
          )}

          {activeTab === "Script" && <Script fetchScripts={fetchScripts} isWelcome={false} />}
        </div>
      </div>
      <DonotShare
        onClose={() => { }}
        toggleStates={toggleStates}
        handleToggle={handleToggle}
      />
      {/* Advanced CSV Export Modal */}
      <CSVExportAdvanced
        isVisible={showCSVExportAdvanced}
        onClose={() => setShowCSVExportAdvanced(false)}
        sessionToken={sessionTokenFromLocalStorage}
        siteInfo={siteInfo}
        onReset={() => {
          // Reset any related state in the main App component if needed
          setIsCSVButtonLoading(false);
        }}
      />

      {/* ChoosePlan Modal */}
      {showChoosePlan && (
        <ChoosePlan onClose={() => setShowChoosePlan(false)} />
      )}
      
    </div>
  );
};

export default CustomizationTab;

