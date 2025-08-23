import { BannerConfig } from './bannerStyleUtils';
import { createBannerElement } from './bannerElementUtils';
import { getTranslation } from '../util/translation-utils';

export interface ContentConfig {
  selectedElement: any;
  config: BannerConfig;
  translations: any;
}

export const createBannerHeading = async (contentConfig: ContentConfig) => {
  const { selectedElement, config, translations } = contentConfig;
  
  const heading = await createBannerElement(selectedElement, {
    domId: 'banner-heading',
    elementType: 'heading',
    textContent: translations[config.language as keyof typeof translations]?.heading || "Cookie Settings",
    customAttributes: {}
  });

  return heading;
};

export const createBannerParagraph = async (contentConfig: ContentConfig) => {
  const { selectedElement, config, translations } = contentConfig;
  
  const paragraph = await createBannerElement(selectedElement, {
    domId: 'banner-paragraph',
    elementType: 'paragraph',
    textContent: translations[config.language as keyof typeof translations]?.description || "We use cookies to provide you with the best possible experience. They also allow us to analyze user behavior in order to constantly improve the website for you.",
    customAttributes: {}
  });

  return paragraph;
};

export const createBannerButtons = async (contentConfig: ContentConfig) => {
  const { selectedElement, config, translations } = contentConfig;
  
  const buttons = [];

  // Create preferences button
  const preferencesButton = await createBannerElement(selectedElement, {
    domId: 'preferences-btn',
    elementType: 'button',
    textContent: translations[config.language as keyof typeof translations]?.preferences || "Preferences",
    customAttributes: {}
  });
  buttons.push(preferencesButton);

  // Create reject button
  const rejectButton = await createBannerElement(selectedElement, {
    domId: 'decline-btn',
    elementType: 'button',
    textContent: translations[config.language as keyof typeof translations]?.reject || "Reject",
    customAttributes: {}
  });
  buttons.push(rejectButton);

  // Create accept button
  const acceptButton = await createBannerElement(selectedElement, {
    domId: 'accept-btn',
    elementType: 'button',
    textContent: translations[config.language as keyof typeof translations]?.accept || "Accept",
    customAttributes: {}
  });
  buttons.push(acceptButton);

  return buttons;
};

export const createCloseButton = async (contentConfig: ContentConfig) => {
  const { selectedElement, config } = contentConfig;
  
  if (!config.toggleStates.closebutton) {
    return null;
  }

  const closeButton = await createBannerElement(selectedElement, {
    domId: 'close-button',
    elementType: 'paragraph',
    textContent: 'X',
    customAttributes: {
      'consentbit': 'close'
    }
  });

  return closeButton;
};

export const createBannerContent = async (contentConfig: ContentConfig) => {
  const { selectedElement, config, translations } = contentConfig;
  
  try {
    // Create inner div
    const innerDiv = await createBannerElement(selectedElement, {
      domId: 'inner-div',
      elementType: 'div',
      customAttributes: {}
    });

    // Create heading
    const heading = await createBannerHeading(contentConfig);

    // Create close button if enabled
    const closeButton = await createCloseButton(contentConfig);

    // Create paragraph
    const paragraph = await createBannerParagraph(contentConfig);

    // Create button container
    const buttonContainer = await createBannerElement(selectedElement, {
      domId: 'button-container',
      elementType: 'div',
      customAttributes: {}
    });

    // Create buttons
    const buttons = await createBannerButtons(contentConfig);

    return {
      innerDiv,
      heading,
      closeButton,
      paragraph,
      buttonContainer,
      buttons
    };
  } catch (error) {
    console.error("Error creating banner content:", error);
    throw error;
  }
};

export const appendBannerContent = async (
  bannerContainer: any,
  content: {
    innerDiv: any;
    heading: any;
    closeButton: any;
    paragraph: any;
    buttonContainer: any;
    buttons: any[];
  }
) => {
  try {
    const { innerDiv, heading, closeButton, paragraph, buttonContainer, buttons } = content;

    // Append elements to banner container
    if (bannerContainer.append) {
      await bannerContainer.append(innerDiv);
      
      if (closeButton) {
        await bannerContainer.append(closeButton);
      }

      // Append content to inner div
      if (innerDiv.append) {
        await innerDiv.append(heading);
        await innerDiv.append(paragraph);
        await innerDiv.append(buttonContainer);

        // Append buttons to button container
        if (buttonContainer.append) {
          for (const button of buttons) {
            await buttonContainer.append(button);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error appending banner content:", error);
    throw error;
  }
};
