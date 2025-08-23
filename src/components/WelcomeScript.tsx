import React from "react";
import { useAppState } from "../hooks/useAppState";
import Script from "./Script";
import SetupStep from "./SetupStep";
import "../style/welcomescript.css";

const infologo = new URL("../assets/info-logo.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const uparrow = new URL("../assets/blue up arrow.svg", import.meta.url).href;
const thumbnail = new URL("../assets/thumbnail.svg", import.meta.url).href;

type WelcomeScriptProps = {
  isFetchScripts: boolean;
  setFetchScripts: (value: boolean) => void;
};

const WelcomeScipt: React.FC<WelcomeScriptProps> = ({ isFetchScripts, setFetchScripts }) => {
  const { popups } = useAppState();

  const handleNextButton = () => {
    popups.setShowPopupWelcomeSetup(true);
  };

  const handleGoBack = () => {
    popups.setShowPopupWelcomeSetup(false);
  };

  const handleProceed = () => {
    popups.setShowPopupWelcomeSetup(false);
    popups.setShowSetUpStep(true);
  };

  return (
    <div className="ws-container">
      {/* Top grid info cards */}
      <div className="ws-info-grid">
        {/* Card 1 */}
        <div className="ws-help-card">
          <div style={{display:"flex"}}>
            <div className="ws-card-header">
              <h3 className="ws-card-title">Facing any issues?</h3>
              <p className="ws-card-desc">Check our tutorial video to help yourself</p>
            </div>
            <div>
               <img src={thumbnail} alt="Tutorial Video" className="ws-thumbnail" />
            </div>
          </div>
          <div className="ws-card-footer">
            <div className="ws-help-link">
              <img style={{width:"18px"}} src={questionmark} alt="Help" className="ws-help-icon" />
              <span>Need help?</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="ws-card ws-info-card">
          <div className="ws-info-icon">
            <img src={infologo} alt="Info" />
          </div>
          <div className="ws-info-text">
            <h3 className="ws-info-title">
              Update the scripts in your project that handle cookie creation
            </h3>
            <p className="ws-info-subtitle">
              Check your project scripts for any that create cookies. Organize them, replace with our snippet, and follow our tutorial to streamline your workflow.
            </p>
            <a href="#" className="ws-docs-link">
              Need help? See the docs <img src={uparrow} alt="↗" />
            </a>
          </div>
        </div>
      </div>

      {/* Scripts Section Header */}
      <div className="ws-scripts-header">
        <h2 className="ws-scripts-title">List of scripts to update</h2>
        <button className="ws-next-btn" onClick={handleNextButton}>
          Next
        </button>
      </div>

      {/* Scrollable Scripts Area */}
      <div className="ws-scripts-scroll">
        <Script fetchScripts={isFetchScripts} setFetchScripts={setFetchScripts} isWelcome={true} />
      </div>

      {/* Popup Setup */}
      {popups.showPopupWelcomeSetup && (
        <div className="ws-popup">
          <div className="ws-popup-content">
            <SetupStep onGoBack={handleGoBack} onProceed={handleProceed} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScipt;
