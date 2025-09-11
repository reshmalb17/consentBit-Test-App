import React, { useState, useEffect } from "react";
import "../style/styless.css";



import { useAppState } from "../hooks/useAppState";
import { getAuthStorageItem } from "../util/authStorage";
import { customCodeApi } from "../services/api";
import { getSessionTokenFromLocalStorage } from "../util/Session";
import WelcomeScipt from "./WelcomeScript";
import NeedHelp from "./NeedHelp";
import webflow from "../types/webflowtypes";
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
  isBannerStatusLoading?: boolean;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthorize, onNeedHelp ,authenticated,handleWelcomeScreen, isCheckingAuth: externalIsCheckingAuth, isBannerAdded, onCustomize, isBannerStatusLoading = false}) => {
  const [hasUserData, setHasUserData] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [actualBannerStatus, setActualBannerStatus] = useState<boolean | null>(null);
  const [sessionBannerAdded, setSessionBannerAdded] = useState<boolean>(false);
  
  // Timing tracking for authorization flow
  const [authStartTime, setAuthStartTime] = useState<number | null>(null);
  const [scanButtonShowTime, setScanButtonShowTime] = useState<number | null>(null);


  useEffect(() => {
    // Check for user authentication data and update hasUserData
    // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
    const userinfo = getAuthStorageItem("consentbit-userinfo");
    const hasData = userinfo && userinfo !== "null" && userinfo !== "undefined";
    setHasUserData(authenticated || !!hasData);
  }, [authenticated]);

  // Check session storage for bannerAdded status
  useEffect(() => {
    const checkSessionStorage = () => {
      const bannerAdded = sessionStorage.getItem('bannerAdded');
      setSessionBannerAdded(bannerAdded === 'true');
    };

    // Check immediately
    checkSessionStorage();

    // Listen for storage changes (in case banner is added in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bannerAdded') {
        setSessionBannerAdded(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      checkSessionStorage();
    };

    window.addEventListener('bannerAddedChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bannerAddedChanged', handleCustomStorageChange);
    };
  }, []);

  // Fetch actual banner status from API - only if parent is not loading
  useEffect(() => {
    const fetchBannerStatus = async () => {
      const token = getSessionTokenFromLocalStorage();
      if (token && authenticated && !isBannerStatusLoading) {
        try {
          // Get site info to pass siteId to API call
          const siteInfo = await webflow.getSiteInfo();
          const response = await customCodeApi.getBannerStyles(token, siteInfo?.siteId);
          if (response && response.isBannerAdded !== undefined) {
            setActualBannerStatus(response.isBannerAdded);
          }
        } catch (error) {
          // Error fetching banner status
        }
      }
    };

    fetchBannerStatus();
  }, [authenticated, isBannerStatusLoading]);


  // Separate useEffect to handle authentication changes
  useEffect(() => {
    if (authenticated) {
      setHasUserData(true);
      setIsAuthorizing(false);
      
      // Track when authentication completes
      if (authStartTime) {
        const authDuration = performance.now() - authStartTime;
      }
    }
  }, [authenticated, authStartTime]);
  
  // Track when scan button becomes visible
  useEffect(() => {
    const currentTime = performance.now();
    
    // Check if scan button should be visible (hasUserData && !externalIsCheckingAuth && !isBannerAdded)
    if (hasUserData && !externalIsCheckingAuth && !isBannerAdded && !scanButtonShowTime) {
      setScanButtonShowTime(currentTime);
      
      if (authStartTime) {
        const totalTime = currentTime - authStartTime;
      }
    }
  }, [hasUserData, externalIsCheckingAuth, isBannerAdded, authStartTime, scanButtonShowTime]);

  const handleAuthorizeClick = () => {
    const startTime = performance.now();
    setAuthStartTime(startTime);
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
            <span className="welcome-title-highlight">ConsentBit</span>
          </h1>
          {(() => {
            
            if (externalIsCheckingAuth) {
              return (
                <p className="welcome-instructions">
                  Checking your authentication status...
                </p>
              );
            } else if (isAuthorizing) {
              return (
                <p className="welcome-instructions">
                  Please complete the authorization process in the popup window...
                </p>
              );
            } else if (hasUserData) {
              return (
                <p className="welcome-instructions">
                  {isBannerAdded
                    ? "Your banner has been successfully added! Customize your consent banner appearance and settings."
                    : "Scan your Webflow site, review detected scripts, add them to the backend, and publish when you're ready."
                  }
                </p>
              );
            } else {
              return (
                <p className="welcome-instructions">
                  The authorization process appears to be incomplete. To continue with the next step, please ensure that all necessary authorization steps have been successfully carried out.
                </p>
              );
            }
          })()}

        

          {externalIsCheckingAuth ? (
            <button className="welcome-authorize-btn" disabled>
              Loading...
            </button>
          ) : isAuthorizing ? (
            <button className="welcome-authorize-btn" disabled>
              Authorizing...
            </button>
          ) : hasUserData ? (
            <>
              {isBannerStatusLoading ? (
                <button className="welcome-authorize-btn" disabled>
                  Loading...
                </button>
              ) : (
                <button
                  className="welcome-authorize-btn scan-project"
                  onClick={isBannerAdded ? onCustomize : handleWelcomeScreen}
                >
                  {isBannerAdded ? "Customize" : "Scan Project"}
                </button>
              )}
            </>
          ) : (
            <button className="welcome-authorize-btn" onClick={handleAuthorizeClick}>
              Authorize
            </button>
          )}
        </div>
        {hasUserData && !externalIsCheckingAuth && !isBannerStatusLoading && !isBannerAdded?(
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

