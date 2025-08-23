import React, { useState } from "react";
import "../style/styless.css";

const copyScript = new URL("../assets/copy.svg", import.meta.url).href;
const cros = new URL("../assets/white cros.svg", import.meta.url).href;
const thumb = new URL("../assets/thumb.jpg", import.meta.url).href;
const uparrow = new URL("../assets/upaarow.svg", import.meta.url).href;




type ChoosePlanProps = {
  onClose: () => void;
  toggleStates?: {
    donotshare: boolean;
  };
  handleToggle?: (toggleName: string) => void;
};

const DonotShare: React.FC<ChoosePlanProps> = ({ onClose, toggleStates, handleToggle }) => {
  return (
    <>
      {/* Conditional content for donotshare */}
      {toggleStates?.donotshare && (
        <div className="popup-overlays1">
          <div className="popup-content1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", padding: "16px 16px 16px 16px", borderBottom: "1px solid #8B77F94D" }}>
              <h3 style={{ margin: 0, fontSize: "12px", color: "#white" }}>Copy Contents</h3>
              <button
                onClick={() => handleToggle?.("donotshare")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                <img src={cros} alt="" />
              </button>
            </div>

            <div style={{ padding: "15px" }}>
              <div className="contentdiv" style={{ display: "flex", alignItems: "center", marginBottom: "10px", justifyContent: "space-between", width: "260px" }}>
                <div>
                  <p style={{ margin: "0", fontSize: "12px", color: "#A0A0B0" }}>
                    Name
                  </p>
                </div>
                <div>
                  <div className="data-attribute">
                    <p className="linktext" style={{ lineHeight: "2px" }}>
                      consentbit-data-donotshare
                    </p>
                    <img
                      src={copyScript}
                      alt="Copy"
                      style={{
                        width: "13px",
                        height: "13px",
                        cursor: "pointer",
                        opacity: "0.7"
                      }}
                       onMouseDown={(event) => {
                        const img = event.target as HTMLImageElement;
                        if (img) {
                          img.style.opacity = "0.4"; 
                        }
                      }}
                      onClick={(event) => {
                        navigator.clipboard.writeText("consentbit-data-donotshare")
                          .then(() => {
                    
                            const img = event?.target as HTMLImageElement;
                            if (img) {
                              img.style.opacity = "1";
                              setTimeout(() => img.style.opacity = "0.7", 500);
                            }
                          })
                          .catch(() => {
                            const textArea = document.createElement('textarea');
                            textArea.value = "consentbit-data-donotshare";
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                          });
                      }}
                      title="Copy text"
                    />
                  </div>

                </div>
              </div>
              <div className="contentdiv" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "260px" }}>
                <div>
                  <p style={{ margin: "0", fontSize: "12px", color: "#A0A0B0" }}>
                    Value
                  </p>
                </div>
                <div>
                  <div className="data-attribute">
                    <p className="linktext" style={{ lineHeight: "2px" }}>
                      consentbit-link-donotshare
                    </p>
                    <img
                      src={copyScript}
                      alt="Copy"
                      style={{
                        width: "13px",
                        height: "13px",
                        cursor: "pointer",
                        opacity: "0.7",
                        transition: "opacity 0.2s ease"
                      }}
                      onMouseDown={(event) => {
                        const img = event.target as HTMLImageElement;
                        if (img) {
                          img.style.opacity = "0.4"; 
                        }
                      }}
                      onClick={(event) => {
                        navigator.clipboard.writeText("consentbit-link-donotshare")
                          .then(() => {
                    
                            const img = event?.target as HTMLImageElement;
                            if (img) {
                              img.style.opacity = "1";
                              setTimeout(() => img.style.opacity = "0.7", 500);
                            }
                          })
                          .catch(() => {
                            const textArea = document.createElement('textarea');
                            textArea.value = "consentbit-link-donotshare";
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                          });
                      }}
                      title="Copy text"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions section */}
            <div>
              <div style={{ padding: "15px" }}>
                <div style={{ borderBottom: "1px solid #8B77F94D", marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#A0A0B0", fontWeight: "400", }}>
                    How to use
                  </h4>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ borderRadius: "6px", fontSize: "12px", lineHeight: "1.4", color: "#A0A0B0" }}>
                    <p style={{ margin: "0 0 15px 0" }}>
                      <span style={{ color: "#fff" }}>Step 1 -</span> Copy the custom attribute above
                    </p>

                    <p style={{ margin: "0 0 15px 0" }}>
                      <span style={{ color: "#fff" }}>Step 2 -</span> In Webflow Designer, select your link element
                    </p>
                    <p style={{ margin: "0 0 15px 0" }}>
                      <span style={{ color: "#fff" }}>Step 3 -</span> Go to Element Settings → Custom Attributes
                    </p>
                    <p style={{ margin: "0" }}>
                      <span style={{ color: "#fff" }}>Step 4 -</span> Paste the copied value as the custom attribute
                    </p>
                    <div style={{width:"85%"}}>
                      <p>*Place the cookie banner inside a reusable component and include it across all pages of the site.</p>
                    </div>
                  </div>
                  <div style={{ width: "242px", justifyContent: "left", display: "flex", flexDirection: "column" }}>
                    <p style={{ marginBottom: "12px", fontSize: "12px", color: "#ffffffff" }}>Watch tutorial</p>
                    <div>
                      <a target="_blank" href="https://vimeo.com/1107523507"><img style={{ marginBottom: "5px", width:"118px", height:"70px" }} src={thumb} alt="" /></a>
                    </div>
                    <a style={{ textDecoration: "none", color: "#A0A0B0", fontSize: "12px", display: "flex" }} target="_blank" href="https://vimeo.com/1107523507">How to enable do not share link<img src={uparrow} alt="" /> </a>
                  </div>
                </div>
              </div>
              <div>

              </div>
            </div>
            {/* <div style={{display:"flex",justifyContent:"center"}}>
              <img style={{width:"100px"}} src={donotshare} alt="" />
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default DonotShare;