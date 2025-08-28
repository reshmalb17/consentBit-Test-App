import React, { useState, useEffect } from 'react';

// Function to migrate old data to new site-specific format
function migrateOldData(): void {
  if (typeof window === 'undefined') return;
  
  const migrationKey = 'migration_done';
  if (localStorage.getItem(migrationKey)) {
    return; // Migration already done
  }
  
  // Only migrate wf_hybrid_user to consentbit-userinfo
  const oldWfHybridUser = localStorage.getItem('wf_hybrid_user');
  if (oldWfHybridUser !== null) {
    // Migrate wf_hybrid_user to consentbit-userinfo
    localStorage.setItem('consentbit-userinfo', oldWfHybridUser);
    localStorage.removeItem('wf_hybrid_user');
  }

  // Mark migration as complete
  localStorage.setItem(migrationKey, 'true');
}

// Function to get key (simple approach - no site-specific storage)
function getSiteSpecificKey(key: string): string {
  // Simple approach - just return the key without any site-specific prefixing
  return key;
}

// Utility function to get current site ID
export function getCurrentSiteId(): string {
  if (typeof window === 'undefined') return 'default';
  
  // Check if user is authorized first
  const userInfo = localStorage.getItem('consentbit-userinfo');
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
  const siteInfo = localStorage.getItem('siteInfo');
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
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Also clear authentication data if requested
  if (includeAuth) {
    const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
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
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Clear authentication data
  const authKeys = ['consentbit-userinfo', 'wf_hybrid_user', 'siteInfo'];
  authKeys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
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
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      keysToRemove.push(key);
    }
  });
  
  // Also clear any site-specific auth keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('consentbit-userinfo') || key.includes('wf_hybrid_user'))) {
      localStorage.removeItem(key);
      keysToRemove.push(key);
    }
  }
  

}

// Utility function to clear ALL localStorage data on reload
export function clearAllDataOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Set flag to indicate data should be cleared on next load
    localStorage.setItem('__clear_on_reload__', 'true');
    
    // Clear everything immediately
    localStorage.clear();
    
    // Also clear any session storage if used
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    console.log('All localStorage and sessionStorage data cleared');
  } catch (error) {
    console.error('Error clearing storage data:', error);
  }
}

// Function to check and handle clear on reload flag
export function handleClearOnReload(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const shouldClear = localStorage.getItem('__clear_on_reload__');
    
    if (shouldClear === 'true') {
      // Clear everything
      localStorage.clear();
      
      // Also clear session storage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      console.log('Data cleared on reload as requested');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error handling clear on reload:', error);
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
      preservedData[key] = localStorage.getItem(key);
    });
    
    // Get all localStorage keys first
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    
    // Clear all keys
    allKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Restore authentication data
    authKeysToPreserve.forEach(key => {
      if (preservedData[key] !== null) {
        localStorage.setItem(key, preservedData[key]!);
      }
    });
    
    // Also clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    const clearedCount = allKeys.length - authKeysToPreserve.filter(key => preservedData[key] !== null).length;
    console.log(`Cleared ${clearedCount} localStorage keys (preserved ${authKeysToPreserve.filter(key => preservedData[key] !== null).length} auth keys) and all sessionStorage data`);
  } catch (error) {
    console.error('Error clearing persistent data:', error);
  }
}

// Import the lightweight storage solution
import { memoryStorage } from '../utils/memoryStorage';

// Function to clear ALL data including authentication (complete reset)
export function clearAllDataIncludingAuth(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear memory storage (our new lightweight solution)
    memoryStorage.clear();
    
    // Also clear localStorage for any remaining data
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    
    allKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    console.log(`Cleared ALL data: ${allKeys.length} localStorage keys, memory storage, and sessionStorage`);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

// Function to enable automatic clearing on every page reload
export function enableAutoClearOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('__auto_clear_enabled__', 'true');
    console.log('Auto-clear on reload enabled. Data will be cleared on every page reload.');
  } catch (error) {
    console.error('Error enabling auto-clear:', error);
  }
}

// Function to disable automatic clearing on page reload
export function disableAutoClearOnReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('__auto_clear_enabled__');
    console.log('Auto-clear on reload disabled.');
  } catch (error) {
    console.error('Error disabling auto-clear:', error);
  }
}

// Function to check if auto-clear is enabled and handle it
export function checkAndHandleAutoClear(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const autoClearEnabled = localStorage.getItem('__auto_clear_enabled__');
    
    if (autoClearEnabled === 'true') {
      // Temporarily save the auto-clear flag
      const tempFlag = autoClearEnabled;
      
      // Clear all data
      clearAllPersistentData();
      
      // Restore the auto-clear flag so it persists
      localStorage.setItem('__auto_clear_enabled__', tempFlag);
      
      console.log('Auto-clear executed on page load');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auto-clear:', error);
    return false;
  }
}

