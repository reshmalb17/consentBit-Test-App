# Webflow Designer API Usage Documentation

## Overview

This document provides a comprehensive explanation of where and how Webflow Designer APIs are used in the ConsentBit application. The Designer APIs enable the app to interact with the Webflow Designer environment, allowing it to read site information, manipulate elements, create styles, manage assets, and perform various design operations.

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Site Information APIs](#site-information-apis)
3. [Element Manipulation APIs](#element-manipulation-apis)
4. [Style Management APIs](#style-management-apis)
5. [Asset Management APIs](#asset-management-apis)
6. [Page Management APIs](#page-management-apis)
7. [Publishing APIs](#publishing-apis)
8. [Notification APIs](#notification-apis)
9. [Variable Collection APIs](#variable-collection-apis)
10. [File Locations](#file-locations)

---

## Authentication APIs

### `webflow.getIdToken()`

**Purpose**: Retrieves an ID token from Webflow for user authentication.

**Where Used**:
- `src/hooks/userAuth.ts` (Lines 214, 280)
- `src/hooks/userAuthCopy.ts` (Lines 205, 273)
- `src/components/Script.tsx` (Line 158)

**Usage Details**:
- **Primary Use**: Exchanging Webflow ID tokens for session tokens with the ConsentBit backend
- **Authentication Flow**:
  1. User initiates authentication
  2. App calls `webflow.getIdToken()` to get Webflow ID token
  3. ID token is sent to ConsentBit backend (`/api/auth/token`)
  4. Backend validates token and returns session token
  5. Session token is stored for subsequent API calls

**Example Implementation**:
```typescript
// From userAuth.ts
const idToken = await webflow.getIdToken();
const response = await fetch(`${base_url}/api/auth/token`, {
  method: "POST",
  body: JSON.stringify({ idToken, siteId: siteInfo.siteId }),
});
```

**Why It's Needed**: 
- Enables secure authentication without requiring users to manually enter credentials
- Validates that the user is authenticated within the Webflow Designer
- Provides site-specific authentication context

---

## Site Information APIs

### `webflow.getSiteInfo()`

**Purpose**: Retrieves information about the current Webflow site being edited.

**Where Used**:
- `src/hooks/userAuth.ts` (Lines 46, 211, 277, 448)
- `src/App.tsx` (Lines 128, 305, 352, 391, 587, 691)
- `src/components/CustomizationTab.tsx` (Lines 822, 1616, 1665, 2749, 3041, 3245, 3325)
- `src/components/WelcomeScreen.tsx` (Line 101)
- `src/components/WelcomeScript.tsx` (Line 145)
- `src/components/Script.tsx` (Lines 84, 103, 164, 258, 389)
- `src/hooks/useBannerCreation.ts` (Line 770)
- `src/hooks/userAuthCopy.ts` (Lines 141, 211, 279, 408)

**Usage Details**:
- **Returns**: Object containing:
  - `siteId`: Unique identifier for the site
  - `siteName`: Full name of the site
  - `shortName`: Short identifier for the site
  - `url`: Site URL
  - `domains`: Array of domain information
  - `workspaceId`: Workspace identifier
  - Additional metadata

**Primary Use Cases**:
1. **Authentication Context**: Validates site context before authentication
2. **Site-Specific Data Storage**: Uses `siteId` to store site-specific banner configurations
3. **Multi-Site Support**: Enables the app to work across different Webflow sites
4. **Banner Registration**: Associates banner scripts with specific sites
5. **Navigation Links**: Generates links to Webflow dashboard pages

**Example Implementation**:
```typescript
// From userAuth.ts - Site context validation
const ensureSiteContext = async () => {
  const siteInfo = await webflow.getSiteInfo();
  if (!siteInfo?.siteId) {
    throw new Error('No site context available');
  }
  return siteInfo;
};
```

**Why It's Needed**:
- Ensures the app operates in the correct site context
- Enables site-specific data isolation
- Required for proper authentication and data management

---

## Element Manipulation APIs

### `webflow.getSelectedElement()`

**Purpose**: Gets the currently selected element in the Webflow Designer.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Lines 1010, 2311, 2992, 3584, 3597, 3770, 3789)
- `src/components/ConfirmPublish.tsx` (Lines 215, 227)
- `src/hooks/useBannerCreation.ts` (Multiple locations)

**Usage Details**:
- **Returns**: Promise resolving to the selected element object with methods like:
  - `append()`: Add child elements
  - `prepend()`: Add element before
  - `setStyles()`: Apply styles
  - `setTextContent()`: Set text
  - `setAttribute()`: Set HTML attributes
  - `getChildren()`: Get child elements

**Primary Use Cases**:
1. **Banner Placement**: Determines where to insert the cookie consent banner
2. **Element Validation**: Checks if selected element can accept children
3. **Context-Aware Operations**: Performs operations relative to user's selection

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const selectedElement = await webflow.getSelectedElement();
if (!selectedElement) {
  webflow.notify({ type: "error", message: "No element selected" });
  return;
}
const newDiv = await selectedElement.prepend(webflow.elementPresets.DivBlock);
```

**Why It's Needed**:
- Provides intuitive user experience - banner is placed where user selects
- Enables precise control over banner placement
- Validates user intent before creating elements

---

### `webflow.getAllElements()`

**Purpose**: Retrieves all elements in the current page.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Lines 926, 1090, 1694, 1767, 1846, 1921, 2227, 2387)
- `src/hooks/useBannerCreation.ts` (Lines 81, 334, 460)

**Usage Details**:
- **Returns**: Array of all elements in the page
- **Primary Use**: Finding existing banner elements to avoid duplicates

**Primary Use Cases**:
1. **Duplicate Detection**: Checks if a banner already exists before creating a new one
2. **Element Search**: Finds specific elements by ID or attributes
3. **Banner Cleanup**: Identifies and removes existing banner elements
4. **Structure Validation**: Verifies banner structure integrity

**Example Implementation**:
```typescript
// From useBannerCreation.ts
const allElements = await webflow.getAllElements();
let consentBitContainer = null;

for (const el of allElements) {
  const domId = await el.getDomId();
  if (domId === 'consentbit-container') {
    consentBitContainer = el;
    break;
  }
}
```

**Why It's Needed**:
- Prevents duplicate banner creation
- Enables banner management and updates
- Validates page structure

---

### `webflow.elementPresets`

**Purpose**: Provides preset element builders for creating common HTML elements.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Multiple locations for creating banner elements)
- `src/hooks/useBannerCreation.ts` (Multiple locations)

**Available Presets**:
- `DivBlock`: Container div elements
- `Heading`: Heading elements (h1-h6)
- `Paragraph`: Paragraph elements
- `Button`: Button elements
- `LinkBlock`: Link/anchor elements
- `Image`: Image elements
- `FormBlock`, `Form`, `CheckboxField`: Form elements

**Primary Use Cases**:
1. **Banner Structure Creation**: Builds the complete cookie consent banner structure
2. **Element Composition**: Creates nested element hierarchies
3. **Dynamic Content**: Generates banner content based on user preferences

**Example Implementation**:
```typescript
// From CustomizationTab.tsx - Creating banner structure
const newDiv = await selectedElement.prepend(webflow.elementPresets.DivBlock);
const innerdiv = await newDiv.append(webflow.elementPresets.DivBlock);
const tempHeading = await innerdiv.append(webflow.elementPresets.Heading);
const tempParagraph = await innerdiv.append(webflow.elementPresets.Paragraph);
const prefrenceButton = await buttonContainer.append(webflow.elementPresets.LinkBlock);
```

**Why It's Needed**:
- Provides type-safe element creation
- Ensures elements are properly integrated with Webflow
- Enables programmatic banner generation

---

## Style Management APIs

### `webflow.createStyle(name: string)`

**Purpose**: Creates a new Webflow style (CSS class).

**Where Used**:
- `src/components/CustomizationTab.tsx` (Lines 1036, 1152, 1438, 2335, 2454, 2804)
- `src/hooks/useBannerCreation.ts` (Lines 293, 421, 572)

**Usage Details**:
- **Returns**: Promise resolving to a `WebflowStyle` object
- **Style Object Methods**:
  - `setProperty(prop, value)`: Set individual CSS property
  - `setProperties(props, options)`: Set multiple properties
  - `save()`: Persist style changes

**Primary Use Cases**:
1. **Banner Styling**: Creates styles for banner components (ConsentBit, consentCloseIcon, etc.)
2. **Dynamic Styling**: Generates styles based on user color preferences
3. **Responsive Design**: Creates breakpoint-specific styles

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const consentBitStyle = await webflow.getStyleByName("ConsentBit") || 
                       await webflow.createStyle("ConsentBit");
await consentBitStyle.setProperties({
  'background-color': bgColor,
  'border-radius': `${borderRadius}px`
});
await consentBitStyle.save();
```

**Why It's Needed**:
- Applies user-customized styling to banner elements
- Maintains consistent styling across banner components
- Enables responsive design customization

---

### `webflow.getStyleByName(name: string)`

**Purpose**: Retrieves an existing style by name.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Lines 1036, 1152, 1438, 2335, 2454, 2804)
- `src/hooks/useBannerCreation.ts` (Lines 293, 421, 572)

**Usage Details**:
- **Returns**: Promise resolving to `WebflowStyle | null`
- **Primary Use**: Check if style exists before creating new one

**Primary Use Cases**:
1. **Style Reuse**: Avoids creating duplicate styles
2. **Style Updates**: Modifies existing styles instead of creating new ones
3. **Banner Updates**: Updates banner styles when user changes preferences

**Example Implementation**:
```typescript
// Get or create style pattern
const getOrCreateStyle = async (name: string) => {
  return (await webflow.getStyleByName(name)) || 
         (await webflow.createStyle(name));
};
```

**Why It's Needed**:
- Prevents style duplication
- Enables style updates
- Maintains clean style organization

---

## Asset Management APIs

### `webflow.getAllAssets()`

**Purpose**: Retrieves all assets (images, files) in the Webflow site.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Line 128)
- `src/util/bannerContentUtils.ts` (Line 83)
- `src/hooks/gdprPreference.ts` (Lines 19, 63, 143)
- `src/hooks/ccpaPreference.ts` (Lines 17, 82)

**Usage Details**:
- **Returns**: Array of asset objects with `id`, `name`, and `url` properties
- **Primary Use**: Finding existing assets to avoid duplicates

**Primary Use Cases**:
1. **Close Icon Asset**: Checks if close icon SVG already exists
2. **Asset Reuse**: Reuses existing assets instead of creating duplicates
3. **Preference Center Assets**: Manages assets for GDPR/CCPA preference centers

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const assets = await webflow.getAllAssets();
const existingAsset = assets.find(asset => asset.name === assetName);
if (existingAsset) {
  return existingAsset;
}
// Create new asset if not found
const newAsset = await webflow.createAsset(file);
```

**Why It's Needed**:
- Manages banner-related assets (close icons, etc.)
- Prevents asset duplication
- Enables asset reuse across banners

---

### `webflow.createAsset(file: File)`

**Purpose**: Creates a new asset in Webflow from a file.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Line 171)
- `src/util/bannerContentUtils.ts`
- `src/hooks/gdprPreference.ts`
- `src/hooks/ccpaPreference.ts`

**Usage Details**:
- **Parameters**: File object (typically SVG for close icons)
- **Returns**: Promise resolving to asset object
- **Primary Use**: Creating close icon assets with custom colors

**Primary Use Cases**:
1. **Dynamic Close Icons**: Creates close icon SVGs with user-selected colors
2. **Preference Center Icons**: Generates icons for preference centers
3. **Custom Assets**: Creates site-specific assets

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const blob = new Blob([svgContent], { type: 'image/svg+xml' });
const file = new File([blob], `${assetName}.svg`, { type: 'image/svg+xml' });
const newAsset = await webflow.createAsset(file);
```

**Why It's Needed**:
- Enables dynamic asset generation
- Supports user customization (color-based icons)
- Manages banner visual assets

---

## Page Management APIs

### `webflow.getAllPagesAndFolders()`

**Purpose**: Retrieves all pages and folders in the Webflow site.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Line 783)

**Usage Details**:
- **Returns**: Array of page/folder objects with:
  - `id`: Unique identifier
  - `type`: "page" or "folder"
  - `getName()`: Method to get name
  - `url`: Page URL

**Primary Use Cases**:
1. **Page Selection**: Allows users to select specific pages for banner display
2. **Page-Specific Configuration**: Enables per-page banner settings
3. **Navigation**: Provides page structure for UI

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const pagesAndFolders = await webflow.getAllPagesAndFolders();
// Filter and display pages for user selection
```

**Why It's Needed**:
- Enables page-specific banner configuration
- Provides page structure information
- Supports selective banner deployment

---

### `webflow.getCurrentPage()`

**Purpose**: Gets information about the currently active page in the Designer.

**Where Used**:
- Defined in types but usage not found in current codebase (may be used in future features)

**Potential Use Cases**:
- Page-specific banner placement
- Current page context for operations
- Page-aware feature toggling

---

## Publishing APIs

### `webflow.publishSite(options?)`

**Purpose**: Publishes the Webflow site with optional domain configuration.

**Where Used**:
- Defined in types but direct usage not found (may be used via other components)

**Usage Details**:
- **Parameters**: Optional object with:
  - `customDomains`: Array of custom domain strings
  - `publishToWebflowSubdomain`: Boolean
- **Returns**: Promise with publish results

**Potential Use Cases**:
- Publishing site after banner creation
- Automated publishing workflows
- Domain-specific publishing

---

## Notification APIs

### `webflow.notify(options)`

**Purpose**: Displays notifications to the user in the Webflow Designer.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Lines 1012, 1029, 1128, 1584, 1587, 2311, 2328, 2425, 2979, 2983, 2994, 3772, 3791)
- `src/components/ConfirmPublish.tsx` (Lines 335, 362)
- `src/App.tsx` (Lines 428, 568)
- `src/hooks/useBannerCreation.ts` (Lines 375, 399, 406)

**Usage Details**:
- **Parameters**: Object with:
  - `type`: "info" | "error" | "Success"
  - `message`: Notification message string
- **Returns**: Promise

**Primary Use Cases**:
1. **Error Notifications**: Informs users of errors (e.g., no element selected, creation failures)
2. **Success Messages**: Confirms successful operations
3. **Info Messages**: Provides helpful information to users

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
if (!selectedElement) {
  webflow.notify({ 
    type: "error", 
    message: "No element selected in the Designer." 
  });
  return;
}
```

**Why It's Needed**:
- Provides user feedback for operations
- Improves user experience with clear error messages
- Confirms successful actions

---

## Variable Collection APIs

### `webflow.getDefaultVariableCollection()`

**Purpose**: Gets the default CSS variable collection for the site.

**Where Used**:
- `src/components/CustomizationTab.tsx` (Line 1169)

**Usage Details**:
- **Returns**: Promise resolving to collection object with:
  - `createColorVariable(name, value)`: Creates a color variable

**Primary Use Cases**:
1. **Color Variables**: Creates reusable color variables for banner styling
2. **Design System Integration**: Integrates banner colors with Webflow design system
3. **Consistent Theming**: Maintains color consistency across site

**Example Implementation**:
```typescript
// From CustomizationTab.tsx
const collection = await webflow.getDefaultVariableCollection();
await collection.createColorVariable("ConsentBit-Primary", btnColor);
```

**Why It's Needed**:
- Enables design system integration
- Supports reusable color variables
- Maintains design consistency

---

## File Locations

### Core API Usage Files

1. **Authentication**:
   - `src/hooks/userAuth.ts` - Main authentication hook
   - `src/hooks/userAuthCopy.ts` - Backup authentication implementation
   - `src/components/Script.tsx` - Script management with auth

2. **Banner Creation**:
   - `src/components/CustomizationTab.tsx` - Main customization interface (4479 lines)
   - `src/hooks/useBannerCreation.ts` - Banner creation logic
   - `src/util/bannerContentUtils.ts` - Banner utility functions

3. **Preference Centers**:
   - `src/hooks/gdprPreference.ts` - GDPR preference center creation
   - `src/hooks/ccpaPreference.ts` - CCPA preference center creation

4. **App Initialization**:
   - `src/App.tsx` - Main app component with initialization
   - `src/components/WelcomeScreen.tsx` - Welcome screen
   - `src/components/WelcomeScript.tsx` - Script welcome screen

5. **Type Definitions**:
   - `src/types/webflowtypes.ts` - Complete Webflow API type definitions

---

## API Usage Summary

### Most Frequently Used APIs

1. **`webflow.getSiteInfo()`** - Used in 15+ files
   - Critical for site context and authentication

2. **`webflow.getSelectedElement()`** - Used in 5+ files
   - Essential for banner placement

3. **`webflow.getAllElements()`** - Used in 3+ files
   - Important for duplicate detection and element management

4. **`webflow.elementPresets`** - Used extensively
   - Core to banner structure creation

5. **`webflow.createStyle()` / `webflow.getStyleByName()`** - Used in 3+ files
   - Critical for banner styling

6. **`webflow.getIdToken()`** - Used in 3+ files
   - Essential for authentication

7. **`webflow.notify()`** - Used in 5+ files
   - Important for user feedback

8. **`webflow.getAllAssets()`** - Used in 4+ files
   - Used for asset management

---

## Integration Patterns

### Common Patterns

1. **Get or Create Pattern**:
   ```typescript
   const style = await webflow.getStyleByName("StyleName") || 
                await webflow.createStyle("StyleName");
   ```

2. **Site Context Validation**:
   ```typescript
   const siteInfo = await webflow.getSiteInfo();
   if (!siteInfo?.siteId) {
     throw new Error('No site context');
   }
   ```

3. **Element Selection Validation**:
   ```typescript
   const element = await webflow.getSelectedElement();
   if (!element) {
     webflow.notify({ type: "error", message: "No selection" });
     return;
   }
   ```

4. **Duplicate Detection**:
   ```typescript
   const allElements = await webflow.getAllElements();
   const existing = allElements.find(el => /* condition */);
   if (existing) {
     // Handle existing element
   }
   ```

---

## Best Practices

1. **Always validate site context** before operations
2. **Check for existing elements/styles** before creating new ones
3. **Use notifications** to provide user feedback
4. **Handle errors gracefully** with try-catch blocks
5. **Validate element selection** before manipulation
6. **Reuse assets** when possible to avoid duplication

---

## References

- [Webflow Designer API Documentation](https://developers.webflow.com/designer/reference/introduction)
- Type definitions: `src/types/webflowtypes.ts`
- Main implementation: `src/components/CustomizationTab.tsx`

---

*Last Updated: Based on codebase analysis of ConsentBit V8*

