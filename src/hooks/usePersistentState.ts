import React, { useState, useEffect } from 'react';
import { getAuthStorageItem, setAuthStorageItem, removeAuthStorageItem } from '../util/authStorage';

// Function to migrate old data to new site-specific format
function migrateOldData(): void {
  if (typeof window === 'undefined') return;
  
  const migrationKey = 'migration_done';
  // COMMENTED OUT: if (localStorage.getItem(migrationKey)) {
  if (getAuthStorageItem(migrationKey)) {
    return; // Migration already done
  }
  
  // Only migrate wf_hybrid_user to consentbit-userinfo
  // COMMENTED OUT: const oldWfHybridUser = localStorage.getItem('wf_hybrid_user');
  const oldWfHybridUser = getAuthStorageItem('wf_hybrid_user');
  if (oldWfHybridUser !== null) {
    // Migrate wf_hybrid_user to consentbit-userinfo
    // COMMENTED OUT: localStorage.setItem('consentbit-userinfo', oldWfHybridUser);
    setAuthStorageItem('consentbit-userinfo', oldWfHybridUser);
    // COMMENTED OUT: localStorage.removeItem('wf_hybrid_user');
    removeAuthStorageItem('wf_hybrid_user');
  }

  // Mark migration as complete
  // COMMENTED OUT: localStorage.setItem(migrationKey, 'true');
  setAuthStorageItem(migrationKey, 'true');
}

// Function to get key with site-specific storage for certain keys
function getSiteSpecificKey(key: string): string {
  // For siteInfo, we need site-specific storage to handle multiple sites
  if (key === 'siteInfo') {
    const currentSiteId = getAuthStorageItem('currentSiteId');
    if (currentSiteId) {
      return `siteInfo_${currentSiteId}`;
    }
    // Fallback to old key for backward compatibility
    return 'siteInfo';
  }
  
  // For other keys, use simple approach
  return key;
}

// Utility function to get current site ID
export function getCurrentSiteId(): string {
  if (typeof window === 'undefined') return 'default';
  
  // Check if user is authorized first
  // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
  const userInfo = getAuthStorageItem('consentbit-userinfo');
  if (!userInfo) {
    // User not authorized - return default
    return 'default';
  }
  
  try {
    const parsed = JSON.parse(userInfo);
    // Check if user has valid session token, email, and siteId
    if (!parsed?.sessionToken || !parsed?.email || !parsed?.siteId) {
      // User not properly authorized - return default
      return 'default';
    }
  } catch (error) {
    // Invalid auth data - return default
    return 'default';
  }
  
  // User is authorized - now get site ID
  // First try to get current site ID from storage
  const currentSiteId = getAuthStorageItem('currentSiteId');
  if (currentSiteId) {
    return currentSiteId;
  }
  
  // Fallback to old siteInfo storage for backward compatibility
  const siteInfo = getAuthStorageItem('siteInfo');
  if (siteInfo) {
    try {
      const parsed = JSON.parse(siteInfo);
      return parsed.siteId || parsed.shortName || 'default';
    } catch (e) {
      return 'default';
    }
  }
  
  if (window.location.hostname) {
    const hostname = window.location.hostname;
    
    if (hostname.includes('webflow.com')) {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        return parts[0];
      }
    } else {
      return hostname.replace(/[^a-zA-Z0-9]/g, '_');
    }
  }
  
  return 'default';
}

