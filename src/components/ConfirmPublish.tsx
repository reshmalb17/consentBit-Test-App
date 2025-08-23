import React, { useState } from "react";
import "../style/styless.css";
import "../style/confirmpublish.css";
import NeedHelp from "../components/NeedHelp";
import { useAuth } from "../hooks/userAuth";
import webflow from "../types/webflowtypes";
import { useAppState } from "../hooks/useAppState";
import { useBannerCreation, BannerConfig } from "../hooks/useBannerCreation";
import PulseAnimation from "../components/PulseAnimation";
import SuccessPublish from "../components/SuccessPublish";
import CustomizationTab from "./CustomizationTab";
import ChoosePlan from "./ChoosePlan";



const confirmIcon = new URL("../assets/confirmicon.svg", import.meta.url).href;
const CopyContent = new URL("../assets/copy.svg", import.meta.url).href;
const Previewtab = new URL("../assets/Previewtab.svg", import.meta.url).href;
const arrow = new URL("../assets/bluearrow.svg", import.meta.url).href;
const whitearrow = new URL("../assets/→.svg", import.meta.url).href;
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const errorsheild = new URL("../assets/warning-2.svg", import.meta.url).href;
const crossmark = new URL("../assets/group.svg", import.meta.url).href;




type ConfirmPublishProps = {
  onGoBack: () => void;
  onProceed: () => void;
};