// Utility function to set site info after authorization
export function setSiteInfoAfterAuth(siteInfo: { siteId: string; siteName: string; shortName: string }): void {
  if (typeof window === 'undefined') return;
  
  // Check if user is authorized
  const userInfo = localStorage.getItem('consentbit-userinfo');
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
  localStorage.setItem('siteInfo', JSON.stringify(siteInfo));
}

// Utility function to check if user can set site info
export function canSetSiteInfo(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userInfo = localStorage.getItem('consentbit-userinfo');
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
  
  const userInfo = localStorage.getItem('consentbit-userinfo');
  const wfHybridUser = localStorage.getItem('wf_hybrid_user');
  const siteInfo = localStorage.getItem('siteInfo');
  const explicitlyLoggedOut = localStorage.getItem('explicitly_logged_out');
  
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
  authKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear any site-specific auth keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('consentbit-userinfo') || key.includes('wf_hybrid_user'))) {
      localStorage.removeItem(key);
    }
  }
  
  // Set explicitly logged out flag to prevent restoration
  localStorage.setItem('explicitly_logged_out', 'true');
  

}

// Utility function to clear authentication data if user is not authorized
export function clearAuthIfNotAuthorized(): void {
  if (typeof window === 'undefined') return;
  
  const userInfo = localStorage.getItem('consentbit-userinfo');
  if (!userInfo) {
    return;
  }
  
  try {
    const parsed = JSON.parse(userInfo);
    // Check if user has valid session token, email, and siteId
    if (!parsed?.sessionToken || !parsed?.email || !parsed?.siteId) {
      clearAuthData();
      // Also clear site info if user is not authorized
      localStorage.removeItem('siteInfo');
    }
  } catch (error) {
    clearAuthData();
    // Also clear site info if auth data is corrupted
    localStorage.removeItem('siteInfo');
  }
}

// Utility function to list all data for current site
export function listCurrentSiteData(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  
  const siteId = getCurrentSiteId();
  const siteData: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${siteId}_`)) {
      try {
        const value = localStorage.getItem(key);
        siteData[key] = value ? JSON.parse(value) : value;
      } catch (e) {
        siteData[key] = localStorage.getItem(key);
      }
    }
  }
  
  return siteData;
}

// Utility function to check migration status
export function checkMigrationStatus(): { migrated: boolean; oldKeysFound: number; newKeysFound: number } {
  if (typeof window === 'undefined') return { migrated: false, oldKeysFound: 0, newKeysFound: 0 };
  
  const migrationKey = 'migration_done';
  const migrated = localStorage.getItem(migrationKey) === 'true';
  
  // Only check for wf_hybrid_user migration
  const oldKeysFound = localStorage.getItem('wf_hybrid_user') !== null ? 1 : 0;
  const newKeysFound = localStorage.getItem('consentbit-userinfo') !== null ? 1 : 0;
  
  return { migrated, oldKeysFound, newKeysFound };
}

// Utility function to force migration
export function forceMigration(): void {
  if (typeof window === 'undefined') return;
  
  const migrationKey = 'migration_done';
  localStorage.removeItem(migrationKey); // Remove migration flag
  migrateOldData(); // Run migration again
}

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Skip migration since we clear all localStorage on every reload
  // migrateOldData();
  
  const siteSpecificKey = getSiteSpecificKey(key);
  
  // Check if user is authorized for siteInfo
  const isAuthorized = (() => {
    if (key === 'siteInfo') {
      const userInfo = localStorage.getItem('consentbit-userinfo');
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
      let savedState = localStorage.getItem(siteSpecificKey);
      
      // Simple approach - no migration logic
      if (!savedState && key !== 'siteInfo') {
        // Only handle wf_hybrid_user -> consentbit-userinfo migration
        if (key === 'consentbit-userinfo') {
          savedState = localStorage.getItem('wf_hybrid_user');
          if (savedState) {
            localStorage.setItem(siteSpecificKey, savedState);
            localStorage.removeItem('wf_hybrid_user');
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
        const userInfo = localStorage.getItem('consentbit-userinfo');
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
      const userInfo = localStorage.getItem('consentbit-userinfo');
      const isUserAuthenticated = (() => {
        if (!userInfo) return false;
        try {
          const parsed = JSON.parse(userInfo);
          return !!(parsed?.sessionToken && parsed?.email);
        } catch {
          return false;
        }
      })();
      
      // Only save to localStorage if:
      // 1. User is authenticated, OR
      // 2. Value was explicitly set (not just initialized), OR
      // 3. We're loading an existing value from localStorage
      if (isUserAuthenticated || wasExplicitlySet.current) {
        localStorage.setItem(siteSpecificKey, JSON.stringify(state));
      }
    }
  }, [siteSpecificKey, state, key]);

  return [state, authorizedSetState];
}

export { usePersistentState };
