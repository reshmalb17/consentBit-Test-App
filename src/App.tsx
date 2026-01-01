import React, { useState, useEffect } from "react";
import "./style/styless.css";
import WelcomeScreen from "./components/WelcomeScreen";
import SetupStep from "./components/SetupStep";
import WelcomeScipt from "./components/WelcomeScript";
import CustomizationTab from "./components/CustomizationTab";
import ConfirmPublish from "./components/ConfirmPublish";
import SuccessPublish from "./components/SuccessPublish";
import { useQueryClient } from "@tanstack/react-query";
import { useAppState } from "./hooks/useAppState";  
import { useAuth } from "./hooks/userAuth";
import { getCurrentSiteId, listCurrentSiteData, clearCurrentSiteData, clearAllData, clearAuthData, clearAuthIfNotAuthorized, checkMigrationStatus, forceMigration, usePersistentState, debugAuthStatus, forceClearAuthData, clearAllDataIncludingAuth, cleanBannerDetailsFromStorage } from "./hooks/usePersistentState";
import { customCodeApi } from "./services/api";
import { CodeApplication } from "./types/types";
import { getSessionTokenFromLocalStorage } from './util/Session';
import { removeAuthStorageItem, getAuthStorageItem, setAuthStorageItem, getAuthData } from './util/authStorage';
import webflow from './types/webflowtypes';
import pkg from '../package.json';

// Import images for tooltip
const errorsheild = new URL("./assets/warning-2.svg", import.meta.url).href;
const crossmark = new URL("./assets/group.svg", import.meta.url).href;

const appVersion = pkg.version;






