import exp from 'constants';
import webflow, { WebflowAPI } from '../types/webflowtypes';
import { getTranslation } from '../util/translation-utils';

type BreakpointAndPseudo = {
  breakpoint: string;
  pseudoClass: string;
};

const logo = new URL("../assets/icon.svg", import.meta.url).href;
const brandLogo = new URL("../assets/BrandImage.svg", import.meta.url).href;
const xVectorIcon = new URL("../assets/X-Vector.svg", import.meta.url).href;


// Helper function to get or create an ass
const getOrCreateAsset = async (): Promise<any> => {
  try {
    // First, try to get existing assets to see if we already have this image
    const assets = await webflow.getAllAssets();
    const existingAsset = assets.find(asset => {
      // Add null checks for all properties
      const hasConsentIcon = asset.name && asset.name === 'consent-icon';
      
      return hasConsentIcon;
    });
    
    if (existingAsset) {
      return existingAsset;
    }

    // If asset doesn't exist, create it from local file
    
    // Fetch the local SVG file
    const response = await fetch(logo);
    if (!response.ok) {
      throw new Error(`Failed to fetch local file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create file from blob with simple name
    const file = new File([blob], 'consent-icon.svg', {
      type: 'image/svg+xml',
    });
    
    const newAsset = await (webflow as any).createAsset(file);
    return newAsset;
  } catch (error) {
    console.error('Error getting or creating asset:', error);
    throw error;
  }
};

// Helper to get or create the brand image asset (BrandImage.svg) with dynamic color
const getOrCreateBrandAsset = async (backgroundColor: string): Promise<any> => {
  try {
    // Import color utility to determine brand image color
    const { getBrandImageColor, getBrandImageSVG } = await import('../util/colorUtils');
    const brandColor = getBrandImageColor(backgroundColor);
    
    // Create a unique asset name based on color to support different colors
    const assetName = `consent-brand-${brandColor.replace('#', '')}`;
    
    const assets = await webflow.getAllAssets();
    const existingAsset = assets.find(asset => asset.name && asset.name === assetName);
    if (existingAsset) {
      return existingAsset;
    }

    // Get the SVG content with modified color
    const svgContent = await getBrandImageSVG(backgroundColor);
    
    // Create blob from modified SVG content
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${assetName}.svg`, { type: 'image/svg+xml' });
    const newAsset = await (webflow as any).createAsset(file);
    return newAsset;
  } catch (error) {
    throw error;
  }
};

// Helper to get or create the close icon asset (X-Vector.svg) with dynamic color
// Helper function to auto-dismiss Webflow notifications after 5 seconds
const autoDismissNotification = () => {
  setTimeout(() => {
    // Try multiple selectors to find the notification element
    const selectors = [
      '[data-wf-notification]',
      '.w-notification',
      '[class*="notification"]',
      '[class*="Notification"]',
      '.notification-container',
      '[role="alert"]'
    ];
    
    let notification: Element | null = null;
    for (const selector of selectors) {
      notification = document.querySelector(selector);
      if (notification) break;
    }
    
    if (notification) {
      // Try to find and click the close button
      const closeSelectors = [
        'button[aria-label*="close" i]',
        'button[aria-label*="dismiss" i]',
        '[class*="close"]',
        '[class*="dismiss"]',
        '[class*="Close"]',
        'button:last-child',
        'svg[class*="close"]',
        'svg[class*="Close"]'
      ];
      
      let closeButton: Element | null = null;
      for (const selector of closeSelectors) {
        closeButton = notification.querySelector(selector);
        if (closeButton && closeButton instanceof HTMLElement) {
          closeButton.click();
          return;
        }
      }
      
      // If no close button found, try to hide/remove the notification
      if (notification instanceof HTMLElement) {
        notification.style.display = 'none';
        notification.style.opacity = '0';
        notification.style.visibility = 'hidden';
      }
    }
  }, 5000);
};

const getOrCreateCloseIconAsset = async (backgroundColor: string): Promise<any> => {
  try {
    // Import color utility to determine icon color
    const { getCloseIconColor } = await import('../util/colorUtils');
    const iconColor = getCloseIconColor(backgroundColor);
    
    // Create a unique asset name based on color to support different colors
    const assetName = `close-icon-${iconColor.replace('#', '')}`;
    
    const assets = await webflow.getAllAssets();
    const existingAsset = assets.find(asset => asset.name && asset.name === assetName);
    if (existingAsset) {
      return existingAsset;
    }

    // Fetch the X-Vector.svg file
    const response = await fetch(xVectorIcon);
    if (!response.ok) {
      throw new Error(`Failed to fetch X-Vector.svg: ${response.status} ${response.statusText}`);
    }

    // Get SVG content and modify the fill color
    let svgContent = await response.text();
    
    // Replace the fill color in the SVG
    svgContent = svgContent.replace(/fill="black"/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill='black'/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill=black/g, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill\s*=\s*["']black["']/gi, `fill="${iconColor}"`);
    svgContent = svgContent.replace(/fill\s*=\s*["'][^"']*["']/gi, `fill="${iconColor}"`);
    
    // Resize the SVG to 16x16
    svgContent = svgContent.replace(/width="385"/g, 'width="16"');
    svgContent = svgContent.replace(/height="385"/g, 'height="16"');
    
    // Ensure fill color is set
    if (!svgContent.includes(`fill="${iconColor}"`)) {
      svgContent = svgContent.replace(/<path([^>]*?)>/gi, (match, attrs) => {
        if (!attrs.includes('fill=')) {
          return `<path${attrs} fill="${iconColor}">`;
        }
        return match;
      });
    }

    // Create blob from modified SVG content
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${assetName}.svg`, {
      type: 'image/svg+xml',
    });
    
    const newAsset = await (webflow as any).createAsset(file);
    return newAsset;
  } catch (error) {
    console.error('Error getting or creating close icon asset:', error);
    throw error;
  }
};

const createCookiePreferences = async (selectedPreferences: string[], language: string = "English", color: string = "#ffffff", btnColor: string = "#F1F1F1", headColor: string = "#483999", paraColor: string = "#1F1D40", secondcolor: string = "secondcolor", buttonRadius: number, animation: string, customToggle: boolean, primaryButtonText: string = "#ffffff", secondbuttontext: string = "#4C4A66", skipCommonDiv: boolean = false, disableScroll: boolean, closebutton: boolean = false, borderRadius: number, font: string, privacyUrl: string = "", targetDiv?: any) => {
  
  try {
    const translation = getTranslation(language);

    // Use provided targetDiv if available, otherwise get selected element
    const selectedElement = targetDiv || await webflow.getSelectedElement();
    if (!selectedElement) {
      webflow.notify({ type: "error", message: "No element selected in the Designer." });
      autoDismissNotification();
      return;
    }

        // Check if the selected element can have children
        if (!selectedElement?.children) {
            webflow.notify({ type: "error", message: "Selected element cannot have children." });
            autoDismissNotification();
            return;
        }

        // Add ConsentBit class name to the selected element
        try {
            const consentBitStyle = await webflow.getStyleByName("ConsentBit") || await webflow.createStyle("ConsentBit");
            if (selectedElement.setStyles) {
                await selectedElement.setStyles([consentBitStyle]);
            }
        } catch (error) {
            // Continue if style application fails
        }

    const timestamp = Date.now();

    const styleNames = {
      preferenceDiv: `consentbit-preference_div`,
      paragraphStyleNames: `consentbit-prefrence_text`,
      formfield: `consentbit-formblock`,
      preferenceblock: `consentbit-prefrence_block`,
      toggledivs: `consentbit-prefrence_toggle`,
      buttonContainerStyleName: `consentbit-prefrence-container`,
      prefrenceButton: `consentbit-button-preference`,
      checkboxlabeltextstyle: `consentbit-checkbox-label`,
      buttonStyleName: `consebit-prefrence-accept`,
      DeclinebuttonStyleName: `consentbit-prefrence-decline`,
      headingStyleName: `consebit-prefrence-heading`,
      checkboxContainerStyleName: `consentbit-toggle`,
      changepreference: `consentbit-change-preference`,
      closebutton: `consentbit-close`,
      maindiv: 'consentbit-preference'

    };

    const styles = await Promise.all(
      Object.values(styleNames).map(async (name) => {
        return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
      })
    );

    const [divStyle, paragraphStyle, formBlockStyle, prefrenceDiv, togglediv, buttonContainerStyle, checkboxlabeltext, prefrenceButtons, buttonStyle, declinebutton, headingStyle, checkboxContainerStyle, changepre, closebuttonStyle, maindivs] = styles;


    const collection = await webflow.getDefaultVariableCollection();

    const animationAttributeMap = {
      "fade": "fade",
      "slide-up": "slide-up",
      "slide-down": "slide-down",
      "slide-left": "slide-left",
      "slide-right": "slide-right",
      "select": "select", // No attribute if "select"
    };

    const animationAttribute = animationAttributeMap[animation] || "";

    const divPropertyMap: Record<string, string> = {
      "background-color": color,
      "max-height": "510px",
      "max-width": "435px",
      "position": "relative",
      "z-index": "99999",
      "top": "50%",
      "left": "50%",
      "transform": "translate(-50%, -50%)",
      "border-radius": `${borderRadius}px`,
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "flex-start",
      "overflow-y": "scroll",
      "padding-top": "20px",
      "padding-right": "20px",
      "padding-bottom": "20px",
      "padding-left": "20px",
      "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
      "font-family":font
    };
    const responsivePropertyMap: Record<string, string> = {
      "max-width": "23.5rem",
      "width": "100%"

    };
    const responsiveOptions = { breakpoint: "medium" } as BreakpointAndPseudo;

    const paragraphPropertyMap: Record<string, string> = {
      "color": paraColor,
      "font-size": "14px",
      "font-weight": "400",
      "line-height": "1.5",
      "text-align": "left",
      "margin-top": "0",
      "margin-right": "0",
      "margin-bottom": "10px",
      "margin-left": "0",
      "max-width": "400px",
      "display": "block",
      "width": "100%",
    };

    const checkboxContainerPropertyMap: Record<string, string> = {
      "position": "relative",
      "display": "inline-block",
      "width": "50px",
      "background-color": color,
    };

    const mainDivBlockPropertyMap: Record<string, string> = {
      "position": "fixed",
      "top": "0%",
      "right": "0%",
      "bottom": "0%",
      "left": "0%",
      "z-index": "99999",
      "display": "none",
    };

    const prefrencePropertyMap: Record<string, string> = {
      "display": "flex",
      "flex-direction": "column",
      "margin-top": "10px",
    };

    const setTooglePropertyMap: Record<string, string> = {
      "color": "rgba(16, 214, 138, 0)",
      "display": "flex",
      "margin-top": "10px",
      "width": "100%",
      "justify-content": "space-between",
    };

    const buttonContainerPropertyMap: Record<string, string> = {
      "display": "flex",
      "justify-content": "right",
      "margin-top": "10px",
      "width": "100%",
    };

    const buttonPropertyMap: Record<string, string> = {
      "border-radius": `${buttonRadius}px`,
      "cursor": "pointer",
      "background-color": btnColor,
      "margin-left": "5px",
      "margin-right": "5px",
      "min-width": "80px",
      "color": primaryButtonText,
      "text-align": "center",
      "display": "flex",
      "justify-content": "center",
    };

    const declineButtonPropertyMap: Record<string, string> = {
      "border-radius": `${buttonRadius}px`,
      "cursor": "pointer",
      "background-color": secondcolor,
      "color": secondbuttontext,
      "margin-left": "5px",
      "margin-right": "5px",
      "min-width": "80px",
      "text-align": "center",
      "display": "flex",
      "justify-content": "center",
    };


    const headingPropertyMap: Record<string, string> = {
      "color": headColor,
      "font-size": "20px",
      "font-weight": "500",
      "text-align": "left",
      "margin-top": "0",
      "margin-bottom": "10px",
      "width": "100%",
    };

    const CloseButtonPropertyMap: Record<string, string> = {
      "color": "#000",
      "justify-content": "center",
      "align-items": "center",
      "width": "25px",
      "height": "25px",
      "display": "flex",
      "position": "relative",
      "top": "0",
      "right": "0",
      "z-index": "99",
      "font-family": "'Montserrat', sans-serif",
      "cursor": "pointer",
      "flex-shrink": "0",
    };

    const checkboxlabelPropertyMap: Record<string, string> = {
      "color": "rgba(72, 57, 153, 1)",
      "font-size": "18px",
      "font-weight": "500",
    };

    const changepreferencePropertyMap: Record<string, string> = {
      "height": "55px",
      "width": "55px",
      "border-radius": "50%",
      "background-size": "cover",
      "position": "fixed",
      "z-index": "999",
      "bottom": "3%",
      "left": "2%",
      "cursor": "pointer",
      "background-position-x": "50%",
      "background-position-y": "50%",
      "display": "none"
    };


    const formPropertyMap: Record<string, string> = {
      "background-color": "rgb(255, 255, 255)", // White background
      "border-radius": "8px", // Rounded corners
      "width": "100%", // Full width
      "max-width": "400px", // Maximum width
      "display": "flex",
      "flex-direction": "column",
    };


    await divStyle.setProperties(divPropertyMap);
    await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
    await paragraphStyle.setProperties(paragraphPropertyMap);
    await prefrenceDiv.setProperties(prefrencePropertyMap)
    await togglediv.setProperties(setTooglePropertyMap)
    await formBlockStyle.setProperties(formPropertyMap)
    await checkboxlabeltext.setProperties(checkboxlabelPropertyMap)
    await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
    await checkboxContainerStyle.setProperties(checkboxContainerPropertyMap)
    await buttonStyle.setProperties(buttonPropertyMap);
    await declinebutton.setProperties(declineButtonPropertyMap)
    await prefrenceButtons.setProperties(declineButtonPropertyMap)
    await changepre.setProperties(changepreferencePropertyMap)
    await closebuttonStyle.setProperties(CloseButtonPropertyMap)
    await headingStyle.setProperties(headingPropertyMap);
    await maindivs.setProperties(mainDivBlockPropertyMap)

    // Create the main banner container with class consentbit-preference as child of targetDiv
    const mainBanner = await selectedElement.append(webflow.elementPresets.DivBlock);
    if (!mainBanner) {
      throw new Error("Failed to create main banner");
    }
    // Apply only overlay styles to mainBanner
    await mainBanner.setStyles([maindivs]);

    // Set DOM ID to main-banner
    if ((mainBanner as any).setDomId) {
      await (mainBanner as any).setDomId("main-banner");
    }

    // The mainBanner (consentbit-preference) has both overlay and content styles
    // All children will be added directly to mainBanner without an extra wrapper

    try {

      if (mainBanner.setCustomAttribute) {
        await mainBanner.setCustomAttribute("data-animation", animationAttribute);
        await mainBanner.setCustomAttribute("data-cookie-banner", disableScroll ? "true" : "false");
      }

      // Create the preference div with class consentbit-preference_div as child of mainBanner first
      const preferenceDiv = await mainBanner.append(webflow.elementPresets.DivBlock);
      if (!preferenceDiv) {
        throw new Error("Failed to create preference div");
      }
      // Apply content box styles (divStyle) to preferenceDiv for centering and sizing
      // divStyle corresponds to consentbit-preference_div class
      await preferenceDiv.setStyles([divStyle]);

      // Set DOM ID to consentbit-preference_div
      if ((preferenceDiv as any).setDomId) {
        await (preferenceDiv as any).setDomId("consentbit-preference_div");
      }

      // Create a wrapper div for heading and close button
      const headingCloseWrapper = await preferenceDiv.append(webflow.elementPresets.DivBlock);
      if (!headingCloseWrapper) {
        throw new Error("Failed to create heading-close wrapper");
      }
      
      // Style the wrapper to position heading on left and close button on right
      const headingCloseWrapperStyle = (await webflow.getStyleByName("consentHeadingCloseWrapper")) || (await webflow.createStyle("consentHeadingCloseWrapper"));
      await headingCloseWrapperStyle.setProperties({
        "display": "flex",
        "justify-content": "space-between",
        "align-items": "flex-start",
        "width": "100%",
        "position": "relative",
        "margin-bottom": "10px"
      });
      await headingCloseWrapper.setStyles([headingCloseWrapperStyle]);

      // Create heading as child of headingCloseWrapper
      const tempHeading = await headingCloseWrapper.append(webflow.elementPresets.Heading);
      if (!tempHeading) {
        throw new Error("Failed to create heading");
      }
      if (tempHeading.setHeadingLevel) {
        await tempHeading.setHeadingLevel(4);
      }
      if (tempHeading.setStyles) {
        await tempHeading.setStyles([headingStyle]);
      }
      if (tempHeading.setTextContent) {
        await tempHeading.setTextContent(translation.heading);
      } else {
      }

      // Create paragraph as child of preferenceDiv
      const tempParagraph = await preferenceDiv.append(webflow.elementPresets.Paragraph);
      if (!tempParagraph) {
        throw new Error("Failed to create paragraph");
      }

      if (tempParagraph.setStyles) {
        await tempParagraph.setStyles([paragraphStyle]);
      }

      if (tempParagraph.setTextContent) {
        await tempParagraph.setTextContent(translation.description);
      } else {
      }

      // Create privacy link as child of tempParagraph (if privacyUrl is available)
      let privacyLink = null;
      
      if (privacyUrl && privacyUrl.trim() !== "") {
        privacyLink = await tempParagraph.append(webflow.elementPresets.LinkBlock);
        if (!privacyLink) throw new Error("Failed to create privacy link");

        // Create and apply privacy link style with paraColor
        const privacyLinkStyle = (await webflow.getStyleByName("consentbit-privacy-link-preference")) || (await webflow.createStyle("consentbit-privacy-link-preference"));
        // Paragraph uses font-weight 400, so make link slightly bolder (500)
        await privacyLinkStyle.setProperties({
          "color": paraColor,
          "text-decoration": "none",
          "font-size": "14px", // Match paragraph font size
          "font-weight": "500", // Slightly bolder than paragraph (400)
          "font-family": font,
          "cursor": "pointer",
        });
        // Add hover styles for underline effect
        await privacyLinkStyle.setProperties({ "text-decoration": "underline" }, { breakpoint: "main", pseudoClass: "hover" });
        
        if (privacyLink.setStyles) {
          await privacyLink.setStyles([privacyLinkStyle]);
        }

        // Set URL using setSettings method
        try {
          await privacyLink.setSettings('url', privacyUrl, {openInNewTab: true});
        } catch (error) {
        }
      
        if (privacyLink.setTextContent) {
          await privacyLink.setTextContent(` ${translation.moreInfo}`);
        }
      
        if (privacyLink.setDomId) {
          await privacyLink.setDomId("privacy-link-preference");
        }
      
      }

      //divblock///////////////////////////////////////////////////////////////////

      //////////////////////
      // Create prefrenceContainerinner as child of preferenceDiv
      const prefrenceContainerinner = await preferenceDiv.append(webflow.elementPresets.DivBlock);
      if (!prefrenceContainerinner) {
        throw new Error("Failed to create button container");
      }
      await prefrenceContainerinner.setStyles([prefrenceDiv]);

      // Create formBlock as child of prefrenceContainerinner
      const formBlock = await prefrenceContainerinner.append(webflow.elementPresets.FormForm);
      if (!formBlock) {
        throw new Error("Failed to create form block");
      }

      // Get all children of the form block
      const allChildren = await formBlock.getChildren();

      // Find the actual form inside the form wrapper
      const form = allChildren.find(child => child.plugin === "Form");
      if (!form) {
        throw new Error("Failed to find form inside form block");
      }

      // Get all elements inside the form and remove them
      const formElements = await form.getChildren();
      await Promise.all(formElements.map(child => child.remove()));

      // Define labels, corresponding checkbox IDs, and descriptions
      const allSections = [
        {
          label: "Essential",
          id: "necessary-checkbox",
          checked: true,
          description: translation.sections.essential.description
        },
        {
          label: "Analytics",
          id: "analytics-checkbox",
          checked: false,
          description: translation.sections.analytics.description
        },
        {
          label: "Marketing",
          id: "marketing-checkbox",
          checked: false,
          description: translation.sections.marketing.description
        },
        {
          label: "Preferences",
          id: "personalization-checkbox",
          checked: false,
          description: translation.sections.preferences.description
        }
      ];

      // const sections = allSections.filter(section => selectedPreferences.includes(section.label.toLowerCase()));

      
      const sections = allSections.filter(section =>
        selectedPreferences.map(pref => pref.toLowerCase()).includes(section.label.toLowerCase())
      );
      



      // Loop to create multiple sections
      for (const section of sections) {
        
        // 🏗️ Create a wrapper DivBlock inside the form
        const wrapperDiv = await form.append(webflow.elementPresets.DivBlock);
        if (!wrapperDiv) {
          throw new Error(`Failed to create wrapper div for ${section.label}`);
        }



        const prefrenceContainertoggle = await wrapperDiv.append(webflow.elementPresets.DivBlock);
        if (!prefrenceContainertoggle) {
          throw new Error(`Failed to create div block for ${section.label}`);
        }
        await prefrenceContainertoggle.setStyles([togglediv]);


        // 📝 Create Paragraph inside the preference container (Checkbox Label)

        const toggleParagraph = await prefrenceContainertoggle.append(webflow.elementPresets.Paragraph);
        if (!toggleParagraph) {
          throw new Error(`Failed to create paragraph for ${section.label}`);
        }
        await toggleParagraph.setStyles([checkboxlabeltext]);

        if (toggleParagraph.setTextContent) {
          await toggleParagraph.setTextContent(section.label);
        }



        // Create the actual checkbox field

        const checkboxField = await prefrenceContainertoggle.append(webflow.elementPresets.FormCheckboxInput);

        if (!checkboxField) {
          throw new Error(`Failed to create checkbox field for ${section.label}`);
        }


        await checkboxField.setStyles([checkboxContainerStyle]);

        const children = await checkboxField.getChildren();

        
        for (const child of children) {
          if (child.type.includes("Label") && child.setTextContent) {

            await child.setTextContent("");
          }
        }

        for (const child of children) {
          if (child.type.includes("FormCheckboxInput") && child.setCustomAttribute) {

            await child.setCustomAttribute("data-consent-id", section.id);
          }
        }


        // ✅ Set the ID for the checkbox

        if (checkboxField.setDomId) {
          await checkboxField.setDomId(section.id);
        }


        if (checkboxField.setCustomAttribute) {
          await checkboxField.setCustomAttribute("customtoggle", customToggle ? "true" : "false");
        }


        // Create description paragraph

        const wrapperParagraph = await wrapperDiv.append(webflow.elementPresets.Paragraph);
        if (!wrapperParagraph) {
          throw new Error(`Failed to create wrapper paragraph for ${section.label}`);
        }

        // Apply text and styles to wrapper paragraph
        if (wrapperParagraph.setStyles) {
          await wrapperParagraph.setStyles([paragraphStyle]);
        }

        if (wrapperParagraph.setTextContent) {
          await wrapperParagraph.setTextContent(section.description);
        }


      }


      if (!skipCommonDiv) {
        // Create the change-preference div as child of targetDiv
        const mainDivBlock = await selectedElement.append(webflow.elementPresets.DivBlock);
        await mainDivBlock.setStyles([changepre]);

        if (!mainDivBlock) {
          throw new Error("Failed to create main div block");
        }

        if ((mainDivBlock as any).setDomId) {
          await mainDivBlock.setCustomAttribute("scroll-control", "true");
          await (mainDivBlock as any).setDomId("toggle-consent-btn");
        } else {
          console.error("ccpa banner id setteled");
        }

        // Add image to the skip div
        let imageElement: any = null;
        
        try {
          // Create the image element
          await mainDivBlock.append(webflow.elementPresets.Image);
          
          // Get the children to find the image element we just added
          const children = await mainDivBlock.getChildren();
          imageElement = children.find(child => child.type === 'Image');
          
          if (!imageElement) {
            throw new Error("Failed to create image elementssss");
          }

          // Create the asset in Webflow
          const asset = await getOrCreateAsset();
          
          // Set the asset to the image element
          await (imageElement as any).setAsset(asset);
          
        } catch (error) {
          // Continue without asset if creation fails
        }

        // Style the image
        if (imageElement) {
          const imageStyle =
            (await webflow.getStyleByName("consentToggleIcon")) ||
            (await webflow.createStyle("consentToggleIcon"));
          
          await imageStyle.setProperties({
            "width": "55px",
            "height": "55px",
            "border-radius": "50%",
            "background-size": "cover",
            "background-position": "center"
          });
          
          await (imageElement as any).setStyles?.([imageStyle]);

          // Set custom attributes for the image
          if ((imageElement as any).setCustomAttribute) {
            await (imageElement as any).setCustomAttribute("data-consent-toggle", "true");
            // Optimize for LCP: remove lazy loading and set high fetch priority
            await (imageElement as any).setCustomAttribute("loading", "eager");
            await (imageElement as any).setCustomAttribute("fetchpriority", "high");
          }
        }
      }

      ////////////////////////////////////////////////////////////////////////////////////////

      // Conditionally add close button only if closebutton parameter is true
      // Add it to the headingCloseWrapper (same wrapper as heading)
      let Closebuttons = null;
      if (closebutton) {
        Closebuttons = await headingCloseWrapper.append(webflow.elementPresets.DivBlock);
        if (!Closebuttons) {
          throw new Error("Failed to create close button div");
        }

        if (Closebuttons.setStyles) {
          await Closebuttons.setStyles([closebuttonStyle]);
          await Closebuttons.setCustomAttribute("consentbit","close");
          
          // Create Image element and set X-Vector.svg as asset (same approach as toggle icon)
          let imageElement: any = null;
          
          try {
            // Create the image element
            imageElement = await Closebuttons.append(webflow.elementPresets.Image);
            
            if (!imageElement) {
              throw new Error("Failed to create image element");
            }

            // Create the asset in Webflow with color based on background
            const asset = await getOrCreateCloseIconAsset(color);
            
            // Set the asset to the image element
            await (imageElement as any).setAsset(asset);
            
            // Style the image to match close button size
            const imageStyle =
              (await webflow.getStyleByName("consentCloseIcon")) ||
              (await webflow.createStyle("consentCloseIcon"));
            
            await imageStyle.setProperties({
              "width": "16px",
              "height": "16px",
              "display": "block"
            });
            
            await (imageElement as any).setStyles?.([imageStyle]);
            
            // Set DOM ID for close button icon
            try {
              if ((imageElement as any).setDomId) {
                await (imageElement as any).setDomId("close-consent-banner");
              } else {
                // Fallback: Set ID on parent container if image doesn't support it
                if ((Closebuttons as any).setDomId) {
                  await (Closebuttons as any).setDomId("close-consent-banner");
                }
              }
            } catch (idError) {
              // Try setting on parent container as fallback
              try {
                if ((Closebuttons as any).setDomId) {
                  await (Closebuttons as any).setDomId("close-consent-banner");
                }
              } catch (fallbackError) {
                // Ignore fallback errors
              }
            }
          } catch (error) {
            console.error('Error creating close icon image element:', error);
          }
        }
      }

      // Create buttonContainer as child of preferenceDiv
      const buttonContainer = await preferenceDiv.append(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      await buttonContainer.setStyles([buttonContainerStyle]);

      // Create acceptButton (Save Preference) as child of buttonContainer (first button)
      const acceptButton = await buttonContainer.append(webflow.elementPresets.Button);
      if (!acceptButton) {
        throw new Error("Failed to create accept button");
      }
      await acceptButton.setStyles([buttonStyle]);
      await acceptButton.setTextContent(translation.acceptAll);

      if ((acceptButton as any).setDomId) {
        await (acceptButton as any).setDomId("save-preferences-btn"); // Type assertion
      } else {
      }

      // Create declineButton (Reject) as child of buttonContainer (second button)
      const declineButton = await buttonContainer.append(webflow.elementPresets.Button);
      if (!declineButton) {
        throw new Error("Failed to create decline button");
      }
      await declineButton.setStyles([declinebutton]);
      await declineButton.setTextContent(translation.reject);

      if ((declineButton as any).setDomId) {
        await (declineButton as any).setDomId("cancel-btn"); // Type assertion
      } else {
      }

      // All elements are already created as children of their appropriate parents
      // preferenceDiv contains all the content elements
        // Append brand image inside a full-width wrapper at the bottom of the banner
        try {
          const brandWrapper = await preferenceDiv.append(webflow.elementPresets.DivBlock);
            const brandWrapperStyle = (await webflow.getStyleByName("consentBrandWrapper")) || (await webflow.createStyle("consentBrandWrapper"));
            await brandWrapperStyle.setProperties({
              "width": "40%",
              "height": "auto",
              "margin-top": "12px",
              "display": "block",
              "align-self": "flex-end",
              "margin-left": "auto"
            });
            await (brandWrapper as any).setStyles([brandWrapperStyle]);

            const brandLink = await (brandWrapper as any).append(webflow.elementPresets.LinkBlock);
            const brandLinkStyle = (await webflow.getStyleByName("consentBrandLink")) || (await webflow.createStyle("consentBrandLink"));
            await brandLinkStyle.setProperties({
              "width": "100%",
              "height": "auto",
              "display": "block"
            });
            await (brandLink as any).setStyles([brandLinkStyle]);
            try {
              await (brandLink as any).setSettings('url', 'https://www.consentbit.com/', { openInNewTab: true });
            } catch (e) {}

            const brandImage = await (brandLink as any).append(webflow.elementPresets.Image);
            const brandAsset = await getOrCreateBrandAsset(color);
            await (brandImage as any).setAsset(brandAsset);

            const brandStyle = (await webflow.getStyleByName("consentBrandImage")) || (await webflow.createStyle("consentBrandImage"));
            await brandStyle.setProperties({
              "width": "100%",
              "height": "auto",
              "display": "block",
              "object-fit": "contain"
            });
            await (brandImage as any).setStyles?.([brandStyle]);
        } catch (e) {
        }

      // Save bannerAdded to sessionStorage
      sessionStorage.setItem('bannerAdded', 'true');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bannerAddedChanged'));

      // webflow.notify({ type: "Success", message: "ConsentBit banner added successfully!" })

    } catch (error) {
      webflow.notify({ type: "error", message: `Error creating preferences: ${error.message}` });
    }
  } catch (error) {
    webflow.notify({ type: "error", message: `Error creating cookie preferences: ${error.message}` });
  } finally {

  }
};

export default createCookiePreferences
