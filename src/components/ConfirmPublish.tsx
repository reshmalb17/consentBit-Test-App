import React, { useState, useEffect } from "react";
import "../style/styless.css";
import "../style/confirmpublish.css";
import NeedHelp from "../components/NeedHelp";
import { useAuth } from "../hooks/userAuth";
import webflow from "../types/webflowtypes";
import { useAppState } from "../hooks/useAppState";
import { useBannerCreation, BannerConfig } from "../hooks/useBannerCreation";
import PulseAnimation from "../components/PulseAnimation";
import SuccessPublish from "../components/SuccessPublish";
import CustomizationTab from "./CustomizationTab";
import ChoosePlan from "./ChoosePlan";
import { customCodeApi } from "../services/api";
import { getSessionTokenFromLocalStorage } from "../util/Session";

// Coupon code and discount - update these valUse Coupon Code:ues to change the displayed text
const COUPON_CODE = "ENDOFYEAR";
const COUPON_DISCOUNT = "20%";

const confirmIcon = new URL("../assets/confirmicon.svg", import.meta.url).href;
//const CopyContent = new URL("../assets/copy-small.svg", import.meta.url).href;
const CopyContent = new URL("../assets/copy-white.svg", import.meta.url).href;

const Previewtab = new URL("../assets/Previewtab.svg", import.meta.url).href;
const arrow = new URL("../assets/bluearrow.svg", import.meta.url).href;
const whitearrow = new URL("../assets/→.svg", import.meta.url).href;
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const errorsheild = new URL("../assets/warning-2.svg", import.meta.url).href;
const crossmark = new URL("../assets/group.svg", import.meta.url).href;
const couponCodeBg = new URL("../assets/Endofyear.svg", import.meta.url).href;

const tickSVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 8l3 3 7-7"/>
    </svg>
  `);



type ConfirmPublishProps = {
  onGoBack: () => void;
  handleConfirmPublish: () => void;
  handleCustomize: () => void;

};

const ConfirmPublish: React.FC<ConfirmPublishProps> = ({ onGoBack, handleConfirmPublish, handleCustomize }) => {
  const [isConfirmed, setIsConfirmed] = useState(true);
  // Note: This local showTooltip is not used - we use tooltips.showTooltip from useAppState
  const [showTooltip, setShowTooltip] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [iconSrc, setIconSrc] = useState(CopyContent);
  const [showChoosePlan, setShowChoosePlan] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);
  const [showChildContainerErrorPopup, setShowChildContainerErrorPopup] = useState(false);
  const [showLicensePopup, setShowLicensePopup] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [siteDomain, setSiteDomain] = useState("staging");
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState("");
  const [hasActiveLicense, setHasActiveLicense] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const { sessionToken } = useAuth();

  
  const {
    bannerStyles,
    bannerUI,
    bannerConfig,
    bannerBooleans,
    popups,
    tooltips,
    siteData,
    buttons,
    bannerAnimation,
    bannerToggleStates,
    bannerLanguages,
    localStorage: localStorageData
  } = useAppState();
  const { user, exchangeAndVerifyIdToken, isAuthenticatedForCurrentSite, openAuthScreen } = useAuth();
  const { 
    createCompleteBannerStructureWithExistingFunctions, 
    isCreating, 
    showSuccessPublish, 
    handleSuccessPublishProceed 
  } = useBannerCreation();

  // Auto-dismiss tooltip after 2 seconds
  useEffect(() => {
    if (tooltips.showTooltip) {
      const timer = setTimeout(() => {
        tooltips.setFadeOut(true);
        setTimeout(() => {
          tooltips.setShowTooltip(false);
          tooltips.setFadeOut(false);
        }, 300); // Wait for fade-out animation
      }, 2000); // Reduced to 2 seconds
      return () => {
        clearTimeout(timer);
      };
    }
  }, [tooltips.showTooltip]);

  // Track if domain has been fetched to avoid checking license with "staging" before real domain is loaded
  const [domainFetched, setDomainFetched] = useState(false);

  // Get site domain from webflow siteInfo
  useEffect(() => {
    const fetchSiteDomain = async () => {
      try {
        const siteInfo = await webflow.getSiteInfo();
        if (siteInfo?.domains && siteInfo.domains.length > 0) {
          // Find custom domain (not staging)
          const customDomain = siteInfo.domains.find(
            (domain) => !domain.stage || domain.stage !== "staging"
          );
          if (customDomain?.url) {
            // Remove protocol if present
            const domain = customDomain.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
            setSiteDomain(domain);
            setDomainFetched(true);
          } else {
            // Use staging domain if available
            const stagingDomain = siteInfo.domains.find(
              (domain) => domain.stage === "staging"
            );
            if (stagingDomain?.url) {
              const domain = stagingDomain.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
              setSiteDomain(domain);
              setDomainFetched(true);
            } else {
              setSiteDomain("staging");
              setDomainFetched(true);
            }
          }
        } else {
          setSiteDomain("staging");
          setDomainFetched(true);
        }
      } catch (error) {
        setSiteDomain("staging");
        setDomainFetched(true);
      }
    };
    fetchSiteDomain();
  }, []);

  // Check for active license from server on mount and when dependencies change
  useEffect(() => {
    console.log('[ConfirmPublish] License check useEffect triggered', {
      hasSessionToken: !!sessionToken,
      sessionTokenValue: sessionToken ? sessionToken.substring(0, 20) + '...' : 'null',
      siteDomain,
      siteDomainType: typeof siteDomain,
      userEmail: user?.email
    });
    
    const checkActiveLicenseFromServer = async () => {
      try {
        // Wait for sessionToken and siteDomain to be available
        // siteDomain defaults to "staging" so it should always be available
        if (!sessionToken) {
          console.log('[ConfirmPublish] ❌ Missing sessionToken for license check', {
            hasSessionToken: !!sessionToken,
            siteDomain
          });
          setHasActiveLicense(false);
          return;
        }
        
        // Ensure siteDomain is not empty (should default to "staging")
        const domainToCheck = siteDomain && siteDomain.trim() ? siteDomain : "staging";
        
        if (!domainToCheck) {
          console.log('[ConfirmPublish] ❌ Missing siteDomain for license check', {
            hasSessionToken: !!sessionToken,
            siteDomain
          });
          setHasActiveLicense(false);
          return;
        }

        console.log('[ConfirmPublish] ✅ All required data available, checking license status from server...', {
          hasSessionToken: !!sessionToken,
          domainToCheck
        });
        const result = await customCodeApi.checkLicenseStatus(
          domainToCheck,
          user?.email,
          sessionToken
        );

        console.log('[ConfirmPublish] License check result:', result);

        // Handle "no license found" case
        // Response format: { success: false, available: false, message: "No active license found for this site", license: null }
        if (result.available === false || !result.license || result.license === null) {
          console.log('[ConfirmPublish] ❌ No license found for this site', {
            message: result.message,
            available: result.available,
            success: result.success,
            hasLicense: !!result.license,
            licenseValue: result.license
          });
          setHasActiveLicense(false);
          return;
        }

        // Check license status from response
        // Response format: { success: true, available: true, license: { status: "active"|"used", ... } }
        const hasActiveLicense = (result.success === true && 
                                 result.available === true && 
                                 result.license &&
                                 (result.license.status === "active" || 
                                  result.license.status === "used" ||
                                  result.license.is_used === true)) ||
                                result.hasActiveLicense === true ||
                                false;

        console.log('[ConfirmPublish] Determined hasActiveLicense:', hasActiveLicense, {
          resultKeys: Object.keys(result),
          hasActiveLicense: result.hasActiveLicense,
          available: result.available,
          licenseStatus: result.license?.status,
          message: result.message
        });

        if (result.success && hasActiveLicense) {
          console.log('[ConfirmPublish] ✅ License is ACTIVE - setting hasActiveLicense to true');
          setHasActiveLicense(true);
        } else {
          console.log('[ConfirmPublish] ❌ License is NOT active - setting hasActiveLicense to false', {
            success: result.success,
            hasActiveLicense,
            licenseStatus: result.license?.status
          });
          setHasActiveLicense(false);
        }
      } catch (error) {
        console.error('[ConfirmPublish] Error in license check:', error);
        setHasActiveLicense(false);
      }
    };
    
    // Only check if we have required data
    // Wait for domain to be fetched to avoid checking with "staging" before real domain loads
    if (sessionToken && domainFetched) {
      checkActiveLicenseFromServer();
    } else {
      console.log('[ConfirmPublish] ⏭️ Skipping license check', {
        hasSessionToken: !!sessionToken,
        domainFetched,
        siteDomain
      });
    }
  }, [siteDomain, sessionToken, user?.email, domainFetched]);

  // Check subscription status
  useEffect(() => {
    const base_url = "https://consentbit-test-server.web-8fb.workers.dev";
    
    const checkSubscription = async (accessToken: string) => {
      try {
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
    };

    const accessToken = getSessionTokenFromLocalStorage();
    const fetchSubscription = async () => {
      try {
        if (!accessToken) {
          setSubscriptionChecked(true);
          return;
        }
        
        const result = await checkSubscription(accessToken);

        // Check if any domain has isSubscribed === true
        const hasSubscription = result.subscriptionStatuses?.some(
          (status: { isSubscribed: boolean }) => status.isSubscribed === true
        );

        setIsSubscribed(Boolean(hasSubscription));
      } catch (error) {
        // Error handling - assume no subscription on error
        setIsSubscribed(false);
      } finally {
        setSubscriptionChecked(true);
      }
    };

    fetchSubscription();
  }, []);

  // Handle license activation
  const handleActivateLicense = async () => {
    console.log('[ConfirmPublish] License activation initiated', {
      hasLicenseKey: !!licenseKey.trim(),
      siteDomain,
      userEmail: user?.email,
      hasSessionToken: !!sessionToken
    });
    
    if (!licenseKey.trim()) {
      console.log('[ConfirmPublish] ❌ No license key provided');
      setLicenseError("Please enter a license key");
      return;
    }

    setIsActivatingLicense(true);
    setLicenseError("");

    try {
      console.log('[ConfirmPublish] Calling activateLicense API...');
      const result = await customCodeApi.activateLicense(
        licenseKey.trim(),
        siteDomain,
        user?.email,
        sessionToken
      );
      
      console.log('[ConfirmPublish] Activate license API response:', result);

      if (result.success) {
        console.log('[ConfirmPublish] ✅ License activation SUCCESS:', result);
        // Immediately set license as active
        setHasActiveLicense(true);
        setShowLicensePopup(false);
        setLicenseKey("");
        setLicenseError("");
        
        // Re-check license status from server after a short delay to ensure it's saved
        console.log('[ConfirmPublish] Scheduling re-check of license status in 1 second...');
        setTimeout(async () => {
          try {
            console.log('[ConfirmPublish] Re-checking license status after activation...');
            const checkResult = await customCodeApi.checkLicenseStatus(
              siteDomain,
              user?.email,
              sessionToken
            );
            console.log('[ConfirmPublish] Re-check result:', checkResult);
            // Check license status from response
            // Response format: { success: true, available: true, license: { status: "active"|"used", ... } }
            const recheckHasActiveLicense = (checkResult.success === true && 
                                             checkResult.available === true && 
                                             checkResult.license &&
                                             (checkResult.license.status === "active" || 
                                              checkResult.license.status === "used" ||
                                              checkResult.license.is_used === true)) ||
                                            checkResult.hasActiveLicense === true ||
                                            false;
            
            if (recheckHasActiveLicense) {
              console.log('[ConfirmPublish] ✅ Re-check confirmed license is active');
              setHasActiveLicense(true);
            } else {
              console.log('[ConfirmPublish] ⚠️ Re-check did not confirm license, but keeping as active since activation succeeded');
            }
          } catch (error) {
            console.error('[ConfirmPublish] Error in re-check:', error);
            // Keep hasActiveLicense as true since activation was successful
          }
        }, 1000);
        
        if (typeof webflow !== 'undefined' && webflow.notify) {
          webflow.notify({
            type: "Success",
            message: result.message || "License activated successfully"
          });
        }
      } else {
        // Handle different error types
        let errorMessage = result.message || "Failed to activate license";
        
        switch (result.error) {
          case "license_not_found":
            errorMessage = "License key not found. Please check the license key and try again.";
            break;
          case "subscription_ended":
            errorMessage = `This license key's subscription has ended on ${result.subscription_end_date_formatted || "the end date"}. Please renew your subscription.`;
            break;
          case "subscription_cancelled":
            errorMessage = `This license key's subscription has been cancelled. It will end on ${result.subscription_cancel_date_formatted || "the end date"}. Please reactivate your subscription.`;
            break;
          case "subscription_inactive":
            errorMessage = `This license key's subscription is ${result.subscription_status || "inactive"}. Please ensure your subscription is active.`;
            break;
          case "inactive_license":
            errorMessage = "This license is not active.";
            break;
          case "unauthorized":
            errorMessage = "This license key does not belong to your account.";
            break;
          case "unauthenticated":
          case "invalid_session":
            errorMessage = "Please log in to activate your license.";
            break;
          default:
            errorMessage = result.message || "Failed to activate license";
        }
        
        setLicenseError(errorMessage);
      }
    } catch (error: any) {
      setLicenseError(error.message || "Network error occurred. Please try again.");
    } finally {
      setIsActivatingLicense(false);
    }
  };


  // Helper function to check if selected element is a child of consentbit-container
  // This matches the exact implementation from CustomizationTab
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
        }
      } catch (e) {
        // Error getting selected element DOM ID
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
          
          // Try to get parent
          let parent: any = null;
          if (typeof currentElement.getParent === 'function') {
            try {
              parent = await currentElement.getParent();
            } catch (e) {
              // Error calling getParent()
            }
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
        // Reached max depth, stopping traversal
      }
      
      return isChildOfContainer;
    } catch (checkError) {
      // Return false on error to allow banner creation (fail-safe)
      return false;
    }
  };

  const handlePublishClick = async () => {
    
    try {
      const selectedElement = await webflow.getSelectedElement() as { type?: string };
      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

      if (isInvalidElement) {
        tooltips.setShowTooltip(true);
        return;
      }

      // Wait a moment before checking to ensure element selection is stable
      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
      
      // Re-get the selected element after delay to ensure it's still selected
      const currentSelectedElement = await webflow.getSelectedElement() as { type?: string };
      if (!currentSelectedElement) {
        tooltips.setShowTooltip(true);
        return;
      }

      // Check if the selected element is a child of consentbit-container FIRST (before authentication)
      // This matches the exact logic from CustomizationTab "Publish your changes" button
      try {
        const isChildOfContainer = await isSelectedElementChildOfContainer(currentSelectedElement);
        
        if (isChildOfContainer) {
          tooltips.setShowTooltip(false);
          setShowChildContainerErrorPopup(true);
          return; // Exit early - don't proceed to authentication or banner creation
        }
      } catch (checkError) {
        // If check fails, allow to proceed (fail-safe)
      }

      // Try authentication check with fallback (matching CustomizationTab pattern)
      let isUserValid = false;
      try {
        isUserValid = await isAuthenticatedForCurrentSite();
      } catch (authError) {
        // If auth check fails, open OAuth window (matching CustomizationTab behavior)
        tooltips.setShowTooltip(false);
        openAuthScreen();
        return;
      }

      if (isUserValid) {
        tooltips.setShowTooltip(false);

        // Create banner configuration using actual state values
        const config: BannerConfig = {
          language: bannerLanguages.language,
          color: bannerStyles.color,
          btnColor: bannerStyles.btnColor,
          headColor: bannerStyles.headColor,
          paraColor: bannerStyles.paraColor,
          secondcolor: bannerStyles.secondcolor,
          buttonRadius: bannerStyles.buttonRadius,
          animation: bannerAnimation.animation,
          primaryButtonText: bannerStyles.primaryButtonText,
          secondbuttontext: bannerStyles.secondbuttontext,
          toggleStates: {
            customToggle: bannerToggleStates.toggleStates.customToggle,
            disableScroll: bannerToggleStates.toggleStates.disableScroll,
            closebutton: bannerToggleStates.toggleStates.closebutton,
          },
          Font: bannerStyles.Font,
          borderRadius: bannerStyles.borderRadius
        };

        // Create banners based on user selection
        
        try {
          // Create complete banner structure (both GDPR and CCPA banners)
          await createCompleteBannerStructureWithExistingFunctions(config);
          
          // Hide loading immediately after banner creation completes
          setHideLoading(true);
          
            } catch (bannerCreationError) {
          setHideLoading(true); // Hide loading even on error
          throw bannerCreationError;
         }

        
            const bannerData = {
           siteId: siteData.siteInfo?.siteId,
           cookieExpiration: bannerConfig.cookieExpiration || "120",
           bgColor: bannerStyles.color,
           activeTab: "Customization",
           activeMode: "Advanced",
           selectedtext: "We use cookies",
           fetchScripts: true,
           btnColor: bannerStyles.btnColor,
           paraColor: bannerStyles.paraColor,
           secondcolor: bannerStyles.secondcolor,
           bgColors: bannerStyles.color,
           headColor: bannerStyles.headColor,
           secondbuttontext: bannerStyles.secondbuttontext,
           primaryButtonText: bannerStyles.primaryButtonText,
           Font: bannerStyles.Font,
           style: "Regular",
           selected: "default",
           weight: "Regular",
           borderRadius: bannerStyles.borderRadius,
           buttonRadius: bannerStyles.buttonRadius,
           animation: bannerAnimation.animation,
           easing: "ease",
           language: bannerLanguages.language,
           isBannerAdded: true,
           color: bannerStyles.color
         };
         // Hide popup immediately to prevent flicker
         popups.setShowPopup(false);
         handleConfirmPublish();
       
         try {
           const respons2 = await customCodeApi.saveBannerStyles(sessionToken, bannerData);
           
           // Check for successful response - must have success message
        
         } catch (apiError) {
           // Show warning notification to user but continue
           if (typeof webflow !== 'undefined' && webflow.notify) {
             webflow.notify({ 
               type: "info", 
               message: "Banner created but settings may not be saved. Please check your settings." 
             });
           }
         }
         
         // Always navigate to success page after banner creation
      
      } else {

        
        popups.setShowPopup(false);
        if (!isUserValid) {

          tooltips.setShowTooltip(false);
          openAuthScreen(); // Open OAuth window instead of popup
        } else if (isInvalidElement) {
          tooltips.setShowTooltip(true);
        }
      }
    } catch (error) {
      tooltips.setShowTooltip(false);
      popups.setShowPopup(false);
      
      // Show error notification to user
      if (typeof webflow !== 'undefined' && webflow.notify) {
        webflow.notify({ type: "error", message: "Failed to publish banners. Please try again." });
      }
      // Note: isCreating state is managed by useBannerCreation hook
    }
  };
  const handleCustomizeClick = () => {
    setShowCustomize(true);
  };

  const handleBackFromCustomize = () => {
    setShowCustomize(false);
  };

  // If showCustomize is true, render the CustomizationTab component
  if (showCustomize) {
    return <CustomizationTab 
      onAuth={handleBackFromCustomize} 
      initialActiveTab="Customization"
      initialBannerStyles={{
        color: bannerStyles.color,
        btnColor: bannerStyles.btnColor,
        paraColor: bannerStyles.paraColor,
        secondcolor: bannerStyles.secondcolor,
        bgColors: bannerStyles.color,
        headColor: bannerStyles.headColor,
        secondbuttontext: bannerStyles.secondbuttontext,
        primaryButtonText: bannerStyles.primaryButtonText,
        Font: bannerStyles.Font,
        style: "align",
        selected: "right",
        borderRadius: bannerStyles.borderRadius,
        buttonRadius: bannerStyles.buttonRadius,
        animation: bannerAnimation.animation,
        easing: "ease",
        language: bannerLanguages.language,
        weight: "Regular",
        toggleStates: {
          customToggle: bannerToggleStates.toggleStates.customToggle,
          disableScroll: bannerToggleStates.toggleStates.disableScroll,
          closebutton: bannerToggleStates.toggleStates.closebutton,
        }
      }}
    />;
  }


  if (showChoosePlan) {
    return <ChoosePlan onClose={() => setShowChoosePlan(false)} />;
  }
  return (
 
    <div className="publish-container">

      <div className="publish-c">
        {/* Success popup after banner creation */}
        {showSuccessPublish && (
          <div className="popup-overlay">
            <div className="success-popup">
              <p>To make the banner live, click the 'Publish' button in the top-right corner of the Webflow interface and publish your site.</p>
              <button onClick={handleSuccessPublishProceed}>Close</button>
            </div>
          </div>
        )}

        {/* Child container error popup */}
        {showChildContainerErrorPopup && (
          <div className="popup-overlay">
            <div className="success-popup">
              <p>Please select the ConsentBit container to update the banner.</p>
              <button onClick={() => setShowChildContainerErrorPopup(false)}>Close</button>
            </div>
          </div>
        )}

        {/* License key popup */}
        {showLicensePopup && (
          <div className="popup-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLicensePopup(false);
              setLicenseKey("");
              setLicenseError("");
            }
          }}>
            <div className="success-popup" style={{ textAlign: "left", maxWidth: "500px" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "500", color: "#fff" }}>
                Activate License
              </h3>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.7)"
                }}>
                  Site Domain
                </label>
                <input
                  type="text"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(10, 8, 27, 1)",
                    border: "1px solid rgba(140, 121, 255, 0.3)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.7)"
                }}>
                  License Key
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setLicenseError("");
                  }}
                  placeholder="Enter your license key"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(10, 8, 27, 1)",
                    border: licenseError ? "1px solid #ef4444" : "1px solid rgba(140, 121, 255, 0.3)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                />
                {licenseError && (
                  <p style={{ 
                    color: "#ef4444", 
                    fontSize: "12px", 
                    marginTop: "8px",
                    marginBottom: 0
                  }}>
                    {licenseError}
                  </p>
                )}
              </div>

              <div className="popup-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowLicensePopup(false);
                    setLicenseKey("");
                    setLicenseError("");
                  }}
                  disabled={isActivatingLicense}
                >
                  Cancel
                </button>
                <button
                  className="authorize-btn"
                  onClick={handleActivateLicense}
                  disabled={isActivatingLicense || !licenseKey.trim()}
                  style={{
                    opacity: (isActivatingLicense || !licenseKey.trim()) ? 0.5 : 1,
                    cursor: (isActivatingLicense || !licenseKey.trim()) ? "not-allowed" : "pointer"
                  }}
                >
                  {isActivatingLicense ? "Activating..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay with pulse animation */}
        {isCreating && !hideLoading && (
          <div className="popup">
            <div className="popup-loading-content">
              <PulseAnimation />
              <p className="popup-message">
                Almost there… your cookie banner is in the oven. Nothing's breaking, just baking!
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><NeedHelp /></div>
          {/* LEFT COLUMN */}
          <div className="content-container">
            <div className="publish-left">
              <button className="go-back-btn" onClick={onGoBack}><img className="whitearrow" src={whitearrow} alt="" /> Go back</button>

              <div className="payment-box">
                
                <div className="coupon-box">
                  <div className="coupon-container">
                    <p className="coupon-header">
                    Complete the payment to publish the Cookie banner to custom domain
                    </p>

                     <div 
                       className="coupon-strip"
                       style={{
                         backgroundImage: `url(${couponCodeBg})`,
                         backgroundSize: "100% 100%",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat"
                       }}
                     >
                      <div style={{ display: "flex", flexDirection: "column", padding: "10px" ,justifyContent: "center",marginLeft: "75px"}}>
                        <span style={{color: "white",fontSize: "8px",marginLeft: "0px",fontWeight: "600"}}>Use Coupon Code:</span>
                        <span style={{color: "white",fontWeight: "400",fontSize: "12px"}}>{COUPON_CODE}</span>
                      </div>

                       <img
                        src={iconSrc}   // ✅ use state here
                        alt="Copy"
                        className="copy-icon"
                        onClick={() => {
                          navigator.clipboard.writeText(COUPON_CODE)
                            .then(() => {
                              setIconSrc(tickSVG); // show tick
                              setTimeout(() => setIconSrc(CopyContent), 10000); // revert after 10s
                            })
                            .catch(() => {
                              // fallback copy
                              const textArea = document.createElement("textarea");
                              textArea.value = COUPON_CODE;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);

                              setIconSrc(tickSVG);
                              setTimeout(() => setIconSrc(CopyContent), 10000);
                            });
                        }}
                        title="Copy"
                      /> 
                    </div>  
                  </div>

                  <div style={{ width: "100%", borderTop: "1px solid rgba(140, 121, 255, 1)" }}>
                    {(() => {
                      const shouldShowPayNow = subscriptionChecked && !hasActiveLicense && !isSubscribed;
                      console.log('[ConfirmPublish] Pay Now button visibility check:', {
                        subscriptionChecked,
                        hasActiveLicense,
                        isSubscribed,
                        shouldShowPayNow
                      });
                      return shouldShowPayNow;
                    })() && (
                      <div className="pay-container"> 
                        <a 
                          href="https://billing.stripe.com/p/login/00gbIJclf5nz4Hm8ww" 
                          target="_blank" 
                          onClick={(e) => {
                            e.preventDefault();
                            setShowChoosePlan(true);
                          }} 
                          rel="noopener noreferrer" 
                          className="pay-now-btn" 
                          style={{ 
                            textDecoration: 'none'
                          }}
                        >
                          Pay now
                        </a>
                        <img 
                          onClick={(e) => {
                            e.preventDefault();
                            setShowChoosePlan(true);
                          }} 
                          src={arrow} 
                          alt="" 
                        />
                      </div>
                    )}
                    {subscriptionChecked && !hasActiveLicense && !isSubscribed && (
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",                       
                        width: "100%",                       
                      }}>
                        <div style={{ 
                          flex: "0.9 0 0%",
                          height: "1px", 
                          background: "rgba(140, 121, 255, 0.3)" 
                        }}></div>
                        <div style={{
                          color: "#a78bfa",
                          fontSize: "10px",
                          fontWeight: "600",
                          fontFamily: "'DM Sans', sans-serif",
                          whiteSpace: "nowrap"
                        }}>
                          OR
                        </div>
                        <div style={{ 
                          flex: "5 0 0%",
                          height: "1px", 
                          background: "rgba(140, 121, 255, 0.3)" 
                        }}></div>
                      </div>
                    )}
                    <div style={{ padding: "4px 10px 0px 10px", display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => setShowLicensePopup(true)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#a78bfa",
                          padding: "6px 0px",
                          fontSize: "11px",
                          fontWeight: "400",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                      >
                        {hasActiveLicense ? "License activated" : "Activate licence key"}
                      </button>
                    </div>
                  </div>
                </div>


                <div className="note">
                  <p className="note-star">*</p>
                  <p className="note-text">
                  Complete the payment to publish the Cookie banner to custom domain.
                    If payment is not made, it will only be published to the staging site.
                  </p>
                </div>

                <button
                  className="publish-btn"
                  disabled={!isConfirmed || isCreating}
                  onClick={() => {
                    handlePublishClick();
                  }}
                >
                  {isCreating ? "Creating..." : "Publish"}
                </button>
              </div>
              {tooltips.showTooltip && (
                <div className={`global-error-banner ${tooltips.fadeOut ? 'fade-out' : 'fade-in'}`}>
                  <img src={errorsheild} alt="errorsheild" />
                  <div className="global-error-content">
                    <span>To continue, choose an element inside the page Body.</span>
                  </div>
                  <img src={crossmark} onClick={() => { tooltips.setShowTooltip(false); tooltips.setFadeOut(false); }} alt="" />
                </div>
              )}

              <button onClick={handleCustomize} className="customize-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Customize <img src={arrow} alt="" />
              </button>
            </div>

            {/* RIGHT COLUMN - PREVIEW */}
            <div className="publish-right">

              <div className="preview-window">
                <img className="consentbit-icon" src={logo} alt="dots" />

                <div className="preview-header">Preview</div>
                {/* Browser mockup */}
                <div
                  className="preview-content"
                  style={{
                    background: `url(${Previewtab}) no-repeat center center`,
                    backgroundSize: "contain",   // keep proportions, full image
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                  }}
                >

                  <div className="cookie-banner1">
                    <span className="cookie-title1">Cookie Setting</span>
                    <p className="cookie-text">
                      We use cookies to provide you with the best possible experience.
                      They also allow us to analyze user behavior in order to
                      continually improve the website for you.
                    </p>
                    <div className="cookie-actions">
                      <button className="btns-preferences">Preferences</button>
                      <button className="btns-reject">Reject</button>
                      <button className="btns-accept">Accept</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    //   )}
    // </>


  );
};

export default ConfirmPublish;
