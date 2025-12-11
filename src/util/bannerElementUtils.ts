import webflow from '../types/webflowtypes';

export interface BannerElementConfig {
  domId: string;
  elementType: 'div' | 'heading' | 'paragraph' | 'button' | 'link';
  styleName?: string;
  textContent?: string;
  customAttributes?: Record<string, string>;
}

// Helper function to check if an element is a child/descendant of consentbit-container
const isElementChildOfContainer = async (element: any): Promise<boolean> => {
  try {
    if (!element) {
      return false;
    }

    // First, check if the element itself is the container
    try {
      if (typeof (element as any).getDomId === 'function') {
        const elementId = await (element as any).getDomId();
        if (elementId === 'consentbit-container') {
          return false; // Element is the container itself, not a child
        }
      }
    } catch (e) {
    }

    // Use getAllElements to find the container and check if element is inside it
    const allElements = await webflow.getAllElements();
    let consentBitContainer: any = null;

    // Find the consentbit-container
    for (const el of allElements) {
      try {
        if (typeof (el as any).getDomId === 'function') {
          const domId = await (el as any).getDomId();
          if (domId === 'consentbit-container') {
            consentBitContainer = el;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!consentBitContainer) {
      return false; // No container exists, so element can't be a child
    }

    // Check if element is inside the container by traversing up the parent chain
    const checkIfElementIsChild = async (parent: any, target: any, checked: Set<any>): Promise<boolean> => {
      if (checked.has(parent) || checked.has(target)) return false;
      checked.add(parent);

      try {
        if (parent === target) {
          return true;
        }

        const children = await parent.getChildren();
        if (children && children.length > 0) {
          for (const child of children) {
            if (child === target) {
              return true;
            }
            const isDescendant = await checkIfElementIsChild(child, target, checked);
            if (isDescendant) {
              return true;
            }
          }
        }
      } catch (e) {
        // Continue
      }
      return false;
    };

    const isInside = await checkIfElementIsChild(consentBitContainer, element, new Set());
    return isInside;
  } catch (error) {
    // Return false on error to be safe (don't block deletion if check fails)
    return false;
  }
};

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

    // Remove matching elements and children - ONLY if they are children of consentbit-container
    await Promise.all(matchingElements.map(async (el) => {
      try {
        // Check if element is a child of consentbit-container before deleting
        const isChild = await isElementChildOfContainer(el);
        if (!isChild) {
          return; // Skip deletion if not a child of container
        }

        const domId = await el.getDomId?.();
        const children = await el.getChildren?.();

        if (children?.length) {
          await Promise.all(children.map(child => child.remove()));
        }

        await el.remove();
      } catch (err) {
        // Error removing element
        webflow.notify({ type: "error", message: "Failed to remove a banner." });
      }
    }));
  } catch (error) {
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
    throw error;
  }
};
