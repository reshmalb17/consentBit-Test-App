import webflow from '../types/webflowtypes';

export interface BannerElementConfig {
  domId: string;
  elementType: 'div' | 'heading' | 'paragraph' | 'button' | 'link';
  styleName?: string;
  textContent?: string;
  customAttributes?: Record<string, string>;
}

export const cleanupExistingBanners = async (idsToCheck: string[]) => {
  try {
    const allElements = await webflow.getAllElements();
    
    // Run domId checks in parallel
    const domIdPromises = allElements.map(async (el) => {
      const domId = await el.getDomId?.();
      return { el, domId };
    });

    const elementsWithDomIds = await Promise.all(domIdPromises);

    // Filter matching elements
    const matchingElements = elementsWithDomIds
      .filter(({ domId }) => domId && idsToCheck.includes(domId))
      .map(({ el, domId }) => el);

    // Remove matching elements and children
    await Promise.all(matchingElements.map(async (el) => {
      try {
        const domId = await el.getDomId?.();
        const children = await el.getChildren?.();

        if (children?.length) {
          await Promise.all(children.map(child => child.remove()));
        }

        await el.remove();
      } catch (err) {
        console.error("Error removing element:", err);
        webflow.notify({ type: "error", message: "Failed to remove a banner." });
      }
    }));
  } catch (error) {
    console.error("Error cleaning up existing banners:", error);
    throw error;
  }
};

export const createBannerContainer = async (selectedElement: any, domId: string) => {
  try {
    const newDiv = await selectedElement.before(webflow.elementPresets.DivBlock);
    
    if (!newDiv) {
      throw new Error("Failed to create div.");
    }

    if ((newDiv as any).setDomId) {
      await (newDiv as any).setDomId(domId);
    }

    return newDiv;
  } catch (error) {
    console.error("Error creating banner container:", error);
    throw error;
  }
};

export const createBannerStyles = async (styleNames: Record<string, string>) => {
  try {
    const styles = await Promise.all(
      Object.values(styleNames).map(async (name) => {
        return (await webflow.getStyleByName(name)) || (await webflow.createStyle(name));
      })
    );

    return styles;
  } catch (error) {
    console.error("Error creating banner styles:", error);
    throw error;
  }
};

export const createBannerElement = async (
  selectedElement: any, 
  config: BannerElementConfig
) => {
  try {
    let element;
    
    switch (config.elementType) {
      case 'div':
        element = await selectedElement.before(webflow.elementPresets.DivBlock);
        break;
      case 'heading':
        element = await selectedElement.before(webflow.elementPresets.Heading);
        if (element && (element as any).setHeadingLevel) {
          await (element as any).setHeadingLevel(2);
        }
        break;
      case 'paragraph':
        element = await selectedElement.before(webflow.elementPresets.Paragraph);
        break;
      case 'button':
        element = await selectedElement.before(webflow.elementPresets.Button);
        break;
      case 'link':
        element = await selectedElement.before(webflow.elementPresets.LinkBlock);
        break;
      default:
        throw new Error(`Unsupported element type: ${config.elementType}`);
    }

    if (!element) {
      throw new Error(`Failed to create ${config.elementType} element`);
    }

    // Set text content if provided
    if (config.textContent && (element as any).setTextContent) {
      await (element as any).setTextContent(config.textContent);
    }

    // Set custom attributes if provided
    if (config.customAttributes) {
      for (const [key, value] of Object.entries(config.customAttributes)) {
        if ((element as any).setCustomAttribute) {
          await (element as any).setCustomAttribute(key, value);
        }
      }
    }

    return element;
  } catch (error) {
    console.error("Error creating banner element:", error);
    throw error;
  }
};