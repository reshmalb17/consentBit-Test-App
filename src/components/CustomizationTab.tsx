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
const warningicon = new URL("../assets/warning-2.png", import.meta.url).href;
const messageicon = new URL("../assets/message-icon.svg", import.meta.url).href;
const BrandImageUrl = new URL("../assets/BrandImage.svg", import.meta.url).href;

import { customCodeApi } from "../services/api";
import { useAuth } from "../hooks/userAuth";
import { getTranslation } from "../util/translation-utils";
import { getAuthStorageItem, setAuthStorageItem, removeAuthStorageItem, setCurrentSiteId } from "../util/authStorage";
import webflow, { WebflowAPI } from '../types/webflowtypes';
import { CodeApplication, ScriptRegistrationRequest } from "../types/types";
import createCookiePreferences from "../hooks/gdprPreference";
import createCookieccpaPreferences from "../hooks/ccpaPreference";
import { usePersistentState, getCurrentSiteId } from "../hooks/usePersistentState";
import { getCloseIconSVG, getCloseIconColor } from "../util/colorUtils";
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
import { skip } from "node:test";



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

interface InitialBannerStyles {
  color?: string;
  btnColor?: string;
  paraColor?: string;
  secondcolor?: string;
  bgColors?: string;
  headColor?: string;
  secondbuttontext?: string;
  primaryButtonText?: string;
  Font?: string;
  style?: BannerStyle;
  selected?: Orientation;
  borderRadius?: number;
  buttonRadius?: number;
  animation?: string;
  easing?: string;
  language?: string;
  weight?: string;
  cookieExpiration?: string;
  privacyUrl?: string;
  toggleStates?: {
    customToggle?: boolean;
    disableScroll?: boolean;
    closebutton?: boolean;
  };
}

interface CustomizationTabProps {
  onAuth: () => void;
  initialActiveTab?: string;
  isAuthenticated?: boolean;
  initialBannerStyles?: InitialBannerStyles;
}


// Global debugging function for banner creation script registration
(window as any).debugBannerScriptRegistration = () => {

  // Log all scripts in head
  const scripts = document.head.querySelectorAll('script');
  scripts.forEach((script, index) => {
  });
  
  // Check for consent script URLs
  const consentScripts = document.head.querySelectorAll('script[src*="consentbit"], script[src*="cb-server"]');
  consentScripts.forEach((script, index) => {
  });
};


