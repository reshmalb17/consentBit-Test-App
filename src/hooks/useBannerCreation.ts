import { useState } from 'react';
import webflow from '../types/webflowtypes';
import { customCodeApi } from '../services/api';
import { getSessionTokenFromLocalStorage } from '../util/Session';
import createCookiePreferences from './gdprPreference';
import createCookieccpaPreferences from './ccpaPreference';
import { CodeApplication } from '../types/types';
import pkg from '../../package.json';
import { useAppState } from './useAppState';

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
  const [showSuccessPublish, setShowSuccessPublish] = useState(false);
    const {
        bannerStyles,
        bannerUI,
        bannerConfig,
        bannerBooleans,
        popups,
        bannerAnimation,
        bannerToggleStates,
        bannerLanguages,
    } = useAppState();

  const handleBannerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleBannerError = (error: any) => {
    // Error handling
    webflow.notify({ type: "error", message: "An error occurred while creating the banner." });
  };

  const handleSuccessPublishProceed = () => {
    setShowSuccessPublish(false);
    // Add any additional logic for proceeding from success page
  };

  const handleSuccessPublishGoBack = () => {
    setShowSuccessPublish(false);
    // Add any additional logic for going back from success page
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
      throw error;
      throw error;
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
      throw error;
      throw error;
    }
  };

     const createGDPRBanner = async (config: BannerConfig, skipCommonDiv: boolean = false) => {
     setIsCreating(true);
     setShowLoading(true);
    
    try {
      // Cleanup existing banners
      const allElements = await webflow.getAllElements();
      
      const idsToCheck = ["consent-banner", "main-banner", "toggle-consent-btn"];

            const domIdPromises = allElements.map(async (el) => {
        const domId = await el.getDomId?.();
        return { el, domId };
      });

      const elementsWithDomIds = await Promise.all(domIdPromises);

      const matchingElements = elementsWithDomIds
        .filter(({ domId }) => domId && idsToCheck.includes(domId))
        .map(({ el }) => el);

      if (matchingElements.length > 0) {
        await Promise.all(matchingElements.map(async (el) => {
          try {
            const children = await el.getChildren?.();
            if (children?.length) {
              await Promise.all(children.map(child => child.remove()));
            }
            await el.remove();
          } catch (err) {
            // Error handling
          }
        }));
      }

      const selectedElement = await webflow.getSelectedElement();
       if (!selectedElement) {
         throw new Error("No element selected in the Designer.");
       }

             const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
      if (!newDiv) {
        throw new Error("Failed to create div.");
      }

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
        divStyle, paragraphStyle, buttonContainerStyle, prefrenceButtonStyle, 
        declineButtonStyle, buttonStyle, headingStyle, innerDivStyle, 
        secondBackgroundStyle, closebutton
      ] = styles;

      
      const animationAttribute = bannerAnimation.animation || "fade";

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

       await divStyle.setProperties(divPropertyMap);
       await divStyle.setProperties(responsivePropertyMap, responsiveOptions);
       await paragraphStyle.setProperties(paragraphPropertyMap);
       await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
       await buttonContainerStyle.setProperties(responsivebuttonPropertyMap, responsiveOptions);
       await buttonStyle.setProperties(buttonPropertyMap);
       await declineButtonStyle.setProperties(declineButtonPropertyMap);
       await prefrenceButtonStyle.setProperties(declineButtonPropertyMap);
       await headingStyle.setProperties(headingPropertyMap);
       await secondBackgroundStyle.setProperties(secondbackgroundPropertyMap);
       await innerDivStyle.setProperties(innerdivPropertyMap);
       await closebutton.setProperties(CloseButtonPropertyMap);

                      if (newDiv.setStyles) {
          await newDiv.setStyles([divStyle]);
        }

         if (newDiv.setCustomAttribute) {
           // Only set animation attribute if it has a valid value
           if (animationAttribute && animationAttribute.trim() !== "") {
             try {
               const animationPromise = newDiv.setCustomAttribute("data-animation", animationAttribute);
               const animationTimeout = new Promise((_, reject) => 
                 setTimeout(() => reject(new Error("Animation attribute timeout")), 5000)
               );
               await Promise.race([animationPromise, animationTimeout]);
             } catch (error) {
               throw error;
             }
           }
          
          try {
            const cookieBannerPromise = newDiv.setCustomAttribute("data-cookie-banner", config.toggleStates.disableScroll ? "true" : "false");
            const cookieBannerTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Cookie banner attribute timeout")), 5000)
            );
            await Promise.race([cookieBannerPromise, cookieBannerTimeout]);
          } catch (error) {
            throw error;
          }
        }

       let innerdiv: any;
       try {
         // Add timeout to prevent hanging
         const innerdivPromise = selectedElement.before(webflow.elementPresets.DivBlock);
         const timeoutPromise = new Promise((_, reject) => 
           setTimeout(() => reject(new Error("Element creation timeout")), 10000)
         );
         
         innerdiv = await Promise.race([innerdivPromise, timeoutPromise]) as any;
         
         if (innerdiv && innerdiv.setStyles) {
           await innerdiv.setStyles([innerDivStyle]);
         }
       } catch (error) {
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







      
      if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {

        await newDiv.append(innerdiv);

        
        if (Closebuttons) {

          await newDiv.append(Closebuttons);
        }
        
        if (SecondDiv) {

          await innerdiv.append(SecondDiv);
        }
        

        await innerdiv.append(tempHeading);

        await innerdiv.append(tempParagraph);

        await innerdiv.append(buttonContainer);

        if (buttonContainer.append && prefrenceButton && declineButton && acceptButton) {

          await buttonContainer.append(prefrenceButton);
          await buttonContainer.append(declineButton);
          await buttonContainer.append(acceptButton);

        }
      }



             
             try {


               
               await createCookiePreferences(
                 ["essential", "analytics", "marketing", "preferences"],
                 bannerLanguages.language,
                 bannerStyles.color,
                 bannerStyles.btnColor,
                 bannerStyles.headColor,
                 bannerStyles.paraColor,
                 bannerStyles.secondcolor,
                 bannerConfig.buttonRadius,
                 bannerAnimation.animation,
                 bannerToggleStates.toggleStates.customToggle,
                 bannerStyles.primaryButtonText,
                 bannerStyles.secondbuttontext,
                 skipCommonDiv,
                 bannerToggleStates.toggleStates.disableScroll,
                 bannerToggleStates.toggleStates.closebutton,                
               );
               

               
               // Display list of created DOM elements with IDs

               try {
                 const allElements = await webflow.getAllElements();
                 const elementsWithIds = [];
                 
                 for (const element of allElements) {
                   try {
                     const domId = await element.getDomId?.();
                     if (domId) {
                       elementsWithIds.push({
                         id: domId,
                         element: element
                       });
                     }
                   } catch (err) {
                     // Skip elements that don't have getDomId method
                   }
                 }
                 

                 elementsWithIds.forEach((item, index) => {

                 });
                 
                 // Show specific banner-related IDs
                 const bannerIds = elementsWithIds.filter(item => 
                   item.id.includes('consent') || 
                   item.id.includes('banner') || 
                   item.id.includes('preference') ||
                   item.id.includes('toggle') ||
                   item.id.includes('accept') ||
                   item.id.includes('decline') ||
                   item.id.includes('preferences')
                 );
                 
                 if (bannerIds.length > 0) {

                   bannerIds.forEach((item, index) => {

                   });
                 }
                 
               } catch (error) {

               }
               
             } catch (error) {



               throw error;
             }



      try {
        if (appVersion === '1.0.0') {

          await fetchAnalyticsBlockingsScripts();

        } else {

          await fetchAnalyticsBlockingsScriptsV2();

        }
        
        // Add a delay to ensure script is loaded

        await new Promise(resolve => setTimeout(resolve, 3000));

        
        // Check if the script is loaded
        const scripts = document.querySelectorAll('script[src*="consent"]');

        scripts.forEach((script, index) => {
          const scriptElement = script as HTMLScriptElement;

        });
        
                 // Check if the script is loaded in the head
         const headScripts = document.head.querySelectorAll('script');

         headScripts.forEach((script, index) => {
           const scriptElement = script as HTMLScriptElement;
           if (scriptElement.src && scriptElement.src.includes('consent')) {

           }
         });
         
        
       
       
         
       } catch (error) {

         throw error;
       }


       setTimeout(() => {

         handleBannerSuccess();
       }, 30000);

    } catch (error) {
      handleBannerError(error);
    } finally {
      setIsCreating(false);
      setShowLoading(false);
    }
  };

  const createCCPABanner = async (config: BannerConfig) => {

    setIsCreating(true);
    setShowLoading(true);
    




    
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

      
      const animationAttribute = bannerAnimation.animation || "fade";


      const divPropertyMap: Record<string, string> = {
        "background-color":bannerStyles.color,
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
         // Only set animation attribute if it has a valid value
         if (animationAttribute && animationAttribute.trim() !== "") {

           try {
             const animationPromise = newDiv.setCustomAttribute("data-animation", animationAttribute);
             const animationTimeout = new Promise((_, reject) => 
               setTimeout(() => reject(new Error("CCPA animation attribute timeout")), 5000)
             );
             await Promise.race([animationPromise, animationTimeout]);

           } catch (error) {

             throw error;
           }
         } else {

         }
         

         try {
           const cookieBannerPromise = newDiv.setCustomAttribute("data-cookie-banner", bannerToggleStates.toggleStates.disableScroll ? "true" : "false");
           const cookieBannerTimeout = new Promise((_, reject) => 
             setTimeout(() => reject(new Error("CCPA cookie banner attribute timeout")), 5000)
           );
           await Promise.race([cookieBannerPromise, cookieBannerTimeout]);

         } catch (error) {

           throw error;
         }
       }

      // Create inner elements following App_backup.tsx pattern

      const innerdiv = await selectedElement.before(webflow.elementPresets.DivBlock);

      await innerdiv.setStyles([innerDivStyle]);


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

        await tempHeading.setTextContent(headingText);
      }

      let Closebuttons = null;
      if (bannerToggleStates.toggleStates.closebutton) {
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







      
      if (newDiv.append && innerdiv && tempHeading && tempParagraph && buttonContainer) {

        await newDiv.append(innerdiv);

        
        if (Closebuttons) {

          await newDiv.append(Closebuttons);
        }
        
        if (SecondDiv) {

          await innerdiv.append(SecondDiv);
        }
        

        await innerdiv.append(tempHeading);

        await innerdiv.append(tempParagraph);

        await innerdiv.append(buttonContainer);

        if (buttonContainer.append && prefrenceButton) {

          await buttonContainer.append(prefrenceButton);

        }
      }



      
      try {

        await createCookieccpaPreferences(
          bannerLanguages.language,
          bannerStyles.color,
          bannerStyles.btnColor,
          bannerStyles.headColor,
          bannerStyles.paraColor,
          bannerStyles.secondcolor,
          bannerConfig.buttonRadius,
          bannerAnimation.animation,
          bannerStyles.primaryButtonText,
          bannerStyles.secondbuttontext,
          bannerToggleStates.toggleStates.disableScroll,
          bannerToggleStates.toggleStates.closebutton,
          false,
          bannerStyles.Font
        );
        

        
        // Display list of created DOM elements with IDs for CCPA

        try {
          const allElements = await webflow.getAllElements();
          const elementsWithIds = [];
          
          for (const element of allElements) {
            try {
              const domId = await element.getDomId?.();
              if (domId) {
                elementsWithIds.push({
                  id: domId,
                  element: element
                });
              }
            } catch (err) {
              // Skip elements that don't have getDomId method
            }
          }
          

          elementsWithIds.forEach((item, index) => {

          });
          
          // Show specific CCPA banner-related IDs
          const ccpaBannerIds = elementsWithIds.filter(item => 
            item.id.includes('consent') || 
            item.id.includes('banner') || 
            item.id.includes('preference') ||
            item.id.includes('toggle') ||
            item.id.includes('ccpa') ||
            item.id.includes('initial') ||
            item.id.includes('do-not-share')
          );
          
          if (ccpaBannerIds.length > 0) {

            ccpaBannerIds.forEach((item, index) => {

            });
          }
          
        } catch (error) {

        }
        
      } catch (error) {

        throw error;
      }



      try {
        if (appVersion === '1.0.0') {

          await fetchAnalyticsBlockingsScripts();

        } else {

          await fetchAnalyticsBlockingsScriptsV2();

        }
        
        // Add a delay to ensure script is loaded

        await new Promise(resolve => setTimeout(resolve, 3000));

        
        // Check if the script is loaded
        const scripts = document.querySelectorAll('script[src*="consent"]');

        scripts.forEach((script, index) => {
          const scriptElement = script as HTMLScriptElement;

        });
        
        // Check if the script is loaded in the head
        const headScripts = document.head.querySelectorAll('script');

        headScripts.forEach((script, index) => {
          const scriptElement = script as HTMLScriptElement;
          if (scriptElement.src && scriptElement.src.includes('consent')) {

          }
        });
        
      } catch (error) {

        throw error;
      }


       setTimeout(() => {

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

    try {

      await createGDPRBanner(config, true);

      await createCCPABanner(config);

      
      // Show success page after both banners are created

      setShowSuccessPublish(true);
      
      // Set localStorage to indicate banner was added through welcome flow
      localStorage.setItem("bannerAddedThroughWelcome", "true");
    } catch (error) {

      throw error;
    }
  };

  // Simple test function to isolate the issue
  const testSimpleBannerCreation = async () => {

    try {
      const selectedElement = await webflow.getSelectedElement();
      if (!selectedElement) {
        throw new Error("No element selected");
      }
      

      const simpleDiv = await selectedElement.before(webflow.elementPresets.DivBlock);

      
      if (simpleDiv && (simpleDiv as any).setDomId) {

        await (simpleDiv as any).setDomId("test-banner");

      }
      

    } catch (error) {

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
    showSuccess,
    showSuccessPublish,
    handleSuccessPublishProceed,
    handleSuccessPublishGoBack
  };
};
