const base_url = "https://cb-server.web-8fb.workers.dev";
import { ScriptCategory, SaveCategoriesResponse, AppData } from '../types/types';
import { scriptCategorizationService } from './script-categorization-service';
import { ClientEncryption } from '../util/Secure-Data';

import { ScriptRegistrationRequest, CodeApplication } from "../types/types";

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
      const response = await fetch(`${base_url}/api/app-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appData: appData,
        })
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

  getBannerStyles: async (token: string) => {
    try {
      const response = await fetch(`${base_url}/api/app-details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
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
    const response = await fetch(`${base_url}/api/v2/apply-v2-custom-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
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

      console.log('🔗 API Call URL:', url);
      console.log('🎯 Site ID being sent to backend:', siteId);
      
      // Debug: Check what's in the session token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Session token payload:', {
            siteId: payload.siteId,
            exp: payload.exp,
            email: payload.email
          });
        }
      } catch (error) {
        console.log('❌ Could not decode session token');
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
      console.log('📊 Backend response data:', {
        hasData: !!data.data,
        hasAnalyticsScripts: !!data.data?.analyticsScripts,
        scriptCount: data.data?.analyticsScripts?.length || 0,
        firstScript: data.data?.analyticsScripts?.[0] ? {
          identifier: data.data.analyticsScripts[0].identifier,
          siteId: data.data.analyticsScripts[0].siteId,
          hasFullTag: !!data.data.analyticsScripts[0].fullTag
        } : null
      });
      
      return {
        success: true,
        ...data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        data: null
      };
    }
  },
//   getVisitorsData: async (token: string, siteName: string, year?: number) => {
//   try {
//     const url = year 
//       ? `${base_url}/api/v2/consent-data/${siteName}/visitors?year=${year}`
//       : `${base_url}/api/v2/consent-data/${siteName}/visitors`;
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// },

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
  registerV2BannerCustomCode: async (token) => {
    try {
      const response = await fetch(`${base_url}/api/v2/register-v2-banner`, {
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


};