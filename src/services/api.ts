import { ScriptCategory, SaveCategoriesResponse, AppData } from '../types/types';
import { scriptCategorizationService } from './script-categorization-service';
import { ClientEncryption } from '../util/Secure-Data';

import { ScriptRegistrationRequest, CodeApplication } from "../types/types";

const base_url = "https://consentbit-test-server.web-8fb.workers.dev";

export const customCodeApi = {
  // Register a new script
  registerScript: async (params: ScriptRegistrationRequest, token: string) => {
    const response = await fetch(`${base_url}/api/custom-code/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    return response.json();
  },


  //blocking script registration
  registerAnalyticsBlockingScript: async (token: string) => {
    try {
      const response = await fetch(`${base_url}/api/custom-code/apply-custom-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },




   exportCSV: async (token:string) => {
    
    try {
     const response = await fetch(`${base_url}/api/export-consent-csv`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // FIXED: Use .text() for CSV data, not .json()
      const csvData = await response.text();
      
      const result = {
        csvData,
        response
      };
      
      return result;
    } catch (error) {
      throw error;
    }
  },
   exportCSVAdvanced: async (token:string) => {
    
    try {
     const response = await fetch(`${base_url}/api/v2/export-consent-csv`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // FIXED: Use .text() for CSV data, not .json()
      const csvData = await response.text();
      
      const result = {
        csvData,
        response
      };
      
      return result;
    } catch (error) {
      throw error;
    }
  },




  
  saveBannerStyles: async (token: string, appData: AppData) => {
    try {
      
      const url = appData.siteId 
        ? `${base_url}/api/app-data?siteId=${appData.siteId}`
        : `${base_url}/api/app-data`;
       
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  getBannerStyles: async (token: string, siteId?: string) => {
    try {
      
      const url = siteId 
        ? `${base_url}/api/app-details?siteId=${siteId}`
        : `${base_url}/api/app-details`;
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        // Add status code to error for easier checking
        (error as any).status = response.status;
        (error as any).errorText = errorText;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },


  //save categorized script
  saveScriptCategorizations: async (token: string, categorizations: ScriptCategory[]) => {
    return scriptCategorizationService.saveScriptCategorizations(token, categorizations);
  },

  updateScriptCategorizations: async (siteId: string, token: string, newCategorizations: ScriptCategory[]) => {
    return scriptCategorizationService.updateScriptCategorizations(token, newCategorizations);
  },

  getScripts: async (siteId: string, token: string) => {
    const response = await fetch(
      `${base_url}/api/custom-code/register?siteId=${siteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  // Apply script to site or page
  applyScript: async (params: CodeApplication, token: string) => {
    const response = await fetch(`${base_url}/api/custom-code/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    return response.json();
  },
  applyV2Script: async (params: CodeApplication, token: string) => {
    // Extract siteId from params and add it to URL
    const { targetId, scriptId, location, version } = params;
    
    const requestBody = {
      targetType: "site",
      scriptId: scriptId,
      location: location,
      version: version
    };
    
    const url = `${base_url}/api/v2/apply-v2-custom-code?siteId=${targetId}`;
    

    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  },

  // src/services/api.ts
  analyticsScript: async (token: string, siteId?: string) => {
    try {
      if (!token) {
        throw new Error("Token is required");
      }
      
      // Include siteId in the URL if provided
      const url = siteId 
        ? `${base_url}/api/analytics?siteId=${siteId}`
        : `${base_url}/api/analytics`;

      
      // Debug: Check what's in the session token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
        }
      } catch (error) {
        // Silent error handling
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const data = await response.json();
      
      return {
        success: true,
        ...data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        data: null
      };
    }
  },


getVisitorsData: async (token: string, siteName: string, year?: number, month?: number) => {
  try {
    const params = new URLSearchParams();
    
    if (year) {
      params.append('year', year.toString());
    }
    
    if (month !== undefined && month !== null) {
      // Convert month from 0-11 to 1-12 format
      const monthNumber = month + 1;
      params.append('month', monthNumber.toString());
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${base_url}/api/v2/consent-data/${siteName}/visitors?${queryString}`
      : `${base_url}/api/v2/consent-data/${siteName}/visitors`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
},
downloadPDFFromUrl: async (token: string, pdfUrl: string, filename: string) => {
  try {
    const response = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pdfBlob = await response.blob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
},
  // Register a new v2 custom code script
  registerV2CustomCode: async (token) => {
    try {
      const response = await fetch(`${base_url}/api/v2/register-v2-custom-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
       
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  registerV2BannerCustomCode: async (token, siteId) => {
    try {
    
      
      const response = await fetch(`${base_url}/api/v2/register-v2-banner?siteId=${siteId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
   postInstalltionCall:async (token: string, siteId: string) => {
   try {
     const url = `${base_url}/api/postinstallation/${siteId}`;
     
     const response = await fetch(url, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
     }
     
     const result = await response.json();
     
      if (result.all_P === true) {
        return { success: true, message: 'Already processed' };
     } else if (result.success === true) {
       return { success: true, message: 'Successfully processed' };
     }
     
     return result;
   
   } catch (error) {
     throw error;
   }
 },
 getCouponCode: async (token: string) => {
   try {
     const response = await fetch(`${base_url}/api/coupon-code`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     
     const data = await response.json();
     return data;
   } catch (error) {
     throw error;
   }
 },
 injectScript: async (token: string, siteId: string) => {
   try {
     const response = await fetch(`${base_url}/api/inject-script?siteId=${siteId}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
     }
     
     const data = await response.json();
     return data;
   } catch (error) {
     throw error;
   }
 },

 // Activate License API
 activateLicense: async (licenseKey: string, siteDomain: string, email?: string, token?: string) => {
   const dashboardBaseUrl = "https://consentbit-dashboard-test.web-8fb.workers.dev";
   
   // Ensure we always send "staging" if domain is not available
   const domainToUse = siteDomain && siteDomain.trim() && siteDomain !== "" ? siteDomain : "staging";
   
   console.log('[API] activateLicense called', {
     licenseKey: licenseKey.substring(0, 8) + '...',
     siteDomain,
     domainToUse,
     email,
     hasToken: !!token,
     url: `${dashboardBaseUrl}/activate-license`
   });
   
   try {
     const requestBody = {
       license_key: licenseKey,
       site_domain: domainToUse,
       ...(email && { email }),
     };
     
     console.log('[API] activateLicense request body:', { ...requestBody, license_key: requestBody.license_key.substring(0, 8) + '...' });
     
     const response = await fetch(`${dashboardBaseUrl}/activate-license`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         ...(token && { Authorization: `Bearer ${token}` }),
       },
       body: JSON.stringify(requestBody),
     });
     
     console.log('[API] activateLicense response status:', response.status, response.statusText);
     
     const data = await response.json();
     console.log('[API] activateLicense response data:', data);
     
     if (!response.ok) {
       console.log('[API] activateLicense failed:', {
         error: data.error,
         message: data.message,
         statusCode: response.status
       });
       // Return error data with status code
       return {
         success: false,
         error: data.error || 'activation_failed',
         message: data.message || 'Failed to activate license',
         statusCode: response.status,
         ...data
       };
     }
     
     console.log('[API] activateLicense SUCCESS:', data);
     return {
       success: true,
       ...data
     };
   } catch (error: any) {
     console.error('[API] activateLicense network error:', error);
     return {
       success: false,
       error: 'network_error',
       message: error.message || 'Network error occurred',
       statusCode: 0
     };
   }
 },

 // Check License Status API - Uses dedicated license status endpoint
 checkLicenseStatus: async (siteDomain: string, email?: string, token?: string) => {
   const dashboardBaseUrl = "https://consentbit-dashboard-test.web-8fb.workers.dev";
   
   // Ensure we always send "staging" if domain is not available
   const domainToUse = siteDomain && siteDomain.trim() && siteDomain !== "" ? siteDomain : "staging";
   
   console.log('[License Check] Starting license status check', {
     siteDomain,
     domainToUse,
     email,
     hasToken: !!token,
     url: `${dashboardBaseUrl}/check-license-status`
   });
   
   try {
     if (!domainToUse) {
       console.log('[License Check] No site domain provided, returning false');
       return {
         success: false,
         hasActiveLicense: false,
         available: false
       };
     }

     const requestBody: any = {
       site: domainToUse
     };
     
     if (email) {
       requestBody.email = email;
     }
     
     console.log('[License Check] Making API request to:', `${dashboardBaseUrl}/check-license-status`, {
       method: 'POST',
       body: requestBody
     });
     
     const response = await fetch(`${dashboardBaseUrl}/check-license-status`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         ...(token && { Authorization: `Bearer ${token}` }),
       },
       credentials: 'include',
       body: JSON.stringify(requestBody),
     });

     console.log('[License Check] Response status:', response.status, response.statusText);

     if (!response.ok) {
       const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
       console.log('[License Check] Response not OK:', errorData);
       return {
         success: false,
         hasActiveLicense: false,
         available: false,
         error: errorData.message || errorData.error || 'Failed to check license status',
         ...errorData
       };
     }

     const data = await response.json();
     console.log('[License Check] Response data:', JSON.stringify(data, null, 2));

     // Handle "no license found" case
     // Response format: { success: false, available: false, message: "No active license found for this site", license: null }
     // or: { success: true, available: false, message: "No license found", license: null }
     if (data.available === false || !data.license || data.license === null) {
       console.log('[License Check] ❌ No license found for this site', {
         success: data.success,
         available: data.available,
         message: data.message,
         hasLicense: !!data.license,
         licenseValue: data.license
       });
       return {
         success: data.success || false,
         hasActiveLicense: false,
         available: false,
         message: data.message || 'No active license found for this site',
         license: null,
         site: data.site,
         ...data
       };
     }

     // Check if license is available and active
     // Response structure: { success: true, available: true, license: { status: "active"|"used", ... } }
     const hasActiveLicense = data.success === true && 
                             data.available === true && 
                             data.license &&
                             (data.license.status === "active" || 
                              data.license.status === "used" ||
                              data.license.is_used === true ||
                              false);
     
     console.log('[License Check] License status determined:', {
       hasActiveLicense: Boolean(hasActiveLicense),
       success: data.success,
       available: data.available,
       licenseStatus: data.license?.status,
       licenseExists: !!data.license,
       subscriptionStatus: data.license?.subscription?.status,
       message: data.message,
       license: data.license,
       allResponseKeys: Object.keys(data)
     });
     
     return {
       success: data.success || false,
       hasActiveLicense: Boolean(hasActiveLicense),
       available: data.available || false,
       license: data.license,
       message: data.message,
       ...data
     };
   } catch (error: any) {
     console.error('[License Check] Error checking license status:', error);
     // On error, assume no license
     return {
       success: false,
       hasActiveLicense: false,
       available: false,
       error: error.message || 'Failed to check license status'
     };
   }
 }
 
 }
