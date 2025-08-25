import React, { useState } from 'react';
import { usePersistentState } from './usePersistentState';

// Types



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

// Helper function to get session token from localStorage
function getSessionTokenFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sessionToken');
  }
  return null;
}

// Custom hook to manage all application state
export const useAppState = () => {
  // Color-related states
  const [color, setColor] = usePersistentState("color", "#ffffff");
  const [bgColor, setBgColor] = usePersistentState("bgColor", "#ffffff");
  const [btnColor, setBtnColor] = usePersistentState("btnColor", "#C9C9C9");
  const [paraColor, setParaColor] = usePersistentState("paraColor", "#4C4A66");
  const [secondcolor, setSecondcolor] = usePersistentState("secondcolor", "#000000");
  const [bgColors, setBgColors] = usePersistentState("bgColors", "#798EFF");
  const [headColor, setHeadColor] = usePersistentState("headColor", "#000000");
  const [secondbuttontext, setsecondbuttontext] = usePersistentState("secondbuttontext", "#000000");
  const [primaryButtonText, setPrimaryButtonText] = usePersistentState("primaryButtonText", "#FFFFFF");

  // UI/UX states
  const [activeTab, setActiveTab] = usePersistentState("activeTab", "General Settings");
  const [activeMode, setActiveMode] = usePersistentState("activeMode", "Simple");
  const [selected, setSelected] = usePersistentState<Orientation>("selected", "right");
  const [selectedOption, setSelectedOption] = usePersistentState("selectedOption", "U.S. State Laws");
  const [selectedOptions, setSelectedOptions] = usePersistentState("selectedOptions", ["GDPR"]);
  const [selectedtext, settextSelected] = usePersistentState("selectedtext", "left");
  const [style, setStyle] = usePersistentState<BannerStyle>("style", "align");

  // Configuration states
  const [expires, setExpires] = usePersistentState("expires", "");
  const [size, setSize] = usePersistentState("size", "12");
  const [Font, SetFont] = usePersistentState("font", "");
  const [weight, setWeight] = usePersistentState("weight", "semibold");
  const [borderRadius, setBorderRadius] = usePersistentState<number>("borderRadius", 3);
  const [buttonRadius, setButtonRadius] = usePersistentState<number>("buttonRadius", 3);
  const [cookieExpiration, setCookieExpiration] = usePersistentState("cookieExpiration", "120");

  // Boolean states
  const [isActive, setIsActive] = usePersistentState("isActive", false);
  const [isLoading, setIsLoading] = usePersistentState("isLoading", false);
  const [isBannerAdded, setIsBannerAdded] = usePersistentState("isBannerAdded", false);
  const [isSubscribed, setIsSubscribed] = usePersistentState("isSubscribed", false);
  const [fetchScripts, setFetchScripts] = usePersistentState("fetchScripts", false);

  // Reset fetchScripts to false on app initialization to ensure we start from welcome screen
  React.useEffect(() => {
    setFetchScripts(false);
  }, []);

  // Function to reset all component states to initial values
  const resetComponentStates = () => {
    setIsWelcomeScreen(false);
    setIsSetUpStep(false);
    setWelcomeScipt(false);
    setIsConfirmPublish(false);
    setIsSuccessPublish(false);
    setIsCustomizationTab(false);
  };

  // Popup/Modal states
  const [showPopup, setShowPopup] = usePersistentState("showPopup", false);
  const [showSuccessPopup, setShowSuccessPopup] = usePersistentState("showSuccessPopup", false);
  const [showAuthPopup, setShowAuthPopup] = usePersistentState("showAuthPopup", false);
  const [showLoadingPopup, setShowLoadingPopup] = usePersistentState("showLoadingPopup", false);
  const [showChoosePlan, setShowChoosePlan] = usePersistentState("showChoosePlan", false);
  const [showCSVExportAdvanced, setShowCSVExportAdvanced] = usePersistentState("showCSVExportAdvanced", false);
  const [showWelcomeScreen, setShowWelcomeScreen] = usePersistentState("showWelcomeScreen", true);
  const [showSetSetup,setShowSetUpStep] = usePersistentState("showSetSetup", false); 
  const[showPopupWelcomeSetup,setShowPopupWelcomeSetup] = usePersistentState("showPopupWelcomeSetup", false); 

  // Tooltip states
  const [showTooltip, setShowTooltip] = usePersistentState("showTooltip", false);
  const [fadeOut, setFadeOut] = usePersistentState("fadeOut", false);

  // Data states
  const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);
  const [accessToken, setAccessToken] = usePersistentState<string>("accessToken", '');
  const [pages, setPages] = usePersistentState("pages", []);
  const [userlocaldata, setUserlocaldata] = usePersistentState<UserData | null>("userlocaldata", null);
  const [sessionTokenFromLocalStorage, setSessionToken] = usePersistentState<string>("sessionTokenFromLocalStorage", getSessionTokenFromLocalStorage() || '');

  // Button states
  const [buttonText, setButtonText] = usePersistentState("buttonText", "Scan Project");
  const [isExporting, setIsExporting] = usePersistentState("isExporting", false);
  const [isCSVButtonLoading, setIsCSVButtonLoading] = usePersistentState("isCSVButtonLoading", false);
  const [isWelcomeScreen, setIsWelcomeScreen] = usePersistentState("isWelcomeScreen", false);
  const [isSetUpStep, setIsSetUpStep] = usePersistentState("isSetUpStep", false);
  const [isWelcomeScipt, setWelcomeScipt] = usePersistentState("isWelcomeScipt", false);
  const [isConfirmPublish, setIsConfirmPublish] = usePersistentState("isConfirmPublish", false);
  const [isSuccessPublish, setIsSuccessPublish] = usePersistentState("isSuccessPublish", false);
  const [isCustomizationTab, setIsCustomizationTab] = usePersistentState("isCustomizationTab", false);

  // Local storage data
  const userinfo = localStorage.getItem("consentbit-userinfo");
  const tokenss = JSON.parse(userinfo || '{}');
  //Aniamation states 
  const [animation, setAnimation] = usePersistentState('animation', "fade");
  const [easing, setEasing] = usePersistentState('easing', "ease");
  const [language, setLanguage] = usePersistentState('language', "English");
  //Toggle States
   const [toggleStates, setToggleStates] = usePersistentState('toggleStates', {
      customToggle: false,
      resetInteractions: false,
      disableScroll: false,
      storeConsents: false,
      globalvariable: false,
      closebutton: false,
      donotshare: false,
    });
  

  // Return all state and setters organized by category
  return {
    // Color states
    componentStates: {
      isWelcomeScreen, setIsWelcomeScreen,
      isSetUpStep, setIsSetUpStep,
      isWelcomeScipt, setWelcomeScipt,
      isConfirmPublish, setIsConfirmPublish,
      isSuccessPublish, setIsSuccessPublish,
      isCustomizationTab, setIsCustomizationTab,
      resetComponentStates,
    },
    bannerStyles: {
      color, setColor,
      bgColor, setBgColor,
      btnColor, setBtnColor,
      paraColor, setParaColor,
      secondcolor, setSecondcolor,
      bgColors, setBgColors,
      headColor, setHeadColor,
      secondbuttontext, setsecondbuttontext,
      primaryButtonText, setPrimaryButtonText,
      size, setSize,
      Font, SetFont,
      weight, setWeight,
      borderRadius, setBorderRadius,
      isWelcomeScreen, setIsWelcomeScreen,
      isSetUpStep, setIsSetUpStep,
      isWelcomeScipt, setWelcomeScipt,
      isConfirmPublish, setIsConfirmPublish,
      isSuccessPublish, setIsSuccessPublish,
      isCustomizationTab, setIsCustomizationTab,
    },

    // UI/UX states
    bannerUI: {
      activeTab, setActiveTab,
      activeMode, setActiveMode,
      selected, setSelected,
      selectedOption, setSelectedOption,
      selectedOptions, setSelectedOptions,
      selectedtext, settextSelected,
      style, setStyle,
    },

    // Configuration states
    bannerConfig: {
      expires, setExpires,
     
      buttonRadius, setButtonRadius,
      cookieExpiration, setCookieExpiration,
    },

    // Boolean states
    bannerBooleans: {
      isActive, setIsActive,
      isLoading, setIsLoading,
      isBannerAdded, setIsBannerAdded,
      isSubscribed, setIsSubscribed,
      fetchScripts, setFetchScripts,
    },

    // Popup states
    popups: {
      showPopup, setShowPopup,
      showSuccessPopup, setShowSuccessPopup,
      showAuthPopup, setShowAuthPopup,
      showLoadingPopup, setShowLoadingPopup,
      showChoosePlan, setShowChoosePlan,
      showCSVExportAdvanced, setShowCSVExportAdvanced,
      showWelcomeScreen, setShowWelcomeScreen,
      showSetSetup,setShowSetUpStep,
      showPopupWelcomeSetup,setShowPopupWelcomeSetup
    },

    // Tooltip states
    tooltips: {
      showTooltip, setShowTooltip,
      fadeOut, setFadeOut,
    },

    // Data states
    siteData: {
      siteInfo, setSiteInfo,
      accessToken, setAccessToken,
      pages, setPages,
      userlocaldata, setUserlocaldata,
      sessionTokenFromLocalStorage, setSessionToken,
    },

    // Button states
    buttons: {
      buttonText, setButtonText,
      isExporting, setIsExporting,
      isCSVButtonLoading, setIsCSVButtonLoading,
    },

    // Local storage data
    localStorage: {
      userinfo,
      tokenss,
    },
    bannerAnimation:{
        animation, setAnimation,
        easing, setEasing,
       

    },
    bannerToggleStates:{
        toggleStates, setToggleStates,
    },
    bannerLanguages:{
        language, setLanguage,
    } ,

  };
};