// Helper to get or create the close icon asset (X-Vector.svg) with dynamic color
const getOrCreateCloseIconAsset = async (backgroundColor: string): Promise<any> => {
  try {
    // Import color utility to determine icon color
    const { getCloseIconColor } = await import('../util/colorUtils');
    const iconColor = getCloseIconColor(backgroundColor);
    
    // Create a unique asset name based on color to support different colors
    const assetName = `close-icon-${iconColor.replace('#', '')}`;
    
    const assets = await webflow.getAllAssets();
    const existingAsset = assets.find(asset => asset.name && asset.name === assetName);
    if (existingAsset) {
      return existingAsset;
    }

    const xVectorIcon = new URL("../assets/X-Vector.svg", import.meta.url).href;
    // Fetch the X-Vector.svg file
    const response = await fetch(xVectorIcon);
    if (!response.ok) {
      throw new Error(`Failed to fetch X-Vector.svg: ${response.status} ${response.statusText}`);
    }

    // Get SVG content and modify the fill color
    let svgContent = await response.text();
    
    // Replace the fill color in the SVG
    svgContent = svgContent.replace(/fill="black"/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill='black'/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill=black/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill\s*=\s*["']black["']/gi, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill\s*=\s*["'][^"']*["']/gi, `fill="${iconColor}"`);
    
    // Resize the SVG to 16x16
    svgContent = svgContent.replace(/width="385"/g, 'width="16"');
    svgContent = svgContent.replace(/height="385"/g, 'height="16"');
    
    // Ensure fill color is set
    if (!svgContent.includes(`fill="${iconColor}"`)) {
      svgContent = svgContent.replace(/<path([^>]*?)>/gi, (match, attrs) => {
        if (!attrs.includes('fill=')) {
          return `<path${attrs} fill="${iconColor}">`;
        }
        return match;
      });
    }

    // Create blob from modified SVG content
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${assetName}.svg`, {
      type: 'image/svg+xml',
    });
    
    const newAsset = await (webflow as any).createAsset(file);
    return newAsset;
  } catch (error) {
    throw error;
  }
};

const CustomizationTab: React.FC<CustomizationTabProps> = ({ onAuth, initialActiveTab = "Settings", isAuthenticated = false, initialBannerStyles }) => {
  // Use initial values if provided, otherwise use defaults
  const [color, setColor] = usePersistentState("color", initialBannerStyles?.color || "#ffffff");
  
  // Debug: Monitor color state changes
  useEffect(() => {
  }, [color]);
  const [bgColor, setBgColor] = usePersistentState("bgColor", initialBannerStyles?.bgColors || "#ffffff");
  
  // Debug: Monitor bgColor state changes
  useEffect(() => {
  }, [bgColor]);
  // Ensure btnColor defaults to black (#000000) for Accept button
  const getDefaultBtnColor = () => {
    if (initialBannerStyles?.btnColor && initialBannerStyles.btnColor !== "#C9C9C9" && initialBannerStyles.btnColor !== "rgb(201, 201, 201)") {
      return initialBannerStyles.btnColor;
    }
    return "#000000"; // Default to black for Accept button
  };
  
  const [btnColor, setBtnColor] = usePersistentState("btnColor", getDefaultBtnColor());
  const [paraColor, setParaColor] = usePersistentState("paraColor", initialBannerStyles?.paraColor || "#4C4A66");
  // Ensure secondcolor defaults to light gray (#C9C9C9) for secondary buttons, not black
  // Only use API value if it's explicitly provided and not black
  const getDefaultSecondColor = () => {
    if (initialBannerStyles?.secondcolor && initialBannerStyles.secondcolor !== "#000000" && initialBannerStyles.secondcolor !== "rgb(0, 0, 0)") {
      return initialBannerStyles.secondcolor;
    }
    return "#C9C9C9"; // Default to light gray
  };
  
  const [secondcolor, setSecondcolor] = usePersistentState("secondcolor", getDefaultSecondColor());
  
  // Fix: Reset secondcolor if it's black and not explicitly set from API
  useEffect(() => {
    if ((secondcolor === "#000000" || secondcolor === "rgb(0, 0, 0)" || secondcolor === "black" || secondcolor === "rgba(0, 0, 0, 1)") && 
        (!initialBannerStyles?.secondcolor || initialBannerStyles.secondcolor === "#000000")) {
      setSecondcolor("#C9C9C9");
    }
  }, [secondcolor, initialBannerStyles]);
  
  // Ensure btnColor is not set to secondcolor (light gray) - it should be black
  useEffect(() => {
    if (btnColor === "#C9C9C9" || btnColor === "rgb(201, 201, 201)" || btnColor === secondcolor) {
      if (!initialBannerStyles?.btnColor || initialBannerStyles.btnColor === "#C9C9C9") {
        setBtnColor("#000000");
      }
    }
  }, [btnColor, secondcolor, initialBannerStyles]);
  
  const [bgColors, setBgColors] = usePersistentState("bgColors", initialBannerStyles?.bgColors || "#798EFF");
  const [headColor, setHeadColor] = usePersistentState("headColor", initialBannerStyles?.headColor || "#000000");
  const [secondbuttontext, setsecondbuttontext] = usePersistentState("secondbuttontext", initialBannerStyles?.secondbuttontext || "#000000");
  const [primaryButtonText, setPrimaryButtonText] = usePersistentState("primaryButtonText", initialBannerStyles?.primaryButtonText || "#FFFFFF");
  const [activeTab, setActiveTab] = usePersistentState("activeTab", initialActiveTab);
  const [previewMode, setPreviewMode] = useState<'gdpr' | 'ccpa'>('gdpr');
  const [closeIconSvg, setCloseIconSvg] = useState<string>("");


  
  // Track if we've already set activeTab from API to prevent conflicts
  const [hasSetActiveTabFromApi, setHasSetActiveTabFromApi] = useState(false);
  
  // Validate that activeTab is one of the valid tabs
  useEffect(() => {
    const validTabs = ["Settings", "Customization", "Script"];
    if (!validTabs.includes(activeTab)) {
      setActiveTab("Settings");
    }
  }, [activeTab]);
  
  // Wrapper function to set activeTab and track that it was set by user interaction
  const handleSetActiveTab = (newTab: string) => {
    setActiveTab(newTab);
    setHasSetActiveTabFromApi(true); // Mark that user has interacted with tabs
  };
  
  // Override activeTab with initialActiveTab prop when provided (only on mount)
  useEffect(() => {
    if (initialActiveTab && initialActiveTab !== activeTab && !hasSetActiveTabFromApi) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab, activeTab, hasSetActiveTabFromApi]);

  // Update state values from initialBannerStyles if provided (only on mount)
  // Ensure defaults are set on mount and when initialBannerStyles changes
  useEffect(() => {
    if (initialBannerStyles) {
      if (initialBannerStyles.color) setColor(initialBannerStyles.color);
      if (initialBannerStyles.btnColor) setBtnColor(initialBannerStyles.btnColor);
      if (initialBannerStyles.paraColor) setParaColor(initialBannerStyles.paraColor);
      if (initialBannerStyles.secondcolor) setSecondcolor(initialBannerStyles.secondcolor);
      if (initialBannerStyles.bgColors) setBgColors(initialBannerStyles.bgColors);
      if (initialBannerStyles.headColor) setHeadColor(initialBannerStyles.headColor);
      if (initialBannerStyles.secondbuttontext) setsecondbuttontext(initialBannerStyles.secondbuttontext);
      if (initialBannerStyles.primaryButtonText) setPrimaryButtonText(initialBannerStyles.primaryButtonText);
      if (initialBannerStyles.Font) SetFont(initialBannerStyles.Font);
      // Always set style and selected when initialBannerStyles is provided
      // Use values from API if available, otherwise use defaults
      // Note: Empty string "" is a valid style value (no style), so check for undefined/null explicitly
      // Valid styles: "align" | "alignstyle" | "bigstyle" | "centeralign" | "fullwidth" | ""
      const newStyle = initialBannerStyles.style !== undefined && initialBannerStyles.style !== null 
        ? initialBannerStyles.style 
        : "align";
      // Use API value if provided and valid, otherwise use default "right"
      // Valid orientations: "left" | "center" | "right"
      const apiSelected = initialBannerStyles.selected;
      const newSelected = (apiSelected !== undefined && apiSelected !== null && 
                          (apiSelected === "left" || apiSelected === "center" || apiSelected === "right"))
        ? apiSelected 
        : "right";
      // Always update style and selected to ensure they're set correctly from API
      setStyle(newStyle);
      setSelected(newSelected);
      if (initialBannerStyles.borderRadius !== undefined) setBorderRadius(initialBannerStyles.borderRadius);
      if (initialBannerStyles.buttonRadius !== undefined) setButtonRadius(initialBannerStyles.buttonRadius);
      if (initialBannerStyles.animation) setAnimation(initialBannerStyles.animation);
      if (initialBannerStyles.easing) setEasing(initialBannerStyles.easing);
      if (initialBannerStyles.language) setLanguage(initialBannerStyles.language);
      if (initialBannerStyles.weight) setWeight(initialBannerStyles.weight);
      if (initialBannerStyles.cookieExpiration) setCookieExpiration(initialBannerStyles.cookieExpiration);
      if (initialBannerStyles.privacyUrl !== undefined) setPrivacyUrl(initialBannerStyles.privacyUrl);
      if (initialBannerStyles.toggleStates) {
        setToggleStates(prev => ({
          ...prev,
          customToggle: initialBannerStyles.toggleStates?.customToggle !== undefined ? initialBannerStyles.toggleStates.customToggle : prev.customToggle,
          disableScroll: initialBannerStyles.toggleStates?.disableScroll !== undefined ? initialBannerStyles.toggleStates.disableScroll : prev.disableScroll,
          closebutton: initialBannerStyles.toggleStates?.closebutton !== undefined ? initialBannerStyles.toggleStates.closebutton : prev.closebutton,
        }));
      }
      // Set only GDPR checkbox as selected when coming from ConfirmPublish or SuccessPublish
      // Only set if initialBannerStyles is provided (coming from API or ConfirmPublish)
      if (initialBannerStyles) {
        setSelectedOptions(["GDPR"]);
        setSelectedOption("GDPR");
      }
    } else {
      // If no initialBannerStyles, ensure defaults are set
      // This handles the case when component mounts before API data is loaded
      setStyle("align");
      setSelected("right");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBannerStyles]); // Run when initialBannerStyles changes

 // Only run on mount
  const [expires, setExpires] = useState("");
  const [size, setSize] = usePersistentState("size", "12");
  const [isActive, setIsActive] = useState(false);
  const [Font, SetFont] = usePersistentState("Font", initialBannerStyles?.Font || "Montserrat");
  const [selectedtext, settextSelected] = usePersistentState("selectedtext", "left");
  // Use regular useState for style and selected since they're banner keys that shouldn't be persisted
  // They should only come from API via initialBannerStyles
  // Note: Empty string "" is a valid style value (no style), so check for undefined/null explicitly
  // Always default to "align" for style and "right" for selected if not provided
  const [style, setStyle] = useState<BannerStyle>(() => {
    if (initialBannerStyles?.style !== undefined && initialBannerStyles?.style !== null) {
      return initialBannerStyles.style;
    }
    return "align";
  });
  // Removed activeMode - all features are now available by default
  const [selected, setSelected] = useState<Orientation>(() => {
    if (initialBannerStyles?.selected !== undefined && initialBannerStyles?.selected !== null) {
      return initialBannerStyles.selected;
    }
    return "right";
  });

  // Ensure selected is always set to a valid value, but only if it's invalid
  // Don't override valid API values
  useEffect(() => {
    // Only validate if selected is somehow undefined or invalid
    // This should rarely happen since we set defaults, but it's a safety check
    if (!selected || (selected !== "left" && selected !== "center" && selected !== "right")) {
      // Only set default if we don't have a valid API value to use
      const apiValue = initialBannerStyles?.selected;
      if (apiValue && (apiValue === "left" || apiValue === "center" || apiValue === "right")) {
        setSelected(apiValue);
      } else {
        setSelected("right");
      }
    }
  }, [selected, initialBannerStyles?.selected]); // Run when selected changes or API value changes
  const [selectedOption, setSelectedOption] = usePersistentState("selectedOption", "GDPR");
  const [weight, setWeight] = usePersistentState("weight", initialBannerStyles?.weight || "Regular");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOptions, setSelectedOptions] = usePersistentState("selectedOptions", ["GDPR"]);
  const showCCPAPreview = selectedOptions.includes("U.S. State Laws");

  // Initialize preview mode based on selectedOption on mount and keep it in sync
  useEffect(() => {
    const hasCCPA = selectedOptions.includes('U.S. State Laws');
    const hasGDPR = selectedOptions.includes('GDPR');
    
    // If U.S. State Laws is selected in Settings AND it's checked, show CCPA
    if (selectedOption === 'U.S. State Laws' && hasCCPA) {
      setPreviewMode('ccpa');
    } 
    // If only GDPR is selected (or U.S. State Laws is unselected), show GDPR
    else if (hasGDPR && !hasCCPA) {
      setPreviewMode('gdpr');
    }
    // If both are selected, default to GDPR unless U.S. State Laws is explicitly selected
    else if (hasGDPR && hasCCPA) {
      setPreviewMode(selectedOption === 'U.S. State Laws' ? 'ccpa' : 'gdpr');
    }
  }, [selectedOption, selectedOptions]);

  // Safety: fall back to GDPR if CCPA is selected but not available
  useEffect(() => {
    if (previewMode === 'ccpa' && !showCCPAPreview) {
      setPreviewMode('gdpr');
    }
  }, [previewMode, showCCPAPreview]);

  // Generate close icon SVG based on background color
  useEffect(() => {
    const generateCloseIcon = async () => {
      try {
        const svgContent = await getCloseIconSVG(color);
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
        setCloseIconSvg(svgDataUrl);
      } catch (error) {
        // Fallback to a simple X SVG
        const iconColor = getCloseIconColor(color);
        const fallbackSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/></svg>`;
        setCloseIconSvg(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fallbackSvg)))}`);
      }
    };
    generateCloseIcon();
  }, [color]);

  // Ensure at least one option is always selected
 useEffect(() => {
  if (!selectedOptions.includes("GDPR")) {
    setSelectedOptions(["GDPR", ...selectedOptions]);
  }
}, []);

  const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);
  const [accessToken, setAccessToken] = usePersistentState<string>("accessToken", '');
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchScripts, setFetchScripts] = useState(false);
  const [triggerScan, setTriggerScan] = useState(false);
  const [borderRadius, setBorderRadius] = usePersistentState<number>("borderRadius", initialBannerStyles?.borderRadius || 4);
  const [buttonRadius, setButtonRadius] = usePersistentState<number>("buttonRadius", initialBannerStyles?.buttonRadius || 3);
  const [isLoading, setIsLoading] = useState(false);
  const [userlocaldata, setUserlocaldata] = useState<UserData | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Reset loading states when component mounts to prevent stuck loading animations
  React.useEffect(() => {
    setIsLoading(false);
    setShowLoadingPopup(false);
    setIsExporting(false);
    setIsCSVButtonLoading(false);
    // Button text will be set based on banner status in fetchbannerdetails useEffect
  }, []);

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [buttonText, setButtonText] = useState("Scan Project");
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [showChildContainerErrorPopup, setShowChildContainerErrorPopup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cookieExpiration, setCookieExpiration] = usePersistentState("cookieExpiration", "120");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Auto-dismiss tooltip after 2 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowTooltip(false);
          setFadeOut(false);
        }, 300); // Wait for fade-out animation
      }, 2000); // Reduced to 2 seconds
      return () => {
        clearTimeout(timer);
      };
    }
  }, [showTooltip]);
  // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
  const userinfo = getAuthStorageItem("consentbit-userinfo");
  const tokenss = userinfo ? JSON.parse(userinfo) : null;
  const [sessionTokenFromLocalStorage, setSessionToken] = useState(getSessionTokenFromLocalStorage());
  const [showChoosePlan, setShowChoosePlan] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [isBannerAdded, setIsBannerAdded] = useState(false);
  
  // Update button text based on whether scripts have been fetched
  useEffect(() => {
    if (fetchScripts) {
      setButtonText("Rescan Project");
    } else {
      setButtonText("Scan Project");
    }
  }, [fetchScripts]);

  // Update fetchScripts when scan is triggered
  useEffect(() => {
    if (triggerScan) {
      setFetchScripts(true);
      setTriggerScan(false);
    }
  }, [triggerScan]);
  const [isCSVButtonLoading, setIsCSVButtonLoading] = useState(false);
  const [showCSVExportAdvanced, setShowCSVExportAdvanced] = useState(false);




  const base_url = "https://app.consentbit.com"

  // Welcome screen handlers - removed since this component is accessed via Customize link
  const handleWelcomeAuthorize = () => {
    // This function is not needed in CustomizationTab
  };

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };


  const [toggleStates, setToggleStates] = usePersistentState('toggleStates', {
    customToggle: initialBannerStyles?.toggleStates?.customToggle || false,
    resetInteractions: false,
    disableScroll: initialBannerStyles?.toggleStates?.disableScroll || false,
    storeConsents: false,
    globalvariable: false,
    closebutton: initialBannerStyles?.toggleStates?.closebutton || false,
    donotshare: false,
  });


  // Your default states
  const defaultState = {
    animation: initialBannerStyles?.animation || "fade",
    easing: initialBannerStyles?.easing || "Ease",
    language: initialBannerStyles?.language || "English",
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
      description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you. ",
      accept: "Accept",
      reject: "Reject",
      preferences: "Preference",
      moreInfo: "More Info",
      ccpa: {
        heading: "We value your privacy",
        description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you. ",
        doNotShare: "Do Not Share My Personal Information"
      }
    },
    Spanish: {
      heading: "Configuración de Cookies",
      description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted. ",
      accept: "Aceptar",
      reject: "Rechazar",
      preferences: "Preferencias",
      moreInfo: "Más Información",
      ccpa: {
        heading: "Valoramos tu Privacidad",
        description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted. ",
        doNotShare: "No Compartir Mi Información Personal"
      }
    },
    French: {
      heading: "Paramètres des Cookies",
      description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous. ",
      accept: "Accepter",
      reject: "Refuser",
      preferences: "Préférences",
      moreInfo: "Plus d'infos",
      ccpa: {
        heading: "Nous Respectons Votre Vie Privée",
        description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous. ",
        doNotShare: "Ne Pas Partager Mes Informations Personnelles"
      }
    },
    German: {
      heading: "Cookie-Einstellungen",
      description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern. ",
      accept: "Akzeptieren",
      reject: "Ablehnen",
      preferences: "Einstellungen",
      moreInfo: "Mehr Info",
      ccpa: {
        heading: "Wir Respektieren Ihre Privatsphäre",
        description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern. ",
        doNotShare: "Meine persönlichen Informationen nicht weitergeben"
      }
    },
    Swedish: {
      heading: "Cookie-inställningar",
      description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig. ",
      accept: "Acceptera",
      reject: "Avvisa",
      preferences: "Inställningar",
      moreInfo: "Mer info",
      ccpa: {
        heading: "Vi Värdesätter Din Integritet",
        description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig. ",
        doNotShare: "Dela Inte Min Personliga Information"
      }
    },
    Dutch: {
      heading: "Cookie-instellingen",
      description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren. ",
      accept: "Accepteren",
      reject: "Weigeren",
      preferences: "Voorkeuren",
      moreInfo: "Meer info",
      ccpa: {
        heading: "We Waarderen Uw Privacy",
        description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren. ",
        doNotShare: "Deel Mijn Persoonlijke Informatie Niet"
      }
    },
    // Add these after the Dutch translations and before the closing brace
    Italian: {
      heading: "Impostazioni Cookie",
      description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te. ",
      accept: "Accetta",
      reject: "Rifiuta",
      preferences: "Preferenze",
      moreInfo: "Più info",
      ccpa: {
        heading: "Rispettiamo la Tua Privacy",
        description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te. ",
        doNotShare: "Non Condividere Le Mie Informazioni Personali"
      }
    },
    Portuguese: {
      heading: "Configurações de Cookies",
      description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você. ",
      accept: "Aceitar",
      reject: "Rejeitar",
      preferences: "Preferências",
      moreInfo: "Mais info",
      ccpa: {
        heading: "Valorizamos Sua Privacidade",
        description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você. ",
        doNotShare: "Não Compartilhar Minhas Informações Pessoais"
      }
    },
    Polish: {
  heading: "Ustawienia plików cookie",
  description: "Używamy plików cookie, aby zapewnić najlepsze możliwe doświadczenie. Pozwalają nam również analizować zachowanie użytkowników, aby stale ulepszać stronę dla Ciebie.",
  accept: "Akceptuj",
  reject: "Odrzuć",
  preferences: "Preferencje",
  moreInfo: "Więcej informacji",
  ccpa: {
    heading: "Cenimy Twoją prywatność",
    description: "Używamy plików cookie, aby zapewnić najlepsze możliwe doświadczenie. Pozwalają nam również analizować zachowanie użytkowników, aby stale ulepszać stronę dla Ciebie.",
    doNotShare: "Nie udostępniaj moich danych osobowych"
  }
}

  };



  const [cookiePreferences, setCookiePreferences] = useState(() => {
    // Get stored preferences from sessionStorage or use default values
    // COMMENTED OUT: const savedPreferences = localStorage.getItem("cookiePreferences");
    const savedPreferences = getAuthStorageItem("cookiePreferences");
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
    // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
    const userInfo = getAuthStorageItem('consentbit-userinfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.sessionToken && parsed?.email) {
          // COMMENTED OUT: localStorage.setItem("cookiePreferences", JSON.stringify(cookiePreferences));
          setAuthStorageItem("cookiePreferences", JSON.stringify(cookiePreferences));
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

      // Save new state to sessionStorage
      // COMMENTED OUT: localStorage.setItem("cookiePreferences", JSON.stringify(updatedPreferences));
      setAuthStorageItem("cookiePreferences", JSON.stringify(updatedPreferences));

      return updatedPreferences;
    });
  };



const handleToggles = (option) => {
  // Prevent user from toggling GDPR
  if (option === "GDPR") return;

  setSelectedOptions((prev) => {
    let updatedOptions;

    if (prev.includes(option)) {
      // Remove selected option (but always keep GDPR)
      updatedOptions = prev.filter((item) => item !== option);
    } else {
      // Add new option
      updatedOptions = [...prev, option];
    }

    // Always ensure GDPR is in the list
    if (!updatedOptions.includes("GDPR")) {
      updatedOptions.push("GDPR");
    }

    // Save to storage
    setAuthStorageItem("selectedOptions", JSON.stringify(updatedOptions));
    return updatedOptions;
  });
};


  useEffect(() => {
    // COMMENTED OUT: localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    setAuthStorageItem("selectedOptions", JSON.stringify(selectedOptions));
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

        // COMMENTED OUT: const localstoragedata = localStorage.getItem("consentbit-userinfo");
        const localstoragedata = getAuthStorageItem("consentbit-userinfo");
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

  // Banner details are now fetched in App.tsx and passed as initialBannerStyles prop
  // No need to fetch here - values come from API via props


  //main function for adding custom code to the head
  const fetchAnalyticsBlockingsScripts = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        openAuthScreen();
        return;
      }

      const siteIdinfo = await webflow.getSiteInfo();
      if (siteIdinfo?.siteId) {
        setCurrentSiteId(siteIdinfo.siteId);
      }
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
  const { user, exchangeAndVerifyIdToken, isAuthenticatedForCurrentSite, openAuthScreen: openAuthScreenHook, attemptSilentAuth } = useAuth();




  // Use the authorization function from useAuth hook (includes automatic silent auth)
  const openAuthScreen = openAuthScreenHook;

  const queryClient = useQueryClient();



  //GDPR preferences banner
  const handleCreatePreferences = async (skipCommonDiv: boolean = false, targetDiv?: any) => {
    try {
      const selectedPreferences = Object.entries(cookiePreferences)
        .filter(([_, isChecked]) => isChecked)
        .map(([category]) => category);

      if (!selectedPreferences.includes("essential")) {
        selectedPreferences.push("essential");
      }

      await createCookiePreferences(
        selectedPreferences, language, color, btnColor, headColor, paraColor, secondcolor, buttonRadius, animation, toggleStates.customToggle, primaryButtonText, secondbuttontext, skipCommonDiv, toggleStates.disableScroll, toggleStates.closebutton, borderRadius , Font, privacyUrl, targetDiv
      );
    } catch (error) {
      // Error creating cookie preferences
    }
  };


  //CCPA preferences banner
  const handleCreatePreferencesccpa = async (targetDiv?: any) => {
    try {
      await createCookieccpaPreferences(language, color, btnColor, headColor, paraColor, secondcolor, buttonRadius, animation, primaryButtonText, secondbuttontext, toggleStates.disableScroll, toggleStates.closebutton, false, Font, borderRadius, privacyUrl, targetDiv);
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
  const ccpabanner = async (targetDiv?: any, bothBanners: boolean = false) => {
    setShowPopup(false); // close the first popup
    setShowLoadingPopup(true); // show loading popup
    setIsLoading(true);
    // COMMENTED OUT: const isBannerAlreadyAdded = localStorage.getItem("cookieBannerAdded") === "true";
    // const isBannerAlreadyAdded = getAuthStorageItem("cookieBannerAdded") === "true";
    try {

      // When creating both banners, skip duplicate removal since GDPR already removed all elements
      // When creating CCPA alone, check for all banner elements
      if (!bothBanners) {
        // Comprehensive check and removal of banner-related elements before creating new ones
        const allElements = await webflow.getAllElements();
        
        // Include all banner IDs when creating CCPA alone
        const idsToCheck = [
          "initial-consent-banner",
          "main-consent-banner", 
          "toggle-consent-btn",
          "do-not-share-link",
          "close-consent-banner",
          "privacy-link",
          "consent-banner",
          "main-banner",
          "close-consent",
          "preferences-btn",
          "decline-btn",
          "accept-btn"
        ];

        // Include all banner style names when creating CCPA alone
        const styleNamesToCheck = [
          "consentbit-ccpa-banner-div",
          "consentbit-ccpa-banner-text",
          "consentbit-ccpa-button-container",
          "consentbit-ccpa-banner-heading",
          "consentbit-ccpa-linkblock",
          "consentbit-ccpa-privacy-link",
          "consentbit-ccpa-innerdiv",
          "consentbit-banner-ccpasecond-bg",
          "close-consentbit",
          "consentbit-gdpr_banner_div",
          "consentbit-gdpr_banner_text",
          "consentbit-banner_button_container",
          "consentbit-banner_button_preference",
          "consentbit-banner_button_decline",
          "consentbit-banner_accept",
          "consentbit-banner_headings",
          "consentbit-innerdiv",
          "consentbit-banner_second-bg",
          "close-consent",
          "consentbit-privacy-link-gdpr-banner",
          "consentbit-preference_div"
        ];

        // Check all elements by both ID and style names
        const elementChecks = await Promise.all(
          allElements.map(async (el) => {
            const isBanner = await isBannerElement(el, idsToCheck, styleNamesToCheck);
            return { el, isBanner };
          })
        );

        // Filter matching elements
        const matchingElements = elementChecks
          .filter(({ isBanner }) => isBanner)
          .map(({ el }) => el);

        // Remove ALL matching elements to prevent duplicates
        if (matchingElements.length > 0) {
          await Promise.all(matchingElements.map(async (el) => {
            try {
              const domId = await el.getDomId?.().catch(() => null);
              const identifier = domId || 'element-with-banner-class';
              
              // Remove all children first
              try {
                const children = await el.getChildren?.();
                if (children && children.length > 0) {
                  await Promise.all(children.map(child => child.remove()));
                }
              } catch (childErr) {
              }

              // Remove the element itself
              await el.remove();
            } catch (err) {
              // Continue even if removal fails
            }
          }));
        }
      }
      // When bothBanners is true, skip duplicate removal - GDPR already cleaned up everything


      // Use provided targetDiv if available, otherwise get selected element
      const selectedElement = targetDiv || await webflow.getSelectedElement();
      if (!selectedElement) {
        webflow.notify({ type: "error", message: "No element selected in the Designer." });
        setIsLoading(false);
        return;
      }

      // Check if the selected element is a child of consentbit-container
      const isChildOfContainer = await isSelectedElementChildOfContainer(selectedElement);
      if (isChildOfContainer) {
        setShowPopup(false);
        setShowLoadingPopup(false);
        setIsLoading(false);
        setShowChildContainerErrorPopup(true);
        return;
      }

      // Check if the selected element can have children
      if (!selectedElement?.children) {
        webflow.notify({ type: "error", message: "Selected element cannot have children." });
        setIsLoading(false);
        return;
      }

      // Add ConsentBit class name to the selected element
      try {
        const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
        if (selectedElement.setStyles) {
          await selectedElement.setStyles([consentBitStyle]);
        }
      } catch (error) {
        // Continue if style application fails
      }

      // Set DOM ID 'consentbit-container' on the selected element (CCPA)
      try {
        // Check if DOM ID is already set
        let existingDomId: string | null = null;
        try {
          if ((selectedElement as any).getDomId) {
            existingDomId = await (selectedElement as any).getDomId();
          }
        } catch (e) {
          // Continue if we can't get DOM ID - element might be in transition
        }

        // Set DOM ID if not already set
        if (existingDomId !== 'consentbit-container') {
          try {
            if ((selectedElement as any).setDomId) {
              await (selectedElement as any).setDomId("consentbit-container");
            } else if (selectedElement.setCustomAttribute) {
              await selectedElement.setCustomAttribute("id", "consentbit-container");
            } else if ((selectedElement as any).setAttribute) {
              await (selectedElement as any).setAttribute("id", "consentbit-container");
            }
          } catch (domIdSetError: any) {
            // Handle "Missing element" error gracefully - element reference became invalid
            // This usually means the ID was set but element was modified by Webflow
            if (domIdSetError?.message && domIdSetError.message.includes("Missing element")) {
              // Silently continue - ID was likely set before element became invalid
            } else {
            }
            // Continue even if DOM ID setting fails
          }
        } else {
          // DOM ID already set - no need to verify or retry
        }
      } catch (domIdError: any) {
        // Handle "Missing element" error gracefully - don't log as error
        if (domIdError?.message && domIdError.message.includes("Missing element")) {
          // Silently continue - element reference became invalid but ID was likely set
        } else {
          
        }
        // Continue even if DOM ID setting fails
      }

      // Final double-check: Only when creating CCPA alone (skip when bothBanners is true)
      if (!bothBanners) {
        const allElementsFinalCheck = await webflow.getAllElements();
        const finalCheckIds = ["initial-consent-banner"];
        const finalCheckStyleNames = [
          "consentbit-ccpa-banner-div",
          "consentbit-gdpr_banner_div"
        ];
        
        const finalElementChecks = await Promise.all(
          allElementsFinalCheck.map(async (el) => {
            const isBanner = await isBannerElement(el, finalCheckIds, finalCheckStyleNames);
            return { el, isBanner };
          })
        );
        
        const existingInitialBanners = finalElementChecks
          .filter(({ isBanner }) => isBanner)
          .map(({ el }) => el);
        
        if (existingInitialBanners.length > 0) {
          await Promise.all(existingInitialBanners.map(async (el) => {
            try {
              const domId = await el.getDomId?.().catch(() => null);
              const identifier = domId || 'element-with-banner-class';
              
              const children = await el.getChildren?.().catch(() => []);
              if (children && children.length > 0) {
                await Promise.all(children.map(child => child.remove()));
              }
              await el.remove();
            } catch (err) {
            }
          }));
        }
      }

      // Create newDiv as a child of the selected element
      const newDiv = await selectedElement.prepend(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        webflow.notify({ type: "error", message: "Failed to create div." });
        setIsLoading(false);
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
        privacyLinkStyleName: "consentbit-ccpa-privacy-link",
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
        privacyLinkStyle,
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

      const linktextPropertyMap: Record<string, string> = {
        "border-radius": "48px",
        "cursor": "pointer",
        "background-color": "transparent !important",
        "color": paraColor,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-decoration": "none !important",
        "font-family": Font,
        "font-size": "16px", // Match paragraph font size
        "font-weight": `${weight === "Regular" ? 500 : weight === "Medium" ? 600 : weight === "Semi Bold" ? 700 : weight === "Bold" ? 700 : parseInt(weight) + 100 || 500}`, // Slightly bolder than paragraph
      };

      const privacyLinkPropertyMap: Record<string, string> = {
        "color": paraColor,
        "text-decoration": "none !important",
        "font-size": "16px", // Match paragraph font size
        "font-weight": `${weight === "Regular" ? 500 : weight === "Medium" ? 600 : weight === "Semi Bold" ? 700 : weight === "Bold" ? 700 : parseInt(weight) + 100 || 500}`,
        "font-family": Font,
        "cursor": "pointer",
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
      await Linktext.setProperties(linktextPropertyMap);
      // Add hover styles for underline effect on Do Not Share link
      await Linktext.setProperties({ "text-decoration": "underline" }, { breakpoint: "main", pseudoClass: "hover" });
      await privacyLinkStyle.setProperties(privacyLinkPropertyMap);
      // Add hover styles for underline effect on More Info link
      await privacyLinkStyle.setProperties({ "text-decoration": "underline" }, { breakpoint: "main", pseudoClass: "hover" });
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

      try {
        // Create innerdiv as child of newDiv
        const innerdiv = await newDiv.append(webflow.elementPresets.DivBlock);
        await innerdiv.setStyles([innerDivStyle]);

        // Create Closebuttons as child of newDiv (if enabled)
        let Closebuttons = null;
        if (toggleStates.closebutton) {
          Closebuttons = await newDiv.append(webflow.elementPresets.DivBlock);
          if (!Closebuttons) {
            throw new Error("Failed to create close button div");
          }

          if (Closebuttons.setStyles) {
            await Closebuttons.setStyles([closebutton]);
            await Closebuttons.setCustomAttribute("consentbit", "close");
            
            // Create Image element and set X-Vector.svg as asset (same approach as toggle icon)
            let imageElement: any = null;
            
            try {
              // Create the image element
              imageElement = await Closebuttons.append(webflow.elementPresets.Image);
              
              if (!imageElement) {
                throw new Error("Failed to create image element");
              }

              // Create the asset in Webflow
              const asset = await getOrCreateCloseIconAsset(color);
              
              // Set the asset to the image element
              await (imageElement as any).setAsset(asset);
              
              // Style the image to match close button size
              const imageStyle =
                (await webflow.getStyleByName("consentCloseIcon")) ||
                (await webflow.createStyle("consentCloseIcon"));
              
              await imageStyle.setProperties({
                "width": "16px",
                "height": "16px",
                "display": "block"
              });
              
              await (imageElement as any).setStyles?.([imageStyle]);
              
              // Set DOM ID for close button icon
              try {
                if ((imageElement as any).setDomId) {
                  await (imageElement as any).setDomId("close-consent-banner");
                } else {
                  // Fallback: Set ID on parent container if image doesn't support it
                  if ((Closebuttons as any).setDomId) {
                    await (Closebuttons as any).setDomId("close-consent-banner");
                  }
                }
              } catch (idError) {
                // Try setting on parent container as fallback
                try {
                  if ((Closebuttons as any).setDomId) {
                    await (Closebuttons as any).setDomId("close-consent-banner");
                  }
                } catch (fallbackError) {
                  // Ignore fallback errors
                }
              }
            } catch (error) {
              // Error creating close icon image element
            }
          }
        }

        // Create SecondDiv as child of innerdiv (if alignstyle)
        let SecondDiv;
        if (style === "alignstyle") {
          SecondDiv = await innerdiv.append(webflow.elementPresets.DivBlock);
          if (SecondDiv.setStyles) {
            await SecondDiv.setStyles([secondBackgroundStyle]);
          }
        }

        // Create heading as child of innerdiv
        const tempHeading = await innerdiv.append(webflow.elementPresets.Heading);
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

        // Create paragraph as child of innerdiv
        const tempParagraph = await innerdiv.append(webflow.elementPresets.Paragraph);
        if (!tempParagraph) {
          throw new Error("Failed to create paragraph");
        }
        if (tempParagraph.setStyles) {
          await tempParagraph.setStyles([paragraphStyle]);
        }
        if (tempParagraph.setTextContent) {
          const descriptionText = translations[language as keyof typeof translations].ccpa.description;
          await tempParagraph.setTextContent(descriptionText);
        }

        // Create privacy link as child of tempParagraph (if privacyUrl is available)
        let privacyLink = null;
        if (privacyUrl && privacyUrl.trim() !== "") {
          privacyLink = await tempParagraph.append(webflow.elementPresets.LinkBlock);
          if (!privacyLink) throw new Error("Failed to create privacy link");

          // Use the privacyLinkStyle that was already set up with privacyLinkPropertyMap
          // This ensures it uses paraColor and correct font size/weight
          if (privacyLink.setStyles) {
            await privacyLink.setStyles([privacyLinkStyle]);
          }

          // Set URL using setSettings method
          try {
            await privacyLink.setSettings('url', privacyUrl, {openInNewTab: true});
          } catch (error) {
          }
        
          if (privacyLink.setTextContent) {
            const translation = getTranslation(language);
            await privacyLink.setTextContent(` ${translation.moreInfo}`);
          }
        
          if (privacyLink.setDomId) {
            await privacyLink.setDomId("privacy-link");
          }
        }

        // Create buttonContainer as child of innerdiv
        const buttonContainer = await innerdiv.append(webflow.elementPresets.DivBlock);
        if (!buttonContainer) {
          throw new Error("Failed to create button container");
        }
        await buttonContainer.setStyles([buttonContainerStyle]);

        // Create prefrenceButton as child of buttonContainer
        const prefrenceButton = await buttonContainer.append(webflow.elementPresets.LinkBlock);
        if (!prefrenceButton) {
          throw new Error("Failed to create decline button");
        }
        await prefrenceButton.setStyles([Linktext]);
        await prefrenceButton.setTextContent(translations[language as keyof typeof translations].ccpa.doNotShare);
        if ((prefrenceButton as any).setDomId) {
          await (prefrenceButton as any).setDomId("do-not-share-link"); // Type assertion
        }



        handleCreatePreferencesccpa(selectedElement)
        
        // Only show popup if not creating both banners (let handleBothBanners handle it)
        if (!bothBanners) {
          setTimeout(async () => {
            setShowPopup(false);
            setShowSuccessPopup(true);
            setIsLoading(false);
            
            // No script registration for CCPA banners - only GDPR banners register scripts
            
            // Save banner details with isBannerAdded: true
            const response = await saveBannerDetails(true);
            if (response && response.ok) {
              setIsBannerAdded(true);
              // Save bannerAdded to sessionStorage
              sessionStorage.setItem('bannerAdded', 'true');
              // Dispatch custom event to notify other components
              window.dispatchEvent(new CustomEvent('bannerAddedChanged'));
            }
          }, 40000);
        }

             } catch (error) {
         webflow.notify({ type: "error", message: "An error occurred while creating the cookie banner." });
       }
     } catch (error) {
       webflow.notify({ type: "error", message: "Unexpected error occurred." });
     }
  }




  // Helper function to register ConsentBit script globally via injectScript API (same as useBannerCreation)
  const addConsentBitScriptGlobally = async (siteId: string, token: string) => {
    try {
      const injectResponse = await customCodeApi.injectScript(token, siteId);
      if (injectResponse && injectResponse.success) {
      } else {
      }
    } catch (injectError) {
      // Continue even if script injection fails
    }
  };

  const fetchAnalyticsBlockingsScriptsV2 = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        openAuthScreen();
        return;
      }

      // FORCE register scripts during banner creation - no session storage checks

      const siteIdinfo = await webflow.getSiteInfo();
      if (siteIdinfo?.siteId) {
        setCurrentSiteId(siteIdinfo.siteId);
      }
      setSiteInfo(siteIdinfo);

      const hostingScript = await customCodeApi.registerV2BannerCustomCode(token, siteIdinfo.siteId);

      if (hostingScript && hostingScript.result) {
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

          // Register ConsentBit script globally
          if (siteIdinfo?.siteId && token) {
            await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
          }

          // Script should be added by server via custom code block

        }
        catch (error) {
          // Register script even if there's an error
          if (siteIdinfo?.siteId && token) {
            await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
          }
          throw error;
        }
      } else {
        // Register ConsentBit script even if hosting script registration fails
        if (siteIdinfo?.siteId && token) {
          await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
        }
      }
    }
    catch (error) {
      // Register ConsentBit script even if there's an error
      try {
        const token = getSessionTokenFromLocalStorage();
        const siteIdinfo = await webflow.getSiteInfo();
        if (siteIdinfo?.siteId && token) {
          await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
        }
      } catch (e) {
      }
    }
  }


  // Helper function to check if an element is a child/descendant of consentbit-container
  const isElementChildOfContainer = async (element: any): Promise<boolean> => {
    try {
      if (!element) {
        return false;
      }

      // First, check if the element itself is the container
      try {
        if (typeof (element as any).getDomId === 'function') {
          const elementId = await (element as any).getDomId();
          if (elementId === 'consentbit-container') {
            return false; // Element is the container itself, not a child
          }
        }
      } catch (e) {
      }

      // Use getAllElements to find the container and check if element is inside it
      const allElements = await webflow.getAllElements();
      let consentBitContainer: any = null;

      // Find the consentbit-container
      for (const el of allElements) {
        try {
          if (typeof (el as any).getDomId === 'function') {
            const domId = await (el as any).getDomId();
            if (domId === 'consentbit-container') {
              consentBitContainer = el;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!consentBitContainer) {
        return false; // No container exists, so element can't be a child
      }

      // Check if element is inside the container by traversing up the parent chain
      const checkIfElementIsChild = async (parent: any, target: any, checked: Set<any>): Promise<boolean> => {
        if (checked.has(parent) || checked.has(target)) return false;
        checked.add(parent);

        try {
          if (parent === target) {
            return true;
          }

          const children = await parent.getChildren();
          if (children && children.length > 0) {
            for (const child of children) {
              if (child === target) {
                return true;
              }
              const isDescendant = await checkIfElementIsChild(child, target, checked);
              if (isDescendant) {
                return true;
              }
            }
          }
        } catch (e) {
          // Continue
        }
        return false;
      };

      const isInside = await checkIfElementIsChild(consentBitContainer, element, new Set());
      return isInside;
    } catch (error) {
      // Return false on error to be safe (don't block deletion if check fails)
      return false;
    }
  };

  // Helper function to find or get the consentbit-container element
  const findOrCreateConsentBitContainer = async (selectedElement: any): Promise<any> => {
    try {
      // First, check if the selected element itself is the container
      try {
        if (typeof (selectedElement as any).getDomId === 'function') {
          const elementId = await (selectedElement as any).getDomId();
          if (elementId === 'consentbit-container') {
            return selectedElement;
          }
        }
      } catch (e) {
      }

      // Search for existing consentbit-container
      const allElements = await webflow.getAllElements();
      for (const el of allElements) {
        try {
          if (typeof (el as any).getDomId === 'function') {
            const domId = await (el as any).getDomId();
            if (domId === 'consentbit-container') {
              return el;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // No container found, use selected element and set it as container
      return selectedElement;
    } catch (error) {
      // Fallback to selected element
      return selectedElement;
    }
  };

  // Helper function to check if selected element is a child of consentbit-container
  const isSelectedElementChildOfContainer = async (selectedElement: any): Promise<boolean> => {
    try {
      let currentElement: any = selectedElement;
      const checkedElements = new Set();
      let isChildOfContainer = false;
      let depth = 0;
      const maxDepth = 20; // Prevent infinite loops
      
      // List of banner element IDs that indicate the element is inside a banner structure
      const bannerElementIds = [
        'consent-banner',
        'initial-consent-banner',
        'main-banner',
        'main-consent-banner',
        'consentbit-preference_div',
        'toggle-consent-btn',
        'preferences-btn',
        'decline-btn',
        'accept-btn',
        'privacy-link'
      ];
      
      if (!currentElement) {
        return false;
      }
      
      // First, check if the selected element itself has the consentbit-container ID or is a banner element
      let selectedElementId: string | null = null;
      try {
        if (typeof (currentElement as any).getDomId === 'function') {
          selectedElementId = await (currentElement as any).getDomId();
          
          // If selected element IS the container, allow it
          if (selectedElementId === 'consentbit-container') {
            return false; // Not a child, it IS the container
          }
          
          // If selected element is a banner element, it's definitely a child of the container
          // CRITICAL: This check MUST return immediately - don't continue to parent traversal
          if (selectedElementId && bannerElementIds.includes(selectedElementId)) {
            return true; // It's a child of the container - RETURN IMMEDIATELY
          }
          
          // Log if ID exists but wasn't in banner list
          if (selectedElementId) {
          }
        } else {
        }
      } catch (e) {
        // Element might be invalid, try getAllElements method
      }
      
      // If we couldn't get the DOM ID or element is invalid, use getAllElements to find container and check
      // This is a fallback method that works even if element references become invalid
      if (!selectedElementId || selectedElementId === null) {
        try {
          const allElements = await webflow.getAllElements();
          let consentBitContainer: any = null;
          let selectedElementFound = false;
          
          // Find the consentbit-container and check if selected element is inside it
          for (const element of allElements) {
            try {
              if (typeof (element as any).getDomId === 'function') {
                const domId = await (element as any).getDomId();
                
                if (domId === 'consentbit-container') {
                  consentBitContainer = element;
                }
                
                // Also check if this element matches our selected element by comparing IDs
                // Note: We can't directly compare element objects, so we check by DOM ID
                if (domId && bannerElementIds.includes(domId)) {
                  // This is a banner element, check if it's inside the container
                  if (consentBitContainer) {
                    try {
                      const containerChildren = await consentBitContainer.getChildren();
                      if (containerChildren && containerChildren.length > 0) {
                        // Check if this banner element is a child of the container
                        const checkIfBannerIsChild = async (parent: any, bannerId: string, checked: Set<any>): Promise<boolean> => {
                          if (checked.has(parent)) return false;
                          checked.add(parent);
                          
                          try {
                            const children = await parent.getChildren();
                            if (children && children.length > 0) {
                              for (const child of children) {
                                try {
                                  const childId = await (child as any).getDomId?.();
                                  if (childId === bannerId) {
                                    return true;
                                  }
                                  const isDescendant = await checkIfBannerIsChild(child, bannerId, checked);
                                  if (isDescendant) {
                                    return true;
                                  }
                                } catch (e) {
                                  continue;
                                }
                              }
                            }
                          } catch (e) {
                            // Continue
                          }
                          return false;
                        };
                        
                        const isInside = await checkIfBannerIsChild(consentBitContainer, domId, new Set());
                        if (isInside) {
                          return true;
                        }
                      }
                    } catch (e) {
                    }
                  }
                }
              }
            } catch (e) {
              continue;
            }
          }
          
          if (consentBitContainer && selectedElementId && bannerElementIds.includes(selectedElementId)) {
            return true;
          }
        } catch (e) {
        }
      }
      
      // Alternative method: Check all elements to find consentbit-container and see if selected element is inside it
      try {
        const allElements = await webflow.getAllElements();
        let consentBitContainer: any = null;
        
        // Find the consentbit-container
        for (const element of allElements) {
          try {
            if (typeof (element as any).getDomId === 'function') {
              const domId = await (element as any).getDomId();
              if (domId === 'consentbit-container') {
                consentBitContainer = element;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        // If container found, check if selected element is inside it
        if (consentBitContainer) {
          try {
            const containerChildren = await consentBitContainer.getChildren();
            
            // Check if selected element is a direct child or descendant
            const checkIfElementIsChild = async (parent: any, target: any, checked: Set<any>): Promise<boolean> => {
              if (checked.has(parent) || checked.has(target)) return false;
              checked.add(parent);
              
              try {
                if (parent === target) {
                  return true;
                }
                
                const children = await parent.getChildren();
                if (children && children.length > 0) {
                  for (const child of children) {
                    if (child === target) {
                      return true;
                    }
                    const isDescendant = await checkIfElementIsChild(child, target, checked);
                    if (isDescendant) {
                      return true;
                    }
                  }
                }
              } catch (e) {
              }
              return false;
            };
            
            const isInside = await checkIfElementIsChild(consentBitContainer, selectedElement, new Set());
            if (isInside && consentBitContainer !== selectedElement) {
              return true;
            } else if (consentBitContainer === selectedElement) {
              return false;
            }
          } catch (e) {
          }
        }
      } catch (e) {
      }
      
      // Traverse up the parent chain to check if any parent has consentbit-container ID
      while (currentElement && !checkedElements.has(currentElement) && !isChildOfContainer && depth < maxDepth) {
        checkedElements.add(currentElement);
        depth++;
        
        try {
          // Check if current element has consentbit-container ID
          let currentId: string | null = null;
          if (typeof (currentElement as any).getDomId === 'function') {
            currentId = await (currentElement as any).getDomId();
            
            // If this is a banner element, it's definitely inside the container
            if (currentId && bannerElementIds.includes(currentId)) {
              isChildOfContainer = true;
              break;
            }
          } else {
          }
          
          // If this element is consentbit-container, check if it's the selected element itself
          if (currentId === 'consentbit-container') {
            // If it's the selected element itself, allow it (user selected the container)
            if (currentElement === selectedElement) {
              isChildOfContainer = false;
              break;
            } else {
              // Selected element is a child of consentbit-container (not the container itself)
              isChildOfContainer = true;
              break;
            }
          }
          
          // Try to get parent using different methods
          let parent: any = null;
          if (typeof currentElement.getParent === 'function') {
            try {
              parent = await currentElement.getParent();
            } catch (e) {
            }
          }
          
          // Try alternative parent access methods
          if (!parent && (currentElement as any).parent) {
            parent = (currentElement as any).parent;
          }
          if (!parent && (currentElement as any).parentElement) {
            parent = (currentElement as any).parentElement;
          }
          
          if (parent) {
            currentElement = parent;
          } else {
            break;
          }
        } catch (e) {
          break;
        }
      }
      
      if (depth >= maxDepth) {
      }
      
      return isChildOfContainer;
    } catch (checkError) {
      // Return false on error to allow banner creation (fail-safe)
      return false;
    }
  };

  // Helper function to check if element has a matching style name
  const checkElementHasMatchingStyle = async (el: any, styleNamesToCheck: string[]): Promise<boolean> => {
    try {
      // Method 1: Try to access styles array directly
      if (el.styles && Array.isArray(el.styles)) {
        for (const style of el.styles) {
          if (style && typeof style === 'object') {
            const styleName = (style as any).name || (style as any).getName?.() || (style as any).styleName;
            if (styleName && typeof styleName === 'string') {
              const lowerStyleName = styleName.toLowerCase();
              if (styleNamesToCheck.some(checkName => 
                lowerStyleName.includes(checkName.toLowerCase()) || 
                lowerStyleName === checkName.toLowerCase()
              )) {
                return true;
              }
            }
          }
        }
      }

      // Method 2: Check if element has style property with name
      if ((el as any).style && typeof (el as any).style === 'object') {
        const styleName = (el as any).style.name || (el as any).style.getName?.() || (el as any).style.styleName;
        if (styleName && typeof styleName === 'string') {
          const lowerStyleName = styleName.toLowerCase();
          if (styleNamesToCheck.some(checkName => 
            lowerStyleName.includes(checkName.toLowerCase()) || 
            lowerStyleName === checkName.toLowerCase()
          )) {
            return true;
          }
        }
      }

      // Method 3: Try getAllStyles if available
      if (typeof (el as any).getAllStyles === 'function') {
        try {
          const allStyles = await (el as any).getAllStyles();
          if (allStyles && Array.isArray(allStyles)) {
            for (const style of allStyles) {
              if (style && typeof style === 'object') {
                const styleName = style.name || style.getName?.() || style.styleName;
                if (styleName && typeof styleName === 'string') {
                  const lowerStyleName = styleName.toLowerCase();
                  if (styleNamesToCheck.some(checkName => 
                    lowerStyleName.includes(checkName.toLowerCase()) || 
                    lowerStyleName === checkName.toLowerCase()
                  )) {
                    return true;
                  }
                }
              }
            }
          }
        } catch {
          // Continue if getAllStyles fails
        }
      }
    } catch {
      // Continue if style check fails
    }
    return false;
  };

  // Helper function to check if element matches banner criteria (by ID, style name, or custom attributes)
  const isBannerElement = async (el: any, idsToCheck: string[], styleNamesToCheck: string[]): Promise<boolean> => {
    try {
      // Check by DOM ID first
      try {
        const domId = await el.getDomId?.();
        if (domId && idsToCheck.includes(domId)) {
          return true;
        }
      } catch {
        // Continue if getDomId fails
      }

      // Check by custom attributes that might indicate banner elements
      // IMPORTANT: For close buttons, verify style name to avoid matching GDPR elements when creating both banners
      try {
        if (el.getCustomAttribute) {
          const consentbitAttr = await el.getCustomAttribute('consentbit').catch(() => null);
          if (consentbitAttr === 'close') {
            // For close buttons, check style name to determine if it's CCPA or GDPR
            // Only return true if it matches the style names we're checking for
            const hasMatchingStyle = await checkElementHasMatchingStyle(el, styleNamesToCheck);
            return hasMatchingStyle;
          } else if (consentbitAttr) {
            return true;
          }
        }
      } catch {
        // Continue if custom attribute check fails
      }

      // Check by style names - try multiple methods to get style name
      try {
        // Method 1: Try to access styles array directly
        if (el.styles && Array.isArray(el.styles)) {
          for (const style of el.styles) {
            if (style && typeof style === 'object') {
              const styleName = (style as any).name || (style as any).getName?.() || (style as any).styleName;
              if (styleName && typeof styleName === 'string') {
                const lowerStyleName = styleName.toLowerCase();
                if (styleNamesToCheck.some(checkName => 
                  lowerStyleName.includes(checkName.toLowerCase()) || 
                  lowerStyleName === checkName.toLowerCase()
                )) {
                  return true;
                }
              }
            }
          }
        }

        // Method 2: Check if element has style property with name
        if ((el as any).style && typeof (el as any).style === 'object') {
          const styleName = (el as any).style.name || (el as any).style.getName?.() || (el as any).style.styleName;
          if (styleName && typeof styleName === 'string') {
            const lowerStyleName = styleName.toLowerCase();
            if (styleNamesToCheck.some(checkName => 
              lowerStyleName.includes(checkName.toLowerCase()) || 
              lowerStyleName === checkName.toLowerCase()
            )) {
              return true;
            }
          }
        }

        // Method 3: Try getAllStyles if available
        if (typeof (el as any).getAllStyles === 'function') {
          try {
            const allStyles = await (el as any).getAllStyles();
            if (allStyles && Array.isArray(allStyles)) {
              for (const style of allStyles) {
                if (style && typeof style === 'object') {
                  const styleName = style.name || style.getName?.() || style.styleName;
                  if (styleName && typeof styleName === 'string') {
                    const lowerStyleName = styleName.toLowerCase();
                    if (styleNamesToCheck.some(checkName => 
                      lowerStyleName.includes(checkName.toLowerCase()) || 
                      lowerStyleName === checkName.toLowerCase()
                    )) {
                      return true;
                    }
                  }
                }
              }
            }
          } catch {
            // Continue if getAllStyles fails
          }
        }
      } catch {
        // Continue if style check fails
      }

      return false;
    } catch {
      return false;
    }
  };

  //gdpr banner
  const gdpr = async (skipCommonDiv: boolean = false, bothbanners:boolean=false, targetDiv?: any) => {
    setShowPopup(false);
    setShowLoadingPopup(true);
    setIsLoading(true);
    // COMMENTED OUT: const isBannerAlreadyAdded = localStorage.getItem("cookieBannerAdded") === "true";
    // const isBannerAlreadyAdded = getAuthStorageItem("cookieBannerAdded") === "true";
    try {

      // Comprehensive check and removal of ALL banner-related elements before creating new ones
      // GDPR is common for both banners, so it should remove ALL elements (GDPR + CCPA)
      const allElements = await webflow.getAllElements();
      // Include all possible banner element IDs (both GDPR and CCPA)
      const idsToCheck = [
        "consent-banner", 
        "main-banner", 
        "toggle-consent-btn",
        "initial-consent-banner",
        "main-consent-banner",
        "consentbit-preference_div",
        "preferences-btn",
        "decline-btn",
        "accept-btn",
        "privacy-link",
        "close-consent-banner",
        "close-consent",
        "do-not-share-link"
      ];

      // Include all possible banner style names (both GDPR and CCPA)
      const styleNamesToCheck = [
        "consentbit-gdpr_banner_div",
        "consentbit-gdpr_banner_text",
        "consentbit-banner_button_container",
        "consentbit-banner_button_preference",
        "consentbit-banner_button_decline",
        "consentbit-banner_accept",
        "consentbit-banner_headings",
        "consentbit-innerdiv",
        "consentbit-banner_second-bg",
        "close-consent",
        "consentbit-privacy-link-gdpr-banner",
        "consentbit-ccpa-banner-div",
        "consentbit-ccpa-banner-text",
        "consentbit-ccpa-button-container",
        "consentbit-ccpa-banner-heading",
        "consentbit-ccpa-linkblock",
        "consentbit-ccpa-privacy-link",
        "consentbit-ccpa-innerdiv",
        "consentbit-banner-ccpasecond-bg",
        "close-consentbit",
        "consentbit-preference_div"
      ];

      // Check all elements by both ID and style names
      const elementChecks = await Promise.all(
        allElements.map(async (el) => {
          const isBanner = await isBannerElement(el, idsToCheck, styleNamesToCheck);
          return { el, isBanner };
        })
      );

      // Filter matching elements
      const matchingElements = elementChecks
        .filter(({ isBanner }) => isBanner)
        .map(({ el }) => el);

      // Remove ALL matching elements to prevent duplicates - regardless of container relationship
      if (matchingElements.length > 0) {
        await Promise.all(matchingElements.map(async (el) => {
          try {
            const domId = await el.getDomId?.().catch(() => null);
            const identifier = domId || 'element-with-banner-class';
            
            // Remove all children first
            try {
              const children = await el.getChildren?.();
              if (children && children.length > 0) {
                await Promise.all(children.map(child => child.remove()));
              }
            } catch (childErr) {
            }

            // Remove the element itself
            await el.remove();
          } catch (err) {
            // Continue even if removal fails
          }
        }));
      } else {
      }

      // Use provided targetDiv if available, otherwise get selected element
      const selectedElement = targetDiv ;
      if (!selectedElement) {
        webflow.notify({ type: "error", message: "No element selected in the Designer." });
        setIsLoading(false); // Reset loading state
        return;
      }

      // Check if the selected element is a child of consentbit-container
      const isChildOfContainer = await isSelectedElementChildOfContainer(selectedElement);
      if (isChildOfContainer) {
        setShowPopup(false);
        setShowLoadingPopup(false);
        setIsLoading(false);
        setShowChildContainerErrorPopup(true);
        return;
      }

      // Check if the selected element can have children
      if (!selectedElement?.children) {
        webflow.notify({ type: "error", message: "Selected element cannot have children." });
        setIsLoading(false);
        return;
      }

      // Add ConsentBit class name to the selected element
      try {
        const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
        if (selectedElement.setStyles) {
          await selectedElement.setStyles([consentBitStyle]);
        }
      } catch (error) {
        // Continue if style application fails
      }

      // Set DOM ID 'consentbit-container' on the selected element
      try {
        // Check if DOM ID is already set
        let existingDomId: string | null = null;
        try {
          if ((selectedElement as any).getDomId) {
            existingDomId = await (selectedElement as any).getDomId();
          }
        } catch (e) {
          // Continue if we can't get DOM ID - element might be in transition
        }

        // Set DOM ID if not already set
        if (existingDomId !== 'consentbit-container') {
          try {
            if ((selectedElement as any).setDomId) {
              await (selectedElement as any).setDomId("consentbit-container");
            } else if (selectedElement.setCustomAttribute) {
              await selectedElement.setCustomAttribute("id", "consentbit-container");
            } else if ((selectedElement as any).setAttribute) {
              await (selectedElement as any).setAttribute("id", "consentbit-container");
            }
          } catch (domIdSetError: any) {
            // Handle "Missing element" error gracefully - element reference became invalid
            // This usually means the ID was set but element was modified by Webflow
            if (domIdSetError?.message && domIdSetError.message.includes("Missing element")) {
              // Silently continue - ID was likely set before element became invalid
            } else {
            }
            // Continue even if DOM ID setting fails
          }
        } else {
          // DOM ID already set - no need to verify or retry
        }
      } catch (domIdError: any) {
        // Handle "Missing element" error gracefully - don't log as error
        if (domIdError?.message && domIdError.message.includes("Missing element")) {
          // Silently continue - element reference became invalid but ID was likely set
        } else {
        }
        // Continue even if DOM ID setting fails
      }

      // Final double-check: Ensure no duplicate consent-banner exists right before creating (check by ID and class names)
      const allElementsFinalCheck = await webflow.getAllElements();
      const finalCheckIds = ["consent-banner"];
      const finalCheckStyleNames = [
        "consentbit-gdpr_banner_div",
        "consentbit-ccpa-banner-div"
      ];
      
      const finalElementChecks = await Promise.all(
        allElementsFinalCheck.map(async (el) => {
          const isBanner = await isBannerElement(el, finalCheckIds, finalCheckStyleNames);
          return { el, isBanner };
        })
      );
      
      const existingConsentBanners = finalElementChecks
        .filter(({ isBanner }) => isBanner)
        .map(({ el }) => el);
      
      if (existingConsentBanners.length > 0) {
        await Promise.all(existingConsentBanners.map(async (el) => {
          try {
            const domId = await el.getDomId?.().catch(() => null);
            const identifier = domId || 'element-with-banner-class';
            
            const children = await el.getChildren?.().catch(() => []);
            if (children && children.length > 0) {
              await Promise.all(children.map(child => child.remove()));
            }
            await el.remove();
          } catch (err) {
          }
        }));
      }

      // Create newDiv as a child of the selected element
      const newDiv = await selectedElement.prepend(webflow.elementPresets.DivBlock);
      
      if (!newDiv) {
        webflow.notify({ type: "error", message: "Failed to create div." });
        setIsLoading(false);
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
        closebutton: 'close-consent',
        privacyLinkStyleName: "consentbit-privacy-link-gdpr-banner"
      };

      const styles = await Promise.all(
        Object.values(styleNames).map(async (name) => {
          return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
        })
      );

      const [
        divStyle, paragraphStyle, buttonContainerStyle, prefrenceButtonStyle, declineButtonStyle, buttonStyle, headingStyle, innerDivStyle, secondBackgroundStyle, closebutton, privacyLinkStyle
      ] = styles;

      // Apply divStyle to newDiv immediately after getting styles (before setting properties)
      if (newDiv.setStyles && divStyle) {
        try {
          await newDiv.setStyles([divStyle]);
        } catch (styleError) {
          // Try alternative method
          try {
            if ((newDiv as any).applyStyle) {
              await (newDiv as any).applyStyle(divStyle);
            }
          } catch (altError) {
          }
        }
      } else {
      }


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
        "background-color": btnColor,
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
        "background-color": secondcolor,
        "color": secondbuttontext,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };

      const linktextPropertyMap: Record<string, string> = {
        "border-radius": `${buttonRadius}px`,
        "cursor": "pointer",
        "background-color": "transparent !important",
        "color": paraColor,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
        "text-decoration": "none !important",
        "font-family": Font,
        "font-size": "16px", // Match paragraph font size
        "font-weight": `${weight === "Regular" ? 500 : weight === "Medium" ? 600 : weight === "Semi Bold" ? 700 : weight === "Bold" ? 700 : parseInt(weight) + 100 || 500}`, // Slightly bolder than paragraph
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

      const privacyLinkPropertyMap: Record<string, string> = {
        "color": paraColor,
        "text-decoration": "none !important",
        "font-size": "16px", // Match paragraph font size
        "font-weight": `${weight === "Regular" ? 500 : weight === "Medium" ? 600 : weight === "Semi Bold" ? 700 : weight === "Bold" ? 700 : parseInt(weight) + 100 || 500}`,
        "font-family": Font,
        "cursor": "pointer",
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
      await closebutton.setProperties(CloseButtonPropertyMap);
      await privacyLinkStyle.setProperties(privacyLinkPropertyMap);
      // Add hover styles for underline effect on More Info link
      await privacyLinkStyle.setProperties({ "text-decoration": "underline" }, { breakpoint: "main", pseudoClass: "hover" });

      // Re-apply divStyle to newDiv after setting properties to ensure it's applied
      if (newDiv.setStyles && divStyle) {
        try {
          await newDiv.setStyles([divStyle]);
        } catch (styleError) {
          // Try alternative method
          try {
            if ((newDiv as any).applyStyle) {
              await (newDiv as any).applyStyle(divStyle);
            }
          } catch (altError) {
          }
        }
      }
      
      // Get siteId from Webflow API
      const siteInfo = await webflow.getSiteInfo();
      const siteId = siteInfo?.siteId || "";
      
      if (newDiv.setCustomAttribute) {
        await newDiv.setCustomAttribute("data-animation", animationAttribute);
        await newDiv.setCustomAttribute("data-cookie-banner", toggleStates.disableScroll ? "true" : "false");
        await newDiv.setCustomAttribute("data-site-info", siteId);
      }
      if(bothbanners=== true){
        await newDiv.setCustomAttribute("data-all-banners", "true");
      }
      else if(bothbanners=== false){
        await newDiv.setCustomAttribute("data-all-banners", "false");
      }
      try {
        // Create innerdiv as child of newDiv
        const innerdiv = await newDiv.append(webflow.elementPresets.DivBlock);
        await innerdiv.setStyles([innerDivStyle]);

        // Create Closebuttons as child of newDiv (if enabled)
        let Closebuttons = null;
        if (toggleStates.closebutton) {
          Closebuttons = await newDiv.append(webflow.elementPresets.DivBlock);
          if (!Closebuttons) {
            throw new Error("Failed to create close button div");
          }

          // Set DOM ID on close button container FIRST (for GDPR: "close-consent" to match style name)
          if ((Closebuttons as any).setDomId) {
            await (Closebuttons as any).setDomId("close-consent");
          }
          
          if (Closebuttons.setStyles) {
            await Closebuttons.setStyles([closebutton]);
            await Closebuttons.setCustomAttribute("consentbit", "close");
            
            // Create Image element and set X-Vector.svg as asset (same approach as toggle icon)
            let imageElement: any = null;
            
            try {
              // Create the image element
              imageElement = await Closebuttons.append(webflow.elementPresets.Image);
              
              if (!imageElement) {
                throw new Error("Failed to create image element");
              }

              // Create the asset in Webflow
              const asset = await getOrCreateCloseIconAsset(color);
              
              // Set the asset to the image element
              await (imageElement as any).setAsset(asset);
              
              // Style the image to match close button size
              const imageStyle =
                (await webflow.getStyleByName("consentCloseIcon")) ||
                (await webflow.createStyle("consentCloseIcon"));
              
              await imageStyle.setProperties({
                "width": "16px",
                "height": "16px",
                "display": "block"
              });
              
              await (imageElement as any).setStyles?.([imageStyle]);
              
              // Set DOM ID for close button icon (optional - container already has ID)
              if ((imageElement as any).setDomId) {
                await (imageElement as any).setDomId("close-consent-banner-icon");
              }
            } catch (error) {
              // Error creating close icon image element - container is still created with DOM ID
            }
          }
        }

        // Create SecondDiv as child of innerdiv (if alignstyle)
        let SecondDiv;
        if (style === "alignstyle") {
          SecondDiv = await innerdiv.append(webflow.elementPresets.DivBlock);
          if (SecondDiv.setStyles) {
            await SecondDiv.setStyles([secondBackgroundStyle]);
          }
        }

        // Create heading as child of innerdiv
        const tempHeading = await innerdiv.append(webflow.elementPresets.Heading);
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

        // Create paragraph as child of innerdiv
        const tempParagraph = await innerdiv.append(webflow.elementPresets.Paragraph);
        if (!tempParagraph) {
          throw new Error("Failed to create paragraph");
        }
        if (tempParagraph.setStyles) {
          await tempParagraph.setStyles([paragraphStyle]);
        }
        if (tempParagraph.setTextContent) {
          const descriptionText = translations[language as keyof typeof translations].description;
          await tempParagraph.setTextContent(descriptionText);
        }

        // Create privacy link as child of tempParagraph (if privacyUrl is available)
        // IMPORTANT: Create privacy link AFTER setting paragraph text to ensure proper ordering
        if (privacyUrl && privacyUrl.trim() !== "") {
          try {
            const privacyLink = await tempParagraph.append(webflow.elementPresets.LinkBlock);
            if (privacyLink) {
              // Use the privacyLinkStyle that was already set up with privacyLinkPropertyMap
              // This ensures it uses paraColor and correct font size/weight
              if (privacyLink.setStyles) {
                await privacyLink.setStyles([privacyLinkStyle]);
              }

              // Set URL using setSettings method
              await privacyLink.setSettings('url', privacyUrl, {openInNewTab: true});
            
              if (privacyLink.setTextContent) {
                const translation = getTranslation(language);
                await privacyLink.setTextContent(` ${translation.moreInfo}`);
              }
            
              // Set DOM ID for privacy link
              if (privacyLink.setDomId) {
                await privacyLink.setDomId("privacy-link");
              }
            }
          } catch (error) {
            // Error creating privacy link - continue without it
          }
        }

        // Create buttonContainer as child of innerdiv
        const buttonContainer = await innerdiv.append(webflow.elementPresets.DivBlock);
        if (!buttonContainer) {
          throw new Error("Failed to create button container");
        }
        await buttonContainer.setStyles([buttonContainerStyle]);

        // Create buttons as children of buttonContainer
        const prefrenceButton = await buttonContainer.append(webflow.elementPresets.Button);
        if (!prefrenceButton) {
          throw new Error("Failed to create preferences button");
        }
        await prefrenceButton.setStyles([prefrenceButtonStyle]);
        await prefrenceButton.setTextContent(translations[language as keyof typeof translations].preferences);
        if ((prefrenceButton as any).setDomId) {
          await (prefrenceButton as any).setDomId("preferences-btn"); // Type assertion
        }

        const declineButton = await buttonContainer.append(webflow.elementPresets.Button);
        if (!declineButton) {
          throw new Error("Failed to create decline button");
        }
        await declineButton.setStyles([declineButtonStyle]);
        await declineButton.setTextContent(translations[language as keyof typeof translations].reject);
        if ((declineButton as any).setDomId) {
          await (declineButton as any).setDomId("decline-btn"); // Type assertion
        }

        const acceptButton = await buttonContainer.append(webflow.elementPresets.Button);
        if (!acceptButton) {
          throw new Error("Failed to create accept button");
        }
        await acceptButton.setStyles([buttonStyle]);
        await acceptButton.setTextContent(translations[language as keyof typeof translations].accept);
        if ((acceptButton as any).setDomId) {
          await (acceptButton as any).setDomId("accept-btn"); // Type assertion
        }


        handleCreatePreferences(skipCommonDiv, selectedElement);
        
        // Only show popup if not creating both banners (let handleBothBanners handle it)
        if (!bothbanners) {
          setTimeout(async () => {
            setShowPopup(false);
            setShowSuccessPopup(true);
            setIsLoading(false);
            
            // Register ConsentBit script globally using inline script registration - ONLY for GDPR banners
            try {
              const token = getSessionTokenFromLocalStorage();
              const siteInfo = await webflow.getSiteInfo();
              if (token && siteInfo?.siteId) {
                await addConsentBitScriptGlobally(siteInfo.siteId, token);
              }
            } catch (scriptError) {
              // Continue even if script registration fails
            }
            
            // Save banner details with isBannerAdded: true
            const response = await saveBannerDetails(true); // Pass true directly
            if (response && response.ok) {
              setIsBannerAdded(true);
              // Save bannerAdded to sessionStorage
              sessionStorage.setItem('bannerAdded', 'true');
              // Dispatch custom event to notify other components
              window.dispatchEvent(new CustomEvent('bannerAddedChanged'));
            }
          }, 45000);
        } else {
          // When creating both banners, still register script but don't show popup
          setTimeout(async () => {
            // Register ConsentBit script globally using inline script registration - ONLY for GDPR banners
            try {
              const token = getSessionTokenFromLocalStorage();
              const siteInfo = await webflow.getSiteInfo();
              if (token && siteInfo?.siteId) {
                await addConsentBitScriptGlobally(siteInfo.siteId, token);
              }
            } catch (scriptError) {
              // Continue even if script registration fails
            }
          }, 45000);
        }

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
     const targetDiv = await webflow.getSelectedElement();
      if (!targetDiv) {
        webflow.notify({ type: "error", message: "No element selected in the Designer." });
        setIsLoading(false); // Reset loading state
        return;
      }

    await gdpr(true,true,targetDiv);
    await ccpabanner(targetDiv, true); // Pass true to indicate both banners are being created
    
    // Show success popup after both banners and preferences are created
    // Wait for the longer preference creation time (GDPR: 45s, CCPA: 40s)
    setTimeout(async () => {
      setShowPopup(false);
      setShowSuccessPopup(true);
      setIsLoading(false);
      
      // Save banner details with isBannerAdded: true
      const response = await saveBannerDetails(true);
      if (response && response.ok) {
        setIsBannerAdded(true);
        // Save bannerAdded to sessionStorage
        sessionStorage.setItem('bannerAdded', 'true');
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('bannerAddedChanged'));
      }
    }, 45000); // Wait 45 seconds (GDPR preference time) to ensure both preferences are created
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCookieExpiration(e.target.value);
  };

  const handlePrivacyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces from the input value
    const valueWithoutSpaces = e.target.value.replace(/\s/g, '');
    setPrivacyUrl(valueWithoutSpaces);
  };

  //banner details
  const saveBannerDetails = async (bannerAdded?: boolean) => {
    try {
      // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
      const userinfo = getAuthStorageItem("consentbit-userinfo");
      if (!userinfo) {
        return;
      }
      const tokenss = JSON.parse(userinfo);
      const tokewern = tokenss.sessionToken;
      const siteIdinfo = await webflow.getSiteInfo();
      if (siteIdinfo?.siteId) {
        setCurrentSiteId(siteIdinfo.siteId);
      }
      setSiteInfo(siteIdinfo);
      if (!tokewern) {
        return;
      }
             const bannerData = {
        siteId: siteIdinfo?.siteId,
        cookieExpiration: cookieExpiration,
        privacyUrl: privacyUrl,
        bgColor: color,
        activeTab: activeTab,
        activeMode: "Advanced", // Add back to satisfy type requirement
        selectedtext: selectedtext,
        // fetchScripts is not saved to server - it's only a local UI state
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
        isBannerAdded: bannerAdded !== undefined ? bannerAdded : isBannerAdded,
        color: color

      }
      const response = await customCodeApi.saveBannerStyles(tokewern, bannerData);
      if (response.ok) {
        return response;
      }
      return null;
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
      // Get current site ID for the API call
      const siteInfo = await webflow.getSiteInfo();
      const siteId = siteInfo?.siteId;
      
      if (!siteId) {
        throw new Error('No site ID available');
      }

      const response = await fetch(`${base_url}/api/payment/subscription?siteId=${siteId}`, {
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
    // Clear subscription cache on app reload to ensure fresh data
    sessionStorage.removeItem('subscription_status');
    
    const accessToken = getSessionTokenFromLocalStorage();
    const fetchSubscription = async () => {
      try {
        if (!accessToken) {
          setSubscriptionChecked(true);
          openAuthScreen();
          return;
        }
        
        // Always check subscription fresh on app reload
        const result = await checkSubscription(accessToken);

        // Check if any domain has isSubscribed === true
        const hasSubscription = result.subscriptionStatuses?.some(
          (status: { isSubscribed: boolean }) => status.isSubscribed === true
        );

        setIsSubscribed(Boolean(hasSubscription));
        
        // Cache subscription status in sessionStorage for current session
        sessionStorage.setItem('subscription_status', JSON.stringify(hasSubscription));
         } catch (error) {
         // Error handling
       } finally {
         // Always mark subscription as checked when done
         setSubscriptionChecked(true);
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
      
      // Always try to register script - removed duplicate check

      // Ensure siteInfo is available
      let currentSiteInfo = siteInfo;
      if (!currentSiteInfo) {
        currentSiteInfo = await webflow.getSiteInfo();
        if (currentSiteInfo?.siteId) {
          setCurrentSiteId(currentSiteInfo.siteId);
        }
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
          
          // Mark V2 consent script as registered for this version in this session
        //  sessionStorage.setItem(`v2_consent_script_registered_${appVersion}`, 'true');
        } catch (error) {
        }
      }
     }

     catch (error) {
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
    "Polish",
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
          <p className="hello">Hello{user?.firstName ? `, ${user.firstName}` : ''}!</p>
        </div>

        <NeedHelp />
      </div>

                                         {/* Tab Navigation Section */}
         <div className="configuration">
           <div className="tabs">
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Settings" ? "active" : ""}`}
                 onClick={() => handleSetActiveTab("Settings")}
               >
                 Settings
               </button>
             </div>
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Customization" ? "active" : ""}`}
                 onClick={() => handleSetActiveTab("Customization")}
               >
                 Customization
               </button>
             </div>
             <div className="tab-button-wrapper">
               <button
                 className={`tab-button ${activeTab === "Script" ? "active" : ""}`}
                 onClick={() => handleSetActiveTab("Script")}
               >
                 Script
               </button>
             </div>
           </div>
        <div className="component-width">
          {!subscriptionChecked ? (
            <div className="subscribe">
            </div>
          ) : !isSubscribed ? (
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
                    try {
                      const selectedElement = await webflow.getSelectedElement() as { type?: string };
                      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

                      if (isInvalidElement) {
                        setShowTooltip(true);
                        setShowPopup(false);
                        return;
                      }

                      // Wait a moment before checking to ensure element selection is stable
                      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
                      
                      // Re-get the selected element after delay to ensure it's still selected
                      const currentSelectedElement = await webflow.getSelectedElement() as { type?: string };
                      if (!currentSelectedElement) {
                        setShowTooltip(true);
                        setShowPopup(false);
                        return;
                      }

                      // Check if the selected element is a child of consentbit-container BEFORE showing popup
                      
                      try {
                        const isChildOfContainer = await isSelectedElementChildOfContainer(currentSelectedElement);
                        
                        if (isChildOfContainer) {
                          setShowTooltip(false);
                          setShowPopup(false);
                          setShowChildContainerErrorPopup(true);
                          return; // Exit early - don't proceed to authentication or popup
                        } else {
                        }
                      } catch (checkError) {
                        // If check fails, allow to proceed (fail-safe)
                      }

                      // Try authentication check with fallback
                      let isUserValid = false;
                      try {
                        isUserValid = await isAuthenticatedForCurrentSite();
                      } catch (authError) {
                        // If auth check fails, try silent auth first
                        try {
                          await attemptSilentAuth();
                          isUserValid = await isAuthenticatedForCurrentSite();
                        } catch (silentAuthError) {
                          // If silent auth fails, open OAuth window
                          openAuthScreen();
                          return;
                        }
                      }

                      if (isUserValid) {
                        setShowTooltip(false);
                        setShowPopup(true);
                      } else {
                        setShowTooltip(false);
                        openAuthScreen();
                      }
                    } catch (error) {
                      setShowTooltip(false);
                      openAuthScreen(); // Fallback to OAuth on any error
                    }
                  }}
                >
                  Publish your changes
                </button>

              </div>
            </div>

          )}

          {activeTab === "Script" && (
            <div>
              <button
                className="publish-buttons"
                onClick={async () => {
                  try {
                    // Try authentication check with fallback
                    let isUserValid = false;
                    try {
                      isUserValid = await isAuthenticatedForCurrentSite();
                    } catch (authError) {
                      // If auth check fails, try silent auth first
                      try {
                        await attemptSilentAuth();
                        isUserValid = await isAuthenticatedForCurrentSite();
                      } catch (silentAuthError) {
                        // If silent auth fails, open OAuth window
                        openAuthScreen();
                        return;
                      }
                    }

                    if (isUserValid) {
                      // Trigger script scanning
                      setTriggerScan(true);
                    } else {
                      openAuthScreen();
                    }
                  } catch (error) {
                    openAuthScreen(); // Fallback to OAuth on any error
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
            <span>To continue, choose an element inside the page Body.</span>
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
                  {/* <div className="warning-container">
                    <div className="warning-icon">
                      <img src={warningicon} alt="warning" />
                      </div>
                      <div className="warning-text">
                       Before proceeding, make sure you're not selecting the ConsentBit element in the Webflow Designer.
                        </div></div> */}
                  <div className="message-container">
                    <div className="message-icon">
                      <img src={messageicon} alt="message" />
                       </div>
                       <div className="message-text">
                           <span> Hang tight! We're updating your banner with the latest changes.</span> 
                           <span >Applying your updates to the project now!</span>
                        </div>
                      </div>
                      <div className="line-separator">

                      </div>
                  
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
                    onClick={async () => {
                      const targetDiv = await webflow.getSelectedElement();
                      if (!targetDiv) {
                        webflow.notify({ type: "error", message: "No element selected in the Designer." });
                        setIsLoading(false);
                        return;
                      }
                      
                      await gdpr(false, false, targetDiv);
                    }}
                  >
                    {isLoading ? (
                      <span>wait...</span>
                    ) : (
                      "Confirm"
                    )}
                  </button>) : selectedOptions.includes("U.S. State Laws") ?
                    (<button
                      className="confirm-button"
                      onClick={async () => {
                        const targetDiv = await webflow.getSelectedElement();
                        if (!targetDiv) {
                          webflow.notify({ type: "error", message: "No element selected in the Designer." });
                          setIsLoading(false);
                          return;
                        }
                        
                        await ccpabanner(targetDiv);
                      }}
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

      {showChildContainerErrorPopup && (
        <div className="popup-overlay">
          <div className="success-popup">
            <p>Please select the ConsentBit container to update the banner.</p>
            <button onClick={() => setShowChildContainerErrorPopup(false)}>Close</button>
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

                <div className="settings-group">
                  <div className="flex">
                    <label htmlFor="privacyUrl">Privacy URL</label>
                    <div className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text1">Link to your privacy policy page.</span>
                    </div>
                  </div>
                  <input
                    type="url"
                    id="privacyUrl"
                    placeholder="https://example.com/privacy-policy"
                    value={privacyUrl}
                    onChange={handlePrivacyUrlChange}
                  />
                </div>

                <div className="compliance-container">
                  <label className="compliance">
                    <span className="compliance">Compliance</span>
                    <span className="tooltip-container">
                      <img src={questionmark} alt="info" className="tooltip-icon" />
                      <span className="tooltip-text">Specifies the type of cookie compliance standard, like GDPR or CCPA.</span>
                    </span>
                  </label>

                 <div className="checkbox-group">
  {["U.S. State Laws", "GDPR"].map((option) => {
    const isChecked = selectedOptions.includes(option);
    const isDisabled = option === "GDPR";

    return (
      <label key={option} className="cookie-category">
        <input
          type="checkbox"
          value={option}
          checked={isChecked}
          disabled={isDisabled}
          onChange={() => handleToggles(option)}
        />
        <span className="custom-checkbox">
          {isChecked && <img src={tickmark} alt="checked" className="tick-icon" />}
        </span>
        <span className="category-name">{option}</span>
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
                {/* Tabs: GDPR / US State Law */}
                <div className="preview-tabs">
                  <button
                    type="button"
                    className={`preview-tab ${previewMode === 'gdpr' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('gdpr')}
                  >
                    GDPR
                  </button>
                  {showCCPAPreview && (
                    <button
                      type="button"
                      className={`preview-tab ${previewMode === 'ccpa' ? 'active' : ''}`}
                      onClick={() => setPreviewMode('ccpa')}
                    >
                      U.S. State Laws
                    </button>
                  )}
                </div>
                <div className="preview-area">
                  <div className="topbar">
                    <img src={dots} alt="dots" className="threedots" />
                  </div>
                  <div className="consentbit-logo">
                    <img src={logo} alt="dots" />
                  </div>
                  {/* GDPR banner */}
                  {previewMode === 'gdpr' && (
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
                      ...(previewDimensions.minHeight ? { height: previewDimensions.minHeight } : {}),
                      borderRadius: `${borderRadius}px`,
                      backgroundColor: color,
                      fontSize: `${size}px`,
                    }}
                  >

                    {style === "alignstyle" && <div className="secondclass" style={{ backgroundColor: bgColors, borderBottomRightRadius: `${borderRadius}px`, borderTopRightRadius: `${borderRadius}px` }}></div>}
                    {toggleStates.closebutton && closeIconSvg ? (
                      <img 
                        id="close-consent-banner"
                        src={closeIconSvg} 
                        alt="Close" 
                        className="closebutton" 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          cursor: "pointer",
                          top: "8px"
                        }}
                      />
                    ) : ""}
                    <div className="space" style={{ color: headColor, fontWeight: weight, display: "flex", justifyContent: "space-between", fontFamily: Font }}>
                      <h4 style={{ textAlign: selectedtext as "left" | "center" | "right", fontFamily: Font }}>

                        {translations[language as keyof typeof translations]?.heading || "Cookie Settings"}
                      </h4>
                    </div>
                    <div className="padding" style={{ color: paraColor }}>
                      <span>

                        {translations[language as keyof typeof translations]?.description || "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you."}
                      </span>
                      {privacyUrl && (
                        <span>
                          {" "}
                          <a 
                            href={privacyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: paraColor, 
                              textDecoration: "none",
                              fontSize: `${typeof size === 'number' ? size - 2 : 12}px`,
                              fontFamily: Font
                            }}
                            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "underline"}
                            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "none"}
                          >
                            {translations[language as keyof typeof translations]?.moreInfo || "More Info"}
                          </a>
                        </span>
                      )}
                    </div>
                    <div className="button-wrapp" style={{ justifyContent: style === "centeralign" ? "center" : undefined, }}>
                      <button className="btn-preferences" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: secondcolor, color: secondbuttontext, fontFamily: Font } as React.CSSProperties} >{translations[language as keyof typeof translations]?.preferences || "Preferences"}</button>
                      <button className="btn-reject" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: secondcolor, color: secondbuttontext, fontFamily: Font } as React.CSSProperties} >{translations[language as keyof typeof translations]?.reject || "Reject"}</button>
                      <button className="btn-accept" style={{ borderRadius: `${buttonRadius}px`, backgroundColor: btnColor, color: primaryButtonText, fontFamily: Font } as React.CSSProperties} >{translations[language as keyof typeof translations]?.accept || "Accept"}</button>
                    </div>
                  </div>
                  )}
                {/* US State Law (CCPA) preview */}
                 {showCCPAPreview && previewMode === 'ccpa' && (
                <div
                  className={`cookie-banner ccpa-banner ${animation} ${isActive ? "active" : ""}`}
                  style={{
                    transition: `transform 0.5s ${easing}, opacity 0.5s ${easing}`,
                    position: "absolute",
                    ...(style !== "fullwidth" && {
                      bottom: "16px",
                      left: selected === "left" ? "16px" : selected === "center" ? "17%" : "auto",
                      right: selected === "right" ? "16px" : "auto",
                    }),
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
                  {style === "alignstyle" && (
                    <div
                      className="secondclass"
                      style={{
                        backgroundColor: bgColors,
                        borderBottomRightRadius: `${borderRadius}px`,
                        borderTopRightRadius: `${borderRadius}px`,
                      }}
                    ></div>
                  )}
                  {toggleStates.closebutton && closeIconSvg ? (
                    <img 
                      id="close-consent-banner"
                      src={closeIconSvg} 
                      alt="Close" 
                      className="closebutton" 
                      style={{ 
                        width: "8px", 
                        height: "8px", 
                        cursor: "pointer"
                      }}
                    />
                  ) : ""}
                  <div className="space" style={{ color: headColor, fontWeight: weight, display: "flex", justifyContent: "space-between", fontFamily: Font }}>
                    <h4 style={{ textAlign: selectedtext as "left" | "center" | "right", fontFamily: Font }}>
                      {translations[language as keyof typeof translations]?.ccpa?.heading || "Privacy Choices"}
                    </h4>
                  </div>
                  <div className="padding" style={{ color: paraColor }}>
                    <span>
                      {translations[language as keyof typeof translations]?.ccpa?.description || "Under US state laws, you can opt out of the sale or sharing of personal data and manage category-level choices."}
                    </span>
                    {privacyUrl && (
                      <span>
                        {" "}
                        <a 
                          href={privacyUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: paraColor, 
                            textDecoration: "none",
                            fontSize: `${typeof size === 'number' ? size - 2 : 12}px`,
                            fontFamily: Font
                          }}
                          onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "underline"}
                          onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "none"}
                        >
                          {translations[language as keyof typeof translations]?.moreInfo || "More Info"}
                        </a>
                      </span>
                    )}
                  </div>
                  <div className="button-wrapp" style={{ justifyContent: style === "centeralign" ? "center" : "flex-start" }}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: paraColor,
                        textDecoration: "none",
                        fontFamily: Font,
                        fontSize: `${typeof size === 'number' ? size : size}px`
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {translations[language as keyof typeof translations]?.ccpa?.doNotShare || "Do not share my personal info"}
                    </a>
                  </div>
                </div>
                )}
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
              privacyUrl={privacyUrl}
              setPrivacyUrl={setPrivacyUrl}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
            />
          )}

          {activeTab === "Script" && <Script fetchScripts={triggerScan} setFetchScripts={setTriggerScan} />}
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