const ConfirmPublish: React.FC<ConfirmPublishProps> = ({ onGoBack, onProceed, }) => {
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showChoosePlan, setShowChoosePlan] = useState(false);

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
    bannerToggleStates,
    bannerLanguages,
    localStorage: localStorageData
  } = useAppState();
  const { user, exchangeAndVerifyIdToken } = useAuth();
  const {
    createGDPRBanner,
    createCCPABanner,
    createBothBanners,
    isCreating,
    showLoading,
    showSuccess,
    showSuccessPublish,
    handleSuccessPublishProceed,
    handleSuccessPublishGoBack
  } = useBannerCreation();


  const handlePublishClick = async () => {


    const isUserValid = user?.firstName;
    try {
      const selectedElement = await webflow.getSelectedElement() as { type?: string };

      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

      if (isUserValid && !isInvalidElement) {
        tooltips.setShowTooltip(false);

        // Create banner configuration using actual state values
        const config: BannerConfig = {
          color: bannerStyles.color,
          bgColor: bannerStyles.bgColor,
          btnColor: bannerStyles.btnColor,
          paraColor: bannerStyles.paraColor,
          secondcolor: bannerStyles.secondcolor,
          bgColors: bannerStyles.bgColors,
          headColor: bannerStyles.headColor,
          secondbuttontext: bannerStyles.secondbuttontext,
          primaryButtonText: bannerStyles.primaryButtonText,
          Font: bannerStyles.Font,
          style: bannerUI.style,
          selected: bannerUI.selected,
          weight: bannerStyles.weight,
          borderRadius: bannerStyles.borderRadius,
          buttonRadius: bannerConfig.buttonRadius,
          animation: bannerAnimation.animation,
          easing: bannerAnimation.easing,
          language: bannerLanguages.language,
          toggleStates: {
            customToggle: bannerToggleStates.toggleStates.customToggle,
            disableScroll: bannerToggleStates.toggleStates.disableScroll,
            closebutton: bannerToggleStates.toggleStates.closebutton,
          }
        };

        

        // Create banners based on user selection - Default to both banners
        if (bannerUI.selectedOptions.includes("GDPR") && bannerUI.selectedOptions.includes("U.S. State Laws")) {
  
          await createBothBanners(config);
        } else if (bannerUI.selectedOptions.includes("GDPR")) {
          await createBothBanners(config);
        } else if (bannerUI.selectedOptions.includes("U.S. State Laws")) {
          await createBothBanners(config);
        } else {
          // Default to both banners
          await createBothBanners(config);
        }

        popups.setShowPopup(true);
      } else {
        popups.setShowPopup(false);
        if (!isUserValid) {
          tooltips.setShowTooltip(false);
          popups.setShowAuthPopup(true);
        } else if (isInvalidElement) {
          tooltips.setShowTooltip(true);
        }
      }
    } catch (error) {
      tooltips.setShowTooltip(false);
    }
  };

  const handleCustomizeClick = () => {
    setShowCustomize(true);
  };

  const handleBackFromCustomize = () => {
    setShowCustomize(false);
  };

  // If showCustomize is true, render the CustomizationTab component
  if (showCustomize) {
    return <CustomizationTab onAuth={handleBackFromCustomize} initialActiveTab="Customization" />;
  }

  
  if (showChoosePlan) {
    return <ChoosePlan onClose={() => setShowChoosePlan(false)} />;
  }

  return (
    // <>
    // {showSuccessPublish ? (
    //   <CustomizationTab onAuth={handleBackFromCustomize} initialActiveTab="Customization" />
    // ) : (
      <div className="publish-container">
        {/* Success page overlay */}
                  {showSuccessPublish && (
            <SuccessPublish
              onProceed={handleSuccessPublishProceed}
              onGoBack={handleSuccessPublishGoBack}
            />
          )}
       <div className="publish-c">
          {/* Loading overlay with pulse animation */}
          {isCreating && (
            <div className="popup">
              <div className="popup-loading-content">
                <PulseAnimation />
                <p className="popup-message">
                  Almost there… your cookie banner is in the oven. Nothing's breaking, just baking!
                </p>
              </div>
            </div>
          )}
    
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><NeedHelp /></div>
            {/* LEFT COLUMN */}
            <div className="content-container">
              <div className="publish-left">
                <button className="go-back-btn" onClick={onGoBack}><img className="whitearrow" src={whitearrow} alt="" /> Go back</button>
    
                <div className="payment-box">
                  {/* Coupon Section */}
                  <div className="coupon-box">
                    <div className="coupon-container">
                      <p className="coupon-header">
                        Complete payment to publish cookie widget to the Live site
                      </p>
    
                      <div className="coupon-strip">
                        <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
                          <span>Get the app free for one year</span>
                          <span>coupon code - CONSENTBIT100</span>
                        </div>
                        {/* <img src={CopyContent} alt="copy" className="copy-icon" /> */}
                        <img
                          src={CopyContent}
                          alt="Copy"
                          className="copy-icon"
                          onClick={(event) => {
                            const img = event.currentTarget;
                            // img.style.opacity = "0.4";
                            navigator.clipboard.writeText("CONSENTBIT100")
                              .then(() => {
                        
                                setTimeout(() => {
                                  img.style.opacity = "0.7";
                                }, 300);
                              })
                              .catch(() => {
                                const textArea = document.createElement("textarea");
                                textArea.value = "CONSENTBIT100";
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                              });
                          }}
                          title="Copy"
                        />
    
                      </div>
                    </div>
    
                    <div style={{ width: "100%", borderTop: "1px solid rgba(140, 121, 255, 1)", display: "flex", justifyContent: "space-between" }}><div className="pay-container"> <a href="https://billing.stripe.com/p/login/00gbIJclf5nz4Hm8ww" target="_blank" onClick={(e) => {
                  e.preventDefault();
                  setShowChoosePlan(true);
                }} rel="noopener noreferrer" className="pay-now-btn" style={{ textDecoration: 'none' }}>Pay now</a><img  onClick={(e) => {
                  e.preventDefault();
                  setShowChoosePlan(true);
                }} src={arrow} alt="" /></div></div>
                  </div>
    
    
                  <div className="note">
                    <p className="note-star">*</p>
                    <p className="note-text">
                      Complete the payment to publish cookie widget to the live site.
                      If payment is not made, it will only be published to the staging site.
                    </p>
                  </div>
    
                  <button
                    className="publish-btn"
                    disabled={!isConfirmed || isCreating}
                    onClick={() => {
              
                      handlePublishClick();
                    }}
                  >
                    {isCreating ? "Creating..." : "Publish"}
                  </button>
                </div>
                {tooltips.showTooltip && (
                  <div className={`global-error-banner ${tooltips.fadeOut ? 'fade-out' : 'fade-in'}`}>
                    <img src={errorsheild} alt="errorsheild" />
                    <div className="global-error-content">
                      <text>To continue, choose an element inside the page Body.</text>
                    </div>
                    <img src={crossmark} onClick={() => { tooltips.setShowTooltip(false); tooltips.setFadeOut(false); }} alt="" />
                  </div>
                )}
    
                <button onClick={handleCustomizeClick} className="customize-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
                  Customize <img src={arrow} alt="" />
                </button>
              </div>
    
              {/* RIGHT COLUMN - PREVIEW */}
              <div className="publish-right">
    
                <div className="preview-window">
                  <img className="consentbit-icon" src={logo} alt="dots" />
    
                  <div className="preview-header">Preview</div>
                  {/* Browser mockup */}
                  <div
                    className="preview-content"
                    style={{
                      background: `url(${Previewtab}) no-repeat center center`,
                      backgroundSize: "contain",   // keep proportions, full image
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center"
                    }}
                  >
    
                    <div className="cookie-banner1">
                      <span className="cookie-title1">Cookie Setting</span>
                      <p className="cookie-text">
                        We use cookies to provide you with the best possible experience.
                        They also allow us to analyze user behavior in order to
                        continually improve the website for you.
                      </p>
                      <div className="cookie-actions">
                        <button className="btns-preferences">Preferences</button>
                        <button className="btns-reject">Reject</button>
                        <button className="btns-accept">Accept All</button>
                      </div>
                    </div>
                  </div>
    
                </div>
              </div>
            </div>
          </div>
       </div>
      </div>
    //   )}
    // </>
    
   
  );
};

export default ConfirmPublish;
