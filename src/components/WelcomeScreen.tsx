import React from "react";
import "../style/styless.css";

// Asset imports
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const leftLines = new URL("../assets/leftlines.svg", import.meta.url).href;
const rightLines = new URL("../assets/rightlines.svg", import.meta.url).href;

type WelcomeScreenProps = {
  onAuthorize: () => void;
  onNeedHelp: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthorize, onNeedHelp }) => {
  return (
    <div className="welcome-screen">
      {/* Main content container */}
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
            Welcome to <span className="welcome-title-highlight">Consentbit</span>
          </h1>
          
          <p className="welcome-instructions">
          Scan your Webflow site, review detected scripts, add them to the backend, and publish when you're ready.
          </p>
          
          <button className="welcome-authorize-btn" onClick={onAuthorize}>
            Authorize
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
