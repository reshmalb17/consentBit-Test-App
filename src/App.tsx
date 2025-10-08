import React, { useState,useEffect } from "react";
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
import { serialize } from "v8";
import { getCurrentSiteId, listCurrentSiteData, clearCurrentSiteData, clearAllData, clearAuthData, clearAuthIfNotAuthorized, checkMigrationStatus, forceMigration, usePersistentState, debugAuthStatus, forceClearAuthData, clearAllDataIncludingAuth } from "./hooks/usePersistentState";
import { customCodeApi } from "./services/api";
import { CodeApplication } from "./types/types";
import { getSessionTokenFromLocalStorage } from './util/Session';
import { removeAuthStorageItem, getAuthStorageItem, setAuthStorageItem, getAuthData } from './util/authStorage';
import webflow from './types/webflowtypes';
import pkg from '../package.json';

const appVersion = pkg.version;

// // Helper function to add script directly to document head
// const addScriptToHead = (scriptUrl: string) => {
//   try {
//     // Check if script already exists
//     const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
//     if (existingScript) {
//       console.log('Script already exists in head:', scriptUrl);
//       return;
//     }

//     // Create and add script element
//     const script = document.createElement('script');
//     script.src = scriptUrl;
//     script.async = true;
//     script.defer = true;
    
//     // Add to head
//     document.head.appendChild(script);
//     console.log('Script added to document head:', scriptUrl);
    
//     // Log success/failure
//     script.onload = () => {
//       console.log('Script loaded successfully:', scriptUrl);
//     };
    
//     script.onerror = () => {
//       console.error('Failed to load script:', scriptUrl);
//     };
//   } catch (error) {
//     console.error('Error adding script to head:', error);
//   }
// };

// // Helper function to check if script exists in head
// const checkScriptInHead = (scriptUrl: string) => {
//   const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
//   console.log('Script check in head:', scriptUrl, existingScript ? 'EXISTS' : 'NOT FOUND');
//   return !!existingScript;
// };

// // Helper function to log all scripts in head for debugging
// const logAllScriptsInHead = () => {
//   const scripts = document.head.querySelectorAll('script');
//   console.log('All scripts in document head:');
//   scripts.forEach((script, index) => {
//     console.log(`${index + 1}. ${script.src || script.textContent?.substring(0, 50) + '...'}`);
//   });
// };

// Debug function removed - no session storage checks needed
  
//   // Check for common consent script URLs
//   const commonScriptUrls = [
//     'https://cb-server.web-8fb.workers.dev',
//     'consentbit',
//     'v2',
//     'banner'
//   ];
  
//   commonScriptUrls.forEach(url => {
//     const scripts = document.head.querySelectorAll(`script[src*="${url}"]`);
//     console.log(`Scripts containing "${url}":`, scripts.length);
//   });
// };

// // Global function to manually trigger script registration
// (window as any).forceScriptRegistration = async () => {
//   console.log('=== FORCING SCRIPT REGISTRATION ===');
  
//   // Clear existing flags
//   sessionStorage.removeItem(`scripts_registered_${appVersion}`);
//   sessionStorage.removeItem(`v2_consent_script_registered_${appVersion}`);
  
//   // Get fresh token and site info
//   const token = getSessionTokenFromLocalStorage();
//   if (!token) {
//     console.error('No session token available');
//     return;
//   }
  
//   try {
//     const siteInfo = await webflow.getSiteInfo();
//     console.log('Site info:', siteInfo);
    
//     if (appVersion === '2.0.0' || appVersion === '2.0.1') {
//       console.log('Registering V2 Banner Custom Code...');
//       const result = await customCodeApi.registerV2BannerCustomCode(token);
//       console.log('Registration result:', result);
      
//       if (result && result.result) {
//         const params: CodeApplication = {
//           targetType: 'site',
//           targetId: siteInfo.siteId,
//           scriptId: result.result.id,
//           location: 'header',
//           version: result.result.version
//         };
        
//         console.log('Applying V2 script...', params);
//         const applyResult = await customCodeApi.applyV2Script(params, token);
//         console.log('Apply result:', applyResult);
        
//         // Add directly to head as fallback
//         if (result.result.hostedLocation) {
//           addScriptToHead(result.result.hostedLocation);
//         }
        
//         console.log('Script registration completed');
//       }
//     }
//   } catch (error) {
//     console.error('Error in force script registration:', error);
//   }
// };

