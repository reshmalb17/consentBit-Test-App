import React from "react";
import { useState } from "react";
import "../style/styless.css";
import Script from "./Script";
const youtubethumbnail=new URL("../assets/youtube-thumbnail.svg", import.meta.url).href;
const infologo = new URL("../assets/info-logo.svg", import.meta.url).href;
const questionmark = new URL("../assets/question.svg", import.meta.url).href;

type WelcomeScriptProps = {
  onAuthorize: () => void;
  onNeedHelp: () => void;
};

const WelcomeScipt: React.FC<WelcomeScriptProps> = ({ onAuthorize, onNeedHelp }) => {

      const [fetchScripts, setFetchScripts] = useState<boolean>(true);
  return (
    <div className="welcome-screen script">     
              {/* Bottom information cards */}
        <div className="setup-info-cards welcome-script">
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
              <img src={questionmark} alt="Need help?" style={{width:"100%", height:"100%"}}  />
              </div>
               
            <span className="need-help-text">Need help?</span>
          </div>
             <div className="setup-card-youtube-thumbnail">
              <img src={youtubethumbnail} alt="Tutorial Video" className="setup-video-thumbnail" />
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

            <div className="subscribe help"><a className="link" href="#">Need help? See the docs <i><img src="https://67c7218243770a3d2c39fb20.webflow-ext.com/689d09e47269fe2b0de4ee70/58620d0d66fe581478f9.svg" alt=""/></i></a></div>
               </div>
               </div>
        
         
        </div>
         <div className="next-step-section">
            <div className="welcome-script-title">
                List of scripts to update                 
          </div>
          <div className="welcome-script-buttons">
            <button className="publish-buttons">Scan Project</button>
            <button className="publish-buttons" >Next</button>

            </div>
         </div>
         <div className="welcome-script-actions">
            <div className="welcome-script-actions-container">
                 <Script fetchScripts={fetchScripts}
             setFetchScripts={setFetchScripts}
             isWelcome={true} />

            </div>
           
           
         </div>
   
    </div>
  );
};

export default WelcomeScipt;
