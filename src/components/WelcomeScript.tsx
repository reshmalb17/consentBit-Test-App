import React from "react";
import { useAppState } from "../hooks/useAppState";
import Script from "./Script";
import SetupStep from "./SetupStep";
import "../style/welcomescript.css";

const infologo = new URL("../assets/info-logo.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const uparrow = new URL("../assets/blue up arrow.svg", import.meta.url).href;
const thumbnail = new URL("../assets/Cover.jpg", import.meta.url).href;

type WelcomeScriptProps = {
  isFetchScripts: boolean;
  handleWelcomeScipt: () => void;
  onGoBack?: () => void;
};

const WelcomeScipt: React.FC<WelcomeScriptProps> = ({ isFetchScripts, handleWelcomeScipt, onGoBack }) => {




  

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
               <a href="https://vimeo.com/1112446810?share=copy" target="_blank"><img src={thumbnail} alt="Tutorial Video" className="ws-thumbnail" /></a>
            </div>
          </div>
          <div className="ws-card-footer">
            <div className="ws-help-link">
              <img style={{width:"18px"}} src={questionmark} alt="Help" className="ws-help-icon" />
              <span><a style={{textDecoration:"none",color:"rgba(255, 255, 255, 0.6)"}} href="https://www.consentbit.com/help-document" target="_blank">Need help?</a></span>
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
            <a href="https://www.consentbit.com/help-document" target="_blank" className="ws-docs-link">
              Need help? See the docs <img src={uparrow} alt="↗" />
            </a>
          </div>
        </div>
      </div>

      {/* Scripts Section Header */}
      <div className="ws-scripts-header">
        <h2 className="ws-scripts-title">List of scripts to update</h2>
        <div className="ws-navigation-buttons">
         
          <button className="ws-next-btn" onClick={handleWelcomeScipt}>
            Next
          </button>
        </div>
      </div>

      {/* Scrollable Scripts Area */}
      <div className="ws-scripts-scroll">
        <Script fetchScripts={isFetchScripts}  isWelcome={true} />
      </div>

      
    </div>
  );
};

export default WelcomeScipt;
