import { useState } from 'react';
import webflow from '../types/webflowtypes';
import { customCodeApi } from '../services/api';
import { getSessionTokenFromLocalStorage } from '../util/Session';
import createCookiePreferences from './gdprPreference';
import createCookieccpaPreferences from './ccpaPreference';
import { CodeApplication } from '../types/types';
import pkg from '../../package.json';

const appVersion = pkg.version;

// Translations object from App_backup.tsx
const translations = {
  English: {
    heading: "Cookie Settings",
    description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.",
    accept: "Accept",
    reject: "Reject",
    preferences: "Preference",
    ccpa: {
      heading: "We value your Privacy",
      description: "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.",
      doNotShare: "Do Not Share My Personal Information"
    }
  },
  Spanish: {
    heading: "Configuración de Cookies",
    description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted.",
    accept: "Aceptar",
    reject: "Rechazar",
    preferences: "Preferencias",
    ccpa: {
      heading: "Valoramos tu Privacidad",
      description: "Utilizamos cookies para brindarle la mejor experiencia posible. También nos permiten analizar el comportamiento del usuario para mejorar constantemente el sitio web para usted.",
      doNotShare: "No Compartir Mi Información Personal"
    }
  },
  French: {
    heading: "Paramètres des Cookies",
    description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous.",
    accept: "Accepter",
    reject: "Refuser",
    preferences: "Préférences",
    ccpa: {
      heading: "Nous Respectons Votre Vie Privée",
      description: "Nous utilisons des cookies pour vous offrir la meilleure expérience possible. Ils nous permettent également d'analyser le comportement des utilisateurs afin d'améliorer constamment le site Web pour vous.",
      doNotShare: "Ne Pas Partager Mes Informations Personnelles"
    }
  },
  German: {
    heading: "Cookie-Einstellungen",
    description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern.",
    accept: "Akzeptieren",
    reject: "Ablehnen",
    preferences: "Einstellungen",
    ccpa: {
      heading: "Wir Respektieren Ihre Privatsphäre",
      description: "Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie helfen uns auch, das Nutzerverhalten zu analysieren, um die Website kontinuierlich für Sie zu verbessern.",
      doNotShare: "Meine persönlichen Informationen nicht weitergeben"
    }
  },
  Swedish: {
    heading: "Cookie-inställningar",
    description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig.",
    accept: "Acceptera",
    reject: "Avvisa",
    preferences: "Inställningar",
    ccpa: {
      heading: "Vi Värdesätter Din Integritet",
      description: "Vi använder cookies för att ge dig den bästa möjliga upplevelsen. De låter oss också analysera användarbeteende för att ständigt förbättra webbplatsen för dig.",
      doNotShare: "Dela Inte Min Personliga Information"
    }
  },
  Dutch: {
    heading: "Cookie-instellingen",
    description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren.",
    accept: "Accepteren",
    reject: "Weigeren",
    preferences: "Voorkeuren",
    ccpa: {
      heading: "We Waarderen Uw Privacy",
      description: "We gebruiken cookies om u de best mogelijke ervaring te bieden. Ze stellen ons ook in staat om gebruikersgedrag te analyseren om de website voortdurend voor u te verbeteren.",
      doNotShare: "Deel Mijn Persoonlijke Informatie Niet"
    }
  },
  Italian: {
    heading: "Impostazioni Cookie",
    description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te.",
    accept: "Accetta",
    reject: "Rifiuta",
    preferences: "Preferenze",
    ccpa: {
      heading: "Rispettiamo la Tua Privacy",
      description: "Utilizziamo i cookie per fornirti la migliore esperienza possibile. Ci permettono anche di analizzare il comportamento degli utenti per migliorare costantemente il sito web per te.",
      doNotShare: "Non Condividere Le Mie Informazioni Personali"
    }
  },
  Portuguese: {
    heading: "Configurações de Cookies",
    description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você.",
    accept: "Aceitar",
    reject: "Rejeitar",
    preferences: "Preferências",
    ccpa: {
      heading: "Valorizamos Sua Privacidade",
      description: "Usamos cookies para fornecer a melhor experiência possível. Eles também nos permitem analisar o comportamento do usuário para melhorar constantemente o site para você.",
      doNotShare: "Não Compartilhar Minhas Informações Pessoais"
    }
  }
};

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

