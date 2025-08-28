import exp from 'constants';
import webflow, { WebflowAPI } from '../types/webflowtypes';
import { getTranslation } from '../util/translation-utils';

type BreakpointAndPseudo = {
  breakpoint: string;
  pseudoClass: string;
};

const createCookiePreferences = async (selectedPreferences: string[], language: string = "English", color: string = "#ffffff", btnColor: string = "#F1F1F1", headColor: string = "#483999", paraColor: string = "#1F1D40", secondcolor: string = "secondcolor", buttonRadius: number, animation: string, customToggle: boolean, primaryButtonText: string = "#ffffff", secondbuttontext: string = "#4C4A66", skipCommonDiv: boolean = false, disableScroll: boolean, closebutton: boolean = false, borderRadius: number, font: string) => {
  
  try {
    const translation = getTranslation(language);

    const selectedElement = await webflow.getSelectedElement();
    if (!selectedElement) {
      webflow.notify({ type: "error", message: "No element selected in the Designer." });
      return;
    }

    const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
    if (!newDiv) {

      webflow.notify({ type: "error", message: "Failed to create div." });
      return;
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
      "width": "100%",
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
      "background-color": secondcolor,
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
      "background-color": btnColor,
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
      "position": "absolute",
      "top": "5%",
      "left": "auto",
      "right": "10",
      "z-index": "99",
      "font-family": "'Montserrat', sans-serif",
      "cursor": "pointer",
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
      "background-image": "url('https://cdn.prod.website-files.com/63d5330e6841081487be0bd6/67ebf5ee639d12979361f2bc_consent.png')",
      "background-size": "cover",
      // "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
      "position": "fixed",
      "z-index": "999",
      "bottom": "3%",
      "left": "2%",
      "cursor": "pointer",
      "background-position-x": "50%",
      "background-position-y": "50%"
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

    if (newDiv.setStyles) {
      await newDiv.setStyles([divStyle]);
    }

    if (newDiv.setCustomAttribute) {
      await newDiv.setCustomAttribute("data-animation", animationAttribute);
      await newDiv.setCustomAttribute("data-cookie-banner", disableScroll ? "true" : "false");

    } else {
    }

    try {
      const tempHeading = await selectedElement.before(webflow.elementPresets.Heading);
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

      const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
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

      //divblock///////////////////////////////////////////////////////////////////

             // Create the main banner container with class consentbit-preference
       const mainBanner = await selectedElement.before(webflow.elementPresets.DivBlock);
       if (!mainBanner) {
         throw new Error("Failed to create main banner");
       }
       await mainBanner.setStyles([maindivs]);

       // Set DOM ID to main-banner
       if ((mainBanner as any).setDomId) {
         await (mainBanner as any).setDomId("main-banner");
       } else {
       }

       // Create the preference div with class consentbit-preference_div
       const preferenceDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
       if (!preferenceDiv) {
         throw new Error("Failed to create preference div");
       }
       await preferenceDiv.setStyles([prefrenceDiv]);

       // Set DOM ID to consentbit-preference_div
       if ((preferenceDiv as any).setDomId) {
         await (preferenceDiv as any).setDomId("consentbit-preference_div");
       } else {
       }

       // Append preference div to main banner
       if (mainBanner.append && preferenceDiv) {
         await mainBanner.append(preferenceDiv);
       }



      const formBlock = await selectedElement.before(webflow.elementPresets.FormForm);
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

      //////////////////////
      const prefrenceContainerinner = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!prefrenceContainerinner) {
        throw new Error("Failed to create button container");
      }
      await prefrenceContainerinner.setStyles([prefrenceDiv]);

      if (!skipCommonDiv) {
        const mainDivBlock = await selectedElement.before(webflow.elementPresets.DivBlock);
        await mainDivBlock.setStyles([changepre]);

        if (!mainDivBlock) {
          throw new Error("Failed to create main div block");
        }

        if ((mainDivBlock as any).setDomId) {
          await mainDivBlock.setCustomAttribute("scroll-control", "true");
          await (mainDivBlock as any).setDomId("toggle-consent-btn");
        } else {
        }
      }

      ////////////////////////////////////////////////////////////////////////////////////////

      // Conditionally add close button only if closebutton parameter is true
      let Closebuttons = null;
      if (closebutton) {
        Closebuttons = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!Closebuttons) {
          throw new Error("Failed to create paragraph");
        }

        if (Closebuttons.setStyles) {
          await Closebuttons.setStyles([closebuttonStyle]);
          await Closebuttons.setTextContent("X");
          await Closebuttons.setCustomAttribute("consentbit","close");
        }
      }

      const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      await buttonContainer.setStyles([buttonContainerStyle]);

      const acceptButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!acceptButton) {
        throw new Error("Failed to create accept button");
      }
      await acceptButton.setStyles([buttonStyle]);
      await acceptButton.setTextContent(translation.acceptAll);

      if ((acceptButton as any).setDomId) {
        await (acceptButton as any).setDomId("save-preferences-btn"); // Type assertion
      } else {
      }

      const declineButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!declineButton) {
        throw new Error("Failed to create decline button");
      }
      await declineButton.setStyles([declinebutton]);
      await declineButton.setTextContent(translation.reject);

      if ((declineButton as any).setDomId) {
        await (declineButton as any).setDomId("cancel-btn"); // Type assertion
      } else {
      }

             if (mainBanner.append && newDiv) {
         await mainBanner.append(newDiv);
       }

       if (newDiv.append && tempHeading && tempParagraph && buttonContainer && preferenceDiv) {
         await newDiv.append(tempHeading);
         await newDiv.append(tempParagraph);
         await newDiv.append(preferenceDiv)
         await newDiv.append(buttonContainer);
         if (Closebuttons) await newDiv.append(Closebuttons)

         if (preferenceDiv.append && prefrenceContainerinner) {
           // await preferenceDiv.append(prefrenceContainertoggle)
           await preferenceDiv.append(prefrenceContainerinner)
         }

        if (prefrenceContainerinner.append && formBlock) {
          await prefrenceContainerinner.append(formBlock)
          // await prefrenceContainerinner.append(prefeParagraph)
        }

        if (buttonContainer.append && acceptButton && declineButton) {
          await buttonContainer.append(acceptButton);
          await buttonContainer.append(declineButton);
          // await buttonContainer.append(prefrenceButton)
        } else {
        }
      } else {
      }

      // Set bannerAdded to true in localStorage
      localStorage.setItem('bannerAdded', 'true');

      // webflow.notify({ type: "Success", message: "ConsentBit banner added successfully!" }


    } catch (error) {

      webflow.notify({ type: "error", message: `Error creating preferences: ${error.message}` });
    }
  } catch (error) {

    webflow.notify({ type: "error", message: `Error creating cookie preferences: ${error.message}` });
  } finally {

  }
};

export default createCookiePreferences