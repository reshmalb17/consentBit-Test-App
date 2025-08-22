import React from "react";
import "../style/styless.css";

import { useAuth } from "../hooks/userAuth";
import { useAppState } from "../hooks/useAppState";
import WelcomeScipt from "./WelcomeScript";
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const leftLines = new URL("../assets/leftlines.svg", import.meta.url).href;
const rightLines = new URL("../assets/rightlines.svg", import.meta.url).href;

type WelcomeScreenProps = {
  onAuthorize: () => void;
  onNeedHelp: () => void;
  authenticated?:boolean;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthorize, onNeedHelp ,authenticated}) => {
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

  console.log("Authenticated prop:", authenticated);
console.log("fetch scripts:",booleans.fetchScripts);
  const base_url = "https://cb-server.web-8fb.workers.dev"
const { user, exchangeAndVerifyIdToken } = useAuth();

   // Function to open the authorization popup authorization window
   const openAuthScreen = () => {
    const authWindow = window.open(
      `${base_url}/api/auth/authorize?state=webflow_designer`,
      "_blank",
      "width=600,height=600"
    );

    const onAuth = async () => {
      await exchangeAndVerifyIdToken();
    };
    const checkWindow = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkWindow);
        onAuth();
      }
    }, 1000);
  };
  const handleScanProject = () => {
    booleans.setFetchScripts(true);
  }

 return (
  <div className="welcome-screen">
    {booleans.fetchScripts ? (
      <WelcomeScipt
        isFetchScripts={booleans.fetchScripts}
        setFetchScripts={booleans.setFetchScripts}
      />
    ) : (
      <div className="welcome-main-content">
        {/* Background line images */}
        <img src={leftLines} alt="" className="welcome-bg-lines-left" />
        <img src={rightLines} alt="" className="welcome-bg-lines-right" />

        {/* Header */}
        <div className="welcome-header">
          <div className="welcome-help" onClick={onNeedHelp}>
            <img src={questionmark} alt="Need help?" />
            <span>Need help?</span>
          </div>
        </div>

        {/* Main content */}
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome to{" "}
            <span className="welcome-title-highlight">Consentbit</span>
          </h1>
          {authenticated?( <p className="welcome-instructions">
            Scan your Webflow site, review detected scripts, add them to the
            backend, and publish when you're ready.
          </p>):( <p className="welcome-instructions">
            The authorization process appears to be incomplete. To continue with the next step, please ensure that all necessary authorization steps have been successfully carried out.
          </p>)}

        

          {authenticated ? (
            <button
              className="welcome-authorize-btn scan-project"
              onClick={handleScanProject}
            >
              Scan Project
            </button>
          ) : (
            <button className="welcome-authorize-btn" onClick={openAuthScreen}>
              Authorize
            </button>
          )}
        </div>
      </div>
    )}
  </div>
);

};

export default WelcomeScreen;
