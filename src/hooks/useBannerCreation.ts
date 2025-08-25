import { useState } from 'react';
import { useAppState } from './useAppState';
import webflow from '../types/webflowtypes';
import createCookiePreferences from './gdprPreference';
import createCookieccpaPreferences from './ccpaPreference';

export interface BannerConfig {
  language: string;
  color: string;
  btnColor: string;
  headColor: string;
  paraColor: string;
  secondcolor: string;
  buttonRadius: number | string;
  animation: string;
  primaryButtonText: string;
  secondbuttontext: string;
  toggleStates?: {
    customToggle?: boolean;
    disableScroll?: boolean;
    closebutton?: boolean;
  };
  Font?: string;
}
type BreakpointAndPseudo = {
  breakpoint: string;
  pseudoClass: string;
};
export const useBannerCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessPublish, setShowSuccessPublish] = useState(false);
  
  const {
    bannerBooleans,
    bannerStyles,
    bannerUI,
    bannerAnimation,
    bannerToggleStates,
    bannerLanguages
  } = useAppState();

  const handleBannerSuccess = () => {
    setShowSuccess(true);
    setShowLoading(false);
    setIsCreating(false);
  };

  const handleBannerError = (error: any) => {
    console.error('Banner creation error:', error);
    setIsCreating(false);
    setShowLoading(false);
  };

  const handleSuccessPublishProceed = () => {
    setShowSuccessPublish(false);
  };

  const handleSuccessPublishGoBack = () => {
    setShowSuccessPublish(false);
  };

  const createSimpleGDPRBanner = async (selectedElement: any, config: BannerConfig, animationAttribute: string) => {
    try {
      console.log('Creating simple GDPR banner...');
      
      // Step 1: Create main banner div using selectedElement.before() exactly like GDPR function
      const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create banner div");
      }
      
      // Step 2: Set DOM ID exactly like GDPR function
      if ((newDiv as any).setDomId) {
        await (newDiv as any).setDomId("consent-banner");
      }
      
      const styleNames = {
        divStyleName: "consentbit-gdpr_banner_div",
        paragraphStyleName: "consentbit-gdpr_banner_text",
        buttonContainerStyleName: "consentbit-banner_button_container",
        prefrenceButtonStyleName: "consentbit-banner_button_preference",
        declineButtonStyleName: "consentbit-banner_button_decline",
        buttonStyleName: "consentbit-banner_accept",
        headingStyleName: "consentbit-banner_headings",
        innerDivStyleName: "consentbit-innerdiv",
        secondBackgroundStyleName: "consentbit-banner_second-bg",
        closebutton: 'close-consent'
      };
      const styles = await Promise.all(
        Object.values(styleNames).map(async (name) => {
          return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
        })
      );
      const [
        divStyle, paragraphStyle, buttonContainerStyle, prefrenceButtonStyle, declineButtonStyle, buttonStyle, headingStyle, innerDivStyle, secondBackgroundStyle, closebutton
      ] = styles;
      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select", // No attribute if "select"
      };
      const divPropertyMap: Record<string, string> = {
        "background-color": `${bannerStyles.bgColor}`,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `4px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": `${bannerStyles.Font}`,
        "right": "3%",
        "transform": "translate3d(0px, 0, 0)",
        "left": "auto",
        "bottom": "3%",
        "width": "438px",
        "min-height": "220px",
      };
     
      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const paragraphPropertyMap: Record<string, string> = {
        "color": config.paraColor,
        "font-size": "16px",
        "font-weight": "400",
        "line-height": "1.5",
        "text-align": "left",
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "right",
        "margin-top": "10px",
        "width": "100%",
      };

      const buttonPropertyMap: Record<string, string> = {
        "border-radius":"3px",
        "cursor": "pointer",
        "background-color":"#C9C9C9",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "color":"#ffffff",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };
      
      const responsivebuttonPropertyMap: Record<string, string> = {
        "margin-bottom": "10px",
        "flex-direction": "column",
        "justify-content": "center",
        "text-align": "center",
        "display": "flex",
        "row-gap": "12px"

      };
      const responsivebuttonOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const declineButtonPropertyMap: Record<string, string> = {
        "border-radius": "3px",
        "cursor": "pointer",
        "background-color": "white",
        "color": "000000",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };



      const headingPropertyMap: Record<string, string> = {
        "color": `${bannerStyles.headColor}`,
        "font-size": "20px",
        "font-weight": "400px",
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": `${bannerStyles.bgColor}`,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": "4px",
        "border-top-right-radius": "4px"
      };

      const CloseButtonPropertyMap: Record<string, string> = {
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

      
      await divStyle.setProperties(divPropertyMap);
      await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
      await paragraphStyle.setProperties(paragraphPropertyMap);
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      await headingStyle.setProperties(headingPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap);
      // Line 316: Properties applied to buttonContainerStyle
       await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
       await prefrenceButtonStyle.setProperties(buttonPropertyMap);

// Line 318: Style attached to button container element
      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }
      if (newDiv.setCustomAttribute) {
        await newDiv.setCustomAttribute("data-animation", bannerAnimation.animation);
        await newDiv.setCustomAttribute("data-cookie-banner", bannerToggleStates.toggleStates.disableScroll ? "true" : "false");
      }
     
      // Step 5: Create inner div exactly like GDPR function
      const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!innerdiv) {
        throw new Error("Failed to create inner div");
      }
      await innerdiv.setStyles([innerDivStyle]);

      // Step 6: Create heading with proper styles and black text
      
      const tempHeading = await selectedElement.before(webflow.elementPresets.Heading);
      if (!tempHeading) {
        throw new Error("Failed to create heading");
      }
     

      
      
      await headingStyle.setProperties(headingPropertyMap);
      
      if (tempHeading.setHeadingLevel) {
        await tempHeading.setHeadingLevel(2);
      }
      if (tempHeading.setStyles) {
        await tempHeading.setStyles([headingStyle]);
      }
      if (tempHeading.setTextContent) {
        await tempHeading.setTextContent('Cookie Consent');
      }

      // Step 7: Create paragraph with proper styles and black text
      const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
      if (!tempParagraph) {
        throw new Error("Failed to create paragraph");
      }
      if (tempParagraph.setStyles) {
      
     
      await paragraphStyle.setProperties(paragraphPropertyMap);
      
      if (tempParagraph.setStyles) {
        await tempParagraph.setStyles([paragraphStyle]);
      }
      if (tempParagraph.setTextContent) {
        await tempParagraph.setTextContent('We use cookies to enhance your browsing experience and provide personalized content.');
      }

      // Step 8: Create button container with proper styles
      const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      
     
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      if (buttonContainer.setStyles) {
        await buttonContainer.setStyles([buttonContainerStyle]);
      }

      // Step 9: Create preferences button with proper styles and black text
      const prefrenceButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!prefrenceButton) {
        throw new Error("Failed to create decline button");
      }
      await prefrenceButton.setStyles([prefrenceButtonStyle]);
      await prefrenceButton.setTextContent('Preferences');
      
      if ((prefrenceButton as any).setDomId) {
        await (prefrenceButton as any).setDomId("preferences-btn"); // Type assertion
      }

     
     

      // Step 10: Create accept button with proper styles and black text
      const acceptButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!acceptButton) {
        throw new Error("Failed to create accept button");
      }
      
      await acceptButton.setStyles([buttonStyle]);
      if ((acceptButton as any).setDomId) {
        await (acceptButton as any).setDomId("accept-btn"); // Type assertion
      }
     
      await acceptButton.setTextContent('Accept');
    

      // Step 11: Create decline button with proper styles and black text
      const declineButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!declineButton) {
        throw new Error("Failed to create decline button");
      }
      await declineButton.setStyles([declineButtonStyle]);
      await declineButton.setTextContent('Decline');
      
      if ((declineButton as any).setDomId) {
        await (declineButton as any).setDomId("decline-btn"); // Type assertion
      }
      
      
    

      // Step 12: Build hierarchy using append() exactly like GDPR function
      if (newDiv.append  && innerdiv && tempHeading && tempParagraph && buttonContainer) {
        // Append elements inside banner div
        await newDiv.append(innerdiv);
        await innerdiv.append(tempHeading);
        await innerdiv.append(tempParagraph);
        await innerdiv.append(buttonContainer);

        if (buttonContainer.append && prefrenceButton && declineButton && acceptButton) {
          await buttonContainer.append(prefrenceButton);
          await buttonContainer.append(declineButton);
          await buttonContainer.append(acceptButton);
        }
      }
      
      console.log('Simple GDPR banner created successfully');
    }
      
    } catch (error) {
      console.error('Error creating simple GDPR banner:', error);
      throw error;
    }
  };

  const createSimpleCCPABanner = async (selectedElement: any, config: BannerConfig, animationAttribute: string) => {
    try {
      console.log('Creating simple CCPA banner...');



      
      // Step 1: Create main CCPA banner div using selectedElement.before() exactly like CCPA function
      const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create CCPA banner div");
      }
      
      // Step 2: Set DOM ID to match existing structure (initial-consent-banner for simple CCPA banner)
      if ((newDiv as any).setDomId) {
        await (newDiv as any).setDomId("initial-consent-banner");
      }
      
      const styleNames = {
        divStyleName: "consentbit-ccpa-banner-div",
        paragraphStyleName: "consentbit-ccpa-banner-text",
        buttonContainerStyleName: "consentbit-ccpa-button-container",
        headingStyleName: "consentbit-ccpa-banner-heading",
        linktextstyle: "consentbit-ccpa-linkblock",
        innerDivStyleName: "consentbit-ccpa-innerdiv",
        secondBackgroundStyleName: "consentbit-banner-ccpasecond-bg",
        closebutton: `close-consentbit`,
      };
      const styles = await Promise.all(
        Object.values(styleNames).map(async (name) => {
          return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
        })
      );
      const [
        divStyle,
        paragraphStyle,
        buttonContainerStyle,
        headingStyle,
        Linktext,
        innerDivStyle,
        secondBackgroundStyle,
        closebutton
      ] = styles;

      const collection = await webflow.getDefaultVariableCollection();
      const webflowBlue = await collection?.createColorVariable("Webflow Blue", "rgba(255, 255, 255, 1)");
      const webflowBlueValue = (webflowBlue as any)?.value || "rgba(255, 255, 255, 1)";

      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select", // No attribute if "select"
      };

      const animationAttribute = "fade";
      
      const divPropertyMap: Record<string, string> = {
        "background-color": `${bannerStyles.bgColor}`,
        "position": "fixed",
        "z-index": "99999",
        "padding-top": "20px",
        "padding-right": "20px",
        "padding-bottom": "20px",
        "padding-left": "20px",
        "border-radius": `4px`,
        "display": "none",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
        "font-family": `${bannerStyles.Font}`,
        "right": "3%",
        "transform": "translate3d(0px, 0, 0)",
        "left": "auto",
         "bottom":"3%",
         "width" :"438px",
         "min-height": "220px",
      };
     
      
      await divStyle.setProperties(divPropertyMap);
      
      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }
      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small" } as BreakpointAndPseudo;

      const paragraphPropertyMap: Record<string, string> = {
        "color": `${bannerStyles.paraColor}`,
        "font-size": "16px",
        "font-weight": "400",
        "line-height": "1.5",
        "text-align": "left",
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "10px",
        "margin-left": "0",
        "display": "block",
        "width": "100%",
      };

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "left",
        "margin-top": "10px",
        "width": "100%",
      };

      const declineButtonPropertyMap: Record<string, string> = {
        "border-radius": "48px",
        "cursor": "pointer",
        "background-color": "rgba(241, 241, 241, 1)",
        "color": "rgba(72, 57, 153, 1)",
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
      };
      const headingPropertyMap: Record<string, string> = {
        "color": `${bannerStyles.headColor}`,
        "font-size": "20px",
        "font-weight": "500",
        "text-align": "left",
        "margin-top": "0",
        "margin-bottom": "10px",
        "width": "100%",
      };
      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };
      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": `${bannerStyles.bgColor}`,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `4px`,
        "border-top-right-radius": `4px`
      };
      const CloseButtonPropertyMap: Record<string, string> = {
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
      

      await divStyle.setProperties(divPropertyMap);
      await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
      await paragraphStyle.setProperties(paragraphPropertyMap);
      await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
      await Linktext.setProperties(declineButtonPropertyMap);
      await headingStyle.setProperties(headingPropertyMap);
      await innerDivStyle.setProperties(innerdivPropertyMap);
      await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
      await closebutton.setProperties(CloseButtonPropertyMap)

       if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }

       if (newDiv.setCustomAttribute) {
         await newDiv.setCustomAttribute("data-animation", "fade");
         await newDiv.setCustomAttribute("data-cookie-banner", "false");
       }

      const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      await innerdiv.setStyles([innerDivStyle]);
      const tempHeading = await selectedElement.before(webflow.elementPresets.Heading);
      if (!tempHeading) {
        throw new Error("Failed to create heading");
      }
      
        if (tempHeading.setHeadingLevel) {
          await tempHeading.setHeadingLevel(2);
        }
        if (tempHeading.setStyles) {
          await tempHeading.setStyles([headingStyle]);
        }
        if (tempHeading.setTextContent) {
           await tempHeading.setTextContent("We value your privacy");
         }
      const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!tempParagraph) {
          throw new Error("Failed to create paragraph");
        }
         if (tempParagraph.setStyles) {
           await tempParagraph.setStyles([paragraphStyle]);
             }
        
         if (tempParagraph.setTextContent) {
        await tempParagraph.setTextContent("We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.");
         }
        
        const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
        if (!buttonContainer) {
          throw new Error("Failed to create button container");
        }
        await buttonContainer.setStyles([buttonContainerStyle]);

        const prefrenceButton = await selectedElement.before(webflow.elementPresets.LinkBlock);
        if (!prefrenceButton) {
          throw new Error("Failed to create decline button");
        }
        await prefrenceButton.setStyles([Linktext])
        await prefrenceButton.setTextContent('Do Not Share My Personal Information');
  
     if ((prefrenceButton as any).setDomId) {
           await (prefrenceButton as any).setDomId("do-not-share-link"); 
         }
      if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {
          await newDiv.append(innerdiv);
          await innerdiv.append(tempHeading);
          await innerdiv.append(tempParagraph);
          await innerdiv.append(buttonContainer);

           if (buttonContainer.append && prefrenceButton) {

             await buttonContainer.append(prefrenceButton)
           }
         }
         
      
      
      console.log('Simple CCPA banner created successfully');
      
    } catch (error) {
      console.error('Error creating simple CCPA banner:', error);
      throw error;
    }
  };
  

  const createGDPRPreferencesWithExistingFunction = async (selectedElement: any, config: BannerConfig) => {
    try {
      console.log('Creating GDPR preferences modal using createCookiePreferences...');
      
      // Call createCookiePreferences with all required parameters - black text for content, config colors for buttons
        await createCookiePreferences(
        ["essential", "analytics", "marketing", "preferences"], // selectedPreferences array
        config.language,           // language
        config.color,             // color (background)
        config.btnColor,          // btnColor
        config.headColor,         // headColor
        config.paraColor,         // paraColor 
        config.secondcolor,       // secondcolor
        typeof config.buttonRadius === 'number' ? config.buttonRadius : parseInt(config.buttonRadius as string), // buttonRadius
        config.animation,         // animation
        config.toggleStates?.customToggle || false, // customToggle
        config.primaryButtonText, // primaryButtonText
        config.secondbuttontext,  // secondbuttontext
        false,                    // skipCommonDiv (false to create toggle button)
        config.toggleStates?.disableScroll || false, // disableScroll
        config.toggleStates?.closebutton || false    // closebutton
      );
      
      console.log('GDPR preferences modal created successfully');
    } catch (error) {
      console.error('Error creating GDPR preferences:', error);
      throw error;
    }
  };

  const createCCPAPreferencesWithExistingFunction = async (selectedElement: any, config: BannerConfig) => {
    try {
      console.log('Creating CCPA preferences modal using createCookieccpaPreferences...');
      
      // Call createCookieccpaPreferences with all required parameters - black text for content, config colors for buttons
      await createCookieccpaPreferences(
        config.language,           // language
        config.color,             // color (background)
        config.btnColor,          // btnColor
        config.headColor,         // headColor
        config.paraColor,         // paraColor      
        config.secondcolor,       // secondcolor
        typeof config.buttonRadius === 'number' ? config.buttonRadius : parseInt(config.buttonRadius as string), // buttonRadius
        config.animation,         // animation
        config.primaryButtonText, // primaryButtonText
        config.secondbuttontext,  // secondbuttontext
        config.toggleStates?.disableScroll || false, // disableScroll
        config.toggleStates?.closebutton || false,   // closebutton
        true,                     // skipCommonDiv (true to avoid duplicate toggle button)
        config.Font    // Font
      );
      
      console.log('CCPA preferences modal created successfully');
    } catch (error) {
      console.error('Error creating CCPA preferences:', error);
      throw error;
    }
  };

  const createCompleteBannerStructureWithExistingFunctions = async (config: BannerConfig) => {
    try {
      setIsCreating(true);
      console.log('Starting complete banner creation with config:', config);

      // Get selected element
      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        throw new Error('No element selected');
      }

      // Determine animation attribute
      const animationAttribute = config.animation && config.animation !== 'none' ? config.animation : '';

      // Remove existing banners using correct IDs from your structure
      console.log('Removing existing banners...');
      const existingBanners = await webflow.getAllElements();
      for (const element of existingBanners) {
        try {
          // Check if the element has the getCustomAttribute method
          if (element && typeof element.getCustomAttribute === 'function') {
            const id = element.getCustomAttribute('id');
            if (id && (id === 'consent-banner' || id === 'initial-consent-banner' || 
                       id === 'main-banner' || id === 'main-consent-banner' || 
                       id === 'toggle-consent-btn')) {
              console.log('Removing existing banner with ID:', id);
              if (typeof element.remove === 'function') {
                element.remove();
              }
            }
          }
        } catch (cleanupError) {
          console.warn('Error checking element for cleanup:', cleanupError);
          // Continue with next element instead of failing completely
        }
      }

      // Create simple banners first
      console.log('🎯 Creating simple GDPR banner...');
      await createSimpleGDPRBanner(selectedElement, config, animationAttribute);
      console.log('✅ GDPR banner created successfully');
      console.log('🎯 Creating GDPR preference modal...');
      await createGDPRPreferencesWithExistingFunction(selectedElement, config);
      console.log('✅ GDPR preferences created successfully');


      console.log('🎯 Creating simple CCPA banner...');
      await createSimpleCCPABanner(selectedElement, config, animationAttribute);
      console.log('✅ CCPA banner created successfully');

      // Create preference modals
    
      
      console.log('🎯 Creating CCPA preference modal...');
      await createCCPAPreferencesWithExistingFunction(selectedElement, config);
      console.log('✅ CCPA preferences created successfully');

      console.log('Complete banner structure created successfully');
      setIsCreating(false);
      
    } catch (error) {
      console.error('Error in createCompleteBannerStructureWithExistingFunctions:', error);
      setIsCreating(false);
      throw error;
    }
  };

  return {
    createCompleteBannerStructureWithExistingFunctions,
    isCreating,
    showLoading,
    showSuccess,
    showSuccessPublish,
    handleSuccessPublishProceed,
    handleSuccessPublishGoBack
  };
};

export default useBannerCreation;