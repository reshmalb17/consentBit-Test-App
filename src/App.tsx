import React, { useState,useEffect } from "react";
import "./style/styless.css";
import WelcomeScreen from "./components/WelcomeScreen";
import SetupStep from "./components/SetupStep";
import WelcomeScipt from "./components/WelcomeScript";
import { useQueryClient } from "@tanstack/react-query";
import { useAppState } from "./hooks/useAppState";  
import { useAuth } from "./hooks/userAuth";
import { use } from "i18next";





const App: React.FC = () => {

  const queryClient = useQueryClient();
   const {
    colors,
    ui,
    config,
    booleans,
    popups,
    tooltips,
    data,
    buttons,
    animation,
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
    const stored = localStorage.getItem("wf_hybrid_user");

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






  return (
    <div className="app">
      {popups.showWelcomeScreen ? (
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
          <button onClick={() => popups.setShowWelcomeScreen(true)}>
            Back to Welcome Screen
          </button>
        </div>
      )}
       
     
    </div>
  );
};

export default App;

