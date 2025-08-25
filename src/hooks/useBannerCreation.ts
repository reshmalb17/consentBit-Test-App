import { useState } from 'react';
import { useAppState } from './useAppState';

export interface BannerConfig {
  color: string;
  bgColor: string;
  btnColor: string;
  paraColor: string;
  secondcolor: string;
  bgColors: string;
  headColor: string;
  secondbuttontext: string;
  primaryButtonText: string;
  Font: string;
  style: string;
  selected: string;
  weight: string;
  borderRadius: number;
  buttonRadius: number;
  animation: string;
  easing: string;
  language: string;
  selectedOptions?: string[];
  toggleStates: {
    customToggle: boolean;
    disableScroll: boolean;
    closebutton: boolean;
  };
}

export const useBannerCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessPublish, setShowSuccessPublish] = useState(false);
  
  const {
    bannerBooleans,
  } = useAppState();

  const handleBannerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleBannerError = (error: any) => {
    // Error handling
  };

  const handleSuccessPublishProceed = () => {
    setShowSuccessPublish(false);
  };

  const handleSuccessPublishGoBack = () => {
    setShowSuccessPublish(false);
  };

  const createGDPRBanner = async (config: BannerConfig, skipCommonDiv: boolean = false) => {
    setIsCreating(true);
    setShowLoading(true);
    
    try {
      // Set bannerAdded to true in localStorage
      localStorage.setItem('bannerAdded', 'true');
      
      // Set the banner boolean state
      bannerBooleans.setIsBannerAdded(true);
      
      // Don't set showSuccessPublish here - let the App component handle the success flow
      // setShowSuccessPublish(true);
    } catch (error) {
      handleBannerError(error);
    } finally {
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  const createCCPABanner = async (config: BannerConfig) => {
    setIsCreating(true);
    setShowLoading(true);
    
    try {
      // Set bannerAdded to true in localStorage
      localStorage.setItem('bannerAdded', 'true');
      
      // Set the banner boolean state
      bannerBooleans.setIsBannerAdded(true);
      
      // Don't set showSuccessPublish here - let the App component handle the success flow
      // setShowSuccessPublish(true);
    } catch (error) {
      handleBannerError(error);
    } finally {
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  const createBothBanners = async (config: BannerConfig) => {
    setIsCreating(true);
    setShowLoading(true);
    
    try {
      // First, remove existing banners before creating new ones
      const allElements = await webflow.getAllElements();
      const idsToCheck = ["consent-banner", "main-banner", "toggle-consent-btn", "initial-consent-banner", "main-consent-banner"];

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

      // Import the actual banner creation functions
      const { default: createCookiePreferences } = await import('../hooks/gdprPreference');
      const { default: createCookieccpaPreferences } = await import('../hooks/ccpaPreference');
      
      // Get the selected options from the config (this should be passed from ConfirmPublish)
      const selectedOptions = config.selectedOptions || ['GDPR', 'U.S. State Laws'];
      
      // Create banners based on user selection
      if (selectedOptions.includes('GDPR') && selectedOptions.includes('U.S. State Laws')) {
        // Create both GDPR and CCPA banners
        const selectedPreferences = ['essential', 'marketing', 'preferences', 'analytics'];
        await createCookiePreferences(
          selectedPreferences,
          config.language,
          config.color,
          config.btnColor,
          config.headColor,
          config.paraColor,
          config.secondcolor,
          config.buttonRadius,
          config.animation,
          config.toggleStates.customToggle,
          config.primaryButtonText,
          config.secondbuttontext,
          false, // skipCommonDiv
          config.toggleStates.disableScroll,
          config.toggleStates.closebutton
        );
        
        await createCookieccpaPreferences(
          config.language,
          config.color,
          config.btnColor,
          config.headColor,
          config.paraColor,
          config.secondcolor,
          config.buttonRadius,
          config.animation,
          config.primaryButtonText,
          config.secondbuttontext,
          config.toggleStates.disableScroll,
          config.toggleStates.closebutton,
          false, // skipCommonDiv
          config.Font
        );
      } else if (selectedOptions.includes('GDPR')) {
        // Create only GDPR banner
        const selectedPreferences = ['essential', 'marketing', 'preferences', 'analytics'];
        await createCookiePreferences(
          selectedPreferences,
          config.language,
          config.color,
          config.btnColor,
          config.headColor,
          config.paraColor,
          config.secondcolor,
          config.buttonRadius,
          config.animation,
          config.toggleStates.customToggle,
          config.primaryButtonText,
          config.secondbuttontext,
          false, // skipCommonDiv
          config.toggleStates.disableScroll,
          config.toggleStates.closebutton
        );
      } else if (selectedOptions.includes('U.S. State Laws')) {
        // Create only CCPA banner
        await createCookieccpaPreferences(
          config.language,
          config.color,
          config.btnColor,
          config.headColor,
          config.paraColor,
          config.secondcolor,
          config.buttonRadius,
          config.animation,
          config.primaryButtonText,
          config.secondbuttontext,
          config.toggleStates.disableScroll,
          config.toggleStates.closebutton,
          false, // skipCommonDiv
          config.Font
        );
      } else {
        // Default to GDPR banner
        const selectedPreferences = ['essential', 'marketing', 'preferences', 'analytics'];
        await createCookiePreferences(
          selectedPreferences,
          config.language,
          config.color,
          config.btnColor,
          config.headColor,
          config.paraColor,
          config.secondcolor,
          config.buttonRadius,
          config.animation,
          config.toggleStates.customToggle,
          config.primaryButtonText,
          config.secondbuttontext,
          false, // skipCommonDiv
          config.toggleStates.disableScroll,
          config.toggleStates.closebutton
        );
      }
      
      // Set initialBannerAdded to true when banner is added through ConfirmPublish
      localStorage.setItem('initialBannerAdded', 'true');
      
      // Set the banner boolean state
      bannerBooleans.setIsBannerAdded(true);
      
      // Don't set showSuccessPublish here - let the App component handle the success flow
      // setShowSuccessPublish(true);
    } catch (error) {
      handleBannerError(error);
    } finally {
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  // Simple test function to isolate the issue
  const testSimpleBannerCreation = async () => {
    try {
      // Set bannerAdded to true in localStorage
      localStorage.setItem('bannerAdded', 'true');
      
      // Set the banner boolean state
      bannerBooleans.setIsBannerAdded(true);
    } catch (error) {
      throw error;
    }
  };

  return {
    createGDPRBanner,
    createCCPABanner,
    createBothBanners,
    testSimpleBannerCreation,
    isCreating,
    showLoading,
    showSuccess,
    showSuccessPublish,
    handleSuccessPublishProceed,
    handleSuccessPublishGoBack
  };
};
