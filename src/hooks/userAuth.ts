import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { User, DecodedToken } from "../types/types";
import webflow from "../types/webflowtypes";
import { setAuthData, setSiteInfo, getAuthData, getSiteInfo, isAuthenticated, migrateAuthDataToSessionStorage, clearAuthData, setAuthStorageItem, removeAuthStorageItem, getAuthStorageItem } from "../util/authStorage";

const base_url = "https://consentbit-test-server.web-8fb.workers.dev";

interface AuthState {
  user: User;
  sessionToken: string;
}

/**
 * Custom hook for managing authentication state and token exchange.
 *
 * Authentication Flow:
 * 1. User initiates auth -> exchangeAndVerifyIdToken()
 *    - Gets ID token from Webflow (Designer APIs)
 *    - Exchanges it for a session token via API
 *
 * 2. Token Exchange -> tokenMutation
 *    - Sends ID token to Data Client
 *    - Data Client validates and returns session token
 *    - On success, decodes and stores token + user data
 *
 * 3. Session Management -> useQuery for token validation
 *    - Automatically checks for existing valid session
 *    - Handles token expiration
 *    - Manages loading states
 *
 * @returns {Object} Authentication utilities and state
 * - user: Current user information
 * - sessionToken: Active session token
 * - isAuthLoading: Loading state
 * - exchangeAndVerifyIdToken: Exchange ID token for session token
 * - logout: Clear authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const isExchangingToken = { current: false };
  
  // 🔧 NEW: Helper function to ensure site context is available
  const ensureSiteContext = async () => {
    try {
      const siteInfo = await webflow.getSiteInfo();
      if (!siteInfo?.siteId) {
        throw new Error('No site context available - user may not be in Webflow Designer');
      }
      return siteInfo;
    } catch (error) {
      throw error;
    }
  };
    // Function to attempt automatic token refresh on app load
  const attemptAutoRefresh = async (): Promise<boolean> => {
    try {
      
      // Check if user was explicitly logged out
      const wasExplicitlyLoggedOut = getAuthStorageItem("explicitly_logged_out");
      if (wasExplicitlyLoggedOut) {
        return false;
      }

      // Check if there's existing auth data that might be expired or invalid
      const authData = getAuthData();
      if (authData && authData.sessionToken) {
        try {
          const decodedToken = jwtDecode(authData.sessionToken) as DecodedToken;
          // If token is not expired, don't need to refresh
          if (decodedToken.exp * 1000 > Date.now()) {
            return true; // Already have valid token
          }
        } catch (error) {
        }
      }
      
      // Attempt silent auth to refresh token with timeout
      const silentAuthPromise = attemptSilentAuth();
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(false);
        }, 3000); // 3 second timeout for silent auth
      });
      
      const result = await Promise.race([silentAuthPromise, timeoutPromise]);
      return result;
    } catch (error) {
      return false;
    }
  };
  // Query for managing auth state and token validation
  const { data: authState, isLoading: isAuthLoading, refetch: refetchAuth } = useQuery<AuthState>({
    queryKey: ["auth"],
    queryFn: async () => {
      const authStartTime = performance.now();
      // Run lightweight migration for existing users (only essential keys, once per session)
      migrateAuthDataToSessionStorage();
      
      const authData = getAuthData();
      const wasExplicitlyLoggedOut = getAuthStorageItem("explicitly_logged_out");

      // Return initial state if no stored user or logged out
      if (!authData || wasExplicitlyLoggedOut) {
        return { user: { firstName: "", email: "" }, sessionToken: "" };
      }

      try {
        if (!authData.sessionToken) {
          return { user: { firstName: "", email: "" }, sessionToken: "" };
        }

        // Decode and validate token
        const decodedToken = jwtDecode(authData.sessionToken) as DecodedToken;
        
        if (decodedToken.exp * 1000 <= Date.now()) {
          // Token expired - clear storage
          clearAuthData();
          return { user: { firstName: "", email: "" }, sessionToken: "" };
        }

        // Return valid auth state
        const authState = {
          user: {
            firstName: decodedToken.user?.firstName || authData.firstName || "",
            email: decodedToken.user?.email || authData.email || "",
            siteId: authData.siteId, // Include siteId from stored data
          },
          sessionToken: authData.sessionToken,
        };
        return authState;
      } catch (error) {
        // Clear invalid data
        clearAuthData();
        return { user: { firstName: "", email: "" }, sessionToken: "" };
      }
    },
    staleTime: Infinity, // Never consider the data stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 1000 * 60 * 60, // Cache for 1 hour
  });
// Mutation for exchanging ID token for session token
  const tokenMutation = useMutation({
    mutationFn: async (idToken: string) => {
      // 🔧 IMPROVED: Get and validate site info
      const siteInfo = await ensureSiteContext();

      // Exchange token with backend
      const response = await fetch(`${base_url}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idToken, siteId: siteInfo.siteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to exchange token: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      if (!data.sessionToken) {
        throw new Error("No session token received");
      }


      // Return both auth data and site info
      return { ...data, siteInfo };
    },   onSuccess: (data) => {
      try {
        // Decode the new token
       const decodedToken = jwtDecode(data.sessionToken) as DecodedToken;
        const userData = {
          sessionToken: data.sessionToken,
          firstName: data.firstName,
          email: data.email,
          siteId: data.siteId, // Store the siteId from server response
          exp: decodedToken.exp,
        };

        // Update sessionStorage for auth data
         setAuthData(userData);
        removeAuthStorageItem("explicitly_logged_out");

        // Store site information after authentication
        if (data.siteInfo) {
          setSiteInfo(data.siteInfo);
        }

        // Directly update the query data instead of invalidating
        queryClient.setQueryData<AuthState>(["auth"], {
          user: {
            firstName: decodedToken.user.firstName,
            email: decodedToken.user.email,
            siteId: data.siteId, // Include siteId in user data
          },
          sessionToken: data.sessionToken,
        });

      } catch (error) {
      }
    },
  });
// 🔧 IMPROVED: Function to attempt silent authorization without user interaction
  const attemptSilentAuth = async (): Promise<boolean> => {
    try {
      // 🔧 IMPROVED: Validate site context first
      const siteInfo = await ensureSiteContext();
      
      // Attempt to get ID token silently (works if user is already authenticated with Webflow)
      const idToken = await webflow.getIdToken();
      if (!idToken) {
        return false;
      }
      
      const response = await fetch(`${base_url}/api/auth/token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          idToken, 
          siteId: siteInfo.siteId 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sessionToken) {
        return false;
      }
  // 🔧 IMPROVED: Validate that backend returned correct site
      if (data.siteId && data.siteId !== siteInfo.siteId) {
      }

      // Store in localStorage
      const userData = {
        sessionToken: data.sessionToken,
        firstName: data.firstName,
        email: data.email,
        siteId: data.siteId || siteInfo.siteId,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };

      setAuthData(userData);
      removeAuthStorageItem("explicitly_logged_out");

      // Store site information after authentication
      if (siteInfo) {
        setSiteInfo(siteInfo);
      }

      // Update React Query cache
      queryClient.setQueryData<AuthState>(["auth"], {
        user: {
          firstName: data.firstName,
          email: data.email,
          siteId: data.siteId || siteInfo.siteId
        },
        sessionToken: data.sessionToken
      });

      return true;
      } catch (error) {
      // Silent auth failed, return false to indicate need for interactive auth
      return false;
    }
  };

  // 🔧 IMPROVED: Function to initiate token exchange process
  const exchangeAndVerifyIdToken = async () => {
    try {
      // 🔧 IMPROVED: Get and validate site context first
      const siteInfo = await ensureSiteContext();

      // Get new ID token from Webflow
      const idToken = await webflow.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get ID token from Webflow');
      }

      
      const response = await fetch(`${base_url}/api/auth/token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          idToken, 
          siteId: siteInfo.siteId 
        }),
      });
       const data = await response.json();


      if (!response.ok) {
        throw new Error(`Token exchange failed: ${data.error || 'Unknown error'}`);
      }

      if (!data.sessionToken) {
        throw new Error('No session token received from server');
      }

     // 🔧 IMPROVED: Validate that backend returned correct site
      if (data.siteId && data.siteId !== siteInfo.siteId ) {
      }

      // Store in localStorage
      const userData = {
        sessionToken: data.sessionToken,
        firstName: data.firstName,
        email: data.email,
        siteId: siteInfo.siteId, // Use backend's siteId or fallback to requested siteId
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };


      setAuthData(userData);
      removeAuthStorageItem("explicitly_logged_out");

      // Store site information after authentication
      if (siteInfo) {
        setSiteInfo(siteInfo);
      }
      
      // Update React Query cache
      queryClient.setQueryData<AuthState>(["auth"], {
        user: {
          firstName: data.firstName,
          email: data.email,
          siteId: data.siteId || siteInfo.siteId
        },
        sessionToken: data.sessionToken
      });
      
      // Refetch auth query to ensure state is updated from storage
      // This ensures the UI updates immediately after token exchange
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      }, 100);

      return data;

    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Set logout flag and clear storage
    setAuthStorageItem("explicitly_logged_out", "true");
    clearAuthData();
    queryClient.setQueryData(["auth"], {
      user: { firstName: "", email: "" },
      sessionToken: "",
    });
    queryClient.clear();
  };
  // 🔧 IMPROVED: OAuth screen opening with site context
  const openAuthScreen = async () => {
    try {
      // First, try silent authentication
      const silentAuthSuccess = await attemptSilentAuth();
      
      if (silentAuthSuccess) {
        return;
      }

      // 🔧 IMPROVED: Get site ID before opening auth window
      let siteId = null;
      let siteInfo = null;
      
      try {
        siteInfo = await ensureSiteContext();
        siteId = siteInfo.siteId;
      } catch (error) {
      }

      // 🔧 IMPROVED: Include site ID in OAuth URL
      const authUrl = siteId 
        ? `${base_url}/api/auth/authorize?state=webflow_designer&site_id=${siteId}`
        : `${base_url}/api/auth/authorize?state=webflow_designer`;

      // Silent auth failed, show the interactive auth window
      const authWindow = window.open(
        authUrl,  // 🔧 Use dynamic URL instead of static
        "_blank",
        "width=600,height=600"
      );

      if (!authWindow) {
        return;
      }

      const onAuth = async () => {
        try {
          await exchangeAndVerifyIdToken();
          // Force refetch of auth state after successful token exchange
          // This ensures the UI updates immediately
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
          }, 200);
        } catch (error: any) {
          // Check if it's a server error (500)
          if (error?.message?.includes('500') || error?.message?.includes('Internal server error')) {
            // Don't clear auth data on server errors - let user retry
            return;
          }
          // Clear any partial auth state only on non-server errors
          clearAuthData();
          setAuthStorageItem("explicitly_logged_out", "true");
          // Invalidate auth query to reflect cleared state
          queryClient.invalidateQueries({ queryKey: ["auth"] });
        }
      };

      const checkWindow = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkWindow);
          onAuth();
        }
      }, 1000);
    } catch (error) {
    }
  };

  // Function to check if user is authenticated for current site
  const isAuthenticatedForCurrentSite = async (): Promise<boolean> => {
    try {
      // Check if user has basic authentication
      if (!authState?.user?.email || !authState?.sessionToken) {
        return false;
      }

      // Get current site info from Webflow
      const currentSiteInfo = await webflow.getSiteInfo();
      
      if (!currentSiteInfo?.siteId) {
        return false;
      }

      // For multi-site support, we'll allow authentication if:
      // 1. User has valid session token
      // 2. Current site info is available
      // 3. Session token is not expired
      
      // Check if session token is expired
      try {
        const decodedToken = jwtDecode(authState.sessionToken) as DecodedToken;
        if (decodedToken.exp * 1000 <= Date.now()) {
          return false; // Token is expired
        }
      } catch (error) {
        return false; // Invalid token
      }
      
      // If we have a valid session token and current site info, allow access
      // This enables multi-site support where users can work across different sites
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    user: authState?.user || { firstName: "", email: "" },
    sessionToken: authState?.sessionToken || "",
    isAuthLoading,
    exchangeAndVerifyIdToken,
    logout,
    openAuthScreen,
    isAuthenticatedForCurrentSite,
    attemptSilentAuth,
    attemptAutoRefresh,
    ensureSiteContext, // 🔧 NEW: Export helper function
  };
}