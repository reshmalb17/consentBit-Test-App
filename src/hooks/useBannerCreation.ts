import { useState } from 'react';
import { useAppState } from './useAppState';
import webflow from '../types/webflowtypes';
import createCookiePreferences from './gdprPreference';
import createCookieccpaPreferences from './ccpaPreference';
import { getSessionTokenFromLocalStorage } from '../util/Session'; 
import { customCodeApi } from '../services/api';
import { CodeApplication, ScriptRegistrationRequest } from 'src/types/types';
import { useAuth } from '../hooks/userAuth';
import { usePersistentState, getCurrentSiteId } from './usePersistentState';
import pkg from '../../package.json';
import { c } from 'framer-motion/dist/types.d-Cjd591yU';

const appVersion = pkg.version;
const base_url = "https://consentbit-test-server.web-8fb.workers.dev"


export interface BannerConfig {
  language: string;
  color: string;
  btnColor: string;
  headColor: string;
  paraColor: string;
  secondcolor: string;
  buttonRadius: number | string;
  animation: string;
  primaryButtonText: string;
  secondbuttontext: string;
  toggleStates?: {
    customToggle?: boolean;
    disableScroll?: boolean;
    closebutton?: boolean;
  };
  Font?: string;
borderRadius: number | string;
}
type BreakpointAndPseudo = {
  breakpoint: string;
  pseudoClass: string;
};
export const useBannerCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessPublish, setShowSuccessPublish] = useState(false);
  const { user, exchangeAndVerifyIdToken } = useAuth();
  const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);
  const [creationInProgress, setCreationInProgress] = useState(false);

  
  const {
    bannerBooleans,
    bannerStyles,
    bannerUI,
    bannerAnimation,
    bannerToggleStates,
    bannerLanguages
  } = useAppState();

  // Helper function to check if an element is part of a banner structure
  // Helper function to check if an element is a child/descendant of consentbit-container
  const isElementChildOfContainer = async (element: any): Promise<boolean> => {
    console.log("🔍 [useBannerCreation.isElementChildOfContainer] Checking if element is child of container:", element);
    try {
      if (!element) {
        console.log("⚠️ [useBannerCreation.isElementChildOfContainer] No element provided, returning false");
        return false;
      }

      // First, check if the element itself is the container
      try {
        if (typeof (element as any).getDomId === 'function') {
          const elementId = await (element as any).getDomId();
          if (elementId === 'consentbit-container') {
            console.log("✅ [useBannerCreation.isElementChildOfContainer] Element IS the container - not a child");
            return false; // Element is the container itself, not a child
          }
        }
      } catch (e) {
        console.log("⚠️ [useBannerCreation.isElementChildOfContainer] Error getting element DOM ID:", e);
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
              console.log("🔍 [useBannerCreation.isElementChildOfContainer] Found consentbit-container");
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!consentBitContainer) {
        console.log("ℹ️ [useBannerCreation.isElementChildOfContainer] No consentbit-container found - element is not a child");
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
      console.log(`🔍 [useBannerCreation.isElementChildOfContainer] Element is ${isInside ? 'INSIDE' : 'NOT inside'} container`);
      return isInside;
    } catch (error) {
      console.error("❌ [useBannerCreation.isElementChildOfContainer] Error checking if element is child of container:", error);
      // Return false on error to be safe (don't block deletion if check fails)
      return false;
    }
  };

  const isElementPartOfBanner = async (element: any): Promise<boolean> => {
    try {
      if (!element) return false;

      // List of banner-related DOM IDs (excluding consentbit-container which is allowed)
      const bannerIds = [
        'consent-banner',
        'initial-consent-banner',
        'main-banner',
        'main-consent-banner',
        'toggle-consent-btn',
        'consentbit-preference_div',
        'preferences-btn',
        'decline-btn',
        'accept-btn',
        'do-not-share-link',
        'do-not-share-checkbox',
        'necessary-checkbox',
        'analytics-checkbox',
        'marketing-checkbox',
        'personalization-checkbox',
        'save-preferences-btn',
        'cancel-btn',
        'save-btn',
        'close-consent-banner'
      ];

      // Check the element itself
      let currentElement: any = element;
      const checkedElements = new Set();

      // Traverse up the DOM tree to check element and all ancestors
      while (currentElement && !checkedElements.has(currentElement)) {
        checkedElements.add(currentElement);

        try {
          // Check DOM ID
          if (typeof (currentElement as any).getDomId === 'function') {
            const domId = await (currentElement as any).getDomId();
            if (domId && bannerIds.includes(domId)) {
              return true;
            }
          }

          // Check custom attribute ID
          if (typeof currentElement.getCustomAttribute === 'function') {
            try {
              const customId = await currentElement.getCustomAttribute('id');
              if (customId && bannerIds.includes(customId)) {
                return true;
              }
            } catch (e) {
              // Continue if we can't get custom attribute
            }
          }

          // Check if element has ConsentBit style
          // Only block if it's an actual banner element, not the container itself
          try {
            const styles = await currentElement.getStyles();
            const hasConsentBitStyle = styles.some((style: any) => {
              return style.name === 'ConsentBit';
            });
            
            if (hasConsentBitStyle) {
              // Check if it's the container itself
              let currentDomId: string | null = null;
              try {
                if (typeof (currentElement as any).getDomId === 'function') {
                  currentDomId = await (currentElement as any).getDomId();
                }
              } catch (e) {
                // Continue
              }
              
              if (currentDomId === 'consentbit-container') {
                // This is the container itself - allow it
                // Don't block, continue checking other conditions
                // The container itself is allowed to be selected
              } else {
                // Has ConsentBit style but isn't the container
                // Check if it's an actual banner element by checking its DOM ID
                if (currentDomId && bannerIds.includes(currentDomId)) {
                  return true; // It's an actual banner element, block it
                }
                // If it has ConsentBit style but no banner ID, it might be a child div
                // Allow it - we only block actual banner elements with specific IDs
              }
            }
          } catch (e) {
            // Continue if we can't check styles
          }

          // Try to get parent element
          try {
            if (typeof currentElement.getParent === 'function') {
              currentElement = await currentElement.getParent();
            } else {
              break; // Can't traverse further
            }
          } catch (e) {
            break; // Can't get parent, stop traversal
          }
        } catch (error) {
          break; // Error checking element, stop traversal
        }
      }

      return false;
    } catch (error) {
      // If we can't check, assume it's not part of banner to be safe
      return false;
    }
  };

  // Helper function to setup selected element as ConsentBit container
  const setupConsentBitContainer = async (selectedElement: any): Promise<any> => {
    try {
      // Check if creation is already in progress
      if (creationInProgress) {
        throw new Error("Banner creation is already in progress. Please wait for it to complete.");
      }

      // Check if the selected element is part of an existing banner structure
      const isPartOfBanner = await isElementPartOfBanner(selectedElement);
      if (isPartOfBanner) {
        throw new Error("Cannot create banners inside an existing banner element. Please select the div with 'ConsentBit' style name or an element outside the banner structure.");
      }

      // Check if the selected element can have children
      if (!selectedElement?.children) {
        throw new Error("Selected element cannot have children.");
      }

      // Check if selected element already has the ConsentBit container ID
      let existingDomId: string | null = null;
      try {
        if (typeof (selectedElement as any).getDomId === 'function') {
          existingDomId = await (selectedElement as any).getDomId();
        }
      } catch (error) {
        // Continue if we can't get DOM ID
      }

      // If element already has consentbit-container ID, verify it has ConsentBit style
      if (existingDomId === 'consentbit-container') {
        try {
          const selectedStyles = await selectedElement.getStyles();
          const hasConsentBitStyle = Array.isArray(selectedStyles) 
            ? selectedStyles.some((style: any) => style.name === 'ConsentBit')
            : false;
          
          if (!hasConsentBitStyle) {
            // Has ID but not style - apply style
            const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
            if (selectedElement.setStyles) {
              const stylesArray = Array.isArray(selectedStyles) ? selectedStyles : [];
              await selectedElement.setStyles([...stylesArray, consentBitStyle]);
            }
          }
          return selectedElement; // Return existing container
        } catch (error) {
          // Continue to setup if check fails
        }
      }
      
      // If element has ConsentBit style but doesn't have the DOM ID, set it
      if (!existingDomId || existingDomId !== 'consentbit-container') {
        try {
          const selectedStyles = await selectedElement.getStyles();
          const hasConsentBitStyle = Array.isArray(selectedStyles) 
            ? selectedStyles.some((style: any) => style.name === 'ConsentBit')
            : false;
          
          if (hasConsentBitStyle) {
            // Has style but not ID - set ID
            try {
              if ((selectedElement as any).setDomId) {
                await (selectedElement as any).setDomId("consentbit-container");
              } else if (selectedElement.setCustomAttribute) {
                await selectedElement.setCustomAttribute("id", "consentbit-container");
              } else if ((selectedElement as any).setAttribute) {
                await (selectedElement as any).setAttribute("id", "consentbit-container");
              }
            } catch (domIdError) {
              console.error("Failed to set DOM ID on element with ConsentBit style:", domIdError);
            }
          }
        } catch (error) {
          // Continue to setup
        }
      }

      // Check if there's already a ConsentBit container elsewhere
      // Only throw error if selected element is NOT the container itself
      if (existingDomId !== 'consentbit-container') {
        const allElements = await webflow.getAllElements();
        for (const element of allElements) {
          try {
            if (element === selectedElement) continue; // Skip the selected element
            
            if (typeof (element as any).getDomId === 'function') {
              const domId = await (element as any).getDomId();
              if (domId === 'consentbit-container') {
                throw new Error("A ConsentBit container already exists. Please select that element or remove it first.");
              }
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
              throw error; // Re-throw the "already exists" error
            }
            // Continue checking other elements
            continue;
          }
        }
      }

      // Setup the selected element as ConsentBit container
      setCreationInProgress(true);

      // Set DOM ID for the container - match the pattern used elsewhere in codebase
      console.log("Attempting to set DOM ID 'consentbit-container' on selected element");
      console.log("Element type:", selectedElement?.type || "unknown");
      console.log("Element has setDomId:", typeof (selectedElement as any).setDomId);
      
      try {
        // Try calling setDomId directly (matching pattern from other parts of codebase)
        // First check if method exists
        const hasSetDomId = typeof (selectedElement as any).setDomId === 'function';
        console.log("hasSetDomId:", hasSetDomId);
        
        if (hasSetDomId) {
          console.log("Calling setDomId('consentbit-container')...");
          await (selectedElement as any).setDomId("consentbit-container");
          console.log("setDomId call completed");
          
          // Wait a bit for the ID to be processed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify the ID was set
          try {
            const verifyId = await (selectedElement as any).getDomId();
            console.log("Verification - getDomId returned:", verifyId);
            if (verifyId === "consentbit-container") {
              // Success - ID is set correctly
              console.log("✓ DOM ID 'consentbit-container' set successfully");
            } else if (verifyId) {
              console.warn(`✗ DOM ID verification failed. Expected 'consentbit-container', but element has '${verifyId}'.`);
              webflow.notify({ 
                type: "info", 
                message: `DOM ID verification: Expected 'consentbit-container', but element has '${verifyId}'.` 
              });
            } else {
              console.warn("✗ DOM ID verification returned null/undefined. ID may not have been set.");
              // Try fallback
              if (selectedElement.setCustomAttribute) {
                await selectedElement.setCustomAttribute("id", "consentbit-container");
                console.log("Tried setCustomAttribute as fallback");
              }
            }
          } catch (verifyError) {
            console.warn("Could not verify DOM ID:", verifyError);
          }
        } else {
          // setDomId doesn't exist, try fallback methods
          console.warn("setDomId method not found on element, trying fallback methods...");
          let fallbackUsed = false;
          if (selectedElement.setCustomAttribute) {
            await selectedElement.setCustomAttribute("id", "consentbit-container");
            console.log("Used setCustomAttribute as fallback");
            fallbackUsed = true;
          } else if ((selectedElement as any).setAttribute) {
            await (selectedElement as any).setAttribute("id", "consentbit-container");
            console.log("Used setAttribute as fallback");
            fallbackUsed = true;
          }
          
          if (!fallbackUsed) {
            webflow.notify({ 
              type: "error", 
              message: "Selected element does not support DOM ID setting. Please select a div element." 
            });
          }
        }
      } catch (domIdError) {
        console.error("Error setting DOM ID:", domIdError);
        console.error("Error details:", {
          message: domIdError instanceof Error ? domIdError.message : 'Unknown error',
          stack: domIdError instanceof Error ? domIdError.stack : undefined
        });
        webflow.notify({ 
          type: "error", 
          message: `Failed to set DOM ID: ${domIdError instanceof Error ? domIdError.message : 'Unknown error'}` 
        });
        // Continue with style application even if DOM ID fails
      }

      // Apply ConsentBit style to the selected element
      try {
        const selectedStyles = await selectedElement.getStyles();
        const hasConsentBitStyle = selectedStyles.some((style: any) => {
          return style.name === 'ConsentBit';
        });
        
        if (!hasConsentBitStyle) {
          const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
          if (selectedElement.setStyles) {
            await selectedElement.setStyles([...selectedStyles, consentBitStyle]);
          }
        }
      } catch (error) {
        // Continue if style application fails
      }

      setCreationInProgress(false);
      return selectedElement;
    } catch (error) {
      setCreationInProgress(false);
      throw error;
    }
  };

  const handleBannerSuccess = () => {
    setShowSuccess(true);
    setShowLoading(false);
    setIsCreating(false);
  };

  const handleBannerError = (error: any) => {
    setIsCreating(false);
    setShowLoading(false);
  };

  const handleSuccessPublishProceed = () => {
    setShowSuccessPublish(false);
  };

  const handleSuccessPublishGoBack = () => {
    setShowSuccessPublish(false);
  };

  const createSimpleGDPRBanner = async (consentBitContainer: any, config: BannerConfig, animationAttribute: string) => {
    try {
      // Final double-check: Ensure no duplicate consent-banner exists right before creating (check by ID and class names)
      console.log("🔍 [useBannerCreation.createSimpleGDPRBanner] Final check for duplicate GDPR banner elements...");
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
      
      const existingGDPRBanners = finalElementChecks
        .filter(({ isBanner }) => isBanner)
        .map(({ el }) => el);
      
      if (existingGDPRBanners.length > 0) {
        console.log(`⚠️ [useBannerCreation.createSimpleGDPRBanner] Final check: Found ${existingGDPRBanners.length} existing GDPR banner element(s), removing before creating new one`);
        
        // Process removals sequentially to avoid race conditions
        for (const el of existingGDPRBanners) {
          try {
            // Check if element is still valid
            let domId: string | null = null;
            try {
              domId = await el.getDomId?.().catch(() => null);
            } catch (checkErr: any) {
              if (checkErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation.createSimpleGDPRBanner] Element already removed, skipping`);
                continue;
              }
            }
            
            const identifier = domId || 'element-with-banner-class';
            console.log(`✅ [useBannerCreation.createSimpleGDPRBanner] Final check: Removing banner element: ${identifier}`);
            
            // Remove children one by one with individual error handling
            try {
              const children = await el.getChildren?.().catch(() => []);
              if (children && children.length > 0) {
                for (const child of children) {
                  try {
                    await child.remove();
                  } catch (childErr: any) {
                    if (childErr?.message?.includes("Missing element")) {
                      console.log(`ℹ️ [useBannerCreation.createSimpleGDPRBanner] Child already removed, continuing`);
                    } else {
                      console.warn(`⚠️ [useBannerCreation.createSimpleGDPRBanner] Error removing child:`, childErr);
                    }
                  }
                }
              }
            } catch (childErr: any) {
              if (childErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation.createSimpleGDPRBanner] Element or children already removed`);
              } else {
                console.warn(`⚠️ [useBannerCreation.createSimpleGDPRBanner] Error getting/removing children:`, childErr);
              }
            }
            
            // Remove the element itself
            try {
              await el.remove();
              console.log(`✓ [useBannerCreation.createSimpleGDPRBanner] Final check: Successfully removed banner element: ${identifier}`);
            } catch (removeErr: any) {
              if (removeErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation.createSimpleGDPRBanner] Element already removed: ${identifier}`);
              } else {
                console.error(`⚠️ [useBannerCreation.createSimpleGDPRBanner] Final check: Error removing element:`, removeErr);
              }
            }
          } catch (err: any) {
            if (err?.message?.includes("Missing element")) {
              console.log(`ℹ️ [useBannerCreation.createSimpleGDPRBanner] Element already removed or invalid`);
            } else {
              console.error(`⚠️ [useBannerCreation.createSimpleGDPRBanner] Final check: Error processing banner:`, err);
            }
          }
        }
      }

      // Verify the container is not part of a banner structure (shouldn't happen, but double-check)
      const isPartOfBanner = await isElementPartOfBanner(consentBitContainer);
      if (isPartOfBanner) {
        // Check if it's the container itself (which is allowed)
        let containerId: string | null = null;
        try {
          if (typeof (consentBitContainer as any).getDomId === 'function') {
            containerId = await (consentBitContainer as any).getDomId();
          }
        } catch (e) {
          // Continue
        }
        
        if (containerId !== 'consentbit-container') {
          throw new Error("Cannot create banners inside an existing banner element. Please select the div with 'ConsentBit' style name or an element outside the banner structure.");
        }
      }

      // Step 1: Create main banner div as child of ConsentBit container
      const newDiv = await consentBitContainer.append(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create banner div");
      }
      
      // Step 2: Set DOM ID exactly like GDPR function
      if ((newDiv as any).setDomId) {
        await (newDiv as any).setDomId("consent-banner");
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
      // Debug: Log banner styles before creating property map

      const divPropertyMap: Record<string, string> = {
        "background-color": `${config.color}`,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `4px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": `${config.Font}`,
        "right": "3%",
        "transform": "translate3d(0px, 0, 0)",
        "left": "auto",
        "bottom": "3%",
        "width": "438px",
        "min-height": "220px",
      };

      // Debug: Log the final property map
     
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
        "color": config.paraColor,
        "font-size": "16px",
        "font-weight": "400",
        "line-height": "1.5",
        "text-align": "left",
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "right",
        "margin-top": "10px",
        "width": "100%",
      };

      const buttonPropertyMap: Record<string, string> = {
        "border-radius": "2px",
        "background-color": "rgb(0, 0, 0)", // Hardcoded default: black for Accept button
        "color": "rgb(255, 255, 255)", // Hardcoded default: white text for Accept button
        "font-family": config.Font || "Montserrat",
        "cursor": "pointer",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
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
        "border-radius": "2px",
        "background-color": "#C9C9C9", // Hardcoded default: grey for Preferences/Reject buttons
        "color": "rgb(0, 0, 0)", // Hardcoded default: black text for Preferences/Reject buttons
        "font-family": config.Font || "Montserrat",
        "cursor": "pointer",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",

      };

      const linktextPropertyMap: Record<string, string> = {
        "border-radius": "2px",
        "background-color": "transparent !important",
        "color": "rgb(0, 0, 0)",
        "font-family": "Montserrat",
        "cursor": "pointer",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
        "text-decoration": "none",
      };



      const headingPropertyMap: Record<string, string> = {
        "color": `${config.headColor}`,
        "font-size": "20px",
        "font-weight": "400px",
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": `${config.color}`,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": "4px",
        "border-top-right-radius": "4px"
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
      await headingStyle.setProperties(headingPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap);
      // Line 316: Properties applied to buttonContainerStyle
       await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
       await prefrenceButtonStyle.setProperties(declineButtonPropertyMap);
       await declineButtonStyle.setProperties(declineButtonPropertyMap);
       await buttonStyle.setProperties(buttonPropertyMap);

// Line 318: Style attached to button container element
      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }
      
      // Debug: Log the actual DOM element after styling
      
      // Get siteId from Webflow API
      const siteInfo = await webflow.getSiteInfo();
      const siteId = siteInfo?.siteId || "";
      
      if (newDiv.setCustomAttribute) {
        await newDiv.setCustomAttribute("data-animation", bannerAnimation.animation);
        await newDiv.setCustomAttribute("data-cookie-banner", bannerToggleStates.toggleStates.disableScroll ? "true" : "false");
        await newDiv.setCustomAttribute("data-site-info", siteId);
        await newDiv.setCustomAttribute("data-all-banners","false");
      }
     
      // Step 5: Create inner div as child of newDiv
      const innerdiv = await newDiv.append(webflow.elementPresets.DivBlock);
      if (!innerdiv) {
        throw new Error("Failed to create inner div");
      }
      await innerdiv.setStyles([innerDivStyle]);

      // Step 6: Create heading as child of innerdiv
      const tempHeading = await innerdiv.append(webflow.elementPresets.Heading);
      if (!tempHeading) {
        throw new Error("Failed to create heading");
      }
      
      await headingStyle.setProperties(headingPropertyMap);
      
      if (tempHeading.setHeadingLevel) {
        await tempHeading.setHeadingLevel(2);
      }
      if (tempHeading.setStyles) {
        await tempHeading.setStyles([headingStyle]);
      }
      if (tempHeading.setTextContent) {
        await tempHeading.setTextContent('Cookie Settings');
      }

      // Step 7: Create paragraph as child of innerdiv
      const tempParagraph = await innerdiv.append(webflow.elementPresets.Paragraph);
      if (!tempParagraph) {
        throw new Error("Failed to create paragraph");
      }
      
      await paragraphStyle.setProperties(paragraphPropertyMap);
      
      if (tempParagraph.setStyles) {
        await tempParagraph.setStyles([paragraphStyle]);
      }
      if (tempParagraph.setTextContent) {
        await tempParagraph.setTextContent('We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.');
      }

      // Step 8: Create button container as child of innerdiv
      const buttonContainer = await innerdiv.append(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      if (buttonContainer.setStyles) {
        await buttonContainer.setStyles([buttonContainerStyle]);
      }

      // Step 9: Create preferences button as child of buttonContainer (first button)
      const prefrenceButton = await buttonContainer.append(webflow.elementPresets.Button);
      if (!prefrenceButton) {
        throw new Error("Failed to create preferences button");
      }
      await prefrenceButton.setStyles([prefrenceButtonStyle]);
      await prefrenceButton.setTextContent('Preferences');
      
      if ((prefrenceButton as any).setDomId) {
        await (prefrenceButton as any).setDomId("preferences-btn"); // Type assertion
      }

      // Step 10: Create decline button as child of buttonContainer (second button)
      const declineButton = await buttonContainer.append(webflow.elementPresets.Button);
      if (!declineButton) {
        throw new Error("Failed to create decline button");
      }
      await declineButton.setStyles([declineButtonStyle]);
      await declineButton.setTextContent('Reject');
      
      if ((declineButton as any).setDomId) {
        await (declineButton as any).setDomId("decline-btn"); // Type assertion
      }

      // Step 11: Create accept button as child of buttonContainer (third button)
      const acceptButton = await buttonContainer.append(webflow.elementPresets.Button);
      if (!acceptButton) {
        throw new Error("Failed to create accept button");
      }
      
      await acceptButton.setStyles([buttonStyle]);
      if ((acceptButton as any).setDomId) {
        await (acceptButton as any).setDomId("accept-btn"); // Type assertion
      }
     
      await acceptButton.setTextContent('Accept');
    } catch (error) {
      throw error;
    }
  };

  const createSimpleCCPABanner = async (consentBitContainer: any, config: BannerConfig, animationAttribute: string) => {
    try {
      // Verify the container is not part of a banner structure (shouldn't happen, but double-check)
      const isPartOfBanner = await isElementPartOfBanner(consentBitContainer);
      if (isPartOfBanner) {
        // Check if it's the container itself (which is allowed)
        let containerId: string | null = null;
        try {
          if (typeof (consentBitContainer as any).getDomId === 'function') {
            containerId = await (consentBitContainer as any).getDomId();
          }
        } catch (e) {
          // Continue
        }
        
        if (containerId !== 'consentbit-container') {
          throw new Error("Cannot create banners inside an existing banner element. Please select the div with 'ConsentBit' style name or an element outside the banner structure.");
        }
      }

      // Step 1: Create main CCPA banner div as child of ConsentBit container
      const newDiv = await consentBitContainer.append(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create CCPA banner div");
      }
      
      // Step 2: Set DOM ID to match existing structure (initial-consent-banner for simple CCPA banner)
      if ((newDiv as any).setDomId) {
        await (newDiv as any).setDomId("initial-consent-banner");
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

      const animationAttr = animationAttribute || "fade";
      
      const divPropertyMap: Record<string, string> = {
        "background-color": `${config.color}`,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `4px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": `${config.Font}`,
        "right": "3%",
        "transform": "translate3d(0px, 0, 0)",
        "left": "auto",
         "bottom":"3%",
         "width" :"438px",
         "min-height": "220px",
      };
     
      
      await divStyle.setProperties(divPropertyMap);
      
      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
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
        "color": `${config.paraColor}`,
        "font-size": "16px",
        "font-weight": "400",
        "line-height": "1.5",
        "text-align": "left",
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "left",
        "margin-top": "10px",
        "width": "100%",
      };

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
        "color": "rgba(72, 57, 153, 1)",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
      };
      const headingPropertyMap: Record<string, string> = {
        "color": `${config.headColor}`,
        "font-size": "20px",
        "font-weight": "500",
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };
      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": `${config.color}`,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `4px`,
        "border-top-right-radius": `4px`
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
      await headingStyle.setProperties(headingPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap)

       if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }

       if (newDiv.setCustomAttribute) {
         await newDiv.setCustomAttribute("data-animation", "fade");
         await newDiv.setCustomAttribute("data-cookie-banner", "false");
       }
       await newDiv.setCustomAttribute("data-all-banners","false");

      // Create innerdiv as child of newDiv
      const innerdiv = await newDiv.append(webflow.elementPresets.DivBlock);
      await innerdiv.setStyles([innerDivStyle]);
      
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
        await tempHeading.setTextContent("We value your privacy");
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
        await tempParagraph.setTextContent("We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.");
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
      await prefrenceButton.setTextContent('Do Not Share My Personal Information');
  
      if ((prefrenceButton as any).setDomId) {
        await (prefrenceButton as any).setDomId("do-not-share-link"); 
      }
      // Add hover effect for underline on Do Not Share link
      if (prefrenceButton.setCustomAttribute) {
        await prefrenceButton.setCustomAttribute("data-hover-underline", "true");
      }
         
      
    } catch (error) {
      throw error;
    }
  };
  

  const createGDPRPreferencesWithExistingFunction = async (consentBitContainer: any, config: BannerConfig) => {
    try {
      
      // Call createCookiePreferences with hardcoded colors matching the main GDPR banner
      // Save Preference button: black background, white text (matching main Accept button)
      // Reject button: grey background, black text (matching main Reject/Preferences buttons)
        await createCookiePreferences(
        ["essential", "analytics", "marketing", "preferences"], // selectedPreferences array
        config.language,           // language
        config.color,             // color (background)
        "rgb(0, 0, 0)",           // btnColor - hardcoded black for Save Preference button (matching main Accept button)
        config.headColor,         // headColor
        config.paraColor,         // paraColor 
        "#C9C9C9",                // secondcolor - hardcoded grey for Reject button (matching main Reject/Preferences buttons)
        typeof config.buttonRadius === 'number' ? config.buttonRadius : parseInt(config.buttonRadius as string), // buttonRadius
        config.animation,         // animation
        config.toggleStates?.customToggle || false, // customToggle
        "rgb(255, 255, 255)",     // primaryButtonText - hardcoded white text for Save Preference button (matching main Accept button)
        "rgb(0, 0, 0)",           // secondbuttontext - hardcoded black text for Reject button (matching main Reject/Preferences buttons)
        false,                    // skipCommonDiv (false to create toggle button)
        config.toggleStates?.disableScroll || false, // disableScroll
        config.toggleStates?.closebutton || false  ,  // closebutton
       typeof config.buttonRadius === 'number' 
       ? config.buttonRadius 
       : parseInt(config.buttonRadius as string),
       config.Font,
       "", // privacyUrl
       consentBitContainer // targetDiv - use ConsentBit container
      );
      
    } catch (error) {
      throw error;
    }
  };

  const createCCPAPreferencesWithExistingFunction = async (consentBitContainer: any, config: BannerConfig) => {
    try {
      
      // Call createCookieccpaPreferences with all required parameters - black text for content, config colors for buttons
      await createCookieccpaPreferences(
        config.language,           // language
        config.color,             // color (background)
        config.btnColor,          // btnColor
        config.headColor,         // headColor
        config.paraColor,         // paraColor      
        config.secondcolor,       // secondcolor
        typeof config.buttonRadius === 'number' ? config.buttonRadius : parseInt(config.buttonRadius as string), // buttonRadius
        config.animation,         // animation
        config.primaryButtonText, // primaryButtonText
        config.secondbuttontext,  // secondbuttontext
        config.toggleStates?.disableScroll || false, // disableScroll
        config.toggleStates?.closebutton || false,   // closebutton
        true,                     // skipCommonDiv (true to avoid duplicate toggle button)
        config.Font ,
        typeof config.buttonRadius === 'number' 
          ? config.buttonRadius 
          : parseInt(config.buttonRadius as string),
        "", // privacyUrl
        consentBitContainer // targetDiv - use ConsentBit container
      );    
    } catch (error) {
      throw error;
    }
  };
   // Import and use the openAuthScreen from useAuth hook that includes automatic silent auth
   const { openAuthScreen } = useAuth();
    
  // COMMENTED OUT: Old script registration function - replaced with injectScript API
  // Helper function to register ConsentBit script globally via Webflow API
  // const addConsentBitScriptGlobally = async (siteId: string, token: string) => {
  //   try {
  //     // Create the script tag HTML directly - Webflow will inject this into the head
  //     // Using a self-executing function to check for duplicates and add the script
  //     const scriptContent = `(function() {
  //       if (document.querySelector('script[src="https://script-5qu.pages.dev/script.js"]')) {
  //         return;
  //       }
  //       var s = document.createElement('script');
  //       s.src = 'https://script-5qu.pages.dev/script.js';
  //       s.setAttribute('data-site-id', '${siteId}');
  //       s.defer = true;
  //       (document.head || document.getElementsByTagName('head')[0]).appendChild(s);
  //     })();`;

  //     // Register as inline script
  //     const scriptData: ScriptRegistrationRequest = {
  //       siteId: siteId,
  //       isHosted: false,
  //       scriptData: {
  //         displayName: 'ConsentBit Script Loader',
  //         version: '1.0.0',
  //         sourceCode: scriptContent
  //       }
  //     };

  //     const registerResult = await customCodeApi.registerScript(scriptData, token);
  //     
  //     if (registerResult && registerResult.result) {
  //       // Apply the script globally to site header
  //       const params: CodeApplication = {
  //         targetType: 'site',
  //         targetId: siteId,
  //         scriptId: registerResult.result.id,
  //         location: 'header',
  //         version: registerResult.result.version
  //       };
  //       
  //       const applyResult = await customCodeApi.applyV2Script(params, token);
  //       console.log(`✓ ConsentBit script registered globally with data-site-id: ${siteId}`, applyResult);
  //       
  //       // Also add it immediately to current page as fallback
  //       try {
  //         if (!document.querySelector(`script[src="https://script-5qu.pages.dev/script.js"]`)) {
  //           const script = document.createElement('script');
  //           script.src = 'https://script-5qu.pages.dev/script.js';
  //           script.setAttribute('data-site-id', siteId);
  //           script.defer = true;
  //           document.head.appendChild(script);
  //           console.log(`✓ ConsentBit script also added to current page`);
  //         }
  //       } catch (immediateError) {
  //         console.warn("Could not add script to current page:", immediateError);
  //       }
  //     } else {
  //       throw new Error("Script registration failed - no result returned");
  //     }
  //   } catch (error) {
  //     console.error("Error registering ConsentBit script globally:", error);
  //     // Fallback to DOM manipulation if API fails
  //     try {
  //       if (!document.querySelector(`script[src="https://script-5qu.pages.dev/script.js"]`)) {
  //         const script = document.createElement('script');
  //         script.src = 'https://script-5qu.pages.dev/script.js';
  //         script.setAttribute('data-site-id', siteId);
  //         script.defer = true;
  //         document.head.appendChild(script);
  //         console.log(`✓ ConsentBit script added via fallback with data-site-id: ${siteId}`);
  //       }
  //     } catch (fallbackError) {
  //       console.error("Fallback script addition also failed:", fallbackError);
  //     }
  //   }
  // };

  // COMMENTED OUT: Old script registration function - replaced with injectScript API
  // const  fetchAnalyticsBlockingsScriptsV2 = async () => {
  //   try {
  //     const token = getSessionTokenFromLocalStorage();
  //     if (!token) {
  //       openAuthScreen();
  //       return;
  //     }

  //     const siteIdinfo = await webflow.getSiteInfo();
  //     setSiteInfo(siteIdinfo);

  //     // First, register the script to get the hosting location
  //     const hostingScript = await customCodeApi.registerV2BannerCustomCode(token, siteIdinfo.siteId);

  //     if (hostingScript && hostingScript.result) {
  //       try {
  //         // Get the hosted location URL
  //         const hostedLocation = hostingScript.result.hostedLocation;
  //         
  //         if (hostedLocation) {
  //           try {
  //             // Fetch the script content from the hosting location
  //             const scriptResponse = await fetch(hostedLocation);
  //             if (!scriptResponse.ok) {
  //               throw new Error(`Failed to fetch script: ${scriptResponse.status}`);
  //             }
  //             const scriptContent = await scriptResponse.text();
  //             
  //             // Register as inline script with the fetched content
  //             const inlineScriptData: ScriptRegistrationRequest = {
  //               siteId: siteIdinfo.siteId,
  //               isHosted: false,
  //               scriptData: {
  //                 displayName: `ConsentBit Banner Script (Inline)`,
  //                 version: hostingScript.result.version || '1.0.0',
  //                 sourceCode: scriptContent
  //               }
  //             };
  //             
  //             const inlineScriptResult = await customCodeApi.registerScript(inlineScriptData, token);
  //             
  //             // Apply the inline script to the site head
  //             if (inlineScriptResult && inlineScriptResult.result) {
  //               const params: CodeApplication = {
  //                 targetType: 'site',
  //                 targetId: siteIdinfo.siteId,
  //                 scriptId: inlineScriptResult.result.id,
  //                 location: 'header',
  //                 version: inlineScriptResult.result.version
  //               };
  //               const applyScriptResponse = await customCodeApi.applyV2Script(params, token);
  //             }
  //           } catch (fetchError) {
  //             console.error("Error fetching script content or registering inline script:", fetchError);
  //             // Fallback to original hosted script registration
  //             const params: CodeApplication = {
  //               targetType: 'site',
  //               targetId: siteIdinfo.siteId,
  //               scriptId: hostingScript.result.id,
  //               location: 'header',
  //               version: hostingScript.result.version
  //             };
  //             const applyScriptResponse = await customCodeApi.applyV2Script(params, token);
  //           }
  //         } else {
  //           // If no hostedLocation, apply the original script
  //           const params: CodeApplication = {
  //             targetType: 'site',
  //             targetId: siteIdinfo.siteId,
  //             scriptId: hostingScript.result.id,
  //             location: 'header',
  //             version: hostingScript.result.version
  //           };
  //           const applyScriptResponse = await customCodeApi.applyV2Script(params, token);
  //         }

  //         // Register ConsentBit script globally after script registration
  //         if (siteIdinfo?.siteId && token) {
  //           await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
  //         }
  //       }
  //       catch (error) {
  //         // Register script even if there's an error
  //         if (siteIdinfo?.siteId && token) {
  //           await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
  //         }
  //         throw error;
  //       }
  //     } else {
  //       // Register ConsentBit script even if hosting script registration fails
  //       if (siteIdinfo?.siteId && token) {
  //         await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
  //       }
  //     }
  //   }
  //   catch (error) {
  //     // Register ConsentBit script even if there's an error
  //     try {
  //       const token = getSessionTokenFromLocalStorage();
  //       const siteIdinfo = await webflow.getSiteInfo();
  //       if (siteIdinfo?.siteId && token) {
  //         await addConsentBitScriptGlobally(siteIdinfo.siteId, token);
  //       }
  //     } catch (e) {
  //       console.error("Error registering ConsentBit script after error:", e);
  //     }
  //   }
  // };

  // Helper function to check if an element is a banner element by ID or style names
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
      try {
        if (el.getCustomAttribute) {
          const consentbitAttr = await el.getCustomAttribute('consentbit').catch(() => null);
          if (consentbitAttr === 'close' || consentbitAttr) {
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

        // Method 3: Try getStyles if available
        if (typeof el.getStyles === 'function') {
          try {
            const allStyles = await el.getStyles();
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
            // Continue if getStyles fails
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

  const createCompleteBannerStructureWithExistingFunctions = async (config: BannerConfig) => {
    try {
      // Check if creation is already in progress
      if (creationInProgress) {
        throw new Error("Banner creation is already in progress. Please wait for it to complete.");
      }

      setIsCreating(true);
      setCreationInProgress(true);

      // Comprehensive check and removal of ALL banner-related elements before creating new ones
      console.log("🔍 [useBannerCreation] Checking for existing banner elements before creation...");
      const allElements = await webflow.getAllElements();
      
      // Include all possible banner element IDs
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
        "do-not-share-link"
      ];

      // Include all possible banner style names (class names)
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

      // Remove ALL matching elements to prevent duplicates
      if (matchingElements.length > 0) {
        console.log(`🔍 [useBannerCreation] Found ${matchingElements.length} existing banner element(s) to remove (checked by ID and class names)`);
        
        // Process removals sequentially to avoid race conditions with "Missing element" errors
        for (const el of matchingElements) {
          try {
            // Check if element is still valid before proceeding
            let domId: string | null = null;
            try {
              domId = await el.getDomId?.().catch(() => null);
            } catch (checkErr: any) {
              // If element is already missing/invalid, skip it
              if (checkErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation] Element already removed or invalid, skipping`);
                continue;
              }
            }
            
            const identifier = domId || 'element-with-banner-class';
            console.log(`✅ [useBannerCreation] Deleting duplicate banner element: ${identifier}`);
            
            // Remove all children first - handle each child individually
            try {
              const children = await el.getChildren?.().catch(() => []);
              if (children && children.length > 0) {
                // Remove children one by one with individual error handling
                for (const child of children) {
                  try {
                    // Check if child is still valid before removing
                    await child.remove();
                  } catch (childErr: any) {
                    // Handle "Missing element" errors gracefully - element may have been removed already
                    if (childErr?.message?.includes("Missing element")) {
                      console.log(`ℹ️ [useBannerCreation] Child element already removed, continuing`);
                    } else {
                      console.warn(`⚠️ [useBannerCreation] Error removing child:`, childErr);
                    }
                    // Continue with next child even if this one fails
                  }
                }
              }
            } catch (childErr: any) {
              // Handle "Missing element" errors gracefully
              if (childErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation] Element or its children already removed, continuing`);
              } else {
                console.warn(`⚠️ [useBannerCreation] Error getting/removing children:`, childErr);
              }
            }

            // Remove the element itself - check if it's still valid
            try {
              await el.remove();
              console.log(`✓ [useBannerCreation] Successfully removed element: ${identifier}`);
            } catch (removeErr: any) {
              // Handle "Missing element" errors gracefully - element may have been removed already
              if (removeErr?.message?.includes("Missing element")) {
                console.log(`ℹ️ [useBannerCreation] Element already removed: ${identifier}`);
              } else {
                console.error(`⚠️ [useBannerCreation] Error removing element ${identifier}:`, removeErr);
              }
            }
          } catch (err: any) {
            // Handle "Missing element" errors gracefully
            if (err?.message?.includes("Missing element")) {
              console.log(`ℹ️ [useBannerCreation] Element already removed or invalid, skipping`);
            } else {
              console.error(`⚠️ [useBannerCreation] Error processing duplicate banner:`, err);
            }
            // Continue with next element even if this one fails
          }
        }
      } else {
        console.log(`✅ [useBannerCreation] No existing banner elements found - safe to create new banner`);
      }

      // Get selected element
      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        throw new Error('No element selected');
      }

      // Check if the selected element is part of an existing banner structure
      let selectedElementId: string | null = null;
      try {
        if (typeof (selectedElement as any).getDomId === 'function') {
          selectedElementId = await (selectedElement as any).getDomId();
        }
      } catch (e) {
        // Continue
      }

      // Check if selected element is an actual banner element (not allowed)
      const actualBannerIds = [
        'consent-banner',
        'initial-consent-banner',
        'main-banner',
        'main-consent-banner',
        'toggle-consent-btn',
        'consentbit-preference_div'
      ];

      if (selectedElementId && actualBannerIds.includes(selectedElementId)) {
        webflow.notify({
          type: "error",
          message: "Cannot create banners inside an existing banner element. Please select the div with 'ConsentBit' style name or an element outside the banner structure." 
        });
        setIsCreating(false);
        setCreationInProgress(false);
        return;
      }

      // If selected element is inside consentbit-container, find and use the container
      let consentBitContainer: any = null;
      let isInsideContainer = false;

      // First, check if there's an existing ConsentBit container anywhere
      // Reuse allElements from earlier duplicate removal check (already fetched above)
      let existingContainer: any = null;
      
      for (const element of allElements) {
        try {
          if (typeof (element as any).getDomId === 'function') {
            const domId = await (element as any).getDomId();
            if (domId === 'consentbit-container') {
              existingContainer = element;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Check if selected element is the container itself
      if (selectedElementId === 'consentbit-container') {
        // It's the container, use it directly
        consentBitContainer = selectedElement;
        isInsideContainer = true;
      } else if (existingContainer) {
        // Check if selected element is inside the existing container by traversing up
        let currentElement: any = selectedElement;
        const checkedElements = new Set();
        let foundContainer = false;
        
        while (currentElement && !checkedElements.has(currentElement)) {
          checkedElements.add(currentElement);
          
          try {
            // Check if this is the container
            if (currentElement === existingContainer) {
              consentBitContainer = existingContainer;
              isInsideContainer = true;
              foundContainer = true;
              break;
            }
            
            let currentId: string | null = null;
            if (typeof (currentElement as any).getDomId === 'function') {
              currentId = await (currentElement as any).getDomId();
            }
            
            if (currentId === 'consentbit-container') {
              // Found the container, use it
              consentBitContainer = currentElement;
              isInsideContainer = true;
              foundContainer = true;
              break;
            }
            
            // Try to get parent
            if (typeof currentElement.getParent === 'function') {
              currentElement = await currentElement.getParent();
            } else {
              break;
            }
          } catch (e) {
            break;
          }
        }
        
        // If we didn't find the container in the parent chain, but container exists, use it anyway
        // (selected element might be a sibling or elsewhere)
        if (!foundContainer && existingContainer) {
          consentBitContainer = existingContainer;
          isInsideContainer = true;
        }
      }

      // If we're inside the container or it's the container itself, verify it has the DOM ID and style
      // Otherwise, setup the selected element as ConsentBit container
      if (isInsideContainer || selectedElementId === 'consentbit-container') {
        // We found an existing container, verify it has DOM ID and ConsentBit style
        try {
          // First, ensure DOM ID is set
          let containerDomId: string | null = null;
          try {
            if (typeof (consentBitContainer as any).getDomId === 'function') {
              containerDomId = await (consentBitContainer as any).getDomId();
            }
          } catch (e) {
            // Continue
          }

              if (containerDomId !== 'consentbit-container') {
                // DOM ID is not set, set it now
                try {
                  if ((consentBitContainer as any).setDomId) {
                    await (consentBitContainer as any).setDomId("consentbit-container");
                    // Wait and verify
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const verifyId = await (consentBitContainer as any).getDomId();
                    if (verifyId === "consentbit-container") {
                      console.log("DOM ID 'consentbit-container' set successfully on existing container");
                    } else {
                      console.warn(`DOM ID verification failed. Expected 'consentbit-container', got '${verifyId}'`);
                    }
                  } else if (consentBitContainer.setCustomAttribute) {
                    await consentBitContainer.setCustomAttribute("id", "consentbit-container");
                    console.log("Used setCustomAttribute to set DOM ID on existing container");
                  } else if ((consentBitContainer as any).setAttribute) {
                    await (consentBitContainer as any).setAttribute("id", "consentbit-container");
                    console.log("Used setAttribute to set DOM ID on existing container");
                  } else {
                    console.error("No method available to set DOM ID on existing container");
                  }
                } catch (domIdError) {
                  console.error("Failed to set DOM ID on existing container:", domIdError);
                }
              } else {
                console.log("Existing container already has DOM ID 'consentbit-container'");
              }

          // Verify it has ConsentBit style
          const containerStyles = await (consentBitContainer as any).getStyles();
          const hasConsentBitStyle = Array.isArray(containerStyles) && containerStyles.some((style: any) => {
            return style.name === 'ConsentBit';
          });
          
          if (!hasConsentBitStyle) {
            const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
            if (consentBitContainer.setStyles) {
              const stylesArray = Array.isArray(containerStyles) ? containerStyles : [];
              await consentBitContainer.setStyles([...stylesArray, consentBitStyle]);
            }
          }
        } catch (e) {
          // Continue if we can't check/apply styles
        }
      } else {
        // Setup selected element as ConsentBit container (adds ID and style)
        // But first check if there's already a container - if so, use it instead
        try {
          // Reuse allElements from earlier duplicate removal check (already fetched above)
          let existingContainer: any = null;
          
          for (const element of allElements) {
            try {
              if (typeof (element as any).getDomId === 'function') {
                const domId = await (element as any).getDomId();
                if (domId === 'consentbit-container') {
                  existingContainer = element;
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
          
          if (existingContainer) {
            // Use existing container instead of creating a new one
            consentBitContainer = existingContainer;
            
            // Verify it has DOM ID set
            try {
              let containerDomId: string | null = null;
              try {
                if (typeof (existingContainer as any).getDomId === 'function') {
                  containerDomId = await (existingContainer as any).getDomId();
                }
              } catch (e) {
                // Continue
              }

              if (containerDomId !== 'consentbit-container') {
                // DOM ID is not set, set it now
                try {
                  if ((existingContainer as any).setDomId) {
                    await (existingContainer as any).setDomId("consentbit-container");
                    // Wait and verify
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const verifyId = await (existingContainer as any).getDomId();
                    if (verifyId === "consentbit-container") {
                      console.log("DOM ID 'consentbit-container' set successfully on found container");
                    } else {
                      console.warn(`DOM ID verification failed. Expected 'consentbit-container', got '${verifyId}'`);
                    }
                  } else if (existingContainer.setCustomAttribute) {
                    await existingContainer.setCustomAttribute("id", "consentbit-container");
                    console.log("Used setCustomAttribute to set DOM ID on found container");
                  } else if ((existingContainer as any).setAttribute) {
                    await (existingContainer as any).setAttribute("id", "consentbit-container");
                    console.log("Used setAttribute to set DOM ID on found container");
                  } else {
                    console.error("No method available to set DOM ID on found container");
                  }
                } catch (domIdError) {
                  console.error("Failed to set DOM ID on found container:", domIdError);
                }
              } else {
                console.log("Found container already has DOM ID 'consentbit-container'");
              }
            } catch (e) {
              // Continue
            }
            
            // Verify it has ConsentBit style
            try {
              const containerStyles = await (existingContainer as any).getStyles();
              const hasConsentBitStyle = Array.isArray(containerStyles) && containerStyles.some((style: any) => {
                return style.name === 'ConsentBit';
              });
              
              if (!hasConsentBitStyle) {
                const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
                if (existingContainer.setStyles) {
                  const stylesArray = Array.isArray(containerStyles) ? containerStyles : [];
                  await existingContainer.setStyles([...stylesArray, consentBitStyle]);
                }
              }
            } catch (e) {
              // Continue
            }
          } else {
            // No existing container, setup the selected element as container
            consentBitContainer = await setupConsentBitContainer(selectedElement);
          }
        } catch (error) {
          // If check fails, try to setup anyway
          consentBitContainer = await setupConsentBitContainer(selectedElement);
        }
      }

      // Determine animation attribute
      const animationAttribute = config.animation && config.animation !== 'none' ? config.animation : '';

      // Remove existing banners inside the ConsentBit container using correct IDs
      try {
        const containerChildren = (consentBitContainer as any).getChildren 
          ? await (consentBitContainer as any).getChildren() 
          : [];
        for (const element of containerChildren) {
          try {
            if (!element) {
              continue;
            }

            // Verify element is actually a child of the container before deleting
            const isChild = await isElementChildOfContainer(element);
            if (!isChild) {
              console.log(`⚠️ [useBannerCreation] Skipping deletion - element is not a child of consentbit-container`);
              continue; // Skip deletion if not a child of container
            }

            // Check for DOM ID using getDomId method
            if (typeof (element as any).getDomId === 'function') {
              try {
                const domId = await (element as any).getDomId();
                if (domId && (domId === 'consent-banner' || domId === 'initial-consent-banner' || 
                             domId === 'main-banner' || domId === 'main-consent-banner' || 
                             domId === 'toggle-consent-btn')) {
                  console.log(`✅ [useBannerCreation] Deleting element (${domId}) - confirmed it's a child of container`);
                  if (typeof element.remove === 'function') {
                    await element.remove();
                  }
                }
              } catch (domIdError) {
                // Element might be missing, skip it
                continue;
              }
            }
          } catch (cleanupError) {
            // Continue with next element instead of failing completely
          }
        }
      } catch (error) {
        // If we can't get children, continue anyway
      }

      // Verify we have a valid container before proceeding
      if (!consentBitContainer) {
        webflow.notify({ 
          type: "error", 
          message: "Failed to find or create ConsentBit container. Please try again." 
        });
        setIsCreating(false);
        setCreationInProgress(false);
        return;
      }

      // Create simple banners first (they will be added to consentBitContainer)
      try {
        await createSimpleGDPRBanner(consentBitContainer, config, animationAttribute);
        await createGDPRPreferencesWithExistingFunction(consentBitContainer, config);
       // await createSimpleCCPABanner(consentBitContainer, config, animationAttribute);
        
        // Call injectScript after GDPR banner is created
        try {
          const token = getSessionTokenFromLocalStorage();
          const siteInfo = await webflow.getSiteInfo();
          if (token && siteInfo?.siteId) {
            const injectResponse = await customCodeApi.injectScript(token, siteInfo.siteId);
            if (injectResponse && injectResponse.success) {
              console.log(`✓ Script injected successfully for site: ${siteInfo.siteId}`);
              console.log(`  Script ID: ${injectResponse.scriptId}`);
              console.log(`  Message: ${injectResponse.message}`);
            } else {
              console.warn("Script injection response indicates failure:", injectResponse);
            }
          }
        } catch (injectError) {
          console.error("Error injecting script:", injectError);
          // Continue even if script injection fails
        }
      } catch (bannerCreationError) {
        console.error("Banner creation error:", bannerCreationError);
        webflow.notify({ 
          type: "error", 
          message: `Failed to create banner: ${bannerCreationError instanceof Error ? bannerCreationError.message : 'Unknown error'}` 
        });
        // Continue with the process even if banner creation fails
      }

      // // Create preference modals
      // try {
      //   await createCCPAPreferencesWithExistingFunction(selectedElement, config);
      // } catch (ccpaError) {
      //   // Continue with the process even if CCPA creation fails
      // }
      
      // COMMENTED OUT: Old script registration - replaced with injectScript API call after banner creation
      // await fetchAnalyticsBlockingsScriptsV2();
      
      // Show success popup after banner creation completes
      setShowSuccessPublish(true);
      console.log("✓ [useBannerCreation] Banner creation completed successfully - showing success popup");
      
    } catch (error) {
      throw error;
    }

  }
  return {
    createCompleteBannerStructureWithExistingFunctions,
    isCreating,
    showLoading,
    showSuccess,
    showSuccessPublish,
    handleSuccessPublishProceed,
    handleSuccessPublishGoBack
  };
};

// Debug: Add function to inspect banner element in DOM
(window as any).inspectBannerElement = () => {
  
  // Look for banner elements
  const bannerElements = document.querySelectorAll('[id*="consent-banner"], [class*="cookie-banner"], [data-cookie-banner]');
  
  bannerElements.forEach((element, index) => {
  });
  
  // Also check for any elements with black background
  const allElements = document.querySelectorAll('*');
  const blackElements = Array.from(allElements).filter(el => {
    const bgColor = window.getComputedStyle(el).backgroundColor;
    return bgColor === 'rgb(0, 0, 0)' || bgColor === '#000000' || bgColor === 'black';
  });
  
};

export default useBannerCreation;


