// import { aw } from 'framer-motion/dist/types.d-6pKw1mTI';
import webflow, { WebflowAPI } from '../types/webflowtypes';
const logo = new URL("../assets/icon.svg", import.meta.url).href;


// Helper function to get or create an asset from local file
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
        throw error;
    }
};

const ccpaTranslations = {
    English: {
        heading: "Opt-out Preference",
        description: "We use third-party cookies that help us analyze how you use this website, store your preferences, and provide the content and advertisements that are relevant to you. We do not sell your information. However, you can opt out of these cookies by checking Do Not Share My Personal Information and clicking the Save My Preferences button. Once you opt out, you can opt in again at any time by unchecking Do Not Share My Personal Information and clicking the Save My Preferences button. ",
        doNotShare: ".Do Not Share My Personal Information",
        savePreference: "Save My Preference",
        cancel: "Cancel",
        moreInfo: "More Info"
    },
    Spanish: {
        heading: "Preferencia de Exclusión",
        description: "Utilizamos cookies de terceros que nos ayudan a analizar cómo utiliza este sitio web, almacenar sus preferencias y proporcionar contenido y anuncios relevantes para usted. No vendemos su información. Sin embargo, puede optar por no recibir estas cookies marcando No Compartir Mi Información Personal y haciendo clic en el botón Guardar Mis Preferencias. Una vez que opte por no participar, puede volver a participar en cualquier momento desmarcando No Compartir Mi Información Personal y haciendo clic en el botón Guardar Mis Preferencias. ",
        doNotShare: ".No Compartir Mi Información Personal.",
        savePreference: "Guardar Mi Preferencia",
        cancel: "Cancelar",
        moreInfo: "Más Información"
    },
    French: {
        heading: "Préférence de Désinscription",
        description: "Nous utilisons des cookies tiers qui nous aident à analyser votre utilisation de ce site web, à stocker vos préférences et à fournir du contenu et des publicités pertinents pour vous. Nous ne vendons pas vos informations. Cependant, vous pouvez désactiver ces cookies en cochant Ne Pas Partager Mes Informations Personnelles et en cliquant sur le bouton Enregistrer Mes Préférences. Une fois désactivé, vous pouvez réactiver à tout moment en décochant Ne Pas Partager Mes Informations Personnelles et en cliquant sur le bouton Enregistrer Mes Préférences. ",
        doNotShare: ".Ne Pas Partager Mes Informations Personnelles.",
        savePreference: "Enregistrer Mes Préférences",
        cancel: "Annuler",
        moreInfo: "Plus d'Informations"
    },
    German: {
        heading: "Abmeldepräferenzen",
        description: "Wir verwenden Cookies von Drittanbietern, die uns helfen, Ihre Nutzung dieser Website zu analysieren, Ihre Präferenzen zu speichern und relevante Inhalte und Werbung bereitzustellen. Wir verkaufen Ihre Informationen nicht. Sie können diese Cookies jedoch deaktivieren, indem Sie 'Meine persönlichen Informationen nicht weitergeben' auswählen und auf 'Meine Präferenzen speichern' klicken. Sobald deaktiviert, können Sie dies jederzeit rückgängig machen, indem Sie die Auswahl von 'Meine persönlichen Informationen nicht weitergeben' aufheben und erneut auf 'Meine Präferenzen speichern' klicken. ",
        doNotShare: "Meine persönlichen Informationen nicht weitergeben",
        savePreference: "Meine Präferenzen speichern",
        cancel: "Abbrechen",
        moreInfo: "Weitere Informationen"
    },
  
    Swedish: {
        heading: "Avregistreringspreferens",
        description: "Vi använder tredjepartscookies som hjälper oss att analysera hur du använder denna webbplats, lagra dina preferenser och tillhandahålla innehåll och annonser som är relevanta för dig. Vi säljer inte din information. Du kan dock välja bort dessa cookies genom att kryssa i 'Dela Inte Min Personliga Information' och klicka på 'Spara Mina Preferenser'-knappen. När du väljer bort kan du välja tillbaka när som helst genom att avmarkera 'Dela Inte Min Personliga Information' och klicka på 'Spara Mina Preferenser'-knappen. ",
        doNotShare: "Dela Inte Min Personliga Information",
        savePreference: "Spara Mina Preferenser",
        cancel: "Avbryt",
        moreInfo: "Mer Information"
    },
    Dutch: {
        heading: "Afmeldingsvoorkeur",
        description: "We gebruiken cookies van derden die ons helpen bij het analyseren van hoe u deze website gebruikt, het opslaan van uw voorkeuren en het leveren van inhoud en advertenties die relevant voor u zijn. We verkopen uw informatie niet. U kunt deze cookies echter uitschakelen door 'Deel Mijn Persoonlijke Informatie Niet' aan te vinken en op de 'Sla Mijn Voorkeuren Op'-knop te klikken. Zodra u zich afmeldt, kunt u zich opnieuw aanmelden door het vinkje bij 'Deel Mijn Persoonlijke Informatie Niet' te verwijderen en op de 'Sla Mijn Voorkeuren Op'-knop te klikken. ",
        doNotShare: "Deel Mijn Persoonlijke Informatie Niet",
        savePreference: "Sla Mijn Voorkeuren Op",
        cancel: "Annuleren",
        moreInfo: "Meer Informatie"
    },
      Polish: {
    heading: "Preferencje rezygnacji",
    description: "Używamy plików cookie stron trzecich, które pomagają nam analizować sposób korzystania z tej strony internetowej, przechowywać Twoje preferencje oraz dostarczać treści i reklamy, które są dla Ciebie istotne. Nie sprzedajemy Twoich informacji. Możesz jednak zrezygnować z tych plików cookie, zaznaczając opcję Nie udostępniaj moich danych osobowych i klikając przycisk Zapisz moje preferencje. Po rezygnacji możesz ponownie wyrazić zgodę w dowolnym momencie, odznaczając opcję Nie udostępniaj moich danych osobowych i klikając przycisk Zapisz moje preferencje.",
    doNotShare: "Nie udostępniaj moich danych osobowych",
    savePreference: "Zapisz moje preferencje",
    cancel: "Anuluj",
    moreInfo: "Więcej informacji"
},
    Portuguese: {
        heading: "Preferência de Exclusão",
        description: "Utilizamos cookies de terceiros que nos ajudam a analisar como você utiliza este site, armazenar suas preferências e fornecer conteúdos e anúncios relevantes para você. Não vendemos suas informações. No entanto, você pode desativar esses cookies marcando a opção Não Compartilhar Minhas Informações Pessoais e clicando no botão Salvar Minhas Preferências. Após desativar, você pode ativar novamente a qualquer momento desmarcando a opção e clicando no botão Salvar Minhas Preferências. ",
        doNotShare: "Não Compartilhar Minhas Informações Pessoais",
        savePreference: "Salvar Minhas Preferências",
        cancel: "Cancelar",
        moreInfo: "Mais Informações"
    },
    Italian: {
        heading: "Preferenza di Opt-out",
        description: "Utilizziamo cookie di terze parti che ci aiutano ad analizzare come utilizzi questo sito web, a memorizzare le tue preferenze e a fornire contenuti e annunci pertinenti. Non vendiamo le tue informazioni. Tuttavia, puoi disattivare questi cookie selezionando Non Condividere le Mie Informazioni Personali e facendo clic sul pulsante Salva le Mie Preferenze. Una volta disattivato, puoi riattivarlo in qualsiasi momento deselezionando l'opzione e facendo clic sul pulsante Salva le Mie Preferenze. ",
        doNotShare: "Non Condividere le Mie Informazioni Personali",
        savePreference: "Salva le Mie Preferenze",
        cancel: "Annulla",
        moreInfo: "Maggiori Informazioni"
    }
};

