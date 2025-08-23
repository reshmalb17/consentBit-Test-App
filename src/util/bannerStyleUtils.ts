export interface BannerConfig {
  color: string;
  bgColor: string;
  btnColor: string;
  paraColor: string;
  secondcolor: string;
  bgColors: string;
  headColor: string;
  secondbuttontext: string;
  primaryButtonText: string;
  Font: string;
  style: string;
  selected: string;
  weight: string;
  borderRadius: number;
  buttonRadius: number;
  animation: string;
  easing: string;
  language: string;
  toggleStates: {
    customToggle: boolean;
    disableScroll: boolean;
    closebutton: boolean;
  };
}

export interface ButtonConfig {
  buttonRadius: number;
  backgroundColor: string;
  color: string;
  marginLeft: string;
  marginRight: string;
  minWidth: string;
  textAlign: string;
  display: string;
  justifyContent: string;
}

export const getBannerStyleProperties = (config: BannerConfig) => {
  const animationAttributeMap = {
    "fade": "fade",
    "slide-up": "slide-up",
    "slide-down": "slide-down",
    "slide-left": "slide-left",
    "slide-right": "slide-right",
    "select": "select",
  };

  const animationAttribute = animationAttributeMap[config.animation as keyof typeof animationAttributeMap] || "";

  const divPropertyMap: Record<string, string> = {
    "background-color": config.color,
    "position": "fixed",
    "z-index": "99999",
    "padding-top": "20px",
    "padding-right": "20px",
    "padding-bottom": "20px",
    "padding-left": "20px",
    "border-radius": `${config.borderRadius}px`,
    "display": "none",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center",
    "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
    "font-family": config.Font,
  };

  if (window.innerWidth <= 768) {
    divPropertyMap["width"] = "100%";
    divPropertyMap["height"] = "40%";
  }

  divPropertyMap["bottom"] = "3%";

  // Handle position based on selected
  switch (config.selected) {
    case "left":
      divPropertyMap["left"] = "3%";
      divPropertyMap["right"] = "auto";
      divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
      break;
    case "center":
      divPropertyMap["left"] = "50%";
      delete divPropertyMap["right"];
      divPropertyMap["transform"] = "translate3d(-50%, 0, 0)";
      break;
    case "right":
    default:
      divPropertyMap["right"] = "3%";
      divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
      divPropertyMap["left"] = "auto";
      break;
  }

  // Handle style dimensions
  switch (config.style) {
    case "bigstyle":
      divPropertyMap["width"] = "370px";
      divPropertyMap["min-height"] = "284px";
      break;
    case "fullwidth":
      divPropertyMap["width"] = "100%";
      divPropertyMap["min-height"] = "167px";
      divPropertyMap["left"] = "0px";
      divPropertyMap["right"] = "0px";
      divPropertyMap["bottom"] = "0px";
      divPropertyMap["transform"] = "translate3d(0px, 0, 0)";
      break;
    case "centeralign":
      divPropertyMap["width"] = "566px";
      divPropertyMap["min-height"] = "167px";
      break;
    case "align":
    case "alignstyle":
    default:
      divPropertyMap["width"] = "438px";
      divPropertyMap["min-height"] = "220px";
      break;
  }

  return {
    divPropertyMap,
    animationAttribute
  };
};

export const getResponsiveProperties = () => {
  return {
    responsivePropertyMap: {
      "max-width": "100%",
      "width": "100%",
      "bottom": "0",
      "left": "0",
      "right": "0",
      "top": "auto",
      "transform": "none"
    },
    responsiveOptions: { breakpoint: "small" }
  };
};

export const getButtonStyleProperties = (config: ButtonConfig) => {
  return {
    "border-radius": `${config.buttonRadius}px`,
    "cursor": "pointer",
    "background-color": config.backgroundColor,
    "color": config.color,
    "margin-left": config.marginLeft,
    "margin-right": config.marginRight,
    "min-width": config.minWidth,
    "text-align": config.textAlign,
    "display": config.display,
    "justify-content": config.justifyContent,
  };
};

export const getParagraphStyleProperties = (config: BannerConfig) => {
  const paragraphPropertyMap: Record<string, string> = {
    "color": config.paraColor,
    "font-size": "16px",
    "font-weight": `${config.weight}`,
    "line-height": "1.5",
    "text-align": "left",
    "margin-top": "0",
    "margin-right": "0",
    "margin-bottom": "10px",
    "margin-left": "0",
    "display": "block",
    "width": "100%",
  };

  if (config.style === "centeralign") {
    paragraphPropertyMap["text-align"] = "center";
  }

  return paragraphPropertyMap;
};

export const getHeadingStyleProperties = (config: BannerConfig) => {
  const headingPropertyMap: Record<string, string> = {
    "color": config.headColor,
    "font-size": "20px",
    "font-weight": `${config.weight}`,
    "text-align": "left",
    "margin-top": "0",
    "margin-bottom": "10px",
    "width": "100%",
  };

  if (config.style === "centeralign") {
    headingPropertyMap["text-align"] = "center";
  }

  return headingPropertyMap;
};

export const getButtonContainerStyleProperties = (config: BannerConfig) => {
  const buttonContainerPropertyMap: Record<string, string> = {
    "display": "flex",
    "justify-content": "right",
    "margin-top": "10px",
    "width": "100%",
  };

  if (config.style === "centeralign") {
    buttonContainerPropertyMap["justify-content"] = "center";
  }

  return buttonContainerPropertyMap;
};

export const getCloseButtonStyleProperties = () => {
  return {
    "color": "#000",
    "justify-content": "center",
    "align-items": "center",
    "width": "25px",
    "height": "25px",
    "display": "flex",
    "position": "absolute",
    "top": "5%",
    "left": "auto",
    "right": "2%",
    "z-index": "99",
    "cursor": "pointer",
    "font-family": "'Montserrat', sans-serif",
  };
};
