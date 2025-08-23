import React, { useState } from "react";
import "../style/styless.css";
import ConfirmPublish from "./ConfirmPublish";

// Asset imports
const confirmIcon = new URL("../assets/confirmicon.svg", import.meta.url).href;
const arrowLeft = new URL("../assets/arroww.svg", import.meta.url).href;
const arrowRight = new URL("../assets/up arrow.svg", import.meta.url).href;
const exclamationIcon = new URL("../assets/warning-2.svg", import.meta.url).href;
const whitearrow = new URL("../assets/→.svg", import.meta.url).href;
const tickmark = new URL("../assets/tickmark.svg", import.meta.url).href;
const uparrow = new URL("../assets/blue up arrow.svg", import.meta.url).href;


type SetupStepProps = {
  onGoBack: () => void;
  onProceed: () => void;
};

const SetupStep: React.FC<SetupStepProps> = ({ onGoBack, onProceed }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  // Asset imports
  const logo = new URL("../assets/icon.svg", import.meta.url).href;
  const questionmark = new URL("../assets/question.svg", import.meta.url).href;
  const leftLines = new URL("../assets/leftlines.svg", import.meta.url).href;
  const rightLines = new URL("../assets/rightlines.svg", import.meta.url).href;
  const infologo = new URL("../assets/info-logo.svg", import.meta.url).href;
  const youtubethumbnail = new URL("../assets/thumb.jpg", import.meta.url).href;

  const onNeedHelp = () => {
    // Open help modal or redirect to help page
    window.open('https://www.consentbit.com/help-document', '_blank');
  };

  const handleProceedToConfirmPublish = () => {
    setShowConfirmPublish(true);
  };

  const handleGoBackFromConfirmPublish = () => {
    setShowConfirmPublish(false);
  };

  const handleConfirmPublishProceed = () => {
    onProceed();
  };


  return (
    <>
      {showConfirmPublish ? (
        <ConfirmPublish
          onGoBack={handleGoBackFromConfirmPublish}
          onProceed={handleConfirmPublishProceed}
        />
      ) : (
        <div className="popup">
          {/* Main content container */}
          <div className="setup-main-content">
            {/* Central interactive section */}
            <div className="setup-central-section">
              {/* Top icon */}
              <div className="setup-icon">
                <img src={confirmIcon} alt="Confirm" />
              </div>

              {/* Confirmation checkbox */}
              <div className="setup-confirmation">
                <div className="setup-checkbox-container">
                  <label className="setup-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="setup-checkbox"
                    />
                    <span className="custom-checkbox3">
                      {isConfirmed && <img src={tickmark} alt="checked" className="tick-icon3" />}
                    </span>
                    <span className="setup-checkbox-text">
                      Confirm that you added all scripts to the backend
                    </span>
                  </label>
                </div>

              </div>

              {/* Navigation buttons */}
              <div className="setup-navigation">
                <button className="setup-back-btn" onClick={onGoBack}>
                  <img src={whitearrow} alt="" /> Go back
                </button>

                <button
                  className="setup-proceed-btn"
                  onClick={handleProceedToConfirmPublish}
                  disabled={!isConfirmed}
                >
                  proceed to next step
                </button>
              </div>
            </div>

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

                    <span className="need-help-text">Need help?</span>
                  </div>
                  <div className="setup-card-youtube-thumbnail">
                    <a href="" target="_blank"><img src={youtubethumbnail} alt="Tutorial Video" className="setup-video-thumbnail" /></a>
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

                  <div className="subscribe help"><a className="link" href="#">Need help? See the docs <i><img src={uparrow} alt="" /></i></a></div>
                </div>
              </div>


            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SetupStep;
