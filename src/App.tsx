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
import { use } from "i18next";
import { serialize } from "v8";
import { getCurrentSiteId, listCurrentSiteData, clearCurrentSiteData, clearAllData, clearAuthData, clearAuthIfNotAuthorized, checkMigrationStatus, forceMigration, usePersistentState, debugAuthStatus, forceClearAuthData, clearAllDataIncludingAuth } from "./hooks/usePersistentState";
import { customCodeApi } from "./services/api";
import { CodeApplication } from "./types/types";
import { getSessionTokenFromLocalStorage } from './util/Session';
import pkg from '../package.json';

const appVersion = pkg.version;





const App: React.FC = () => {

  // Clear ALL data including authentication on every reload - run immediately
  React.useEffect(() => {
    // Clear everything immediately on mount - complete fresh start
    clearAllDataIncludingAuth();
    console.log('All data including authentication cleared on reload');
    
    // Also set up a more aggressive clearing to catch any late localStorage writes
    const clearAgain = () => {
      const currentKeys = Object.keys(localStorage);
      if (currentKeys.length > 0) {
        console.log('Found additional localStorage keys, clearing again:', currentKeys);
        clearAllDataIncludingAuth();
      }
    };
    
    // Check again after a short delay to catch any late writes
    const timeoutId = setTimeout(clearAgain, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const queryClient = useQueryClient();
  const [skipWelcomeScreen, setSkipWelcomeScreen] = usePersistentState("skipWelcomeScreen", false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  const [customizationInitialTab, setCustomizationInitialTab] = useState("Settings");
  
  
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


  const { user, sessionToken, exchangeAndVerifyIdToken, openAuthScreen, isAuthenticatedForCurrentSite, attemptAutoRefresh } = useAuth();
  
  // App initialization with fresh background authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Small delay to prevent flash of content
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Try fresh background authentication (silent)
        console.log('Attempting fresh background authentication...');
        const refreshSuccess = await attemptAutoRefresh();
        if (refreshSuccess) {
          console.log('Background authentication successful');
          setIsAuthenticated(true);
        } else {
          console.log('Background authentication failed - user needs to authenticate manually');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Additional small delay for smoother UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsAppInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Debug authentication state changes
  useEffect(() => {
    // Auth state monitoring
  }, [user, sessionToken, isAuthenticated]);

  // Check if banners were previously added and navigate to CustomizationTab (only on initial load)
  useEffect(() => {
    if (isInitialized) return; // Skip if already initialized
    
    const initialBannerAdded = localStorage.getItem('initialBannerAdded') === 'true';
    const bannerAdded = localStorage.getItem('bannerAdded') === 'true';
    
    if (initialBannerAdded || bannerAdded) {
      // Reset all component states
      componentStates.resetComponentStates();
      // Navigate to CustomizationTab
      componentStates.setIsCustomizationTab(true);
      // Set banner added flag
      bannerBooleans.setIsBannerAdded(true);
    }
    
    setIsInitialized(true);
  }, [isInitialized, componentStates, bannerBooleans]);

 


  // Welcome Screen -> WelcomeScript (Scan Project clicked)
  const handleWelcomeScreen = () => {
    componentStates.setIsWelcomeScreen(false);
    bannerBooleans.setFetchScripts(true);
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
    openAuthScreen();
    // The authentication state will be updated when the user completes authorization
    // through the useEffect that depends on user?.email and sessionToken
  };

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };

  const handleBackToWelcome = () => {
    // Clear the banner added flag and show welcome screen
    bannerBooleans.setIsBannerAdded(false);
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

  
  




  // Check if banner was already added (for existing users) and set authentication state
  useEffect(() => {
    // Don't run this effect if we're currently showing SuccessPublish
    if (componentStates.isSuccessPublish) return;
    
    // Add a small delay to ensure all states are properly loaded from localStorage
    const timer = setTimeout(async() => {
      // Check both the persistent state and the direct localStorage key
      const bannerAddedFromStorage = localStorage.getItem('bannerAdded') === 'true';

      // Check site-specific authentication
      const isUserAuthenticated = await isAuthenticatedForCurrentSite();
      
      if (bannerAddedFromStorage && isUserAuthenticated) {
        // For existing users who already have a banner AND are authenticated for this site, show CustomizationTab directly
        setSkipWelcomeScreen(true);
        componentStates.resetComponentStates();
        componentStates.setIsCustomizationTab(true);
      } else {
        // For new users or users without banner or not authenticated for this site, start with welcome screen
        setSkipWelcomeScreen(false);
        componentStates.resetComponentStates();
        componentStates.setIsWelcomeScreen(true);
      }
      
    }, 1000); // Small delay to ensure localStorage is read

    return () => clearTimeout(timer);
  }, [bannerBooleans.isBannerAdded, user?.email, sessionToken, componentStates.isSuccessPublish]); // Added isSuccessPublish to dependencies

  // Separate useEffect to update authentication state when auth changes
  useEffect(() => {
    const checkSiteAuthentication = async () => {
      try {
        const isUserAuthenticated = await isAuthenticatedForCurrentSite();
        setIsAuthenticated(isUserAuthenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkSiteAuthentication();
  }, [user?.email, sessionToken, user?.siteId]);

  // Version-based script registration - run once when user is authenticated
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
        // Get site info for script application
        const siteInfo = await webflow.getSiteInfo();

        if (appVersion === '1.0.0') {
          const result = await customCodeApi.registerAnalyticsBlockingScript(token);
          
          // Apply the registered script
          if (result && result.result) {
            const params: CodeApplication = {
              targetType: 'site',
              targetId: siteInfo.siteId,
              scriptId: result.result.id,
              location: 'header',
              version: result.result.version
            };
            await customCodeApi.applyScript(params, token);
          }
        } else if (appVersion === '2.0.0' || appVersion === '2.0.1') {
          const result = await customCodeApi.registerV2BannerCustomCode(token);
          
          // Apply the registered script
          if (result && result.result) {
            const params: CodeApplication = {
              targetType: 'site',
              targetId: siteInfo.siteId,
              scriptId: result.result.id,
              location: 'header',
              version: result.result.version
            };
            await customCodeApi.applyV2Script(params, token);
          }
        }
      } catch (error) {
        // Silent error handling - script registration will be retried on next auth
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

  // App initialization delay removed - now handled in automatic token refresh useEffect











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
   

      {isAppInitializing ? (
        // Show nothing during initialization to prevent flash
        <div></div>
      ) : skipWelcomeScreen ? (
        <CustomizationTab onAuth={handleBackToWelcome} isAuthenticated={isAuthenticated} initialActiveTab={customizationInitialTab} />
      ) : componentStates.isWelcomeScreen ? (
        <WelcomeScreen 
          onAuthorize={handleWelcomeAuthorize}
          onNeedHelp={handleWelcomeNeedHelp}
          authenticated={isAuthenticated}
          handleWelcomeScreen={handleWelcomeScreen}
        />
      ) : componentStates.isWelcomeScipt ? (
        <WelcomeScipt
          isFetchScripts={bannerBooleans.fetchScripts}
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
        />
      )}
       
     
    </div>
  );
};

export default App;

