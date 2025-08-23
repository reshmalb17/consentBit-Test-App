import React, { useState } from "react";
import "../style/styless.css";
import "../style/confirmpublish.css";
import NeedHelp from "../components/NeedHelp";
import { useAuth } from "../hooks/userAuth";
import webflow from "../types/webflowtypes";
import { useAppState } from "../hooks/useAppState";
import { useBannerCreation } from "../hooks/useBannerCreation";
import PulseAnimation from "../components/PulseAnimation";



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

const ConfirmPublish: React.FC<ConfirmPublishProps> = ({ onGoBack, onProceed , }) => {
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

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
        toggleStates,
        localStorage: localStorageData
      } = useAppState();
      const {user, exchangeAndVerifyIdToken } = useAuth();
  const { createGDPRBanner, createCCPABanner, createBothBanners, isCreating, showLoading, showSuccess } = useBannerCreation();
  

  const handlePublishClick = async () => {
    console.log("handlePublishClick called");
    console.log("isConfirmed:", isConfirmed);
    console.log("user:", user);
    console.log("isUserValid:", user?.firstName);
    
    const isUserValid = user?.firstName;
    try {
      const selectedElement = await webflow.getSelectedElement() as { type?: string };

      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

      if (isUserValid && !isInvalidElement) {
        tooltips.setShowTooltip(false);
        
        // Create banner configuration using actual state values
        const bannerConfig = {
          color: colors.color,
          bgColor: colors.bgColor,
          btnColor: colors.btnColor,
          paraColor: colors.paraColor,
          secondcolor: colors.secondcolor,
          bgColors: colors.bgColors,
          headColor: colors.headColor,
          secondbuttontext: colors.secondbuttontext,
          primaryButtonText: colors.primaryButtonText,
          Font: config.Font,
          style: ui.style,
          selected: ui.selected,
          weight: config.weight,
          borderRadius: config.borderRadius,
          buttonRadius: config.buttonRadius,
          animation: animation.animation,
          easing: animation.easing,
          language: animation.language,
          toggleStates: {
            customToggle: toggleStates.toggleStates.customToggle,
            disableScroll: toggleStates.toggleStates.disableScroll,
            closebutton: toggleStates.toggleStates.closebutton,
          }
        };

        console.log("Creating banners with config:", bannerConfig);
        console.log("Selected options:", ui.selectedOptions);
        
        // Create banners based on user selection - Default to both banners
        if (ui.selectedOptions.includes("GDPR") && ui.selectedOptions.includes("U.S. State Laws")) {
          console.log("Creating both banners");
          await createBothBanners(bannerConfig);
        } else if (ui.selectedOptions.includes("GDPR")) {
          console.log("Creating both banners (GDPR selected, defaulting to both)");
          await createBothBanners(bannerConfig);
        } else if (ui.selectedOptions.includes("U.S. State Laws")) {
          console.log("Creating both banners (CCPA selected, defaulting to both)");
          await createBothBanners(bannerConfig);
        } else {
          console.log("Creating both banners (default)");
          // Default to both banners
          await createBothBanners(bannerConfig);
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
      console.error("Error checking selected element:", error);
    }
  };

  return (
    <div className="publish-container">
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
                            console.log("Text copied to clipboard");
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

                <div style={{ width: "100%", borderTop: "1px solid rgba(140, 121, 255, 1)", display: "flex", justifyContent: "space-between" }}><div className="pay-container"> <button className="pay-now-btn"  >Pay now</button><img src={arrow} alt="" /></div></div>
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
                    console.log("Button clicked, isConfirmed:", isConfirmed);
                    handlePublishClick();
                  }}
                >
                  {isCreating ? "Creating..." : "Publish"}
                </button>
            </div>
                 {showTooltip && (
        <div className={`global-error-banner ${tooltips.fadeOut ? 'fade-out' : 'fade-in'}`}>
          <img src={errorsheild} alt="errorsheild" />
          <div className="global-error-content">
            <text>To continue, choose an element inside the page Body.</text>
          </div>
          <img src={crossmark} onClick={() => { setShowTooltip(false); tooltips.setFadeOut(false); }} alt="" />
        </div>
      )}

            <a href="/customize" className="customize-link">
              Customize <img src={arrow} alt="" />
            </a>
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
                  <span className="cookie-title">Cookie Setting</span>
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
  );
};

export default ConfirmPublish;