// Utility function to clear all data for current site
export function clearCurrentSiteData(includeAuth: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  // Simple approach - clear all app-related keys
  const keysToRemove: string[] = [];
  
  // Clear all app-related keys (excluding auth unless requested)
  const appKeys = [
    'isWelcomeScreen', 'isSetUpStep', 'isWelcomeScipt', 'isConfirmPublish', 'isSuccessPublish', 'isCustomizationTab',
    'showPopup', 'showSuccessPopup', 'showAuthPopup', 'showLoadingPopup', 'showChoosePlan', 'showCSVExportAdvanced', 'showWelcomeScreen', 'showSetSetup', 'showPopupWelcomeSetup',
    'showTooltip', 'fadeOut', 'isExporting', 'isCSVButtonLoading', 'isSubscribed', 'fetchScripts',
    'userlocaldata', 'sessionTokenFromLocalStorage', 'script_isSaving', 'script_saveStatus', 'script_showPopup', 
    'script_isLoading', 'script_showAuthPopup', 'script_copiedScriptIndex', 'scriptContext_scripts',
    'bannerAddedThroughWelcome', 'skipWelcomeScreen', 'isBannerAdded', 'bannerAdded',
    'color', 'bgColor', 'btnColor', 'paraColor', 'secondcolor', 'bgColors', 'headColor', 'secondbuttontext', 'primaryButtonText',
    'size', 'font', 'weight', 'borderRadius', 'buttonRadius', 'cookieExpiration',
    'activeTab', 'activeMode', 'selected', 'selectedOption', 'selectedOptions', 'selectedtext', 'style',
    'expires', 'buttonText', 'animation', 'easing', 'language', 'toggleStates'
  ];
  
  appKeys.forEach(key => {
    // COMMENTED OUT: if (localStorage.getItem(key) !== null) {
    if (getAuthStorageItem(key) !== null) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Also clear authentication data if requested
  if (includeAuth) {
    const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo'];
    authKeys.forEach(key => {
      // COMMENTED OUT: if (localStorage.getItem(key) !== null) {
      if (getAuthStorageItem(key) !== null) {
        // COMMENTED OUT: localStorage.removeItem(key);
        removeAuthStorageItem(key);
        keysToRemove.push(key);
      }
    });
  }
}

// Utility function to clear ALL data including authentication
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  // Simple approach - clear all app-related keys and auth data
  const keysToRemove: string[] = [];
  
  // Clear all app-related keys
  const appKeys = [
    'isWelcomeScreen', 'isSetUpStep', 'isWelcomeScipt', 'isConfirmPublish', 'isSuccessPublish', 'isCustomizationTab',
    'showPopup', 'showSuccessPopup', 'showAuthPopup', 'showLoadingPopup', 'showChoosePlan', 'showCSVExportAdvanced', 'showWelcomeScreen', 'showSetSetup', 'showPopupWelcomeSetup',
    'showTooltip', 'fadeOut', 'isExporting', 'isCSVButtonLoading', 'isSubscribed', 'fetchScripts',
    'userlocaldata', 'sessionTokenFromLocalStorage', 'script_isSaving', 'script_saveStatus', 'script_showPopup', 
    'script_isLoading', 'script_showAuthPopup', 'script_copiedScriptIndex', 'scriptContext_scripts',
    'bannerAddedThroughWelcome', 'isBannerAdded', 'skipWelcomeScreen', 'bannerAdded',
    'color', 'bgColor', 'btnColor', 'paraColor', 'secondcolor', 'bgColors', 'headColor', 'secondbuttontext', 'primaryButtonText',
    'size', 'font', 'weight', 'borderRadius', 'buttonRadius', 'cookieExpiration',
    'activeTab', 'activeMode', 'selected', 'selectedOption', 'selectedOptions', 'selectedtext', 'style',
    'expires', 'buttonText', 'animation', 'easing', 'language', 'toggleStates'
  ];
  
  appKeys.forEach(key => {
    // COMMENTED OUT: if (localStorage.getItem(key) !== null) {
    if (getAuthStorageItem(key) !== null) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Clear authentication data
  const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo'];
  authKeys.forEach(key => {
    // COMMENTED OUT: if (localStorage.getItem(key) !== null) {
    if (getAuthStorageItem(key) !== null) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
      keysToRemove.push(key);
    }
  });
}

// Utility function to clear only authentication data
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo', 'explicitly_logged_out'];
  const keysToRemove: string[] = [];
  
  authKeys.forEach(key => {
    // COMMENTED OUT: if (localStorage.getItem(key) !== null) {
    if (getAuthStorageItem(key) !== null) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Also clear any site-specific auth keys
  // COMMENTED OUT: for (let i = 0; i < localStorage.length; i++) {
  for (let i = 0; i < sessionStorage.length; i++) {
    // COMMENTED OUT: const key = localStorage.key(i);
    const key = sessionStorage.key(i);
    if (key && (key.includes('consentbit-userinfo') || key.includes('wf_hybrid_user'))) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
      keysToRemove.push(key);
    }
  }
  

}

// Utility function to clear ALL localStorage data on reload
export function clearAllDataOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Set flag to indicate data should be cleared on next load
    // COMMENTED OUT: localStorage.setItem('__clear_on_reload__', 'true');
    setAuthStorageItem('__clear_on_reload__', 'true');
    
    // Clear everything immediately
    // COMMENTED OUT: localStorage.clear();
    sessionStorage.clear();
    
    // Also clear any session storage if used
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
  } catch (error) {
    // Silent error handling
  }
}