// Global function to test script addition to head
// (window as any).testScriptAddition = (scriptUrl: string = 'https://cb-server.web-8fb.workers.dev/test-script.js') => {
//   console.log('=== TESTING SCRIPT ADDITION TO HEAD ===');
//   console.log('Adding test script:', scriptUrl);
//   addScriptToHead(scriptUrl);
  
//   setTimeout(() => {
//     checkScriptInHead(scriptUrl);
//     logAllScriptsInHead();
//   }, 1000);
// };





const App: React.FC = () => {

  // COMMENTED OUT: Clear ALL data including authentication on every reload
  // This was causing unnecessary re-authentication on every reload
  // React.useEffect(() => {
  //   // Clear everything immediately on mount - complete fresh start
  //   clearAllDataIncludingAuth();
  //   
  //   // Also set up a more aggressive clearing to catch any late sessionStorage writes
  //   const clearAgain = () => {
  //     // COMMENTED OUT: const currentKeys = Object.keys(localStorage);
  //     const currentKeys = Object.keys(sessionStorage);
  //     if (currentKeys.length > 0) {
  //       clearAllDataIncludingAuth();
  //     }
  //   };
  //   
  //   // Check again after a short delay to catch any late writes
  //   const timeoutId = setTimeout(clearAgain, 100);
  //   
  //   return () => clearTimeout(timeoutId);
  // }, []);

  const queryClient = useQueryClient();
  const [skipWelcomeScreen, setSkipWelcomeScreen] = usePersistentState("skipWelcomeScreen", false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBannerStatusLoading, setIsBannerStatusLoading] = useState(true);
  const [customizationInitialTab, setCustomizationInitialTab] = useState("Settings");
  
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
    localStorage: localStorageData,
    componentStates,
  } = useAppState();
  
  // Track when scan button becomes available
  useEffect(() => {
    const currentTime = performance.now();
    
    // Check if scan button should be available (authenticated && !isCheckingAuth && !isBannerAdded)
  }, [isAuthenticated, isCheckingAuth, bannerBooleans.isBannerAdded, globalAuthStartTime]);

  // // Debug component states
  // useEffect(() => {

    
  // }, [componentStates.isWelcomeScreen, componentStates.isSetUpStep, componentStates.isWelcomeScipt, componentStates.isConfirmPublish, componentStates.isSuccessPublish, componentStates.isCustomizationTab]);

  const { user, sessionToken, exchangeAndVerifyIdToken, openAuthScreen, isAuthenticatedForCurrentSite, attemptAutoRefresh } = useAuth();
  const [isFetchWelcomeScripts, setIsFetchWelcomeScripts] = useState(false);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  
    // App initialization with clean welcome screen flow
  useEffect(() => {
    const initializeApp = async () => {
      const startTime = performance.now();
      
      // Start with welcome screen and loading state
      componentStates.resetComponentStates();
      componentStates.setIsWelcomeScreen(true);
      setIsAppInitializing(false);
      setIsCheckingAuth(true);
      
      // Check if user data already exists in sessionStorage - if so, skip auth check
      const existingUserData = getAuthStorageItem("consentbit-userinfo");
      
      if (existingUserData && existingUserData !== "null" && existingUserData !== "undefined") {
        const authStartTime = performance.now();
        setIsAuthenticated(true);
       
        // Track timing for cached authentication
        if (globalAuthStartTime) {
          const totalTime = performance.now() - globalAuthStartTime;
        }
        
        // Always check banner status from API to get accurate status
        const bannerStartTime = performance.now();
        const token = getSessionTokenFromLocalStorage();
        
        if (token) {
          try {
            const apiStartTime = performance.now();
            
            // Get site info to pass siteId to API call
            const siteInfo = await webflow.getSiteInfo();
            
            // Add timeout to prevent hanging API calls
            const apiPromise = await customCodeApi.getBannerStyles(token, siteInfo?.siteId);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('API call timeout after 10 seconds')), 10000);
            });
            
            const response = await Promise.race([apiPromise, timeoutPromise]);
            
            // Set banner status based on API response
            if (response && response.isBannerAdded === true) {
              // Banner was previously added - show welcome screen with "Customize" button
              setSkipWelcomeScreen(false);
              bannerBooleans.setIsBannerAdded(true);
            } else {
              // Response is null, empty, or bannerAdded is not true - show welcome screen with "Scan Project" button
              setSkipWelcomeScreen(false);
              bannerBooleans.setIsBannerAdded(false);
            }
            setIsBannerStatusLoading(false);
          } catch (error) {
            // API call failed or timed out - show welcome screen with default state
           
            setSkipWelcomeScreen(false);
            bannerBooleans.setIsBannerAdded(false);
            setIsBannerStatusLoading(false);
          }
        } else {
          // No token available - show welcome screen with default state
          setSkipWelcomeScreen(false);
          bannerBooleans.setIsBannerAdded(false);
          setIsBannerStatusLoading(false);
        }
        
        
        // Set checking auth to false only after all initialization is complete
        const finalStartTime = performance.now();
        setIsCheckingAuth(false);
        return; // Exit early since we have user data
      }
      
      try {
        const authStartTime = performance.now();
        
        // Try fresh background authentication (silent) with timeout
        const authPromise = attemptAutoRefresh();
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, 5000); // 5 second timeout
        });
        
        const refreshSuccess = await Promise.race([authPromise, timeoutPromise]);
        
        if (refreshSuccess) {
          setIsAuthenticated(true);
          
          // Track timing for fresh authentication
          if (globalAuthStartTime) {
            const totalTime = performance.now() - globalAuthStartTime;
          }
          
          // Always check API for current banner status (don't rely on cached data)
          const token = getSessionTokenFromLocalStorage();
          if (token) {
            try {
              const apiStartTime = performance.now();
              
              // Get site info to pass siteId to API call
              const siteInfo = await webflow.getSiteInfo();
              
              // Add timeout to prevent hanging API calls
              const apiPromise = customCodeApi.getBannerStyles(token, siteInfo?.siteId);
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('API call timeout after 10 seconds')), 10000);
              });
              
            const response = await Promise.race([apiPromise, timeoutPromise]);
              
              // Set banner status based on API response (not cached data)
              if (response && response.isBannerAdded === true) {
                // Banner was previously added - show welcome screen with "Customize" button
                setSkipWelcomeScreen(false);
                bannerBooleans.setIsBannerAdded(true);
              } else {
                // Response is null, empty, or bannerAdded is not true - show welcome screen with "Scan Project" button
                setSkipWelcomeScreen(false);
                bannerBooleans.setIsBannerAdded(false);
              }
              setIsBannerStatusLoading(false);
            } catch (error) {
              // API call failed - show welcome screen
              setSkipWelcomeScreen(false);
              bannerBooleans.setIsBannerAdded(false);
              setIsBannerStatusLoading(false);
            }
          } else {
            // No token available - show welcome screen
            setSkipWelcomeScreen(false);
            bannerBooleans.setIsBannerAdded(false);
            setIsBannerStatusLoading(false);
          }
        } else {
          // Auth failed - show welcome screen
          setSkipWelcomeScreen(false);
          bannerBooleans.setIsBannerAdded(false);
          setIsBannerStatusLoading(false);
        }
      } catch (error) {
        // Silent error handling - show welcome screen
        setSkipWelcomeScreen(false);
        bannerBooleans.setIsBannerAdded(false);
        setIsBannerStatusLoading(false);
      } finally {
        // Auth check complete
        setIsCheckingAuth(false);
      }
    };

    initializeApp();
  }, []);

  // Update isAuthenticated state when user authentication changes
  useEffect(() => {
    const isUserAuthenticated = !!(user?.email && sessionToken);
    setIsAuthenticated(isUserAuthenticated);
  }, [user, sessionToken]);

  // Removed - this is now handled in the main initialization useEffect
  useEffect(() => {
    const registerVersionBasedScripts = async () => {
      
      // Only register scripts if user is authenticated and has session token
      if (!isAuthenticated || !sessionToken || !user?.email) {
        return;
      }

      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        return;
      }
      

      try {
        const siteInfo = await webflow.getSiteInfo();
        
        // Get the stored siteId from authentication (this is the correct siteId that matches the server)
        const storedSiteId = getCurrentSiteId();

        if (appVersion === '1.0.0') {
          const result = await customCodeApi.registerAnalyticsBlockingScript(token);
          
          // Apply the registered script
          if (result && result.result) {
            const params: CodeApplication = {
              targetType: 'site',
              targetId: siteInfo.siteId, // Use siteInfo.siteId for application
              scriptId: result.result.id,
              location: 'header',
              version: result.result.version
            };
            const applyResult = await customCodeApi.applyScript(params, token);
          } else {
          }
        } else if (appVersion === '2.0.0' || appVersion === '2.0.1') {
          const result = await customCodeApi.registerV2BannerCustomCode(token, siteInfo.siteId);
          // Apply the registered script
          if (result && result.result) {
            const params: CodeApplication = {
              targetType: 'site',
              targetId: siteInfo.siteId, // Use URL if available, fallback to siteId
              scriptId: result.result.id,
              location: 'header',
              version: result.result.version
            };
            const applyResult = await customCodeApi.applyV2Script(params, token);
            
            // Script should be added by server via custom code block
            
          } else {
          }
        }
      } catch (error) {
        
      }
    };

    // Delay script registration to ensure authentication is fully settled
    const timer = setTimeout(() => {
      registerVersionBasedScripts();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, sessionToken, user?.email]); // Trigger when auth state changes

 


  // Welcome Screen -> WelcomeScript (Scan Project clicked)
  const handleWelcomeScreen = () => {
    componentStates.setIsWelcomeScreen(false);
     setIsFetchWelcomeScripts(true);
    componentStates.setWelcomeScipt(true);
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
  const handleWelcomeAuthorize = () => {
    const authStartTime = performance.now();
    setGlobalAuthStartTime(authStartTime);
    openAuthScreen();
    // The authentication state will be updated when the user completes authorization
    // through the useEffect that depends on user?.email and sessionToken
  };

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

  
  




  // Removed - this is now handled in the main initialization useEffect

  // REMOVED: This useEffect was causing conflicts with fast sessionStorage-based auth
  // The authentication state is now properly managed in the main initialization useEffect

  // Site change detection - clear scripts when site changes
  // useEffect(() => {
  //   const detectSiteChange = async () => {
  //     try {
  //       // Check if we already have site info cached to avoid unnecessary API call
  //       const cachedSiteInfo = getAuthStorageItem("siteInfo");
  //       let siteInfo;
  //       let newSiteId;
        
  //       if (cachedSiteInfo) {
  //         try {
  //           siteInfo = JSON.parse(cachedSiteInfo);
  //           newSiteId = siteInfo?.siteId;
  //         } catch (error) {
  //           // Fallback to API call if cached data is invalid
  //           siteInfo = await webflow.getSiteInfo();
  //           newSiteId = siteInfo?.siteId;
  //         }
  //       } else {
  //         siteInfo = await webflow.getSiteInfo();
  //         newSiteId = siteInfo?.siteId;
  //         // Cache the site info for future use
  //         if (siteInfo) {
  //           setAuthStorageItem("siteInfo", JSON.stringify(siteInfo));
  //         }
  //       }
        
  //       if (newSiteId && newSiteId !== currentSiteId) {
  //         // Site has changed, clear scripts to prevent cross-site contamination
  //         if (currentSiteId !== null) {
  //           // Only clear if we had a previous site (not initial load)
  //           // COMMENTED OUT: localStorage.removeItem('scriptContext_scripts');
  //           removeAuthStorageItem('scriptContext_scripts');
            
  //           // Regenerate session token for the new site
  //           try {
              
  //             // Clear old token first to force complete regeneration
  //             // COMMENTED OUT: localStorage.removeItem("consentbit-userinfo");
  //             removeAuthStorageItem("consentbit-userinfo");
              
  //             const newTokenData = await exchangeAndVerifyIdToken();
             
  //           } catch (error) {
  //             // Fallback: just update the site ID in stored data
  //             // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
  //             const userinfo = getAuthStorageItem("consentbit-userinfo");
  //             if (userinfo) {
  //               try {
  //                 const userData = JSON.parse(userinfo);
  //                 userData.siteId = newSiteId;
  //                 // COMMENTED OUT: localStorage.setItem("consentbit-userinfo", JSON.stringify(userData));
  //                 setAuthStorageItem("consentbit-userinfo", JSON.stringify(userData));
  //               } catch (error) {
  //               }
  //             }
  //           }
  //         }
  //         setCurrentSiteId(newSiteId);
  //       }
  //     } catch (error) {
  //       // Silent error handling
  //     }
  //   };
    
  //   detectSiteChange();
  // }, [currentSiteId, exchangeAndVerifyIdToken]);

 
  // App initialization delay removed - now handled in automatic token refresh useEffect



// Site change detection - clear scripts when site changes
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
        <CustomizationTab onAuth={handleBackToWelcome} isAuthenticated={isAuthenticated} initialActiveTab={customizationInitialTab} />
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
       
     
    </div>
  );
};

export default App;

