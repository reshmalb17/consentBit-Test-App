import React, { useState, useEffect } from "react";
import "../style/styless.css";



import { useAppState } from "../hooks/useAppState";
import WelcomeScipt from "./WelcomeScript";
import NeedHelp from "./NeedHelp";
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;
const leftLines = new URL("../assets/leftlines.svg", import.meta.url).href;
const rightLines = new URL("../assets/rightlines.svg", import.meta.url).href;
const infologo = new URL("../assets/info-logo.svg", import.meta.url).href;
const youtubethumbnail = new URL("../assets/Cover.jpg", import.meta.url).href;
const uparrow = new URL("../assets/up arrow.svg", import.meta.url).href;
type WelcomeScreenProps = {
  onAuthorize: () => void;
  onNeedHelp: () => void;
  authenticated?:boolean;
  handleWelcomeScreen: () => void;
  isCheckingAuth?: boolean;
  isBannerAdded?: boolean;
  onCustomize?: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthorize, onNeedHelp ,authenticated,handleWelcomeScreen, isCheckingAuth: externalIsCheckingAuth, isBannerAdded, onCustomize}) => {
  const [hasUserData, setHasUserData] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Check for user authentication data and update hasUserData
    const userinfo = localStorage.getItem("consentbit-userinfo");
    const hasData = userinfo && userinfo !== "null" && userinfo !== "undefined";
    setHasUserData(authenticated || !!hasData);
  }, [authenticated]);

  // Handle the 2-second delay after external auth check completes
  useEffect(() => {
    if (!externalIsCheckingAuth) {
      // External auth check completed, wait 1 second then show buttons
      const timer = setTimeout(() => {
        setShowButtons(true);
      },500);
      
      return () => clearTimeout(timer);
    } else {
      // Reset when auth check starts
      setShowButtons(false);
    }
  }, [externalIsCheckingAuth]);

  // Separate useEffect to handle authentication changes
  useEffect(() => {
    if (authenticated) {
      setHasUserData(true);
      setIsAuthorizing(false);
    }
  }, [authenticated]);

  const handleAuthorizeClick = () => {
    setIsAuthorizing(true);
    onAuthorize();
  };

   return (
    <div className="welcome-screen">
      <div className="welcome-main-content">
        {/* Background line images */}
        <img src={leftLines} alt="" className="welcome-bg-lines-left" />
        <img src={rightLines} alt="" className="welcome-bg-lines-right" />

        {/* Header */}
        <div className="welcome-header">
          <div style={{ display: "flex", justifyContent: "flex-end" }}><NeedHelp /></div>
        </div>

        {/* Main content */}
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome to{" "}
            <span className="welcome-title-highlight">Consentbit</span>
          </h1>
          {(externalIsCheckingAuth || !showButtons) ? (
            <p className="welcome-instructions">
              Checking your authentication status...
            </p>
          ) : isAuthorizing ? (
            <p className="welcome-instructions">
              Please complete the authorization process in the popup window...
            </p>
          ) : hasUserData ? (
            <p className="welcome-instructions">
              {isBannerAdded 
                ? "Your banner has been successfully added! Customize your consent banner appearance and settings."
                : "Scan your Webflow site, review detected scripts, add them to the backend, and publish when you're ready."
              }
            </p>
          ) : (
            <p className="welcome-instructions">
              The authorization process appears to be incomplete. To continue with the next step, please ensure that all necessary authorization steps have been successfully carried out.
            </p>
          )}

        

          {(externalIsCheckingAuth || !showButtons) ? (
            <button className="welcome-authorize-btn" disabled>
              Loading...
            </button>
          ) : isAuthorizing ? (
            <button className="welcome-authorize-btn" disabled>
              Authorizing...
            </button>
          ) : hasUserData ? (
            <>
              <button
                className="welcome-authorize-btn scan-project"
                onClick={isBannerAdded ? onCustomize : handleWelcomeScreen}
              >
                {isBannerAdded ? "Customize" : "Scan Project"}
              </button>
          
            </>
          ) : (
            <button className="welcome-authorize-btn" onClick={handleAuthorizeClick}>
              Authorize
            </button>
          )}
        </div>
        {hasUserData && showButtons && !externalIsCheckingAuth && !isBannerAdded?(
        <>
        
            {/* Bottom information cards */}
            <div className="setup-info-cards">
              <div className="setup-card">
                <div className="setup-card-top">
                  <div className="setup-card-title">
                    Facing any issues?
                  </div>
                  <div className="setup-card-content">
                    Check our tutorial video to help yourself
                  </div>
                </div>
                <div className="setup-card-bottom">
                  <div className="setup-card-help" onClick={onNeedHelp}  >
                    <div className="setup-card-img">
                      <img src={questionmark} alt="Need help?" style={{ width: "100%", height: "100%" }} />
                    </div>

                 <span><a style={{textDecoration:"none",color:"rgba(255, 255, 255, 0.6)"}} href="https://www.consentbit.com/help-document" target="_blank">Need help?</a></span>
                  </div>
                  <div className="setup-card-youtube-thumbnail">
                    <a href="https://vimeo.com/1112446810?share=copy" target="_blank"><img src={youtubethumbnail} alt="Tutorial Video" className="setup-video-thumbnail" /></a>
                  </div>


                </div>

              </div>
              <div className="setup-card-info">
                <div className="setup-card-info-logo">
                  <img src={infologo} alt="Info" className="setup-card-info-icon" />




                </div>

                <div className="setup-card-info-text">
                  <p className="setup-card-info-title">Update the scripts in your project that handle cookie creation</p>
                  <p className="setup-card-info-subtitle">Check your project scripts for any that create cookies. Organize them, replace with our snippet, and follow our tutorial to streamline your workflow.</p>

                  <div className="subscribe help"><a className="link" target="_blank" href="https://www.consentbit.com/help-document">Need help? See the docs <i><img src={uparrow} alt="" /></i></a></div>
                </div>
              </div>


            </div>
        </>) : null}
      </div>
    </div>
  );
};

export default WelcomeScreen;