// Function to check and handle clear on reload flag
export function handleClearOnReload(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // COMMENTED OUT: const shouldClear = localStorage.getItem('__clear_on_reload__');
    const shouldClear = getAuthStorageItem('__clear_on_reload__');
    
    if (shouldClear === 'true') {
      // Clear everything
      // COMMENTED OUT: localStorage.clear();
      sessionStorage.clear();
      
      // Also clear session storage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

// Enhanced function to clear all persistent data except authentication
export function clearAllPersistentData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Authentication keys to preserve
    const authKeysToPreserve = [
      'consentbit-userinfo',
      'siteInfo', 
      'explicitly_logged_out'
    ];
    
    // Save authentication data temporarily
    const preservedData: Record<string, string | null> = {};
    authKeysToPreserve.forEach(key => {
      // COMMENTED OUT: preservedData[key] = localStorage.getItem(key);
      preservedData[key] = getAuthStorageItem(key);
    });
    
    // Get all sessionStorage keys first
    const allKeys: string[] = [];
    // COMMENTED OUT: for (let i = 0; i < localStorage.length; i++) {
    for (let i = 0; i < sessionStorage.length; i++) {
      // COMMENTED OUT: const key = localStorage.key(i);
      const key = sessionStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    
    // Clear all keys
    allKeys.forEach(key => {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
    });
    
    // Restore authentication data
    authKeysToPreserve.forEach(key => {
      if (preservedData[key] !== null) {
        // COMMENTED OUT: localStorage.setItem(key, preservedData[key]!);
        setAuthStorageItem(key, preservedData[key]!);
      }
    });
    
    // Also clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    const clearedCount = allKeys.length - authKeysToPreserve.filter(key => preservedData[key] !== null).length;
  } catch (error) {
    // Silent error handling
  }
}

// Function to clear ALL data including authentication (complete reset)
export function clearAllDataIncludingAuth(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all localStorage data
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    
    allKeys.forEach(key => {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
    });
    
    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
  } catch (error) {
    // Silent error handling
  }
}

// Function to enable automatic clearing on every page reload
export function enableAutoClearOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // COMMENTED OUT: localStorage.setItem('__auto_clear_enabled__', 'true');
    setAuthStorageItem('__auto_clear_enabled__', 'true');
  } catch (error) {
    // Silent error handling
  }
}

// Function to disable automatic clearing on page reload
export function disableAutoClearOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // COMMENTED OUT: localStorage.removeItem('__auto_clear_enabled__');
    removeAuthStorageItem('__auto_clear_enabled__');
  } catch (error) {
    // Silent error handling
  }
}

// Function to check if auto-clear is enabled and handle it
export function checkAndHandleAutoClear(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // COMMENTED OUT: const autoClearEnabled = localStorage.getItem('__auto_clear_enabled__');
    const autoClearEnabled = getAuthStorageItem('__auto_clear_enabled__');
    
    if (autoClearEnabled === 'true') {
      // Temporarily save the auto-clear flag
      const tempFlag = autoClearEnabled;
      
      // Clear all data
      clearAllPersistentData();
      
      // Restore the auto-clear flag so it persists
      // COMMENTED OUT: localStorage.setItem('__auto_clear_enabled__', tempFlag);
      setAuthStorageItem('__auto_clear_enabled__', tempFlag);
      
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

// Utility function to set site info after authorization
export function setSiteInfoAfterAuth(siteInfo: { siteId: string; siteName: string; shortName: string }): void {
  if (typeof window === 'undefined') return;
  
  // Check if user is authorized
  // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
  const userInfo = getAuthStorageItem('consentbit-userinfo');
  if (!userInfo) {
    return;
  }
  
  try {
    const parsed = JSON.parse(userInfo);
    if (!parsed?.sessionToken || !parsed?.firstName || !parsed?.email) {
      return;
    }
  } catch (error) {
    return;
  }
  
  // User is authorized - set site info
  // COMMENTED OUT: localStorage.setItem('siteInfo', JSON.stringify(siteInfo));
  setAuthStorageItem('siteInfo', JSON.stringify(siteInfo));
}

// Utility function to check if user can set site info
export function canSetSiteInfo(): boolean {
  if (typeof window === 'undefined') return false;
  
  // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
  const userInfo = getAuthStorageItem('consentbit-userinfo');
  if (!userInfo) return false;
  
  try {
    const parsed = JSON.parse(userInfo);
    return !!(parsed?.sessionToken && parsed?.firstName && parsed?.email);
  } catch (error) {
    return false;
  }
}

// Debug function to check auth status
export function debugAuthStatus(): void {
  if (typeof window === 'undefined') return;
  
  // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
  const userInfo = getAuthStorageItem('consentbit-userinfo');
  // COMMENTED OUT: const wfHybridUser = localStorage.getItem('wf_hybrid_user');
  const wfHybridUser = getAuthStorageItem('wf_hybrid_user');
  // COMMENTED OUT: const siteInfo = localStorage.getItem('siteInfo');
  const siteInfo = getAuthStorageItem('siteInfo');
  // COMMENTED OUT: const explicitlyLoggedOut = localStorage.getItem('explicitly_logged_out');
  const explicitlyLoggedOut = getAuthStorageItem('explicitly_logged_out');
  
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
    } catch (error) {
      // Auth data is corrupted
    }
  }
  
  if (wfHybridUser) {
    try {
      const parsed = JSON.parse(wfHybridUser);
    } catch (error) {
      // Auth data is corrupted
    }
  }
}