export const useBannerCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBannerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleBannerError = (error: any) => {
    console.error("Banner creation error:", error);
    webflow.notify({ type: "error", message: "An error occurred while creating the banner." });
  };

  const fetchAnalyticsBlockingsScripts = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        throw new Error("No token available");
      }

      const siteIdinfo = await webflow.getSiteInfo();
      const hostingScript = await customCodeApi.registerAnalyticsBlockingScript(token);

      if (hostingScript) {
        const scriptId = hostingScript.result.id;
        const version = hostingScript.result.version;

        const params: CodeApplication = {
          targetType: 'site',
          targetId: siteIdinfo.siteId,
          scriptId: scriptId,
          location: 'header',
          version: version
        };
        
        await customCodeApi.applyScript(params, token);
      }
    } catch (error) {
      console.error("Error in fetchAnalyticsBlockingsScripts:", error);
    }
  };

  const fetchAnalyticsBlockingsScriptsV2 = async () => {
    try {
      const token = getSessionTokenFromLocalStorage();
      if (!token) {
        throw new Error("No token available");
      }

      const siteIdinfo = await webflow.getSiteInfo();
      const hostingScript = await customCodeApi.registerV2BannerCustomCode(token);

      if (hostingScript) {
        const scriptId = hostingScript.result.id;
        const version = hostingScript.result.version;

        const params: CodeApplication = {
          targetType: 'site',
          targetId: siteIdinfo.siteId,
          scriptId: scriptId,
          location: 'header',
          version: version
        };
        
        await customCodeApi.applyV2Script(params, token);
      }
    } catch (error) {
      console.error("Error in fetchAnalyticsBlockingsScriptsV2:", error);
    }
  };

     const createGDPRBanner = async (config: BannerConfig, skipCommonDiv: boolean = false) => {
     console.log("=== GDPR BANNER CREATION START ===");
     setIsCreating(true);
     setShowLoading(true);
     
           // Add overall timeout for the entire process
      const overallTimeout = setTimeout(() => {
        console.error("GDPR banner creation timed out after 20 seconds");
        setIsCreating(false);
        setShowLoading(false);
      }, 20000);
    
    console.log("Creating GDPR banner with config:", config);
    console.log("Language:", config.language);
    console.log("SkipCommonDiv:", skipCommonDiv);
    
    try {
      console.log("Starting GDPR banner creation process...");
      // Cleanup existing banners
      console.log("Getting all elements for cleanup...");
      const allElements = await webflow.getAllElements();
      console.log("All elements retrieved:", allElements.length);
      
      const idsToCheck = ["consent-banner", "main-banner", "toggle-consent-btn"];
      console.log("Checking for existing banners with IDs:", idsToCheck);

      const domIdPromises = allElements.map(async (el) => {
        const domId = await el.getDomId?.();
        return { el, domId };
      });

      console.log("Getting DOM IDs for all elements...");
      const elementsWithDomIds = await Promise.all(domIdPromises);
      console.log("DOM IDs retrieved for all elements");
      
      const matchingElements = elementsWithDomIds
        .filter(({ domId }) => domId && idsToCheck.includes(domId))
        .map(({ el }) => el);
      
      console.log("Found matching elements to remove:", matchingElements.length);

      if (matchingElements.length > 0) {
        console.log("Removing existing banner elements...");
        await Promise.all(matchingElements.map(async (el) => {
          try {
            const children = await el.getChildren?.();
            if (children?.length) {
              await Promise.all(children.map(child => child.remove()));
            }
            await el.remove();
          } catch (err) {
            console.error("Error removing element:", err);
          }
        }));
        console.log("Existing banner elements removed");
             } else {
         console.log("No existing banner elements found to remove");
       }

              console.log("Getting selected element for GDPR banner...");
       const selectedElement = await webflow.getSelectedElement();
       console.log("Selected element retrieved:", selectedElement);
       console.log("Selected element methods:", Object.keys(selectedElement || {}));
       if (!selectedElement) {
         throw new Error("No element selected in the Designer.");
       }

       console.log("Creating newDiv for GDPR banner...");
       console.log("webflow.elementPresets.DivBlock:", webflow.elementPresets.DivBlock);
       const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
       console.log("newDiv created:", newDiv);
       console.log("newDiv methods:", Object.keys(newDiv || {}));
      if (!newDiv) {
        throw new Error("Failed to create div.");
      }

             if ((newDiv as any).setDomId) {
         console.log("Setting DOM ID for newDiv...");
         await (newDiv as any).setDomId("consent-banner");
         console.log("DOM ID set successfully");
       }

       console.log("Creating style names object...");
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
        divStyle, paragraphStyle, buttonContainerStyle, prefrenceButtonStyle, 
        declineButtonStyle, buttonStyle, headingStyle, innerDivStyle, 
        secondBackgroundStyle, closebutton
      ] = styles;

      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select",
      };
      const animationAttribute = animationAttributeMap[config.animation] || "";

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

      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small", pseudoClass: "" } as const;

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

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "right",
        "margin-top": "10px",
        "width": "100%",
      };
      if (config.style === "centeralign") {
        buttonContainerPropertyMap["justify-content"] = "center";
      }

      const buttonPropertyMap: Record<string, string> = {
        "border-radius": `${config.buttonRadius}px`,
        "cursor": "pointer",
        "background-color": config.secondcolor,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "color": config.primaryButtonText,
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

      const declineButtonPropertyMap: Record<string, string> = {
        "border-radius": `${config.buttonRadius}px`,
        "cursor": "pointer",
        "background-color": config.btnColor,
        "color": config.secondbuttontext,
        "margin-left": "5px",
        "margin-right": "5px",
        "min-width": "80px",
        "text-align": "center",
        "display": "flex",
        "justify-content": "center",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": config.bgColors,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `${config.borderRadius}px`,
        "border-top-right-radius": `${config.borderRadius}px`
      };

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

      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
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

             console.log("Setting style properties...");
       console.log("Setting divStyle properties...");
       await divStyle.setProperties(divPropertyMap);
       console.log("Setting divStyle responsive properties...");
       await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
       console.log("Setting paragraphStyle properties...");
       await paragraphStyle.setProperties(paragraphPropertyMap);
       console.log("Setting buttonContainerStyle properties...");
       await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
       console.log("Setting buttonContainerStyle responsive properties...");
       await buttonContainerStyle.setProperties(responsivebuttonPropertyMap, responsiveOptions);
       console.log("Setting buttonStyle properties...");
       await buttonStyle.setProperties(buttonPropertyMap);
       console.log("Setting declineButtonStyle properties...");
       await declineButtonStyle.setProperties(declineButtonPropertyMap);
       console.log("Setting prefrenceButtonStyle properties...");
       await prefrenceButtonStyle.setProperties(declineButtonPropertyMap);
       console.log("Setting headingStyle properties...");
       await headingStyle.setProperties(headingPropertyMap);
       console.log("Setting secondBackgroundStyle properties...");
       await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
       console.log("Setting innerDivStyle properties...");
       await innerDivStyle.setProperties(innerdivPropertyMap);
       console.log("Setting closebutton properties...");
       await closebutton.setProperties(CloseButtonPropertyMap);
              console.log("All style properties set successfully");

              console.log("Applying styles to newDiv...");
       if (newDiv.setStyles) {
         await newDiv.setStyles([divStyle]);
         console.log("Styles applied to newDiv successfully");
       } else {
         console.log("newDiv.setStyles not available");
       }

               console.log("Setting custom attributes...");
        if (newDiv.setCustomAttribute) {
          console.log("Setting data-animation attribute:", animationAttribute? animationAttribute : "none");
          try {
            const animationPromise = newDiv.setCustomAttribute("data-animation", animationAttribute);
            const animationTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Animation attribute timeout")), 5000)
            );
            await Promise.race([animationPromise, animationTimeout]);
            console.log("data-animation attribute set successfully");
          } catch (error) {
            console.error("Error setting data-animation attribute:", error);
            throw error;
          }
          
          console.log("Setting data-cookie-banner attribute:", config.toggleStates.disableScroll ? "true" : "false");
          try {
            const cookieBannerPromise = newDiv.setCustomAttribute("data-cookie-banner", config.toggleStates.disableScroll ? "true" : "false");
            const cookieBannerTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Cookie banner attribute timeout")), 5000)
            );
            await Promise.race([cookieBannerPromise, cookieBannerTimeout]);
            console.log("data-cookie-banner attribute set successfully");
          } catch (error) {
            console.error("Error setting data-cookie-banner attribute:", error);
            throw error;
          }
          
          console.log("Custom attributes set successfully");
        } else {
          console.log("newDiv.setCustomAttribute not available");
        }

             console.log("=== ELEMENT CREATION PHASE START ===");
       console.log("Creating innerdiv for GDPR banner...");
       console.log("About to call selectedElement.before for innerdiv...");
       console.log("Testing if selectedElement.before is available...");
       console.log("selectedElement.before exists:", !!selectedElement.before);
       console.log("webflow.elementPresets.DivBlock exists:", !!webflow.elementPresets.DivBlock);
       console.log("selectedElement type:", typeof selectedElement);
       console.log("selectedElement keys:", Object.keys(selectedElement || {}));
       
              // Test if we can call the method without hanging
       console.log("About to test selectedElement.before call...");
       let innerdiv: any;
       try {
         console.log("Calling selectedElement.before with DivBlock...");
         // Add timeout to prevent hanging
         const innerdivPromise = selectedElement.before(webflow.elementPresets.DivBlock);
         console.log("innerdivPromise created, waiting for result...");
         const timeoutPromise = new Promise((_, reject) => 
           setTimeout(() => reject(new Error("Element creation timeout")), 10000)
         );
         
         innerdiv = await Promise.race([innerdivPromise, timeoutPromise]) as any;
         console.log("innerdiv created:", innerdiv);
         console.log("innerdiv methods:", Object.keys(innerdiv || {}));
         
         if (innerdiv && innerdiv.setStyles) {
           await innerdiv.setStyles([innerDivStyle]);
           console.log("innerdiv styles applied");
         } else {
           console.log("Failed to apply styles to innerdiv");
         }
       } catch (error) {
         console.error("Error creating innerdiv:", error);
         throw new Error(`Failed to create innerdiv: ${error}`);
       }

      let SecondDiv;
      if (config.style === "alignstyle") {
        SecondDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
        if (SecondDiv.setStyles) {
          await SecondDiv.setStyles([secondBackgroundStyle]);
        }
      }

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
        const language = config.language || "English";
        const headingText = translations[language as keyof typeof translations]?.heading || "Cookie Settings";
        console.log("Setting heading text:", headingText, "for language:", language);
        await tempHeading.setTextContent(headingText);
      }

      let Closebuttons = null;
      if (config.toggleStates.closebutton) {
        Closebuttons = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!Closebuttons) {
          throw new Error("Failed to create paragraph");
        }
        if (Closebuttons.setStyles) {
          await Closebuttons.setStyles([closebutton]);
          await Closebuttons.setTextContent("X");
          await Closebuttons.setCustomAttribute("consentbit", "close");
        }
      }

      const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
      if (!tempParagraph) {
        throw new Error("Failed to create paragraph");
      }
      if (tempParagraph.setStyles) {
        await tempParagraph.setStyles([paragraphStyle]);
      }
      if (tempParagraph.setTextContent) {
        const language = config.language || "English";
        const paragraphText = translations[language as keyof typeof translations]?.description || "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.";
        console.log("Setting paragraph text:", paragraphText, "for language:", language);
        await tempParagraph.setTextContent(paragraphText);
      }

      const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      await buttonContainer.setStyles([buttonContainerStyle]);

      const prefrenceButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!prefrenceButton) {
        throw new Error("Failed to create preference button");
      }
      await prefrenceButton.setStyles([prefrenceButtonStyle]);
      const language = config.language || "English";
      await prefrenceButton.setTextContent(translations[language as keyof typeof translations]?.preferences || "Preferences");
      if ((prefrenceButton as any).setDomId) {
        await (prefrenceButton as any).setDomId("preferences-btn");
      }

      const acceptButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!acceptButton) {
        throw new Error("Failed to create accept button");
      }
      await acceptButton.setStyles([buttonStyle]);
      await acceptButton.setTextContent(translations[language as keyof typeof translations]?.accept || "Accept");
      if ((acceptButton as any).setDomId) {
        await (acceptButton as any).setDomId("accept-btn");
      }

      const declineButton = await selectedElement.before(webflow.elementPresets.Button);
      if (!declineButton) {
        throw new Error("Failed to create decline button");
      }
      await declineButton.setStyles([declineButtonStyle]);
      await declineButton.setTextContent(translations[language as keyof typeof translations]?.reject || "Reject");
      if ((declineButton as any).setDomId) {
        await (declineButton as any).setDomId("decline-btn");
      }

      console.log("Starting to append elements to GDPR banner...");
      console.log("newDiv.append exists:", !!newDiv.append);
      console.log("innerdiv exists:", !!innerdiv);
      console.log("tempHeading exists:", !!tempHeading);
      console.log("tempParagraph exists:", !!tempParagraph);
      console.log("buttonContainer exists:", !!buttonContainer);
      
      if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {
        console.log("Appending innerdiv to newDiv...");
        await newDiv.append(innerdiv);
        console.log("innerdiv appended successfully");
        
        if (Closebuttons) {
          console.log("Appending Closebuttons...");
          await newDiv.append(Closebuttons);
        }
        
        if (SecondDiv) {
          console.log("Appending SecondDiv to innerdiv...");
          await innerdiv.append(SecondDiv);
        }
        
        console.log("Appending tempHeading to innerdiv...");
        await innerdiv.append(tempHeading);
        console.log("Appending tempParagraph to innerdiv...");
        await innerdiv.append(tempParagraph);
        console.log("Appending buttonContainer to innerdiv...");
        await innerdiv.append(buttonContainer);

        if (buttonContainer.append && prefrenceButton && declineButton && acceptButton) {
          console.log("Appending buttons to buttonContainer...");
          await buttonContainer.append(prefrenceButton);
          await buttonContainer.append(declineButton);
          await buttonContainer.append(acceptButton);
          console.log("All buttons appended successfully");
        } else {
          console.log("Button append failed - missing elements:", {
            buttonContainerAppend: !!buttonContainer.append,
            prefrenceButton: !!prefrenceButton,
            declineButton: !!declineButton,
            acceptButton: !!acceptButton
          });
        }
      } else {
        console.log("Main append failed - missing elements:", {
          newDivAppend: !!newDiv.append,
          innerdiv: !!innerdiv,
          tempHeading: !!tempHeading,
          tempParagraph: !!tempParagraph,
          buttonContainer: !!buttonContainer
        });
      }

      await createCookiePreferences(
        ["essential", "analytics", "marketing", "preferences"],
        config.language,
        config.color,
        config.btnColor,
        config.headColor,
        config.paraColor,
        config.secondcolor,
        config.buttonRadius,
        config.animation,
        config.toggleStates.customToggle,
        config.primaryButtonText,
        config.secondbuttontext,
        skipCommonDiv,
        config.toggleStates.disableScroll,
        config.toggleStates.closebutton,
        config.Font
      );

      if (appVersion === '1.0.0') {
        await fetchAnalyticsBlockingsScripts();
      } else {
        await fetchAnalyticsBlockingsScriptsV2();
      }

             console.log("GDPR banner creation completed, setting success timeout...");
       setTimeout(() => {
         console.log("GDPR banner success timeout triggered");
         handleBannerSuccess();
       }, 30000);

    } catch (error) {
      handleBannerError(error);
    } finally {
      clearTimeout(overallTimeout);
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  const createCCPABanner = async (config: BannerConfig) => {
    console.log("=== CCPA BANNER CREATION START ===");
    setIsCreating(true);
    setShowLoading(true);
    
    console.log("Creating CCPA banner with config:", config);
    console.log("Language:", config.language);
    
    try {
      // Cleanup existing banners
      const allElements = await webflow.getAllElements();
      const idsToCheck = ["initial-consent-banner", "main-consent-banner", "toggle-consent-btn"];

      const domIdPromises = allElements.map(async (el) => {
        const domId = await el.getDomId?.();
        return { el, domId };
      });

      const elementsWithDomIds = await Promise.all(domIdPromises);
      const matchingElements = elementsWithDomIds
        .filter(({ domId }) => domId && idsToCheck.includes(domId))
        .map(({ el }) => el);

      await Promise.all(matchingElements.map(async (el) => {
        try {
          const children = await el.getChildren?.();
          if (children?.length) {
            await Promise.all(children.map(child => child.remove()));
          }
          await el.remove();
        } catch (err) {
          console.error("Error removing element:", err);
        }
      }));

      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        throw new Error("No element selected in the Designer.");
      }

      const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create div.");
      }

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
        divStyle, paragraphStyle, buttonContainerStyle, headingStyle,
        Linktext, innerDivStyle, secondBackgroundStyle, closebutton
      ] = styles;

      const animationAttributeMap = {
        "fade": "fade",
        "slide-up": "slide-up",
        "slide-down": "slide-down",
        "slide-left": "slide-left",
        "slide-right": "slide-right",
        "select": "select",
      };
      const animationAttribute = animationAttributeMap[config.animation] || "";

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

      const responsivePropertyMap: Record<string, string> = {
        "max-width": "100%",
        "width": "100%",
        "bottom": "0",
        "left": "0",
        "right": "0",
        "top": "auto",
        "transform": "none"
      };
      const responsiveOptions = { breakpoint: "small", pseudoClass: "" } as const;

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

      const buttonContainerPropertyMap: Record<string, string> = {
        "display": "flex",
        "justify-content": "left",
        "margin-top": "10px",
        "width": "100%",
      };
      if (config.style === "centeralign") {
        buttonContainerPropertyMap["justify-content"] = "center";
      }

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

      const innerdivPropertyMap: Record<string, string> = {
        "max-width": "877px",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      const secondbackgroundPropertyMap: Record<string, string> = {
        "position": "absolute",
        "background-color": config.bgColors,
        "width": "35%",
        "right": "0px",
        "height": "100%",
        "z-index": "-3",
        "opacity": "30%",
        "bottom": "0px",
        "border-bottom-right-radius": `${config.borderRadius}px`,
        "border-top-right-radius": `${config.borderRadius}px`
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
      await closebutton.setProperties(CloseButtonPropertyMap);

      if (newDiv.setStyles) {
        await newDiv.setStyles([divStyle]);
      }

      if (newDiv.setCustomAttribute) {
        await newDiv.setCustomAttribute("data-animation", animationAttribute);
        await newDiv.setCustomAttribute("data-cookie-banner", config.toggleStates.disableScroll ? "true" : "false");
      }

      // Create inner elements following App_backup.tsx pattern
      console.log("Creating innerdiv for CCPA banner...");
      const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      console.log("CCPA innerdiv created:", innerdiv);
      await innerdiv.setStyles([innerDivStyle]);
      console.log("CCPA innerdiv styles applied");

      let SecondDiv;
      if (config.style === "alignstyle") {
        SecondDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
        if (SecondDiv.setStyles) {
          await SecondDiv.setStyles([secondBackgroundStyle]);
        }
      }

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
        const language = config.language || "English";
        const headingText = translations[language as keyof typeof translations]?.ccpa.heading || "We value your Privacy";
        console.log("Setting CCPA heading text:", headingText, "for language:", language);
        await tempHeading.setTextContent(headingText);
      }

      let Closebuttons = null;
      if (config.toggleStates.closebutton) {
        Closebuttons = await selectedElement.before(webflow.elementPresets.Paragraph);
        if (!Closebuttons) {
          throw new Error("Failed to create paragraph");
        }
        if (Closebuttons.setStyles) {
          await Closebuttons.setStyles([closebutton]);
          await Closebuttons.setTextContent("X");
          await Closebuttons.setCustomAttribute("consentbit", "close");
        }
      }

      const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
      if (!tempParagraph) {
        throw new Error("Failed to create paragraph");
      }
      if (tempParagraph.setStyles) {
        await tempParagraph.setStyles([paragraphStyle]);
      }
      if (tempParagraph.setTextContent) {
        const language = config.language || "English";
        const paragraphText = translations[language as keyof typeof translations]?.ccpa.description || "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.";
        console.log("Setting CCPA paragraph text:", paragraphText, "for language:", language);
        await tempParagraph.setTextContent(paragraphText);
      }

      const buttonContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!buttonContainer) {
        throw new Error("Failed to create button container");
      }
      await buttonContainer.setStyles([buttonContainerStyle]);

      const prefrenceButton = await selectedElement.before(webflow.elementPresets.LinkBlock);
      if (!prefrenceButton) {
        throw new Error("Failed to create preference button");
      }
      await prefrenceButton.setStyles([Linktext]);
      const language = config.language || "English";
      await prefrenceButton.setTextContent(translations[language as keyof typeof translations]?.ccpa.doNotShare || "Do Not Share My Personal Information");
      if ((prefrenceButton as any).setDomId) {
        await (prefrenceButton as any).setDomId("do-not-share-link");
      }

      console.log("Starting to append elements to CCPA banner...");
      console.log("CCPA newDiv.append exists:", !!newDiv.append);
      console.log("CCPA innerdiv exists:", !!innerdiv);
      console.log("CCPA tempHeading exists:", !!tempHeading);
      console.log("CCPA tempParagraph exists:", !!tempParagraph);
      console.log("CCPA buttonContainer exists:", !!buttonContainer);
      
      if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {
        console.log("Appending CCPA innerdiv to newDiv...");
        await newDiv.append(innerdiv);
        console.log("CCPA innerdiv appended successfully");
        
        if (Closebuttons) {
          console.log("Appending CCPA Closebuttons...");
          await newDiv.append(Closebuttons);
        }
        
        if (SecondDiv) {
          console.log("Appending CCPA SecondDiv to innerdiv...");
          await innerdiv.append(SecondDiv);
        }
        
        console.log("Appending CCPA tempHeading to innerdiv...");
        await innerdiv.append(tempHeading);
        console.log("Appending CCPA tempParagraph to innerdiv...");
        await innerdiv.append(tempParagraph);
        console.log("Appending CCPA buttonContainer to innerdiv...");
        await innerdiv.append(buttonContainer);

        if (buttonContainer.append && prefrenceButton) {
          console.log("Appending CCPA button to buttonContainer...");
          await buttonContainer.append(prefrenceButton);
          console.log("CCPA button appended successfully");
        } else {
          console.log("CCPA button append failed - missing elements:", {
            buttonContainerAppend: !!buttonContainer.append,
            prefrenceButton: !!prefrenceButton
          });
        }
      } else {
        console.log("CCPA main append failed - missing elements:", {
          newDivAppend: !!newDiv.append,
          innerdiv: !!innerdiv,
          tempHeading: !!tempHeading,
          tempParagraph: !!tempParagraph,
          buttonContainer: !!buttonContainer
        });
      }

      await createCookieccpaPreferences(
        config.language,
        config.color,
        config.btnColor,
        config.headColor,
        config.paraColor,
        config.secondcolor,
        config.buttonRadius,
        config.animation,
        config.primaryButtonText,
        config.secondbuttontext,
        config.toggleStates.disableScroll,
        config.toggleStates.closebutton,
        false,
        config.Font
      );

      if (appVersion === '1.0.0') {
        await fetchAnalyticsBlockingsScripts();
      } else {
        await fetchAnalyticsBlockingsScriptsV2();
      }

             console.log("CCPA banner creation completed, setting success timeout...");
       setTimeout(() => {
         console.log("CCPA banner success timeout triggered");
         handleBannerSuccess();
       }, 20000);

    } catch (error) {
      handleBannerError(error);
    } finally {
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  const createBothBanners = async (config: BannerConfig) => {
    console.log("Starting createBothBanners...");
    try {
      console.log("Creating GDPR banner first...");
      await createGDPRBanner(config, true);
      console.log("GDPR banner created successfully, now creating CCPA banner...");
      await createCCPABanner(config);
      console.log("Both banners created successfully!");
    } catch (error) {
      console.error("Error in createBothBanners:", error);
      throw error;
    }
  };

  // Simple test function to isolate the issue
  const testSimpleBannerCreation = async () => {
    console.log("=== TESTING SIMPLE BANNER CREATION ===");
    try {
      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        throw new Error("No element selected");
      }
      
      console.log("Creating simple div...");
      const simpleDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      console.log("Simple div created:", simpleDiv);
      
      if (simpleDiv && (simpleDiv as any).setDomId) {
        console.log("Setting DOM ID...");
        await (simpleDiv as any).setDomId("test-banner");
        console.log("DOM ID set successfully");
      }
      
      console.log("Simple banner creation test completed successfully");
    } catch (error) {
      console.error("Simple banner creation test failed:", error);
      throw error;
    }
  };

  return {
    createGDPRBanner,
    createCCPABanner,
    createBothBanners,
    testSimpleBannerCreation,
    isCreating,
    showLoading,
    showSuccess
  };
};
