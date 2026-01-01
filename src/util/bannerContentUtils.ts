import { BannerConfig } from './bannerStyleUtils';
import { createBannerElement } from './bannerElementUtils';
import { getTranslation } from '../util/translation-utils';
import webflow from '../types/webflowtypes';

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

// Helper to get or create the close icon asset (X-Vector.svg) with dynamic color
export const getOrCreateCloseIconAsset = async (backgroundColor: string): Promise<any> => {
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

    const xVectorIcon = new URL("../assets/X-Vector.svg", import.meta.url).href;
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
    throw error;
  }
};

export const createCloseButton = async (contentConfig: ContentConfig) => {
  const { selectedElement, config } = contentConfig;
  
  if (!config.toggleStates.closebutton) {
    return null;
  }

  const closeButton = await createBannerElement(selectedElement, {
    domId: 'close-button',
    elementType: 'div', // Use div instead of paragraph to avoid default text
    textContent: '', // No text, only SVG icon
    customAttributes: {
      'consentbit': 'close'
    }
  });

  // Create Image element and set X-Vector.svg as asset (same approach as toggle icon)
  if (closeButton) {
    try {
      // Create the image element
      const imageElement = await (closeButton as any).append(webflow.elementPresets.Image);
      
      if (!imageElement) {
        throw new Error("Failed to create image element");
      }

      // Create the asset in Webflow with color based on background
      const asset = await getOrCreateCloseIconAsset(config.color);
      
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
    } catch (error) {
      // Failed to set SVG icon for close button
    }
  }

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
    throw error;
  }
};