const App: React.FC = () => {


  const queryClient = useQueryClient();
  const [skipWelcomeScreen, setSkipWelcomeScreen] = usePersistentState("skipWelcomeScreen", false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBannerStatusLoading, setIsBannerStatusLoading] = useState(true);
  const [customizationInitialTab, setCustomizationInitialTab] = useState("Settings");
  const [bannerDetailsFromApi, setBannerDetailsFromApi] = useState<any>(null);
  
  // Global timing tracking for authorization flow
  const [globalAuthStartTime, setGlobalAuthStartTime] = useState<number | null>(null);
  
  
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
    bannerLanguages,
    bannerToggleStates,
    localStorage: localStorageData,
    componentStates,
  } = useAppState();
  
  // Auto-dismiss tooltip after 5 seconds (same as CustomizationTab and ConfirmPublish)
  useEffect(() => {
    if (tooltips.showTooltip) {
      const timer = setTimeout(() => {
        tooltips.setFadeOut(true);
        setTimeout(() => {
          tooltips.setShowTooltip(false);
          tooltips.setFadeOut(false);
        }, 300); // Wait for fade-out animation
      }, 5000); // 5 seconds
      return () => {
        clearTimeout(timer);
      };
    }
  }, [tooltips.showTooltip, tooltips.setFadeOut, tooltips.setShowTooltip]);
  
  // Track when scan button becomes available
  useEffect(() => {
    const currentTime = performance.now();
    
    // Check if scan button should be available (authenticated && !isCheckingAuth && !isBannerAdded)
  }, [isAuthenticated, isCheckingAuth, bannerBooleans.isBannerAdded, globalAuthStartTime]);

  
  const { user, sessionToken, exchangeAndVerifyIdToken, openAuthScreen, isAuthenticatedForCurrentSite, attemptAutoRefresh } = useAuth();
  const [isFetchWelcomeScripts, setIsFetchWelcomeScripts] = useState(false);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  
    // App initialization with clean welcome screen flow
  useEffect(() => {
    const initializeApp = async () => {
      // Clean banner details from consolidated storage on app start
      cleanBannerDetailsFromStorage();
      
      // Always reset to welcome screen on app launch
      setSkipWelcomeScreen(false);
      componentStates.resetComponentStates();
      componentStates.setIsWelcomeScreen(true);
      
      setIsAppInitializing(false);
      setIsCheckingAuth(true);
      
      // Set overall timeout for authorization check (15 seconds)
      const authTimeout = setTimeout(() => {
        setSkipWelcomeScreen(false);
        bannerBooleans.setIsBannerAdded(false);
        setIsAuthenticated(false);
        setIsBannerStatusLoading(false);
        setIsCheckingAuth(false);
      }, 15000);
      
      try {
        // Get existing user data from sessionStorage
        const existingUserDataStr = sessionStorage.getItem("consentbit-userinfo");
        let existingUserData = null;
        if (existingUserDataStr && existingUserDataStr !== "null" && existingUserDataStr !== "undefined") {
          try {
            existingUserData = JSON.parse(existingUserDataStr);
          } catch (e) {
            // Error parsing user data
          }
        }
        
        // Get current site info from Webflow with timeout
        const siteInfoPromise = webflow.getSiteInfo();
        const siteInfoTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getSiteInfo timeout after 5 seconds')), 5000);
        });
        
        let siteInfo;
        try {
          siteInfo = await Promise.race([siteInfoPromise, siteInfoTimeout]);
        } catch (error) {
          clearTimeout(authTimeout);
          setSkipWelcomeScreen(false);
          bannerBooleans.setIsBannerAdded(false);
          setIsAuthenticated(false);
          setIsBannerStatusLoading(false);
          setIsCheckingAuth(false);
          return;
        }
        
        // If user data doesn't exist, or siteId doesn't match, exchange token and store again
        if (!existingUserData) {
          try {
            const exchangePromise = exchangeAndVerifyIdToken();
            const exchangeTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Token exchange timeout after 10 seconds')), 10000);
            });
            await Promise.race([exchangePromise, exchangeTimeout]);
            
            // Re-fetch user data after exchange
            const newUserDataStr = sessionStorage.getItem("consentbit-userinfo");
            if (newUserDataStr && newUserDataStr !== "null" && newUserDataStr !== "undefined") {
              try {
                existingUserData = JSON.parse(newUserDataStr);
              } catch (e) {
                // Error parsing user data after exchange
              }
            }
          } catch (error: any) {
            // Continue with default state if token exchange fails
          }
        } else if (existingUserData.siteId && siteInfo?.siteId) {
          if (existingUserData.siteId !== siteInfo.siteId) {
            try {
              const exchangePromise = exchangeAndVerifyIdToken();
              const exchangeTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Token exchange timeout after 10 seconds')), 10000);
              });
              await Promise.race([exchangePromise, exchangeTimeout]);
              
              // Re-fetch user data after exchange
              const newUserDataStr = sessionStorage.getItem("consentbit-userinfo");
              if (newUserDataStr && newUserDataStr !== "null" && newUserDataStr !== "undefined") {
                try {
                  existingUserData = JSON.parse(newUserDataStr);
                } catch (e) {
                  // Error parsing user data after exchange
                }
              }
            } catch (error: any) {
              // Continue with existing data if token exchange fails
            }
          }
        }
        
        // Get token from existing user data
        const token = existingUserData?.sessionToken;
        
        if (token && siteInfo?.siteId) {
          try {
            // Check banner status from API
            const apiPromise = customCodeApi.getBannerStyles(token, siteInfo.siteId);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('API call timeout after 10 seconds')), 10000);
            });
            
            const response = await Promise.race([apiPromise, timeoutPromise]);
            
            // Clear the auth timeout since we completed successfully
            clearTimeout(authTimeout);
            
            // Store banner details from API to pass to CustomizationTab
            if (response) {
              setBannerDetailsFromApi(response);
            }
            
            // Set banner status based on API response
            if (response && response.isBannerAdded === true) {
              setSkipWelcomeScreen(false);
              bannerBooleans.setIsBannerAdded(true);
              setIsAuthenticated(true);
            } else {
              setSkipWelcomeScreen(false);
              bannerBooleans.setIsBannerAdded(false);
              setIsAuthenticated(!!token);
            }
            setIsBannerStatusLoading(false);
          } catch (error: any) {
            clearTimeout(authTimeout);
            setSkipWelcomeScreen(false);
            bannerBooleans.setIsBannerAdded(false);
            
            // Check if it's a 401 Unauthorized error (expired/invalid token)
            const isUnauthorized = error?.status === 401 || 
                                   error?.message?.includes('401') || 
                                   error?.message?.includes('Unauthorized');
            
            if (isUnauthorized) {
              // Token is expired or invalid - clear auth data and show authorize
              clearAuthData();
              setIsAuthenticated(false);
            } else {
              // For other errors, still check if we have token
              setIsAuthenticated(!!token);
            }
            setIsBannerStatusLoading(false);
          }
        } else {
          // No token or siteId available
          clearTimeout(authTimeout);
          setSkipWelcomeScreen(false);
          bannerBooleans.setIsBannerAdded(false);
          setIsAuthenticated(false);
          setIsBannerStatusLoading(false);
        }
      } catch (error) {
        clearTimeout(authTimeout);
        setSkipWelcomeScreen(false);
        bannerBooleans.setIsBannerAdded(false);
        setIsAuthenticated(false);
        setIsBannerStatusLoading(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on app launch

  // Update isAuthenticated state when user authentication changes
  // Skip this during welcome screen auth flow to prevent conflicts
  useEffect(() => {
    // Don't update if we're in the middle of welcome screen authorization
    // The auth completion useEffect will handle it
    if (globalAuthStartTime) {
      return;
    }
    
    // Check if we have a session token (either from hook or storage)
    const tokenFromStorage = getSessionTokenFromLocalStorage();
    const hasToken = !!(sessionToken || tokenFromStorage);
    
    // Check if we have user email (either from hook or storage)
    const authData = getAuthData();
    const hasEmail = !!(user?.email || authData?.email);
    
    const isUserAuthenticated = hasToken && hasEmail;
    
    // Only update if the value actually changed to prevent unnecessary re-renders
    if (isAuthenticated !== isUserAuthenticated) {
      setIsAuthenticated(isUserAuthenticated);
    }
  }, [user, sessionToken, globalAuthStartTime, isAuthenticated]);

  // Script injection using injectScript API (replaces old script registration)
  useEffect(() => {
    const injectScriptOnAuth = async () => {
      // Only inject script if user is authenticated and has session token
      if (!isAuthenticated || !sessionToken || !user?.email) {
        return;
      }

      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        return;
      }

      try {
        const siteInfo = await webflow.getSiteInfo();
        if (siteInfo?.siteId) {
          // Use injectScript API instead of old registration methods
          const injectResponse = await customCodeApi.injectScript(token, siteInfo.siteId);
          if (injectResponse && injectResponse.success) {
            // Script injected successfully
          } else {
            // Script injection response indicates failure
          }
        }
      } catch (error) {
        // Error handling
      }
    };

    // Delay script injection to ensure authentication is fully settled
    const timer = setTimeout(() => {
      injectScriptOnAuth();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, sessionToken, user?.email]); // Trigger when auth state changes

  // Call postInstallationCall only once on first launch, after authentication is ready
  useEffect(() => {
    

    // Only proceed if authentication is ready
    if (!isAuthenticated || !sessionToken) {
   
      return;
    }

    // Check if we've already called this (prevent multiple calls)
    const hasCalled = getAuthStorageItem("postInstallationCalled");
    
    if (hasCalled === "true") {
      return;
    }

    const callPostInstallation = async () => {
      try {
        const token = getSessionTokenFromLocalStorage();
       
        if (token) {
          const siteInfo = await webflow.getSiteInfo();
        
          
          if (siteInfo?.siteId) {
            // Call the API - it will handle checking if already processed
            try {
             
              
              const result = await customCodeApi.postInstalltionCall(token, siteInfo.siteId);
              
             
              
              // Mark as called to prevent duplicate calls
              setAuthStorageItem("postInstallationCalled", "true");
              
              // API returns { success: true, message: 'Already processed' } if already called
              // or { success: true, message: 'Successfully processed' } if just processed
            } catch (apiError: any) {
              // Handle CORS and other API errors gracefully - don't throw
            }
          }
        }
      } catch (error) {
        // Error handling
        // Silently handle error - don't block app
      }
    };

    callPostInstallation();
  }, [isAuthenticated, sessionToken]); // Trigger when authentication is ready

 


  // Welcome Screen -> WelcomeScript (Scan Project clicked)
  const handleWelcomeScreen = async () => {
    try {
      // Check if site is published before scanning
      let isPublished = false;
      let siteInfo = null;        siteInfo = await webflow.getSiteInfo();

      
      try {
        // Check publication status using domains[].lastPublished from getSiteInfo()
        // If any domain has a non-null lastPublished value, site is published
        if (siteInfo?.domains && siteInfo.domains.length > 0) {
          const hasPublishedDomain = siteInfo.domains.some(domain => 
            domain.lastPublished !== null && domain.lastPublished !== undefined
          );
          
          isPublished = hasPublishedDomain;
        } else {
          // No domains found, assume not published
          isPublished = false;
        }
      } catch (checkError) {
        // If check fails, we'll proceed anyway but show a warning
        isPublished = false;
      }
      
      // If site doesn't appear to be published, notify user and STOP scanning
      if (!isPublished) {
        // Show custom tooltip notification (same style as CustomizationTab and ConfirmPublish)
        tooltips.setShowTooltip(true);
        tooltips.setFadeOut(false);
        
        // STOP here - don't proceed with scanning
        return;
      }
      
      // Site is published - proceed with scanning
      componentStates.setIsWelcomeScreen(false);
      setIsFetchWelcomeScripts(true);
      componentStates.setWelcomeScipt(true);
    } catch (error) {
      // On error, show notification and don't proceed (fail closed for safety)
      webflow.notify({ 
        type: "error", 
        message: "Could not verify publication status. Please ensure your site is published before scanning." 
      });
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        const selectors = [
          '[data-wf-notification]',
          '.w-notification',
          '[class*="notification"]',
          '[class*="Notification"]',
          '.notification-container',
          '[role="alert"]'
        ];
        
        let notification: Element | null = null;
        for (const selector of selectors) {
          notification = document.querySelector(selector);
          if (notification) break;
        }
        
        if (notification) {
          const closeSelectors = [
            'button[aria-label*="close" i]',
            'button[aria-label*="dismiss" i]',
            '[class*="close"]',
            '[class*="dismiss"]',
            '[class*="Close"]',
            'button:last-child',
            'svg[class*="close"]',
            'svg[class*="Close"]'
          ];
          
          let closeButton: Element | null = null;
          for (const selector of closeSelectors) {
            closeButton = notification.querySelector(selector);
            if (closeButton && closeButton instanceof HTMLElement) {
              closeButton.click();
              return;
            }
          }
          
          if (notification instanceof HTMLElement) {
            notification.style.display = 'none';
            notification.style.opacity = '0';
            notification.style.visibility = 'hidden';
          }
        }
      }, 5000);
      // Don't proceed with scanning if we can't verify publication status
      return;
    }
  };

  // WelcomeScript -> SetupStep (Next clicked)
  const handleWelcomeScipt = () => {
    componentStates.resetComponentStates();
    componentStates.setIsSetUpStep(true);
  };

  // WelcomeScript -> WelcomeScreen (Go back)
  const handleWelcomeScriptGoBack = () => {
    // Don't reset script-related states, just change the component
    componentStates.setWelcomeScipt(false);
    componentStates.setIsSetUpStep(false);
    componentStates.setIsConfirmPublish(false);
    componentStates.setIsSuccessPublish(false);
    componentStates.setIsCustomizationTab(false);
    componentStates.setIsWelcomeScreen(true);
    // Don't set fetchScripts to true - scripts are already loaded and preserved in ScriptContext
    // bannerBooleans.setFetchScripts(true); // This was causing re-fetching and loading screen
  };

  // SetupStep -> ConfirmPublish (Proceed to next step clicked)
  const handleSetUpStep = () => {
    // Set all states to false first, then set the one we want
    componentStates.setIsWelcomeScreen(false);
    componentStates.setWelcomeScipt(false);
    componentStates.setIsSetUpStep(false);
    componentStates.setIsSuccessPublish(false);
    componentStates.setIsCustomizationTab(false);
    componentStates.setIsConfirmPublish(true);
  };

  // ConfirmPublish -> SuccessPublish (Publish Banner clicked)
  const handleConfirmPublish = () => {
    componentStates.resetComponentStates();
    componentStates.setIsSuccessPublish(true);
    // Set flag that banner was added through welcome flow
    bannerBooleans.setIsBannerAdded(true);
    componentStates.setIsCustomizationTab(false);
  };

  // ConfirmPublish -> SetupStep (Go back)
  const handleConfirmPublishGoBack = () => {
    // Set all states to false first, then set the one we want
    componentStates.setIsWelcomeScreen(false);
    componentStates.setWelcomeScipt(false);
    componentStates.setIsConfirmPublish(false);
    componentStates.setIsSuccessPublish(false);
    componentStates.setIsCustomizationTab(false);
    componentStates.setIsSetUpStep(true);
  };

  // SuccessPublish -> CustomizationTab (Customize clicked)
  const handleCustomize = () => {
    // Set all states to false first, then set the one we want
    componentStates.setIsWelcomeScreen(false);
    componentStates.setWelcomeScipt(false);
    componentStates.setIsSetUpStep(false);
    componentStates.setIsConfirmPublish(false);
    componentStates.setIsSuccessPublish(false);
    componentStates.setIsCustomizationTab(true);
    // Set initial tab to Customization when coming from Customize button
    setCustomizationInitialTab("Customization");
  };

  // SuccessPublish -> ConfirmPublish (Go back)
  const handleSuccessPublishGoBack = () => {
    // Set all states to false first, then set the one we want
    componentStates.setIsWelcomeScreen(false);
    componentStates.setWelcomeScipt(false);
    componentStates.setIsSetUpStep(false);
    componentStates.setIsSuccessPublish(false);
    componentStates.setIsCustomizationTab(false);
    componentStates.setIsConfirmPublish(true);
  };


  // Welcome screen handlers
  const handleWelcomeAuthorize = async () => {
    const authStartTime = performance.now();
    setGlobalAuthStartTime(authStartTime);
    
    try {
      // Force window to open, bypassing silent auth
      await openAuthScreen(true);
    } catch (error: any) {
      // Handle any errors that occur during auth screen opening
      const errorMessage = error?.message || "Failed to open authorization window";
      webflow.notify({ 
        type: "error", 
        message: errorMessage 
      });
    }
    // The authentication state will be updated when the user completes authorization
    // through the useEffect that depends on user?.email and sessionToken
  };

  // Watch for auth completion after welcome screen authorization
  useEffect(() => {
    // Only trigger if we just completed authorization (user and token become available)
    if (user?.email && sessionToken && globalAuthStartTime) {
      // Wait a bit for token exchange to fully complete
      const checkAuthComplete = setTimeout(async () => {
        const token = getSessionTokenFromLocalStorage();
        
        if (token) {
          try {
            const siteInfo = await webflow.getSiteInfo();
            
            if (siteInfo?.siteId) {
              // Check banner status and update authentication state (similar to installation flow)
              setIsCheckingAuth(true);
              setIsBannerStatusLoading(true);
              
              const response = await customCodeApi.getBannerStyles(token, siteInfo.siteId);
              
              // Check if response indicates authentication failure
              if (response && (response.error || response.success === false)) {
                // Clear auth data if we get unauthorized error
                clearAuthData();
                setIsAuthenticated(false);
                bannerBooleans.setIsBannerAdded(false);
                setIsCheckingAuth(false);
                setIsBannerStatusLoading(false);
                return;
              }
              
              if (response && response.isBannerAdded === true) {
                bannerBooleans.setIsBannerAdded(true);
                setIsAuthenticated(true);
              } else {
                bannerBooleans.setIsBannerAdded(false);
                setIsAuthenticated(true);
              }
              setIsBannerStatusLoading(false);
              setIsCheckingAuth(false);
            } else {
              setIsAuthenticated(!!token);
              setIsCheckingAuth(false);
              setIsBannerStatusLoading(false);
            }
          } catch (error: any) {
            // Check if it's a 401 Unauthorized error
            const isUnauthorized = error?.status === 401 || 
                                   error?.message?.includes('401') || 
                                   error?.message?.includes('Unauthorized') ||
                                   error?.errorText?.includes('Unauthorized');
            
            if (isUnauthorized) {
              clearAuthData();
              setIsAuthenticated(false);
              bannerBooleans.setIsBannerAdded(false);
              // Clear the global auth start time to allow retry
              setGlobalAuthStartTime(null);
            } else {
              // For other errors, still check if we have token
              setIsAuthenticated(!!token);
            }
            setIsCheckingAuth(false);
            setIsBannerStatusLoading(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          setIsBannerStatusLoading(false);
        }
        
        // Clear the global auth start time to prevent re-triggering
        setGlobalAuthStartTime(null);
      }, 1500); // Wait 1.5 seconds for token exchange to complete
      
      return () => {
        clearTimeout(checkAuthComplete);
      };
    }
  }, [user?.email, sessionToken, globalAuthStartTime]);

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };

  const handleBackToWelcome = () => {
    // Don't clear the banner added flag - preserve the banner status
    // bannerBooleans.setIsBannerAdded(false);
    setSkipWelcomeScreen(false);
    componentStates.resetComponentStates();
    componentStates.setIsWelcomeScreen(true);
    // Reset initial tab to Settings
    setCustomizationInitialTab("Settings");
  };

  // SetupStep -> WelcomeScript (Go back)
  const handleSetupGoBack = () => {
    // Don't reset fetchScripts to preserve script states
    componentStates.setIsSetUpStep(false);
    componentStates.setWelcomeScipt(true);
    // Don't set fetchScripts to true - scripts are already loaded and preserved in ScriptContext
    // bannerBooleans.setFetchScripts(true); // This was causing re-fetching and loading screen
  };

  
  




useEffect(() => {
  const detectSiteChange = async () => {
    try {
      // Always get fresh site info for critical operations
      const siteInfo = await webflow.getSiteInfo();
      const newSiteId = siteInfo?.siteId;
      
      if (!newSiteId) {
        return;
      }
      
      if (newSiteId !== currentSiteId) {
        if (currentSiteId !== null) {
          // Clear site-specific data
          removeAuthStorageItem('scriptContext_scripts');
          
          // Force complete re-authentication for new site
          try {
            removeAuthStorageItem("consentbit-userinfo");
            await exchangeAndVerifyIdToken();
          } catch (error) {
            // Handle gracefully - maybe show re-auth prompt
            // Could set a flag to show re-auth UI
          }
        }
        
        setCurrentSiteId(newSiteId);
        
        // Update cached site info
        setAuthStorageItem("siteInfo", JSON.stringify(siteInfo));
        setAuthStorageItem("currentSiteId", newSiteId);
      }
    } catch (error) {
      // Silent error handling
    }
  };
  
  detectSiteChange();
}, [currentSiteId, exchangeAndVerifyIdToken]);







  // Debug section - remove this in production
  const debugInfo = {
    currentSiteId: getCurrentSiteId(),
    currentSiteData: listCurrentSiteData(),
    migrationStatus: checkMigrationStatus(),
  };


  // Debug function to check auth status
  const handleDebugAuth = () => {
    debugAuthStatus();
  };

  // Data is automatically cleared on every reload (see useEffect above)



  return (
   <div>
   

      {skipWelcomeScreen ? (
        <CustomizationTab onAuth={handleBackToWelcome} isAuthenticated={isAuthenticated} initialActiveTab={customizationInitialTab} />
      ) : componentStates.isWelcomeScreen ? (
        (() => {
          return (
        <WelcomeScreen 
          onAuthorize={handleWelcomeAuthorize}
          onNeedHelp={handleWelcomeNeedHelp}
          authenticated={isAuthenticated}
          handleWelcomeScreen={handleWelcomeScreen}
          isCheckingAuth={isCheckingAuth}
          isBannerAdded={bannerBooleans.isBannerAdded}
          onCustomize={handleCustomize}
          isBannerStatusLoading={isBannerStatusLoading}
        />
          );
        })()
      ) : componentStates.isWelcomeScipt ? (
        <WelcomeScipt
          isWFetchWelcomeScripts={isFetchWelcomeScripts}
          handleWelcomeScipt={handleWelcomeScipt}
          onGoBack={handleWelcomeScriptGoBack}
        />
      ) : componentStates.isSetUpStep ? (
        <SetupStep
          onGoBack={handleSetupGoBack}
          handleSetUpStep={handleSetUpStep}
        />
      ) : componentStates.isConfirmPublish ? (
        <ConfirmPublish
          onGoBack={handleConfirmPublishGoBack}
          handleCustomize={handleCustomize}
          handleConfirmPublish={handleConfirmPublish}
        />
      ) : componentStates.isSuccessPublish ? (
        <SuccessPublish
          onGoBack={handleSuccessPublishGoBack}
          handleCustomize={handleCustomize}
        />
      ) : componentStates.isCustomizationTab ? (
        <CustomizationTab 
            onAuth={handleBackToWelcome} 
            isAuthenticated={isAuthenticated} 
            initialActiveTab={customizationInitialTab}
            initialBannerStyles={bannerDetailsFromApi ? {
              color: bannerDetailsFromApi.color,
              btnColor: bannerDetailsFromApi.btnColor,
              paraColor: bannerDetailsFromApi.paraColor,
              secondcolor: bannerDetailsFromApi.secondcolor,
              bgColors: bannerDetailsFromApi.bgColors || bannerDetailsFromApi.bgColor,
              headColor: bannerDetailsFromApi.headColor,
              secondbuttontext: bannerDetailsFromApi.secondbuttontext,
              primaryButtonText: bannerDetailsFromApi.primaryButtonText,
              Font: bannerDetailsFromApi.Font,
              style: bannerDetailsFromApi.style,
              selected: bannerDetailsFromApi.selected,
              borderRadius: bannerDetailsFromApi.borderRadius,
              buttonRadius: bannerDetailsFromApi.buttonRadius,
              animation: bannerDetailsFromApi.animation,
              easing: bannerDetailsFromApi.easing,
              language: bannerDetailsFromApi.language,
              weight: bannerDetailsFromApi.weight,
              cookieExpiration: bannerDetailsFromApi.cookieExpiration,
              privacyUrl: bannerDetailsFromApi.privacyUrl,
              toggleStates: bannerDetailsFromApi.toggleStates ? {
                customToggle: bannerDetailsFromApi.toggleStates.customToggle,
                disableScroll: bannerDetailsFromApi.toggleStates.disableScroll,
                closebutton: bannerDetailsFromApi.toggleStates.closebutton,
              } : undefined
            } : undefined}
          />
      ) : (
        <WelcomeScreen 
          onAuthorize={handleWelcomeAuthorize}
          onNeedHelp={handleWelcomeNeedHelp}
          authenticated={isAuthenticated}
          handleWelcomeScreen={handleWelcomeScreen}
          isCheckingAuth={isCheckingAuth}
          isBannerAdded={bannerBooleans.isBannerAdded}
          onCustomize={handleCustomize}
          isBannerStatusLoading={isBannerStatusLoading}
        />
      )}
      
      {/* Global tooltip notification for unpublished site */}
      {tooltips.showTooltip && (
        <div className={`global-error-banner ${tooltips.fadeOut ? 'fade-out' : 'fade-in'}`}>
          <img src={errorsheild} alt="errorsheild" />
          <div className="global-error-content">
            <span>Publish your site before scanning</span>
          </div>
          <img src={crossmark} onClick={() => { tooltips.setShowTooltip(false); tooltips.setFadeOut(false); }} alt="" />
        </div>
      )}
       
     
    </div>
  );
};

export default App;
