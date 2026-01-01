import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { otherIcons } from "../util/optimized-images";
import "../style/styless.css";

// Coupon code and discount - update these values to change the displayed text
const COUPON_CODE = "BlackFriday2025";
const COUPON_DISCOUNT = "20%";


const cross = new URL("../assets/cross mark.svg", import.meta.url).href;
const arrow = new URL("../assets/→.svg", import.meta.url).href;
const couponImage = new URL("../assets/CouponImage.png", import.meta.url).href;

type ChoosePlanProps = {
  onClose: () => void;
};

const ChoosePlan: React.FC<ChoosePlanProps> = ({ onClose }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const price = isAnnual ? 6 : 8;
  const pricingText = isAnnual ? "/Paid Annually" : "/Paid Monthly";

  const handleToggle = (value: "monthly" | "annually") => {
    setIsAnnual(value === "annually");
  }

  return (
    <div className="choose-plan-overlay">
      <div className="choose-plan-modal">
        <div className="flexx">
          <h2 className="choose-plan-title">Choose plan</h2>

          <button className="choose-plan-close" onClick={onClose}>
            <img src={cross} alt="" />
          </button>

        </div>

        <div className="choose-plan-description">
          {/* <FaStar className="choose-plan-star" /> */}
          <img src={otherIcons.star} alt="" />
          <p>
            Simple pricing, complete access—go monthly for flexibility or save big with a yearly subscription. All features, always available
          </p>
        </div>

        <div className="plan-big-card">
          <div className="choose-plan-card" style={{ position: "relative" }}>
            <img 
              src={couponImage} 
              alt="Coupon" 
              style={{
                position: "absolute",
                top: "0%",
                left: "0%",
                width: "170px",
                height: "auto",
                zIndex: 1
              }}
            />
             {/* <p>Use code <b>{COUPON_CODE}</b> at checkout and get {COUPON_DISCOUNT} off your purchase. Limited time only!</p>  */}
            <div className="choose-plan-price">
              ${price}
            </div>
            <div className="choose-plan-subtext">{pricingText}</div>

            <div className="switches-container">
              <input
                type="radio"
                id="switchMonthly"
                name="switchPlan"
                checked={!isAnnual}
                onChange={() => handleToggle("monthly")}
              />
              <input
                type="radio"
                id="switchYearly"
                name="switchPlan"
                checked={isAnnual}
                onChange={() => handleToggle("annually")}
              />
              <label htmlFor="switchMonthly">Monthly</label>
              <label htmlFor="switchYearly">Annually</label>
              <div className="switch-wrapper">
                <div className="switch"></div>
              </div>

            </div>

            <div className="center">
              <button
                className="choose-plan-cta"
                onClick={() => {
                  const url = isAnnual ? "https://buy.stripe.com/aFa3cw5xtfv49xTeEYds403" : "https://buy.stripe.com/fZubJ2aRNer0h0l8gAds401";
                  window.open(url, "_blank");
                }}
              >
                Purchase Now <img src={arrow} alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;


