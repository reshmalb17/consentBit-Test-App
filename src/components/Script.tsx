import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../style/styless.css";
import { ScriptCategory } from "../types/types";
import { customCodeApi } from "../services/api";
import { useScriptContext } from "../context/ScriptContext";
import PulseAnimation from './PulseAnimation';
import { usePersistentState } from '../hooks/usePersistentState';
import { getAuthStorageItem, setAuthStorageItem, removeAuthStorageItem, setCurrentSiteId } from '../util/authStorage';
import webflow from '../types/webflowtypes';

const base_url = "https://consentbit-test-server.web-8fb.workers.dev";

const questionmark = new URL("../assets/blue question.svg", import.meta.url).href;
const settings = new URL("../assets/setting-2.svg", import.meta.url).href;
const tickmark = new URL("../assets/implement correctly.svg", import.meta.url).href;
const edit = new URL("../assets/edit.svg", import.meta.url).href;
const explain = new URL("../assets/catogery.svg", import.meta.url).href;
const sheild = new URL("../assets/sheild.svg", import.meta.url).href;
const line = new URL("../assets/Line 6.svg", import.meta.url).href;
const dismiss = new URL("../assets/Vector.svg", import.meta.url).href;
const Active = new URL("../assets/active.svg", import.meta.url).href;
const search = new URL("../assets/search.svg", import.meta.url).href;
const uparrow = new URL("../assets/blue up arrow.svg", import.meta.url).href;
const line2 = new URL("../assets/line.svg", import.meta.url).href;
const copyScript = new URL("../assets/copy script.svg", import.meta.url).href;
const tickmarkcopy = new URL("../assets/Vector 23.svg", import.meta.url).href;
const goto = new URL("../assets/gotosetting.svg", import.meta.url).href;