type BreakpointAndPseudo = {
    breakpoint: string;
    pseudoClass: string;
};

const createCookieccpaPreferences = async (language: string = "English", color: string = "#ffffff", btnColor: string = "#F1F1F1", headColor: string = "#483999", paraColor: string = "#1F1D40", secondcolor: string = "secondcolor", buttonRadius: number, animation: string, primaryButtonText: string = "#ffffff", secondbuttontext: string = "#4C4A66", disableScroll: boolean, _closebutton: boolean = false, skipCommonDiv: boolean = false, Font: string, borderRadius: number, privacyUrl: string = ""
) => {


    // Add overall timeout for the entire function
    const overallTimeout = setTimeout(() => {
    }, 30000);

    try {

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

        if ((newDiv as any).setDomId) {
            await (newDiv as any).setDomId("main-consent-banner"); // Type assertion
        }

        const timestamp = Date.now();


        const styleNames = {
            preferenceDiv: `consentbit-ccpa_preference`,
            paragraphStyleNames: `consentbit-ccpa_prefrence_text`,
            formfield: `consentbit-ccpa-formblock`,
            preferenceblock: `consentbit-ccpa-prefrence-block`,
            toggledivs: `consentbit-ccpa-prefrence-toggle`,
            buttonContainerStyleName: `consebit-ccpa-prefrence-container`,
            prefrenceButton: `consentbit-ccpa-button-preference`,
            checkboxstyle: "consentbit-change-preference",
            buttonStyleName: `consebit-ccpa-prefrence-accept`,
            DeclinebuttonStyleName: `consebit-ccpa-prefrence-decline`,
            headingStyleName: `consebit-ccpa-prefrence-heading`,
            checkboxContainerStyleName: `consentbit-toggle`,
            // changepreference: `consentbit-ccpa-checkbox`,
            closebutton: 'consent-close'
        };

        const styles = await Promise.all(
            Object.values(styleNames).map(async (name) => {
                try {
                    const existingStyle = await webflow.getStyleByName(name);
                    if (existingStyle) {
                        return existingStyle;
                    } else {
                        const newStyle = await webflow.createStyle(name);
                        return newStyle;
                    }
                } catch (error) {
                    throw error;
                }
            })
        );

        const [divStyle, paragraphStyle, formBlockStyle, prefrenceDiv, togglediv, buttonContainerStyle, prefrenceButtons, changepre, buttonStyle, declinebutton, headingStyle, checkbosstyle, closebutton] = styles;



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

        const animationAttribute = animationAttributeMap[animation] || "";

        const divPropertyMap: Record<string, string> = {
            "background-color": color,
            "position": "fixed",
            "z-index": "99999",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)",
            "border-radius": `${borderRadius}px`,
            "display": "none",
            "flex-direction": "column",
            "overflow-y": "scroll",
            "align-items": "center",
            "justify-content": "flex-start",
            "padding-top": "20px",
            "padding-right": "20px",
            "padding-bottom": "20px",
            "padding-left": "20px",
            "box-shadow": "2px 2px 20px rgba(0, 0, 0, 0.51)",
            "font-family": Font,
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

        const prefrencePropertyMap: Record<string, string> = {
            "display": "flex",
            "flex-direction": "column",
            "margin-top": "10px",
            "width": "100%",
        };

        const setTooglePropertyMap: Record<string, string> = {
            "color": "rgba(72, 57, 153, 1)",
            "display": "flex",
            "flex-direction": "row", /* Items are arranged in a row */
            "flex-wrap": "nowrap",   /* Prevents wrapping */
            "direction": "rtl",
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
            "color": primaryButtonText,
            "margin-right": "5px",
            "min-width": "80px",
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

        const CloseButtonPropertyMap: Record<string, string> = {
            "color": "#000",
            "justify-content": "center",
            "align-items": "center",
            "width": "25px",
            "height": "25px",
            "display": "flex",
            "position": "absolute",
            "top": "10",
            "left": "auto",
            "right": "0",
            "font-family": "'Montserrat', sans-serif",
            "z-index": "99",
            "cursor": "pointer",
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

        const changepreferencePropertyMap: Record<string, string> = {
            "height": "55px",
            "width": "55px",
            "border-radius": "50%",
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

        const checkboxStyleMap: Record<string, string> = {
            "appearance": "none", // Removes default checkbox styling
            "width": "20px", // Checkbox width
            "height": "20px", // Checkbox height
            "border-radius": "4px", // Rounded corners
            "background-color": color,
            "cursor": "pointer",
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
        await prefrenceDiv.setProperties(prefrencePropertyMap);
        await togglediv.setProperties(setTooglePropertyMap);
        await formBlockStyle.setProperties(formPropertyMap);
        await buttonContainerStyle.setProperties(buttonContainerPropertyMap);
        await buttonStyle.setProperties(buttonPropertyMap);
        await changepre.setProperties(changepreferencePropertyMap);
        await declinebutton.setProperties(declineButtonPropertyMap);
        await prefrenceButtons.setProperties(declineButtonPropertyMap);
        await checkbosstyle.setProperties(checkboxStyleMap);
        await headingStyle.setProperties(headingPropertyMap);
        await closebutton.setProperties(CloseButtonPropertyMap);


        if (newDiv.setStyles) {
            await newDiv.setStyles([divStyle]);
        }

        if (newDiv.setCustomAttribute) {
            try {
                const animationPromise = newDiv.setCustomAttribute("data-animation", animationAttribute);
                const animationTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("CCPA animation attribute timeout")), 5000)
                );
                await Promise.race([animationPromise, animationTimeout]);
            } catch (error) {
                throw error;
            }

            try {
                const cookieBannerPromise = newDiv.setCustomAttribute("data-cookie-banner", disableScroll ? "true" : "false");
                const cookieBannerTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("CCPA cookie banner attribute timeout")), 5000)
                );
                await Promise.race([cookieBannerPromise, cookieBannerTimeout]);
            } catch (error) {
                throw error;
            }
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
                await tempHeading.setTextContent(ccpaTranslations[language as keyof typeof ccpaTranslations].heading);
            }

            const tempParagraph = await selectedElement.before(webflow.elementPresets.Paragraph);
            if (!tempParagraph) {
                throw new Error("Failed to create paragraph");
            }

            if (tempParagraph.setStyles) {
                await tempParagraph.setStyles([paragraphStyle]);
            }

            if (tempParagraph.setTextContent) {
                await tempParagraph.setTextContent(ccpaTranslations[language as keyof typeof ccpaTranslations].description);
            }

            // Create privacy link if privacyUrl is available
            let privacyLink = null;

            if (privacyUrl && privacyUrl.trim() !== "") {
                privacyLink = await selectedElement.before(webflow.elementPresets.LinkBlock);
                if (!privacyLink) throw new Error("Failed to create privacy link");

                // Set URL using setSettings method
                try {
                    await privacyLink.setSettings('url', privacyUrl, { openInNewTab: true });
                } catch (error) {
                }

                if (privacyLink.setTextContent) {
                    await privacyLink.setTextContent(` ${ccpaTranslations[language as keyof typeof ccpaTranslations].moreInfo}`);
                }

                if (privacyLink.setDomId) {
                    await privacyLink.setDomId("privacy-link-ccpa-preference");
                }

                // Add hover effect for underline
                if (privacyLink.setCustomAttribute) {
                    await privacyLink.setCustomAttribute("data-hover-underline", "true");
                }

            }

            //divblock///////////////////////////////////////////////////////////////////

            const prefrenceContainer = await selectedElement.before(webflow.elementPresets.DivBlock);
            if (!prefrenceContainer) {
                throw new Error("Failed to create button container");
            }
            await prefrenceContainer.setStyles([prefrenceDiv]);

            // Conditionally add close button only if closebutton parameter is true
            let Closebuttons = null;
            if (_closebutton) {
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

            const formBlock = await selectedElement.before(webflow.elementPresets.FormForm);
            if (!formBlock) {
                throw new Error("Failed to create form block");
            }

            const allChildren = await formBlock.getChildren();

            const form = allChildren.find(child => child.plugin === "Form");
            if (!form) {
                throw new Error("Failed to find form inside form block");
            }

            const formElements = await form.getChildren();
            await Promise.all(formElements.map(child => child.remove()));

            const prefrenceContainertoggle = await form.append(webflow.elementPresets.DivBlock);
            if (!prefrenceContainertoggle) {
                throw new Error("Failed to create div block inside form");
            }
            await prefrenceContainertoggle.setStyles([togglediv]);

            // Create Paragraph inside the DivBlock (First)
            const toggleParagraph = await prefrenceContainertoggle.append(webflow.elementPresets.Paragraph);
            if (!toggleParagraph) {
                throw new Error("Failed to create paragraph inside div block");
            }

            // Apply styles and text to paragraph
            if (toggleParagraph.setStyles) {
                await toggleParagraph.setStyles([paragraphStyle]);
            }

            if (toggleParagraph.setTextContent) {
                await toggleParagraph.setTextContent(ccpaTranslations[language as keyof typeof ccpaTranslations].doNotShare);
            }

            const checkboxField = await prefrenceContainertoggle.append(webflow.elementPresets.FormCheckboxInput);

            if (!checkboxField) {
                throw new Error("Failed to create checkbox field inside div block");
            }

            if ((checkboxField as any).setDomId) {
                await checkboxField.setStyles([checkbosstyle]);
                await (checkboxField as any).setDomId("do-not-share-checkbox"); // Type assertion
            }

            const children = await checkboxField.getChildren();

            for (const child of children) {
                if (child.type.includes("Label") && child.setTextContent) {
                    await child.setTextContent("");
                }
            }

            for (const child of children) {
                if (child.type.includes("FormCheckboxInput") && child.setCustomAttribute) {
                    await child.setCustomAttribute("data-consent-id", "do-not-share-checkbox");
                }
            }


            //////////////////////
            const prefrenceContainerinner = await selectedElement.before(webflow.elementPresets.DivBlock);
            if (!prefrenceContainerinner) {
                throw new Error("Failed to create button container");
            }
            await prefrenceContainerinner.setStyles([prefrenceDiv]);

            ////////////////////////////////////////////////////////////////////////////////////////
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
            await acceptButton.setTextContent(ccpaTranslations[language as keyof typeof ccpaTranslations].savePreference);

            if ((acceptButton as any).setDomId) {
                await (acceptButton as any).setDomId("save-btn"); // Type assertion
            }

            const declineButtons = await selectedElement.before(webflow.elementPresets.Button);
            if (!declineButtons) {
                throw new Error("Failed to create decline button");
            }
            await declineButtons.setStyles([declinebutton]);
            await declineButtons.setTextContent(ccpaTranslations[language as keyof typeof ccpaTranslations].cancel);

            if ((declineButtons as any).setDomId) {
                await (declineButtons as any).setDomId("close-consent-banner"); // Type assertion
            }



            if (newDiv.append && tempHeading && tempParagraph && buttonContainer && prefrenceContainer) {
                await newDiv.append(tempHeading);
                await newDiv.append(tempParagraph);
                if (privacyLink && tempParagraph.append) {
                    await tempParagraph.append(privacyLink);
                }
                await newDiv.append(prefrenceContainer)
                await newDiv.append(buttonContainer);
                if (Closebuttons) await newDiv.append(Closebuttons)

                if (prefrenceContainer.append && prefrenceContainerinner) {
                    // await prefrenceContainer.append(prefrenceContainertoggle)
                    await prefrenceContainer.append(prefrenceContainerinner)
                }

                if (prefrenceContainerinner.append && formBlock) {
                    await prefrenceContainerinner.append(formBlock)
                    // await prefrenceContainerinner.append(prefeParagraph)
                }

                if (buttonContainer.append && acceptButton && declineButtons) {
                    await buttonContainer.append(acceptButton);
                    await buttonContainer.append(declineButtons);
                }
            }

            // Only create the common div if not skipped
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
                    }
                }
            }

            // Set bannerAdded to true in sessionStorage
            // COMMENTED OUT: localStorage.setItem('bannerAdded', 'true');
            sessionStorage.setItem('bannerAdded', 'true');

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('bannerAddedChanged'));

            // webflow.notify({ type: "Success", message: "ConsentBit banner added successfully!" });


        } catch (error) {
            webflow.notify({ type: "error", message: "An error occurred while creating the cookie banner." });
        }
    } catch (error) {
        webflow.notify({ type: "error", message: "An error occurred while creating the cookie banner." });
    } finally {
        clearTimeout(overallTimeout);
    }
};

export default createCookieccpaPreferences
