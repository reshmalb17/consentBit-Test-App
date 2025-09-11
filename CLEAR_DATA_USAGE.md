# Clear Data on Reload Functionality

This document explains how to use the clear data functionality implemented in the application.

## Available Methods

### 1. URL Parameter Method
Add `?clearData=true` to the URL to clear all localStorage and sessionStorage data on page load.

**Example:**
```
https://your-app.com/?clearData=true
```

This will:
- Clear all localStorage data
- Clear all sessionStorage data  
- Remove the parameter from URL
- Reload the page with clean state

### 2. Keyboard Shortcut
Press `Ctrl+Shift+R` to immediately clear all data and reload the page.

### 3. Programmatic Methods

#### Clear data immediately:
```javascript
import { clearAllPersistentData } from './hooks/usePersistentState';

// Clear all data immediately
clearAllPersistentData();
```

#### Enable auto-clear on every reload:
```javascript
import { enableAutoClearOnReload } from './hooks/usePersistentState';

// Enable automatic clearing on every page reload
enableAutoClearOnReload();
```

#### Disable auto-clear:
```javascript
import { disableAutoClearOnReload } from './hooks/usePersistentState';

// Disable automatic clearing
disableAutoClearOnReload();
```

#### Check if auto-clear is enabled:
```javascript
import { checkAndHandleAutoClear } from './hooks/usePersistentState';

// This is automatically called on app startup
const wasCleared = checkAndHandleAutoClear();
```

## What Data Gets Cleared

The clear functionality removes:

### localStorage Keys:
- All authentication data (`consentbit-userinfo`, `siteInfo`, `explicitly_logged_out`)
- All banner configuration data (colors, fonts, styles, etc.)
- All UI state data (active tabs, toggles, etc.)
- All user preferences and settings
- All site-specific data (prefixed with site ID)
- All script and cookie data

### sessionStorage:
- All session-specific data

### Persistent State Data:
All data managed by the `usePersistentState` hook, including:
- `color`, `bgColor`, `btnColor`, `paraColor`, `secondcolor`, etc.
- `activeTab`, `selectedOptions`, `toggleStates`
- `isBannerAdded`, `fetchScripts`, `skipWelcomeScreen`
- `animation`, `language`, `buttonText`
- And many more application state variables

## Browser Console Commands

You can also use these commands in the browser console:

```javascript
// Clear all data immediately
clearAllPersistentData();

// Enable auto-clear on reload
enableAutoClearOnReload();

// Disable auto-clear
disableAutoClearOnReload();

// Check current status
```

## Important Notes

1. **Data Loss**: This functionality permanently removes ALL application data. Make sure users understand this before using.

2. **Auto-reload**: Most methods automatically reload the page to ensure a clean state.

3. **Confirmation**: Interactive methods show confirmation dialogs to prevent accidental data loss.

4. **Development**: This is primarily intended for development and testing purposes.

5. **Persistence**: The auto-clear setting persists across sessions until explicitly disabled.

## Use Cases

- **Development**: Clear all test data between development sessions
- **Testing**: Reset application to initial state for testing
- **Debugging**: Clear potentially corrupted localStorage data
- **Demo**: Reset application for clean demonstrations
- **User Request**: Allow users to reset their settings completely

## Example Implementation

```javascript
// In a component
import { clearAllPersistentData, enableAutoClearOnReload } from './hooks/usePersistentState';

const ResetButton = () => {
  const handleReset = () => {
    if (confirm('This will clear all your data. Continue?')) {
      clearAllPersistentData();
      window.location.reload();
    }
  };

  return <button onClick={handleReset}>Reset All Data</button>;
};
```