// Force clear all auth data and prevent restoration
export function forceClearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all auth-related keys
  const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo', 'explicitly_logged_out'];
  // COMMENTED OUT: authKeys.forEach(key => localStorage.removeItem(key));
  authKeys.forEach(key => removeAuthStorageItem(key));
  
  // Clear any site-specific auth keys
  // COMMENTED OUT: for (let i = 0; i < localStorage.length; i++) {
  for (let i = 0; i < sessionStorage.length; i++) {
    // COMMENTED OUT: const key = localStorage.key(i);
    const key = sessionStorage.key(i);
    if (key && (key.includes('consentbit-userinfo') || key.includes('wf_hybrid_user'))) {
      // COMMENTED OUT: localStorage.removeItem(key);
      removeAuthStorageItem(key);
    }
  }
  
  // Set explicitly logged out flag to prevent restoration
  // COMMENTED OUT: localStorage.setItem('explicitly_logged_out', 'true');
  setAuthStorageItem('explicitly_logged_out', 'true');
  

}

// Utility function to clear authentication data if user is not authorized
export function clearAuthIfNotAuthorized(): void {
  if (typeof window === 'undefined') return;
  
  // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
  const userInfo = getAuthStorageItem('consentbit-userinfo');
  if (!userInfo) {
    return;
  }
  
  try {
    const parsed = JSON.parse(userInfo);
    // Check if user has valid session token, email, and siteId
    if (!parsed?.sessionToken || !parsed?.email || !parsed?.siteId) {
      clearAuthData();
      // Also clear site info if user is not authorized
      // COMMENTED OUT: localStorage.removeItem('siteInfo');
      removeAuthStorageItem('siteInfo');
    }
  } catch (error) {
    clearAuthData();
    // Also clear site info if auth data is corrupted
    // COMMENTED OUT: localStorage.removeItem('siteInfo');
    removeAuthStorageItem('siteInfo');
  }
}

// Utility function to list all data for current site
export function listCurrentSiteData(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  
  const siteId = getCurrentSiteId();
  const siteData: Record<string, any> = {};
  
  // COMMENTED OUT: for (let i = 0; i < localStorage.length; i++) {
  for (let i = 0; i < sessionStorage.length; i++) {
    // COMMENTED OUT: const key = localStorage.key(i);
    const key = sessionStorage.key(i);
    if (key && key.startsWith(`${siteId}_`)) {
      try {
        // COMMENTED OUT: const value = localStorage.getItem(key);
        const value = getAuthStorageItem(key);
        siteData[key] = value ? JSON.parse(value) : value;
      } catch (e) {
        // COMMENTED OUT: siteData[key] = localStorage.getItem(key);
        siteData[key] = getAuthStorageItem(key);
      }
    }
  }
  
  return siteData;
}

// Utility function to check migration status
export function checkMigrationStatus(): { migrated: boolean; oldKeysFound: number; newKeysFound: number } {
  if (typeof window === 'undefined') return { migrated: false, oldKeysFound: 0, newKeysFound: 0 };
  
  const migrationKey = 'migration_done';
  // COMMENTED OUT: const migrated = localStorage.getItem(migrationKey) === 'true';
  const migrated = getAuthStorageItem(migrationKey) === 'true';
  
  // Only check for wf_hybrid_user migration
  // COMMENTED OUT: const oldKeysFound = localStorage.getItem('wf_hybrid_user') !== null ? 1 : 0;
  const oldKeysFound = getAuthStorageItem('wf_hybrid_user') !== null ? 1 : 0;
  // COMMENTED OUT: const newKeysFound = localStorage.getItem('consentbit-userinfo') !== null ? 1 : 0;
  const newKeysFound = getAuthStorageItem('consentbit-userinfo') !== null ? 1 : 0;
  
  return { migrated, oldKeysFound, newKeysFound };
}

