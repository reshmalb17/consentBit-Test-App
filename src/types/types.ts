// Auth & User Types
export interface TokenResponse {
    sessionToken: string;
  }
  
  // JWT Decoded Token Type
export interface DecodedToken {
  user: User;
  exp: number;
  // Add other JWT claims as needed
  iat?: number;
  iss?: string;
}
  
  export interface User {
  firstName: string;
  email: string;
  siteId?: string;
}
  
  export interface StoredUser extends User {
    sessionToken: string;
    exp: number;
  }
  
  // Site Types
  export interface Site {
    id: string;
    displayName: string;
    createdOn: string;
    lastUpdated: string;
    lastPublished: string;
  }
  
  // API Response Types
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: number;
  }
  
  export interface SitesResponse {
    sites: Site[];
  }
  
  // Component Props Types
  export interface DashboardProps {
    user: User;
    sites: Site[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    onFetchSites: () => void;
  }
  
  export interface DataTableProps {
    data: Site[];
  }
  
  export interface AuthScreenProps {
    onAuth: () => void;
  }
  
  // Custom Code Types
  export type ScriptLocation = "header" | "footer";
  export type ScriptTargetType = "site" | "page";
  
  /**
   * Data required to register a new script
   * @property {string} sourceCode - An in-line script's source code
   * @property {string} displayName - Display name for the script
   * @property {string} version - Version of the script
   * @property {string} [hostedLocation] - URL for hosted scripts
   */
  export interface ScriptData {
    sourceCode?: string;
    displayName: string;
    version: string;
    hostedLocation?: string;
  }
  
  /**
   * Request payload for script registration
   * @property {string} siteId - ID of the target Webflow site
   * @property {boolean} isHosted - Whether the script is hosted externally
   * @property {ScriptData} scriptData - The script data to register
   */
  export interface ScriptRegistrationRequest {
    siteId: string;
    isHosted: boolean;
    scriptData: ScriptData;
  }
  
  /**
   * Represents a registered script in the system
   * @property {string} id - The unique identifier for the script
   * @property {string} displayName - The display name for the script
   * @property {string} hostedLocation - The URL where the script is hosted
   * @property {string} sourceCode - The source code for inline scripts
   * @property {string} version - The version of the script
   * @property {string} createdOn - The date and time when the script was created
   * @property {string} lastUpdated - The date and time when the script was last updated
   */
  export interface CustomCode {
    id?: string;
    displayName: string;
    hostedLocation?: string;
    sourceCode?: string;
    version: string;
    createdOn?: string;
    lastUpdated?: string;
  }
  
  /**
   * Represents a script application to a specific target (site/page)
   * @property {string} scriptId - The unique identifier for the script
   * @property {ScriptTargetType} targetType - The type of target (site/page)
   * @property {string} targetId - The ID of the target (site/page)
   * @property {string} appliedAt - The date and time when the script was applied
   * @property {string} version - The version of the script
   */
  export interface CodeApplication {
    scriptId: string;
    targetType: ScriptTargetType;
    targetId: string;
    appliedAt?: string;
    version: string;
    location: ScriptLocation;
  }
  
  /**
   * Interface for tracking script application status per target (site/page)
   * @property {boolean} isApplied - Whether the script is applied to this target
   * @property {ScriptLocation} location - Where the script is applied
   */
  export interface ApplicationStatus {
    [pageId: string]: {
      isApplied: boolean;
      location?: "header" | "footer";
    };
  }
  
  /**
   * Interface for Webflow's script status response
   * Represents the structure of script data returned from Webflow's API
   * @property {Object} location - The placement of the script
   */
  export interface ScriptStatus {
    [scriptId: string]: { location: ScriptLocation };
  }
  
  // Environment Variables Type
  export interface ImportMetaEnv {
    VITE_NEXTJS_API_URL: string;
    // Add other env variables as needed
  }
  

 // src/types/types.ts
export interface Script {
  url?: string | null;
  script?: string | null;
  isDismissed: boolean;
  selectedCategories: string[];
  src?: string | null;
  content?: string | null;
  type?: string | null;
  async?: boolean;
  defer?: boolean;
  crossorigin?: string | null;
  category?: string;
  fullTag?: string | null;
  isEdited: boolean;
}

export interface ScriptCategory {
  src: string | null;
  content: string | null;
  selectedCategories?: string[];
}

export interface SaveCategoriesResponse {
  success: boolean;
  error?: string;
}

export type ScriptType = {
  id: string;
  fullTag: string;
  script: string;
  src: string;
  url: string; 
  category?: "Essential" | "Personalization" | "Analytics" | "Marketing" | string;
  isDismissed?: boolean;
  selectedCategories?: string[];
  identifier?: string | null;
  transitionState?: 'fade-in' | 'fade-out' | '';
  hasAutoDetectedCategories?: boolean;
  group?: string;
  groupScripts?: ScriptType[];
};

export type AppData = {
  siteId?: string;
  cookieExpiration: string;
  bgColor: string;
  activeTab: string;
  activeMode: string;
  selectedtext: string;
  fetchScripts?: boolean;  
  btnColor:string,
  paraColor:string,
  secondcolor:string,
  bgColors:string,
  headColor:string,
  secondbuttontext:string,
  primaryButtonText:string,
  Font:string,
  style:string,
  selected:string,
  weight:string,
  borderRadius:number,
  buttonRadius:number,
  animation:string,
  easing:string,
  language:string,
  buttonText?:string,
  isBannerAdded:boolean,
  color:string,
};