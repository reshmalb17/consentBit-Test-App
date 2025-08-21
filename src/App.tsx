import React, { useState } from "react";
import "./style/styless.css";
import WelcomeScreen from "./components/WelcomeScreen";
import SetupStep from "./components/SetupStep";
import WelcomeScipt from "./components/WelcomeScript";
const App: React.FC = () => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showSetupStep, setShowSetupStep] = useState(true);

  // Welcome screen handlers
  const handleWelcomeAuthorize = () => {
    setShowWelcomeScreen(true);
    setShowSetupStep(false);
  };

  const handleWelcomeNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };

  // Setup step handlers
  const handleSetupGoBack = () => {
    setShowSetupStep(false);
    setShowWelcomeScreen(true);
  };

  const handleSetupProceed = () => {
    setShowSetupStep(false);
    // Add logic for next step here
  };

  return (
    <div className="app">
      {showWelcomeScreen ? (
        <WelcomeScipt 
          onAuthorize={handleWelcomeAuthorize}
          onNeedHelp={handleWelcomeNeedHelp}
        />
      ) : showSetupStep ? (
        <SetupStep 
          onGoBack={handleSetupGoBack}
          onProceed={handleSetupProceed}
        />
      ) : (
        <div className="main-app">
          <h1>Main App Interface</h1>
          <p>Welcome to the main application!</p>
          <button onClick={() => setShowWelcomeScreen(true)}>
            Back to Welcome Screen
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

