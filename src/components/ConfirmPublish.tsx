import React, { useState, useEffect } from "react";
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
import { customCodeApi } from "../services/api";

// Coupon code and discount - update these values to change the displayed text
const COUPON_CODE = "BlackFriday2025";
const COUPON_DISCOUNT = "20%";

const confirmIcon = new URL("../assets/confirmicon.svg", import.meta.url).href;
const CopyContent = new URL("../assets/copy-small.svg", import.meta.url).href;
const Previewtab = new URL("../assets/Previewtab.svg", import.meta.url).href;
const arrow = new URL("../assets/bluearrow.svg", import.meta.url).href;
const whitearrow = new URL("../assets/→.svg", import.meta.url).href;
const logo = new URL("../assets/icon.svg", import.meta.url).href;
const errorsheild = new URL("../assets/warning-2.svg", import.meta.url).href;
const crossmark = new URL("../assets/group.svg", import.meta.url).href;
const couponCodeBg = new URL("../assets/Couponcode.svg", import.meta.url).href;

const tickSVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 8l3 3 7-7"/>
    </svg>
  `);



type ConfirmPublishProps = {
  onGoBack: () => void;
  handleConfirmPublish: () => void;
  handleCustomize: () => void;

};

const ConfirmPublish: React.FC<ConfirmPublishProps> = ({ onGoBack, handleConfirmPublish, handleCustomize }) => {
  console.log('[ConfirmPublish] Component rendered');
  console.warn('[ConfirmPublish] Component rendered - WARN LEVEL');
  const [isConfirmed, setIsConfirmed] = useState(true);
  // Note: This local showTooltip is not used - we use tooltips.showTooltip from useAppState
  const [showTooltip, setShowTooltip] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [iconSrc, setIconSrc] = useState(CopyContent);
  const [showChoosePlan, setShowChoosePlan] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);
  const { sessionToken } = useAuth();

  
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
  const { user, exchangeAndVerifyIdToken, isAuthenticatedForCurrentSite, openAuthScreen } = useAuth();
  const { createCompleteBannerStructureWithExistingFunctions, isCreating } = useBannerCreation();

  // Log whenever tooltip state changes
  useEffect(() => {
    console.log('[ConfirmPublish] tooltips.showTooltip state changed to:', tooltips.showTooltip);
    console.warn('[ConfirmPublish] tooltips.showTooltip =', tooltips.showTooltip);
  }, [tooltips.showTooltip]);

  // Auto-dismiss tooltip after 2 seconds
  useEffect(() => {
    console.log('[ConfirmPublish] Auto-dismiss useEffect triggered - showTooltip:', tooltips.showTooltip, 'fadeOut:', tooltips.fadeOut);
    console.warn('[ConfirmPublish] useEffect - showTooltip:', tooltips.showTooltip);
    if (tooltips.showTooltip) {
      console.log('[ConfirmPublish] tooltips.showTooltip is TRUE - Starting auto-dismiss timer (2 seconds)');
      console.warn('[ConfirmPublish] ⏰ STARTING 2 SECOND TIMER');
      const timer = setTimeout(() => {
        console.log('[ConfirmPublish] ⏰ Timer fired after 2 seconds - starting fade out');
        console.warn('[ConfirmPublish] ⏰ TIMER FIRED - HIDING TOOLTIP');
        tooltips.setFadeOut(true);
        setTimeout(() => {
          console.log('[ConfirmPublish] 🎬 Hiding tooltip after fade animation');
          tooltips.setShowTooltip(false);
          tooltips.setFadeOut(false);
          console.log('[ConfirmPublish] ✅ Tooltip hidden successfully');
          console.warn('[ConfirmPublish] ✅ TOOLTIP HIDDEN');
        }, 300); // Wait for fade-out animation
      }, 2000); // Reduced to 2 seconds
      return () => {
        console.log('[ConfirmPublish] 🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    } else {
      console.log('[ConfirmPublish] tooltips.showTooltip is FALSE - not starting timer');
      console.warn('[ConfirmPublish] showTooltip is FALSE - no timer');
    }
  }, [tooltips.showTooltip]);


  const handlePublishClick = async () => {
    
    try {
      const isUserValid = await isAuthenticatedForCurrentSite();
      
      const selectedElement = await webflow.getSelectedElement() as { type?: string };

      const isInvalidElement = !selectedElement || selectedElement.type === "Body";

      if (isUserValid && !isInvalidElement) {
        tooltips.setShowTooltip(false);

        // Create banner configuration using actual state values
        const config: BannerConfig = {
          language: bannerLanguages.language,
          color: bannerStyles.color,
          btnColor: bannerStyles.btnColor,
          headColor: bannerStyles.headColor,
          paraColor: bannerStyles.paraColor,
          secondcolor: bannerStyles.secondcolor,
          buttonRadius: bannerStyles.buttonRadius,
          animation: bannerAnimation.animation,
          primaryButtonText: bannerStyles.primaryButtonText,
          secondbuttontext: bannerStyles.secondbuttontext,
          toggleStates: {
            customToggle: bannerToggleStates.toggleStates.customToggle,
            disableScroll: bannerToggleStates.toggleStates.disableScroll,
            closebutton: bannerToggleStates.toggleStates.closebutton,
          },
          Font: bannerStyles.Font,
          borderRadius: bannerStyles.borderRadius
        };

        // Create banners based on user selection
        
        try {
          // Create complete banner structure (both GDPR and CCPA banners)
          await createCompleteBannerStructureWithExistingFunctions(config);
          
          // Hide loading immediately after banner creation completes
          setHideLoading(true);
          
            } catch (bannerCreationError) {
          setHideLoading(true); // Hide loading even on error
          throw bannerCreationError;
         }

        
            const bannerData = {
           siteId: siteData.siteInfo?.siteId,
           cookieExpiration: "30",
           bgColor: bannerStyles.color,
           activeTab: "Customization",
           activeMode: "Advanced",
           selectedtext: "We use cookies",
           fetchScripts: true,
           btnColor: bannerStyles.btnColor,
           paraColor: bannerStyles.paraColor,
           secondcolor: bannerStyles.secondcolor,
           bgColors: bannerStyles.color,
           headColor: bannerStyles.headColor,
           secondbuttontext: bannerStyles.secondbuttontext,
           primaryButtonText: bannerStyles.primaryButtonText,
           Font: bannerStyles.Font,
           style: "Regular",
           selected: "default",
           weight: "Regular",
           borderRadius: bannerStyles.borderRadius,
           buttonRadius: bannerStyles.buttonRadius,
           animation: bannerAnimation.animation,
           easing: "ease",
           language: bannerLanguages.language,
           isBannerAdded: true,
           color: bannerStyles.color
         };
         // Hide popup immediately to prevent flicker
         popups.setShowPopup(false);
         handleConfirmPublish();
       
         try {
           const respons2 = await customCodeApi.saveBannerStyles(sessionToken, bannerData);
           
           // Check for successful response - must have success message
        
         } catch (apiError) {
           // Show warning notification to user but continue
           if (typeof webflow !== 'undefined' && webflow.notify) {
             webflow.notify({ 
               type: "info", 
               message: "Banner created but settings may not be saved. Please check your settings." 
             });
           }
         }
         
         // Always navigate to success page after banner creation
      
      } else {

        
        popups.setShowPopup(false);
        if (!isUserValid) {

          tooltips.setShowTooltip(false);
          openAuthScreen(); // Open OAuth window instead of popup
        } else if (isInvalidElement) {
          console.log('[ConfirmPublish] Setting tooltips.showTooltip to true');
          console.warn('[ConfirmPublish] 🚨 SETTING TOOLTIP TO TRUE');
          tooltips.setShowTooltip(true);
          console.warn('[ConfirmPublish] 🚨 TOOLTIP SET TO TRUE - should trigger useEffect');
        }
      }
    } catch (error) {
      tooltips.setShowTooltip(false);
      popups.setShowPopup(false);
      
      // Show error notification to user
      if (typeof webflow !== 'undefined' && webflow.notify) {
        webflow.notify({ type: "error", message: "Failed to publish banners. Please try again." });
      }
      // Note: isCreating state is managed by useBannerCreation hook
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

    <div className="publish-container">

      <div className="publish-c">
        {/* Loading overlay with pulse animation */}
        {isCreating && !hideLoading && (
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
                
                <div className="coupon-box">
                  <div className="coupon-container">
                    <p className="coupon-header">
                    Complete the payment to publish the Cookie banner to custom domain
                    </p>

                     <div 
                       className="coupon-strip"
                       style={{
                         backgroundImage: `url(${couponCodeBg})`,
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat"
                       }}
                     >
                      <div style={{ display: "flex", flexDirection: "column", padding: "10px" ,justifyContent: "center",marginLeft: "75px"}}>
                        <span style={{color: "black",fontSize: "8px",marginLeft: "5px",fontWeight: "600"}}>Use Coupon Code:</span>
                        <span style={{color: "black",fontWeight: "600",fontSize: "10px"}}>{COUPON_CODE}</span>
                      </div>

                       <img
                        src={iconSrc}   // ✅ use state here
                        alt="Copy"
                        className="copy-icon"
                        style={{ filter: "brightness(0)" }}
                        onClick={() => {
                          navigator.clipboard.writeText(COUPON_CODE)
                            .then(() => {
                              setIconSrc(tickSVG); // show tick
                              setTimeout(() => setIconSrc(CopyContent), 10000); // revert after 10s
                            })
                            .catch(() => {
                              // fallback copy
                              const textArea = document.createElement("textarea");
                              textArea.value = COUPON_CODE;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);

                              setIconSrc(tickSVG);
                              setTimeout(() => setIconSrc(CopyContent), 10000);
                            });
                        }}
                        title="Copy"
                      /> 
                    </div>  
                  </div>

                  <div style={{ width: "100%", borderTop: "1px solid rgba(140, 121, 255, 1)", display: "flex", justifyContent: "space-between" }}><div className="pay-container"> <a href="https://billing.stripe.com/p/login/00gbIJclf5nz4Hm8ww" target="_blank" onClick={(e) => {
                    e.preventDefault();
                    setShowChoosePlan(true);
                  }} rel="noopener noreferrer" className="pay-now-btn" style={{ textDecoration: 'none' }}>Pay now</a><img onClick={(e) => {
                    e.preventDefault();
                    setShowChoosePlan(true);
                  }} src={arrow} alt="" /></div></div>
                </div>


                <div className="note">
                  <p className="note-star">*</p>
                  <p className="note-text">
                  Complete the payment to publish the Cookie banner to custom domain.
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
                    <span>To continue, choose an element inside the page Body.</span>
                  </div>
                  <img src={crossmark} onClick={() => { tooltips.setShowTooltip(false); tooltips.setFadeOut(false); }} alt="" />
                </div>
              )}

              <button onClick={handleCustomize} className="customize-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                      <button className="btns-accept">Accept</button>
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