const Script: React.FC<{
    fetchScripts: boolean;
    setFetchScripts: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ fetchScripts, setFetchScripts }) => {
    const { scripts, setScripts } = useScriptContext();
    
    // Debug scripts state changes
    useEffect(() => {
    }, [scripts]);
    
    // Check if any script has categories selected (including Essential)
    const hasAnyCategories = useMemo(() => {
        return scripts.some(script => {
            if (!script.identifier || script.isDismissed) return false;
            // Check if script has any categories selected
            return script.selectedCategories.length > 0;
        });
    }, [scripts]);
    
    // Check if any script has categories selected other than Essential
    const hasNonEssentialCategories = useMemo(() => {
        return scripts.some(script => {
            if (!script.identifier || script.isDismissed) return false;
            // Check if script has any categories other than Essential
            const nonEssentialCategories = script.selectedCategories.filter(cat => cat !== "Essential");
            return nonEssentialCategories.length > 0;
        });
    }, [scripts]);
    
    // Check if any script with non-essential categories has been saved
    const hasSavedCategories = useMemo(() => {
        return scripts.some(script => {
            if (!script.identifier || script.isDismissed) return false;
            // Check if script has non-essential categories and has been saved
            const nonEssentialCategories = script.selectedCategories.filter(cat => cat !== "Essential");
            return nonEssentialCategories.length > 0 && script.isSaved;
        });
    }, [scripts]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [hasSuccessfullySaved, setHasSuccessfullySaved] = useState(false);
    const categories = ["Essential", "Personalization", "Analytics", "Marketing"];
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
    const [hasScanned, setHasScanned] = useState(false);
    const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);

    // Fetch site info when component mounts - always update currentSiteId immediately
    useEffect(() => {
        const fetchSiteInfo = async () => {
            try {
                const currentSiteInfo = await webflow.getSiteInfo();
                if (currentSiteInfo?.siteId) {
                    // Always update currentSiteId immediately so site-specific keys work correctly
                    setCurrentSiteId(currentSiteInfo.siteId);
                    // Always overwrite siteInfo to ensure fresh data on app reload
                    setSiteInfo(currentSiteInfo);
                }
            } catch (error) {
            }
        };

        // Always fetch to ensure fresh site data on app reload
        fetchSiteInfo();
    }, [setSiteInfo]);

    // Site change detection - clear scripts when site changes
    useEffect(() => {
        const detectSiteChange = async () => {
            try {
                const currentSiteInfo = await webflow.getSiteInfo();
                const newSiteId = currentSiteInfo?.siteId;
                
                // Always update currentSiteId on first load or when site changes
                if (newSiteId) {
                    // Update current site ID immediately for site-specific storage
                    setCurrentSiteId(newSiteId);
                    
                    // Always overwrite siteInfo when site changes or on first load
                    // This ensures fresh site data for each site, even in the same workspace
                    if (siteInfo?.siteId && newSiteId !== siteInfo.siteId) {
                        // Site has changed - clear scripts and old site-specific data
                        setScripts([]);
                        removeAuthStorageItem('scriptContext_scripts');
                        
                        // Clear old site's siteInfo from storage (site-specific key)
                        // Note: Banner settings are kept separate per site, so we don't clear them
                        const oldSiteKey = `siteInfo_${siteInfo.siteId}`;
                        removeAuthStorageItem(oldSiteKey);
                        
                        // Set new site info (will overwrite any existing data)
                        setSiteInfo(currentSiteInfo);
                    } else {
                        // First load or same site - always overwrite to ensure fresh data
                        setSiteInfo(currentSiteInfo);
                    }
                }
            } catch (error) {
            }
        };

        // Check immediately on mount, then every 2 seconds
        detectSiteChange();
        const interval = setInterval(detectSiteChange, 2000);
        
        return () => clearInterval(interval);
    }, [siteInfo, setSiteInfo, setScripts]);

    // Debug logs for siteInfo
    useEffect(() => {
    }, [siteInfo]);

    const getScriptIdentifier = useCallback((script: { src?: string | null; fullTag?: string | null }) => {
        return script.src || script.fullTag?.replace(/\s*data-category\s*=\s*"[^"]*"/i, '') || null;
    }, []);

    // Function to regenerate session token for current site
    const regenerateSessionToken = useCallback(async () => {
        try {
            
            // Clear old token first to force regeneration
            // COMMENTED OUT: localStorage.removeItem("consentbit-userinfo");
            removeAuthStorageItem("consentbit-userinfo");
            
            // Get new ID token from Webflow
            const idToken = await webflow.getIdToken();
            if (!idToken) {
                throw new Error('Failed to get ID token from Webflow');
            }

            // Get current site info
            const siteInfo = await webflow.getSiteInfo();
            if (!siteInfo || !siteInfo.siteId) {
                throw new Error('Failed to get site info from Webflow');
            }
            
            
            // Exchange for new session token
            const requestBody = {
                idToken, 
                siteId: siteInfo.siteId 
            };
            
          

            const response = await fetch(`${base_url}/api/auth/token`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Token exchange failed: ${data.error || 'Unknown error'}`);
            }

            if (!data.sessionToken) {
                throw new Error('No session token received from server');
            }

            // Debug: Check what the backend returned
          

            // Update stored authentication data
            const userData = {
                sessionToken: data.sessionToken,
                firstName: data.firstName,
                email: data.email,
                siteId: data.siteId || siteInfo.siteId, // Use backend's siteId or fallback to requested siteId
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
            };

            // COMMENTED OUT: localStorage.setItem("consentbit-userinfo", JSON.stringify(userData));
            setAuthStorageItem("consentbit-userinfo", JSON.stringify(userData));
            
            return data.sessionToken;
        } catch (error) {
            return null;
        }
    }, []);



    const fetchScriptData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        
        try {
            // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
            const userinfo = getAuthStorageItem("consentbit-userinfo");
            const userInfo = JSON.parse(userinfo || "{}");
            const tokens = userInfo?.sessionToken;
            
            if (!tokens) {
                setIsLoading(false);
                return;
            }
            
            // Check if scripts are already cached in sessionStorage for this site (only if not forcing refresh)
            if (!forceRefresh) {
                const cachedScripts = getAuthStorageItem('scriptContext_scripts');
                if (cachedScripts) {
                    try {
                        const parsedScripts = JSON.parse(cachedScripts);
                        if (Array.isArray(parsedScripts) && parsedScripts.length > 0) {
                            setScripts(parsedScripts);
                            setIsLoading(false);
                            return; // Use cached data, no API call needed
                        }
                    } catch (error) {
                    }
                }
            }
            // Clear existing scripts before fetching new ones to prevent cross-site contamination
            setScripts([]);
            
            // Also clear from sessionStorage to ensure complete cleanup
            // COMMENTED OUT: localStorage.removeItem('scriptContext_scripts');
            removeAuthStorageItem('scriptContext_scripts');
            
            // If forcing refresh, also clear any cached scripts
          
            // Get current site info to verify we're getting scripts for the right site
            const currentSiteInfo = await webflow.getSiteInfo();
            const currentSiteId = currentSiteInfo?.siteId;
            
            if (!currentSiteId) {
                setIsLoading(false);
                return;
            }

            // Check if we need to regenerate session token for the new site
            const userData = JSON.parse(userinfo || "{}");
            let finalTokens = tokens;
            
            
            // Check if session token has the correct siteId
            let tokenHasCorrectSiteId = false;
            try {
                const tokenParts = finalTokens.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    tokenHasCorrectSiteId = payload.siteId === currentSiteId;
                }
            } catch (error) {
            }
            
            if (userData.siteId !== currentSiteId || !tokenHasCorrectSiteId) {
                const oldSiteId = userData.siteId;
                
                // Clear old token data completely
                // COMMENTED OUT: localStorage.removeItem("consentbit-userinfo");
                removeAuthStorageItem("consentbit-userinfo");
                // COMMENTED OUT: localStorage.removeItem("scriptContext_scripts");
                removeAuthStorageItem("scriptContext_scripts");
                
                // Regenerate session token for the new site
                const newToken = await regenerateSessionToken();
                if (newToken) {
                    finalTokens = newToken;
                }
            }

            // Log token for debugging (remove in production)
            
            const result = await customCodeApi.analyticsScript(finalTokens, currentSiteId);


            if (!result) {
                throw new Error('No response from API');
            }

            if (!result.success) {
                throw new Error(result.error || 'API request failed');
            }

            if (!result.data) {
                throw new Error('No data in API response');
            }
            
            const scriptsResponse = result.data.analyticsScripts ?? [];
            
            
            // Filter scripts - show all scripts that have valid content
            const validScripts = scriptsResponse.filter(script => {
                // Only filter out scripts that have no content at all
                if (!script.fullTag?.trim() && !script.src?.trim() && !script.content?.trim()) {
                    return false;
                }
                
                // If script has siteId, only filter if it's explicitly from a different site
                if (script.siteId && script.siteId !== currentSiteId) {
                    return false;
                }
                
                // For scripts without siteId, trust the backend filtering
                // Since we're passing the correct siteId to the API, the backend should return
                // scripts for the current site only
                return true;
            });
            
           
           
            // Debug: Add a global function to manually regenerate token
            (window as any).regenerateToken = regenerateSessionToken;
            (window as any).testSiteChange = async () => {
                const newToken = await regenerateSessionToken();
                if (newToken) {
                    // Trigger a new script fetch
                    fetchScriptData(true); // Force refresh after token regeneration
                }
            };
            
            (window as any).forceTokenRegeneration = async () => {
                // Clear everything first
                // COMMENTED OUT: localStorage.removeItem("consentbit-userinfo");
                removeAuthStorageItem("consentbit-userinfo");
                // COMMENTED OUT: localStorage.removeItem("scriptContext_scripts");
                removeAuthStorageItem("scriptContext_scripts");
                
                // Wait a bit then regenerate
                setTimeout(async () => {
                    const newToken = await regenerateSessionToken();
                    if (newToken) {
                        fetchScriptData(true); // Force refresh after token regeneration
                    }
                }, 1000);
            };
            
            // Debug: Add function to bypass filtering temporarily
            (window as any).bypassFiltering = () => {
              
                setScripts(scriptsResponse.map(script => ({
                    ...script,
                    selectedCategories: script.selectedCategories || ["Essential"],
                    isActive: script.isActive !== undefined ? script.isActive : true
                })));
            };
            
            // Debug: Add function to show filtered vs unfiltered scripts
            
            
            // Debug: Add function to manually fetch and print server response
            (window as any).printServerResponse = async () => {
                try {
                    // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
                    const userinfo = getAuthStorageItem("consentbit-userinfo");
                    const userInfo = JSON.parse(userinfo || "{}");
                    const tokens = userInfo?.sessionToken;
                    
                    if (!tokens) {
                        return;
                    }
                    
                    const currentSiteInfo = await webflow.getSiteInfo();
                    const currentSiteId = currentSiteInfo?.siteId;
                    
                    
                    const result = await customCodeApi.analyticsScript(tokens, currentSiteId);
                    
                  
                    
                    if (result?.data?.analyticsScripts) {
                     
                        result.data.analyticsScripts.forEach((script, index) => {
                        });
                    }
                    
                } catch (error) {
                }
            };
            
            // Debug: Add function to show all scripts without any filtering
            (window as any).showAllScripts = () => {
               
                // Set all scripts directly without filtering
                const allScripts = scriptsResponse.map(script => ({
                    ...script,
                    selectedCategories: script.selectedCategories || 
                                     (script.category ? (Array.isArray(script.category) ? script.category : script.category.split(',').map(c => c.trim())) : ["Essential"]),
                    isActive: script.isActive !== undefined ? script.isActive : true
                }));
                
                setScripts(allScripts);
            };

            const formattedScripts = validScripts.map(script => {
                // Add or update type attribute in the script tag
                let modifiedTag = script.fullTag || '';
                
                // First, fix any malformed script tags like <scriptsrc to <script src
                modifiedTag = modifiedTag.replace(/<script([^>\s])([^>]*?)>/gi, (match, firstChar, rest) => {
                    // If firstChar is not a space and not '>', it means we have <scriptsrc or similar
                    if (firstChar !== ' ' && firstChar !== '>') {
                        return `<script ${firstChar}${rest}>`;
                    }
                    return match;
                });
                
                const tagRegex = /<script\b([^>]*)>/i;
                const match = modifiedTag.match(tagRegex);
                
                // Parse existing data-category attribute to set selectedCategories (only if it exists)
                let existingCategories: string[] = [];
                let hasDataCategoryAttribute = false;
                
                if (script.fullTag) {
                    const categoryMatch = script.fullTag.match(/data-category\s*=\s*"([^"]*)"/i);
                    if (categoryMatch && categoryMatch[1]) {
                        hasDataCategoryAttribute = true;
                        // Split by comma and clean up the categories (include Essential now)
                        existingCategories = categoryMatch[1]
                            .split(',')
                            .map(cat => cat.trim())
                            .filter(cat => cat.length > 0); // Don't exclude Essential anymore
                    }
                }
                
                // If no categories found in fullTag, check if script has category property
                if (existingCategories.length === 0 && script.category) {
                    if (Array.isArray(script.category)) {
                        existingCategories = script.category;
                    } else if (typeof script.category === 'string') {
                        existingCategories = script.category.split(',').map(cat => cat.trim());
                    }
                }
                
                if (match) {
                    let attrs = match[1];
                    // Remove consent-related attributes
                    attrs = attrs.replace(/\s*data-cb-consent[^"'\s]*\s*/g, '');
                    
                    // Check if there are non-essential categories (from data-category if exists)
                    const categoryMatch = modifiedTag.match(/data-category\s*=\s*"([^"]*)"/i);
                    let hasNonEssential = false;
                    if (categoryMatch && categoryMatch[1]) {
                        const categories = categoryMatch[1].split(',').map(c => c.trim());
                        hasNonEssential = categories.some(cat => cat !== "Essential");
                    }

                    // Check if script is in Google category/group (case-insensitive)
                    const isGoogleScript = script.group?.toLowerCase().includes('google') || script.category?.toLowerCase().includes('google');
                    
                    // Only add/update type="text/plain" if there are non-essential categories AND it's not a Google script
                    if (hasNonEssential && !isGoogleScript) {
                        // Update or add type attribute
                        if (attrs.includes('type=')) {
                            attrs = attrs.replace(/type\s*=\s*"[^"]*"/i, 'type="text/plain"');
                        } else {
                            attrs += ' type="text/plain"';
                        }
                    } else {
                        // Remove type="text/plain" if only Essential, no categories, or Google script
                        attrs = attrs.replace(/\s*type\s*=\s*"text\/plain"\s*/i, ' ');
                        attrs = attrs.trim();
                    }
                    
                    // Ensure there's always a space between <script and attributes
                    const trimmedAttrs = attrs.trim();
                    const scriptTag = trimmedAttrs ? `<script ${trimmedAttrs}>` : `<script>`;
                    modifiedTag = modifiedTag.replace(tagRegex, scriptTag);
                }

                // Extract selectedCategories from script if it exists, but only use it if data-category attribute exists
                const { selectedCategories: backendCategories, ...scriptWithoutCategories } = script;
                
                return {
                    identifier: getScriptIdentifier(script),
                    url: script.src || null,
                    script: modifiedTag || null,
                    fullTag: modifiedTag || null,
                    isDismissed: false,
                    isSaved: false,
                    selectedCategories: hasDataCategoryAttribute ? existingCategories : [], // Only set if data-category exists, ignore backend categories
                    hasAutoDetectedCategories: hasDataCategoryAttribute && existingCategories.length > 0, // Track if categories were auto-detected
                    group: script.category || 'Other', // Use backend's category
                    ...scriptWithoutCategories,
                };
            });

            // For custom scripts and single-instance scripts, keep them separate. For other scripts, group by category
            const groupedScripts: any[] = [];
            
            // Separate custom scripts and single-instance scripts
            const customScripts = formattedScripts.filter(script => script.group === 'custom');
            const singleInstanceScripts = formattedScripts.filter(script => 
                script.group === 'Heap' || 
                script.group === 'Umami' || 
                script.group === 'PostHog'
            );
            const otherScripts = formattedScripts.filter(script => 
                script.group !== 'custom' && 
                script.group !== 'Heap' && 
                script.group !== 'Umami' && 
                script.group !== 'PostHog'
            );
            
            // Add each custom script as a separate block
            customScripts.forEach((script, index) => {
                groupedScripts.push({
                    identifier: `custom-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    id: `custom-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    url: script.url || null,
                    script: script.script,
                    fullTag: script.fullTag,
                    isDismissed: false,
                    isSaved: false,
                    selectedCategories: script.selectedCategories,
                    hasAutoDetectedCategories: script.hasAutoDetectedCategories,
                    group: 'custom',
                    groupScripts: [script],
                    category: 'Custom',
                    src: script.src || null,
                    content: script.content,
                    type: script.type || null,
                    async: script.async || false,
                    defer: script.defer || false,
                    crossorigin: script.crossorigin || null,
                });
            });
            
            // Add each single-instance script as a separate block
            singleInstanceScripts.forEach((script, index) => {
                groupedScripts.push({
                    identifier: `${script.group.toLowerCase()}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    id: `${script.group.toLowerCase()}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    url: script.url || null,
                    script: script.script,
                    fullTag: script.fullTag,
                    isDismissed: false,
                    isSaved: false,
                    selectedCategories: script.selectedCategories,
                    hasAutoDetectedCategories: script.hasAutoDetectedCategories,
                    group: script.group.toLowerCase(),
                    groupScripts: [script],
                    category: script.group,
                    src: script.src || null,
                    content: script.content,
                    type: script.type || null,
                    async: script.async || false,
                    defer: script.defer || false,
                    crossorigin: script.crossorigin || null,
                });
            });
            
            // Group other scripts by their group name
            const scriptGroups = new Map<string, typeof otherScripts>();
            otherScripts.forEach(script => {
                const groupName = script.group || 'Other';
                if (!scriptGroups.has(groupName)) {
                    scriptGroups.set(groupName, []);
                }
                scriptGroups.get(groupName)!.push(script);
            });

            // Create grouped scripts for non-custom scripts
            Array.from(scriptGroups.entries()).forEach(([groupName, scripts]) => {
                // Combine all scripts in the group
                const combinedFullTag = scripts.map(s => s.fullTag).filter(Boolean).join('\n');
                const combinedScript = scripts.map(s => s.script).filter(Boolean).join('\n');
                
                // Don't merge categories - use categories only if all scripts in group have the same categories
                let groupCategories: string[] = [];
                let hasAutoDetected = false;
                
                // Check if all scripts have the same categories (only if they have data-category attributes)
                const scriptsWithCategories = scripts.filter(s => s.hasAutoDetectedCategories);
                if (scriptsWithCategories.length > 0) {
                    const firstScriptCategories = scriptsWithCategories[0].selectedCategories.sort().join(',');
                    const allSameCategories = scriptsWithCategories.every(s => 
                        s.selectedCategories.sort().join(',') === firstScriptCategories
                    );
                    
                    if (allSameCategories) {
                        groupCategories = scriptsWithCategories[0].selectedCategories;
                        hasAutoDetected = true;
                    }
                }

                groupedScripts.push({
                    identifier: `${groupName}-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    id: `${groupName}-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    url: scripts[0]?.url || null,
                    script: combinedScript,
                    fullTag: combinedFullTag,
                    isDismissed: false,
                    isSaved: false,
                    selectedCategories: groupCategories, // Only use if all scripts have same categories
                    hasAutoDetectedCategories: hasAutoDetected,
                    group: groupName,
                    groupScripts: scripts, // Store individual scripts for reference
                    category: groupName, // Use group name as category for display
                    // Add other properties from first script but don't override our combined content
                    src: scripts[0]?.src || null,
                    content: combinedScript,
                    type: scripts[0]?.type || null,
                    async: scripts[0]?.async || false,
                    defer: scripts[0]?.defer || false,
                    crossorigin: scripts[0]?.crossorigin || null,
                });
            });

            setScripts(prevScripts => {
                const existingScriptsMap = new Map(prevScripts.map(script => [script.identifier, script]));
                const mergedScripts = groupedScripts.map(newScript => {
                    const existingScript = existingScriptsMap.get(newScript.identifier);
                    if (existingScript) {
                        // For existing scripts, keep user selections unless the script has a different data-category attribute
                        // Check if the new script has different categories from data-category attribute
                        const hasNewCategories = newScript.selectedCategories.length > 0 && 
                            JSON.stringify(newScript.selectedCategories.sort()) !== JSON.stringify(existingScript.selectedCategories.sort());
                        
                        return {
                            ...newScript,
                            isSaved: existingScript.isSaved,
                            selectedCategories: hasNewCategories ? newScript.selectedCategories : existingScript.selectedCategories,
                            isDismissed: existingScript.isDismissed,
                            hasAutoDetectedCategories: hasNewCategories ? newScript.hasAutoDetectedCategories : existingScript.hasAutoDetectedCategories,
                        };
                    }
                    // For new scripts, use the categories parsed from data-category attribute
                    return newScript;
                });
                
                const finalScripts = mergedScripts.filter(script => script.identifier !== null);
                
                // Cache the scripts in sessionStorage for future use
                try {
                    setAuthStorageItem('scriptContext_scripts', JSON.stringify(finalScripts));
                } catch (error) {
                }
                
                setIsLoading(false);
                setHasScanned(true); // Mark scan as completed after successful fetch
                return finalScripts;
            });
        } catch (error) {
            // Don't show error popup for fetch failures - just set empty scripts
            setScripts([]);
            setIsLoading(false);
            setHasScanned(true); // Mark scan as completed even if it failed
        }
    }, [setScripts, getScriptIdentifier, siteInfo]);

  

    useEffect(() => {
        if (fetchScripts) {
            fetchScriptData(true); // Force refresh when triggered by rescan button
            setFetchScripts(false);
        }
    }, [fetchScripts, fetchScriptData, setFetchScripts]);

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        let successMessageShown = false; // Flag to prevent showing message again
        
        try {
            // COMMENTED OUT: const userinfo = localStorage.getItem("consentbit-userinfo");
            const userinfo = getAuthStorageItem("consentbit-userinfo");
            const tokens = JSON.parse(userinfo || "{}")?.sessionToken;
            if (!tokens) {
                setSaveStatus({
                    success: false,
                    message: "No authentication token found. Please authenticate first.",
                });
                setIsSaving(false);
                return;
            }

            const scriptsToSave: ScriptCategory[] = scripts
                .filter(script => script.identifier !== null && (script.fullTag || "").includes("data-category="))
                .map(script => ({
                    src: script.src || script.url || null,
                    content: script.fullTag || script.script || null,
                    categories: script.selectedCategories,
                }));

            if (scriptsToSave.length === 0) {
                setSaveStatus({
                    success: false,
                    message: "No scripts with selected categories to save.",
                });
                setIsSaving(false);
                return;
            }

            // Call save - background completion will be silent (no callback passed)
            const result = await customCodeApi.saveScriptCategorizations(tokens, scriptsToSave) as {
                success: boolean;
                message?: string;
                isEarlyResponse?: boolean;
                error?: { message?: string } | string;
            };

            if (result.success) {
                // Show success message only once (may be early response after 2s)
                if (!successMessageShown) {
                    successMessageShown = true;
                    setSaveStatus({
                        success: true,
                        message: result.message || "Script categories saved successfully!",
                    });
                    // Mark that we've successfully saved - this will change button text to "Update Categories"
                    setHasSuccessfullySaved(true);
                }
                
                // Update the local state: mark the currently saved scripts as 'isSaved: true',
                // and keep the 'isSaved' status of other scripts as they were.
                setScripts(prevScripts =>
                    prevScripts.map(script => {
                        if (!script.identifier) {
                            return script; 
                        }
                        const wasJustSaved = scriptsToSave.some(savedScript =>
                            savedScript.content === (script.fullTag || script.script) &&
                            savedScript.src === (script.src || script.url)
                        );
                        
                        // Debug logging for save process
                        if (wasJustSaved) {
                        }
                        
                        return { ...script, isSaved: script.isSaved || wasJustSaved };
                    })
                );
                
                // If this was an early response (after 2s timeout), keep saving in background
                // The save will continue and complete silently without showing another message
                if (result.isEarlyResponse) {
                    // Keep isSaving true to show "Saving..." while background save completes
                    // The background save will complete silently - no UI updates
                    // Set a longer timeout to ensure button resets even if background save takes time
                    setTimeout(() => {
                        setIsSaving(false);
                    }, 1000); // Increased delay to ensure button resets
                } else {
                    // Save completed quickly (< 2s), stop showing "Saving..."
                    setIsSaving(false);
                }
            } else {
                // Handle error response
                const errorMessage = typeof result.error === 'object' && result.error?.message 
                    ? result.error.message 
                    : typeof result.error === 'string' 
                    ? result.error 
                    : "Failed to save categories";
                if (!successMessageShown) {
                    setSaveStatus({
                        success: false,
                        message: errorMessage,
                    });
                }
                setIsSaving(false);
            }
        } catch (error) {
            // Only show error if we haven't already shown a success message
            if (!successMessageShown) {
                setSaveStatus({
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to save categories",
                });
            }
            setIsSaving(false);
        }
    };


    const handleToggleEdit = useCallback((index: number) => {
        setScripts(prevScripts =>
            prevScripts.map((script, i) => {
                if (i === index) {
                    return { 
                        ...script, 
                        isSaved: false 
                    };
                }
                return script;
            })
        );
        // Reset hasSuccessfullySaved when user edits a script
        setHasSuccessfullySaved(false);
    }, [setScripts]);

    // ... existing code ...

    const handleToggle = useCallback((category: string, scriptIndex: number) => {
        // Prevent toggling Essential category - it must always be enabled
        if (category === "Essential") {
            return; // Do nothing if trying to toggle Essential
        }
        
        // Reset hasSuccessfullySaved when user changes categories
        setHasSuccessfullySaved(false);
        
        setScripts(prevScripts =>
            prevScripts.map((script, index) => {
                if (index === scriptIndex && script.identifier) {
                    let updatedCategories = script.selectedCategories.includes(category)
                        ? script.selectedCategories.filter(c => c !== category)
                        : [...script.selectedCategories, category];

                    // Update all individual scripts in the group
                    let updatedGroupScripts = script.groupScripts;
                    if (updatedGroupScripts) {
                        updatedGroupScripts = updatedGroupScripts.map(groupScript => {
                            let updatedTag = groupScript.fullTag || '';
                            const tagRegex = /<script\b([^>]*)>/i;
                            const match = updatedTag.match(tagRegex);

                            if (match) {
                                let attrs = match[1];
                                // Remove consent-related attributes and data-category
                                attrs = attrs.replace(/\s*data-cb-consent[^"'\s]*\s*/g, '');
                                attrs = attrs.replace(/\s*data-category\s*=\s*"[^"]*"/i, '');
                                
                                // Check if there are non-essential categories
                                const nonEssentialCategories = updatedCategories.filter(cat => cat !== "Essential");
                                const hasNonEssential = nonEssentialCategories.length > 0;
                                
                                // Check if script is in Google category/group (case-insensitive)
                                const isGoogleScript = script.group?.toLowerCase().includes('google') || script.category?.toLowerCase().includes('google');

                                // Only add/update type="text/plain" if there are non-essential categories AND it's not a Google script
                                if (hasNonEssential && !isGoogleScript) {
                                    // Update or add type attribute
                                    if (attrs.includes('type=')) {
                                        attrs = attrs.replace(/type\s*=\s*"[^"]*"/i, 'type="text/plain"');
                                    } else {
                                        attrs += ' type="text/plain"';
                                    }
                                } else {
                                    // Remove type="text/plain" if only Essential, no categories, or Google script
                                    attrs = attrs.replace(/\s*type\s*=\s*"text\/plain"\s*/i, ' ');
                                    attrs = attrs.trim();
                                }
                                
                                // Add category attribute if needed (including Essential)
                                const categoryAttr = updatedCategories.length > 0
                                    ? ` data-category="${updatedCategories.join(',')}"`
                                    : '';
                                // Ensure there's always a space between <script and attributes
                                const trimmedAttrs = attrs.trim();
                                const combinedAttrs = trimmedAttrs + categoryAttr;
                                const scriptTag = combinedAttrs.trim() ? `<script ${combinedAttrs.trim()}>` : `<script>`;
                                updatedTag = updatedTag.replace(tagRegex, scriptTag);
                            }

                            return {
                                ...groupScript,
                                selectedCategories: updatedCategories,
                                fullTag: updatedTag,
                                script: updatedTag,
                            };
                        });
                    }

                    // Update the combined script tag for the group
                    let updatedCombinedTag = script.fullTag || '';
                    if (updatedGroupScripts) {
                        updatedCombinedTag = updatedGroupScripts.map(s => s.fullTag).filter(Boolean).join('\n');
                    }

                    return {
                        ...script,
                        selectedCategories: updatedCategories,
                        fullTag: updatedCombinedTag,
                        script: updatedCombinedTag,
                        groupScripts: updatedGroupScripts,
                    };
                }
                return script;
            })
        );
    }, [setScripts]);


    const handleDismiss = useCallback((scriptIndex: number) => {
        // Start fade-out animation
        setScripts(prev =>
            prev.map((s, i) => {
                if (i === scriptIndex) {
                    // Clean up the script tag
                    let originalTag = s.fullTag || '';
                    const tagRegex = /<script\b([^>]*)>/i;
                    const match = originalTag.match(tagRegex);
                    
                    if (match) {
                        let attrs = match[1];
                        // Remove all consent-related attributes and type
                        attrs = attrs.replace(/\s*data-cb-consent[^"'\s]*\s*/g, '');
                        attrs = attrs.replace(/\s*data-category\s*=\s*"[^"]*"/gi, '');
                        attrs = attrs.replace(/\s*type\s*=\s*"[^"]*"/gi, '');
                        
                        // Ensure there's always a space between <script and attributes
                        const trimmedAttrs = attrs.trim();
                        const scriptTag = trimmedAttrs ? `<script ${trimmedAttrs}>` : `<script>`;
                        originalTag = originalTag.replace(tagRegex, scriptTag);
                    }

                    return {
                        ...s,
                        fullTag: originalTag,
                        script: originalTag,
                        selectedCategories: [],
                        transitionState: 'fade-out'
                    };
                }
                return s;
            })
        );

        // After animation, hide script
        setTimeout(() => {
            setScripts(prev =>
                prev.map((s, i) =>
                    i === scriptIndex ? { ...s, isDismissed: true, transitionState: '' } : s
                )
            );
        }, 300); // must match CSS transition time
    }, [setScripts]);

    const handleActivate = useCallback((scriptIndex: number) => {
        // Instantly show script, then fade it in
        setScripts(prev =>
            prev.map((s, i) =>
                i === scriptIndex ? { ...s, isDismissed: false, transitionState: 'fade-in' } : s
            )
        );

        setTimeout(() => {
            setScripts(prev =>
                prev.map((s, i) =>
                    i === scriptIndex ? { ...s, transitionState: '' } : s
                )
            );
        }, 300);
    }, [setScripts]);

    // Add copy functionality
    const handleCopyScript = useCallback((script: string, index: number) => {
        if (!script) {
            return;
        }

        // Clean up the script tag before copying
        const tagRegex = /<script\b([^>]*)>/i;
        const match = script.match(tagRegex);
        
        let cleanScript = script;
        if (match) {
            let attrs = match[1];
            // Remove all existing type and consent-related attributes
            attrs = attrs.replace(/\s*type\s*=\s*"[^"]*"/gi, '');
            attrs = attrs.replace(/\s*data-cb-consent[^"'\s]*\s*/g, '');
            
            // Remove any existing data-category attributes
            attrs = attrs.replace(/\s*data-category\s*=\s*"[^"]*"/gi, '');
            
            // Get the categories from the script's selectedCategories (including Essential)
            const scriptObj = scripts[index];
            const selectedCategories = scriptObj?.selectedCategories || [];
            
            // Check if there are non-essential categories
            const nonEssentialCategories = selectedCategories.filter(cat => cat !== "Essential");
            const hasNonEssential = nonEssentialCategories.length > 0;
            
            // Check if script is in Google category/group (case-insensitive)
            const isGoogleScript = scriptObj?.group?.toLowerCase().includes('google') || scriptObj?.category?.toLowerCase().includes('google');

            // Only add type="text/plain" if there are non-essential categories AND it's not a Google script
            if (hasNonEssential && !isGoogleScript) {
                // Remove existing type attribute first
                attrs = attrs.replace(/\s*type\s*=\s*"[^"]*"/gi, '');
                attrs = attrs.trim();
                // Add type attribute
                attrs += ' type="text/plain"';
            } else {
                // Remove type="text/plain" if only Essential, no categories, or Google script
                attrs = attrs.replace(/\s*type\s*=\s*"text\/plain"\s*/gi, ' ');
                attrs = attrs.trim();
            }
            
            if (selectedCategories.length > 0) {
                // Add all selected categories including Essential
                attrs += ` data-category="${selectedCategories.join(',')}"`;
            }
            
            // Ensure there's always a space between <script and attributes
            const trimmedAttrs = attrs.trim();
            const scriptTag = trimmedAttrs ? `<script ${trimmedAttrs}>` : `<script>`;
            
            // Create clean script tag
            cleanScript = script.replace(tagRegex, scriptTag);
        }

        // Use the Clipboard API
        navigator.clipboard.writeText(cleanScript)
            .then(() => {
                setCopiedScriptIndex(index);
                // Reset the copied state after 1 second
                setTimeout(() => {
                    setCopiedScriptIndex(null);
                }, 1000);
            })
            .catch(err => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = cleanScript;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopiedScriptIndex(index);
                    setTimeout(() => {
                        setCopiedScriptIndex(null);
                    }, 1000);
                } catch (err) {
                }
                document.body.removeChild(textArea);
            });
    }, [scripts]);

    useEffect(() => {
        if (saveStatus) {
            setShowPopup(true);
            const timer = setTimeout(() => {
                setShowPopup(false);
                setTimeout(() => {
                    setSaveStatus(null);
                }, 200);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    return (
        <div className="container-script">
            <div className="section back-color">
                <div className="flexings">
                    <div>
                        <img src={sheild} style={{ marginTop: '5px' }} alt="catogery image" />
                    </div>
                    <div>
                        <div className="header">
                            <div>
                                <span>Scan your project for any scripts that set cookies.</span>
                            </div>
                        </div>
                        {saveStatus && (
                            <div className={`popup-overlays ${showPopup ? 'fade-in' : 'fade-out'}`}>
                                <div className={`popup-boxs ${saveStatus.success ? 'success' : 'error'}`}>
                                    <p>{saveStatus.message}</p>
                                </div>
                            </div>
                        )}
                        <p>Organize and replace them using our recommended snippet, and refer to our tutorial for a streamlined setup.</p>
                        <a href="https://www.consentbit.com/help-document" target="_blank">Need help? See the docs <i><img src={uparrow} alt="uparrow" /></i></a>
                    </div>
                </div>
            </div>

            {scripts.length > 0 && (
                <div className="line">
                    <img src={line2} alt="line2" />
                </div>)}

            {scripts.length > 0 && hasAnyCategories && (
                <div className="save-btn-container">
                    <button className="save-all-btn" onClick={handleSaveAll} disabled={isSaving}>
                        {isSaving ? "Saving..." : (hasSuccessfullySaved || hasSavedCategories) ? "Update Categories" : "Save Categories"}
                    </button>
                </div>
            )}
            
            {(() => { return null; })()}
            {isLoading ? (
                <div className="pulse-overlays">
                    <PulseAnimation />
                </div>
            ) : scripts.length === 0 ? (
                <div className="sections">
                    <img src={search} alt="search" />
                    <p>{hasScanned ? "No analytics scripts found in your project." : "Click 'Scan Project' to analyze your project."}</p>
                </div>
            ) : (
                (() => {
                    const filteredScripts = scripts.filter(script => script.identifier !== null);
                    return filteredScripts;
                })()
                    .map((script, index) => {
                        return (
                        <div key={script.identifier || index} className={`section-script script-container ${script.transitionState || ''}`}>
                            {script.isSaved && !script.isDismissed ? (
                                // --- EDIT CONFIRMATION VIEW ---
                                <div className="flexing">
                                    <div>
                                        <img src={tickmark} alt="checkmark" className="flex-image" />
                                    </div>
                                    <div className="editdiv">
                                        <div className="editname">
                                            <h4 className="heading-text">{script.category.charAt(0).toUpperCase() + script.category.slice(1) || 'Script'} is implemented correctly.</h4>
                                        </div>
                                        <div className="bottom-row">
                                            <p className="category-text">Categories: <span className="category-highlight">{script.selectedCategories.join(', ')}</span></p>
                                            <div className="edit-flex" onClick={() => handleToggleEdit(index)} style={{ cursor: 'pointer' }}>
                                                <img className="editimage" src={edit} alt="edit icon" />
                                                <p className="edit-text">Edit</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {script.isDismissed ? (
                                        <div className="dismissed-message">
                                            <p>
                                                <span>
                                                    {script.category
                                                        ? script.category.charAt(0).toUpperCase() + script.category.slice(1)
                                                        : script.src
                                                            ? script.src.charAt(0).toUpperCase() + script.src.slice(1)
                                                            : 'Unknown'}
                                                </span>{' '}
                                                Script is Dismissed!
                                            </p>

                                            <button className="dismiss-btn" onClick={() => handleActivate(index)}> <img src={Active} alt="activate icon" style={{ marginRight: '8px', width: "14px", height: "14px" }} />Activate</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flexings">
                                                <div>
                                                    <img src={explain} alt="catogery image" />
                                                </div>
                                                <div className="width-100">
                                                    <div className="header">
                                                        <div>
                                                            <span className="text-[12px] font-bold">
                                                                {script.category
                                                                    ? `Update the ${script.category.charAt(0).toUpperCase() + script.category.slice(1)} Script`
                                                                    : 'Unknown Script'}
                                                            </span>
                                                        </div>
                                                        {/* <div className="flex">
                                                            <img src={settings} alt="settingsimage" />
                                                            {siteInfo?.shortName ? (
                                                                <a 
                                                                    href={`https://webflow.com/dashboard/sites/${siteInfo.shortName}/custom-code`}
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="font-14 light"
                                                                    style={{ cursor: 'pointer' }}
                
                                                                >
                                                                    Site Settings &gt; Custom Code
                                                                </a>
                                                            ) : (
                                                                <span className="font-14 light">
                                                                    Site Settings &gt; Custom Code
                                                                </span>
                                                            )}
                                                        </div> */}
                                                        <button className="dismiss-btn" onClick={() => handleDismiss(index)}>  <img src={dismiss} alt="Dismiss icon" style={{ marginRight: '8px' }} />Dismiss</button>
                                                    </div>
                                                    <p>Check categories → copy script → open the page to paste script:</p>
                                                    <div><img src={line} alt="lineimage" /></div>
                                                    <div className="category-code-block">
                                                        <div className="category">
                                                            <span>Category:</span>
                                                            {categories.map((category) => {
                                                                const isEssential = category === "Essential";
                                                                // Essential should always appear checked, even if not in selectedCategories
                                                                const isChecked = isEssential ? true : script.selectedCategories.includes(category);
                                                                
                                                                return (
                                                                    <label key={category} className={`toggle-switch ${isEssential ? 'essential-disabled' : ''}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            value={category}
                                                                            checked={isChecked}
                                                                            disabled={isEssential}
                                                                            onChange={() => handleToggle(category, index)}
                                                                        />
                                                                        <span className="slider"></span>
                                                                        <span className="category-label">{category}</span>
                                                                        <div className="tooltip-containers">
                                                                            <img src={questionmark} alt="info" className="tooltip-icon" />
                                                                            <span className="tooltip-text">
                                                                                {isEssential 
                                                                                    ? "Essential category is always enabled and cannot be changed."
                                                                                    : "Categorize this script based on its purpose."}
                                                                            </span>
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                        <div>
                                                        <div className="code-block">
                                                            <div className="script-header">
                                                                <textarea
                                                                    value={script.fullTag || ''}
                                                                    readOnly
                                                                    className={`script-input ${copiedScriptIndex === index ? 'copied' : ''}`}
                                                                    rows={8}
                                                                    placeholder="Script content..."
                                                                />
                                                               
                                                                {copiedScriptIndex === index ? (
                                                                     <img
                                                                        src={tickmarkcopy}
                                                                        className="copy-button"
                                                                        alt="Copy icon"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={copyScript}
                                                                        className="copy-button"
                                                                        onClick={() => handleCopyScript(script.fullTag || '', index)}
                                                                        alt="Copy icon"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="gotto-settings">
                                                                    {siteInfo?.shortName ? (
                                                                        <a
                                                                            href={`https://webflow.com/dashboard/sites/${siteInfo.shortName}/custom-code`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="font-14 light flex items-center gap-2"
                                                                            style={{ cursor: "pointer", color: "rgba(140, 121, 255, 1)" }}
                                                                        >
                                                                            <span>Open the page to paste script</span>
                                                                            <img src={goto} alt="" className="w-4 h-4" />
                                                                        </a>

                                                                    ) : (
                                                                        <span className="font-14 light">
                                                                            Open the page to paste script <img src={goto} alt="" />
                                                                        </span>
                                                                    )}
                                                                </div>

                                                        </div>
                                                     
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        );
                    })
            )}
        </div>
    );
};

export default Script;