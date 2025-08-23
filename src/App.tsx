import React, { useState,useEffect } from "react";
import "./style/styless.css";
import WelcomeScreen from "./components/WelcomeScreen";
import SetupStep from "./components/SetupStep";
import WelcomeScipt from "./components/WelcomeScript";
import CustomizationTab from "./components/CustomizationTab";
import { useQueryClient } from "@tanstack/react-query";
import { useAppState } from "./hooks/useAppState";  
import { useAuth } from "./hooks/userAuth";
import { use } from "i18next";





const App: React.FC = () => {

  const queryClient = useQueryClient();
  const [skipWelcomeScreen, setSkipWelcomeScreen] = useState(false);
  
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
    localStorage: localStorageData
  } = useAppState();


  const { user, exchangeAndVerifyIdToken } = useAuth();

  // Welcome screen handlers
  const handleWelcomeAuthorize = () => {
    popups.setShowWelcomeScreen(true);
    popups.setShowSetUpStep(false);
  };

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };

  const handleBackToWelcome = () => {
    // Clear the localStorage flag and show welcome screen
    localStorage.removeItem("bannerAddedThroughWelcome");
    setSkipWelcomeScreen(false);
    popups.setShowWelcomeScreen(true);
  };

  // Setup step handlers
  const handleSetupGoBack = () => {
    popups.setShowSetUpStep(false);
    popups.setShowWelcomeScreen(true);
  };

  const handleSetupProceed = () => {
    popups.setShowSetUpStep(false);
    // Add logic for next step here
  };



 //authentication
  useEffect(() => {
    const stored = localStorage.getItem("consentbit-userinfo");

    if (!user?.firstName && stored) {
      const parsed = JSON.parse(stored);

      if (parsed?.sessionToken) {
        exchangeAndVerifyIdToken();
      } else {
       
        queryClient.setQueryData(["auth"], {
          user: {
            firstName: parsed.firstName,
            email: parsed.email,
          },
          sessionToken: "",
        });
      }
    }
  }, []);

  // Check if banner was added through welcome flow
  useEffect(() => {
    const bannerAddedThroughWelcome = localStorage.getItem("bannerAddedThroughWelcome");
    if (bannerAddedThroughWelcome === "true") {
      setSkipWelcomeScreen(true);
    }
  }, []);






  return (
    <div className="app">
      {skipWelcomeScreen ? (
        <CustomizationTab onAuth={handleBackToWelcome} />
      ) : popups.showWelcomeScreen ? (
        <WelcomeScreen 
          onAuthorize={handleWelcomeAuthorize}
          onNeedHelp={handleWelcomeNeedHelp}
          authenticated={user?.firstName ? true : false}
        />
      ) : popups.setShowSetUpStep ? (
        <SetupStep 
          onGoBack={handleSetupGoBack}
          onProceed={handleSetupProceed}
        />
      ) : (
        <div className="main-app">
          <h1>Main App Interface</h1>
          <p>Welcome to the main application!</p>
          <button onClick={handleBackToWelcome}>
            Back to Welcome Screen
          </button>
        </div>
      )}
       
     
    </div>
  );
};

export default App;