// Utility function to force migration
export function forceMigration(): void {
  if (typeof window === 'undefined') return;
  
  const migrationKey = 'migration_done';
  // COMMENTED OUT: localStorage.removeItem(migrationKey); // Remove migration flag
  removeAuthStorageItem(migrationKey); // Remove migration flag
  migrateOldData(); // Run migration again
}

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Skip migration since we clear all localStorage on every reload
  // migrateOldData();
  
  const siteSpecificKey = getSiteSpecificKey(key);
  
  // Check if user is authorized for siteInfo
  const isAuthorized = (() => {
    if (key === 'siteInfo') {
      // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
      const userInfo = getAuthStorageItem('consentbit-userinfo');
      if (!userInfo) return false;
      
      try {
        const parsed = JSON.parse(userInfo);
        return !!(parsed?.sessionToken && parsed?.firstName && parsed?.email);
      } catch (error) {
        return false;
      }
    }
    return true; // For other keys, allow setting
  })();
  
  // Track if value was explicitly set (not just initialized with default)
  const wasExplicitlySet = React.useRef(false);

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    // If not authorized for siteInfo, return default value
    if (key === 'siteInfo' && !isAuthorized) {
      return defaultValue;
    }
    
    try {
      // First try to get from new site-specific key
      // COMMENTED OUT: let savedState = localStorage.getItem(siteSpecificKey);
      let savedState = getAuthStorageItem(siteSpecificKey);
      
      // Simple approach - no migration logic
      if (!savedState && key !== 'siteInfo') {
        // Only handle wf_hybrid_user -> consentbit-userinfo migration
        if (key === 'consentbit-userinfo') {
          // COMMENTED OUT: savedState = localStorage.getItem('wf_hybrid_user');
          savedState = getAuthStorageItem('wf_hybrid_user');
          if (savedState) {
            // COMMENTED OUT: localStorage.setItem(siteSpecificKey, savedState);
            setAuthStorageItem(siteSpecificKey, savedState);
            // COMMENTED OUT: localStorage.removeItem('wf_hybrid_user');
            removeAuthStorageItem('wf_hybrid_user');
          }
        }
      }
      
      if (!savedState || savedState === "undefined") return defaultValue;
      return JSON.parse(savedState);
    } catch (e) {
      return defaultValue;
    }
  });

  // Create a wrapped setState that respects authorization
  const authorizedSetState = React.useCallback((newState: React.SetStateAction<T>) => {
    // For siteInfo, only allow setting if authorizedS
    if (key === 'siteInfo' && !isAuthorized) {
      return;
    }
    
    // Mark that this value was explicitly set (not just initialized)
    wasExplicitlySet.current = true;
    
    // Always update the state, but localStorage will be handled in useEffect
    setState(newState);
  }, [key, isAuthorized]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Special handling for siteInfo - only allow setting if user is authorized
      if (key === 'siteInfo') {
        // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
        const userInfo = getAuthStorageItem('consentbit-userinfo');
        if (!userInfo) {
          return;
        }
        
        try {
          const parsed = JSON.parse(userInfo);
          if (!parsed?.sessionToken || !parsed?.email) {
            return;
          }
        } catch (error) {
          return;
        }
      }
      
      // Check if user is authenticated before saving any data
      // COMMENTED OUT: const userInfo = localStorage.getItem('consentbit-userinfo');
      const userInfo = getAuthStorageItem('consentbit-userinfo');
      const isUserAuthenticated = (() => {
        if (!userInfo) return false;
        try {
          const parsed = JSON.parse(userInfo);
          return !!(parsed?.sessionToken && parsed?.email);
        } catch {
          return false;
        }
      })();
      
      // Only save to sessionStorage if:
      // 1. User is authenticated, OR
      // 2. Value was explicitly set (not just initialized), OR
      // 3. We're loading an existing value from sessionStorage
      if (isUserAuthenticated || wasExplicitlySet.current) {
        // COMMENTED OUT: localStorage.setItem(siteSpecificKey, JSON.stringify(state));
        setAuthStorageItem(siteSpecificKey, JSON.stringify(state));
      }
    }
  }, [siteSpecificKey, state, key]);

  return [state, authorizedSetState];
}

export { usePersistentState };
