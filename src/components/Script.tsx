import React, { useState, useEffect, useCallback } from "react";
import "../style/styless.css";
import { ScriptCategory } from "../types/types";
import { customCodeApi } from "../services/api";
import { useScriptContext } from "../context/ScriptContext";
import PulseAnimation from './PulseAnimation';
import { usePersistentState } from '../hooks/usePersistentState';
import webflow from '../types/webflowtypes';

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
        // Removed console.log for production
    }, [scripts]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
    const categories = ["Essential", "Personalization", "Analytics", "Marketing"];
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
    const [siteInfo, setSiteInfo] = usePersistentState<{ siteId: string; siteName: string; shortName: string } | null>("siteInfo", null);

    // Fetch site info when component mounts
    useEffect(() => {
        const fetchSiteInfo = async () => {
            try {
                const siteInfo = await webflow.getSiteInfo();
                setSiteInfo(siteInfo);
            } catch (error) {
            }
        };

        if (!siteInfo) {
            fetchSiteInfo();
        }
    }, [siteInfo, setSiteInfo]);

    // Site change detection - clear scripts when site changes
    useEffect(() => {
        const detectSiteChange = async () => {
            try {
                const currentSiteInfo = await webflow.getSiteInfo();
                const newSiteId = currentSiteInfo?.siteId;
                
                if (newSiteId && siteInfo?.siteId && newSiteId !== siteInfo.siteId) {
                    console.log('🔄 Site changed in Script component:', siteInfo.siteId, '->', newSiteId);
                    console.log('🧹 Clearing scripts to prevent cross-site contamination');
                    
                    // Clear scripts immediately
                    setScripts([]);
                    localStorage.removeItem('scriptContext_scripts');
                    
                    // Update site info
                    setSiteInfo(currentSiteInfo);
                }
            } catch (error) {
                console.error('Error detecting site change:', error);
            }
        };

        // Check for site changes every 2 seconds
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
            console.log('🔄 Regenerating session token for current site...');
            
            // Clear old token first to force regeneration
            localStorage.removeItem("consentbit-userinfo");
            console.log('🗑️ Cleared old session token');
            
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
            
            console.log('🎯 Requesting new token for site:', siteInfo.siteId);
            
            // Exchange for new session token
            const requestBody = {
                idToken, 
                siteId: siteInfo.siteId 
            };
            
            console.log('📤 Sending token exchange request:', {
                url: 'https://cb-server.web-8fb.workers.dev/api/auth/token',
                siteId: siteInfo.siteId,
                hasIdToken: !!idToken
            });

            const response = await fetch('https://cb-server.web-8fb.workers.dev/api/auth/token', {
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
            console.log('🔍 Backend token response (Script component):', {
                hasSessionToken: !!data.sessionToken,
                hasFirstName: !!data.firstName,
                hasEmail: !!data.email,
                hasSiteId: !!data.siteId,
                requestedSiteId: siteInfo.siteId,
                fullResponse: data
            });

            // Update stored authentication data
            const userData = {
                sessionToken: data.sessionToken,
                firstName: data.firstName,
                email: data.email,
                siteId: data.siteId || siteInfo.siteId, // Use backend's siteId or fallback to requested siteId
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
            };

            localStorage.setItem("consentbit-userinfo", JSON.stringify(userData));
            console.log('✅ Session token regenerated successfully for site:', siteInfo.siteId);
            console.log('🔍 New token payload should contain siteId:', siteInfo.siteId);
            
            return data.sessionToken;
        } catch (error) {
            console.error('❌ Error regenerating session token:', error);
            return null;
        }
    }, []);



    const fetchScriptData = useCallback(async () => {
        setIsLoading(true);
        // Clear existing scripts before fetching new ones to prevent cross-site contamination
        setScripts([]);
        
        // Also clear from localStorage to ensure complete cleanup
        localStorage.removeItem('scriptContext_scripts');
        
        try {
            const userinfo = localStorage.getItem("consentbit-userinfo");
            const userInfo = JSON.parse(userinfo || "{}");
            const tokens = userInfo?.sessionToken;
            
            if (!tokens) {
                setIsLoading(false);
                return;
            }

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
                    console.log('🔍 Token siteId check:', payload.siteId, 'vs current:', currentSiteId, 'match:', tokenHasCorrectSiteId);
                }
            } catch (error) {
                console.log('❌ Could not decode session token for siteId check');
            }
            
            if (userData.siteId !== currentSiteId || !tokenHasCorrectSiteId) {
                const oldSiteId = userData.siteId;
                console.log('🔄 Site ID mismatch detected:', oldSiteId, 'vs', currentSiteId, 'or token siteId mismatch');
                console.log('⚠️ Session token may be for wrong site - regenerating...');
                
                // Clear old token data completely
                localStorage.removeItem("consentbit-userinfo");
                localStorage.removeItem("scriptContext_scripts");
                
                // Regenerate session token for the new site
                const newToken = await regenerateSessionToken();
                if (newToken) {
                    finalTokens = newToken;
                    console.log('✅ Using regenerated session token for site:', currentSiteId);
                } else {
                    console.log('⚠️ Token regeneration failed, using existing token');
                }
            } else {
                console.log('✅ Stored site ID matches current site ID:', currentSiteId);
            }

            // Log token for debugging (remove in production)
            const result = await customCodeApi.analyticsScript(finalTokens, currentSiteId);

            // Print complete server response
            console.log('🔍 COMPLETE SERVER RESPONSE:');
            console.log('Full result object:', result);
            console.log('Result success:', result?.success);
            console.log('Result error:', result?.error);
            console.log('Result data:', result?.data);
            
            if (result?.data) {
                console.log('Data keys:', Object.keys(result.data));
                console.log('Analytics scripts array:', result.data.analyticsScripts);
                console.log('Analytics scripts length:', result.data.analyticsScripts?.length);
                
                // Print each script individually
                if (result.data.analyticsScripts && Array.isArray(result.data.analyticsScripts)) {
                    result.data.analyticsScripts.forEach((script, index) => {
                        console.log(`📜 Script ${index + 1}:`, {
                            identifier: script.identifier,
                            siteId: script.siteId,
                            fullTag: script.fullTag,
                            url: script.url,
                            group: script.group,
                            isActive: script.isActive,
                            selectedCategories: script.selectedCategories,
                            allKeys: Object.keys(script)
                        });
                    });
                }
            }

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
            
            // Debug: Log the current site ID and any scripts with site IDs
            console.log('Current Site ID:', currentSiteId);
            console.log('Scripts from API (first 3):', scriptsResponse.slice(0, 3).map(s => ({ 
                identifier: s.identifier, 
                siteId: s.siteId,
                hasSiteId: !!s.siteId,
                hasFullTag: !!s.fullTag,
                hasUrl: !!s.url,
                group: s.group
            })));
            
            // Filter scripts - show all scripts that have valid content
            const validScripts = scriptsResponse.filter(script => {
                // Only filter out scripts that have no content at all
                if (!script.fullTag?.trim() && !script.src?.trim() && !script.content?.trim()) {
                    console.log('🚫 Filtering out script with no content:', script.identifier || 'unnamed');
                    return false;
                }
                
                // If script has siteId, only filter if it's explicitly from a different site
                if (script.siteId && script.siteId !== currentSiteId) {
                    console.log('🚫 Filtering out script from different site:', script.siteId, 'vs current:', currentSiteId);
                    return false;
                }
                
                // For scripts without siteId, trust the backend filtering
                // Since we're passing the correct siteId to the API, the backend should return
                // scripts for the current site only
                console.log('✅ Accepting script:', script.identifier || 'unnamed', 'siteId:', script.siteId || 'none');
                return true;
            });
            
            console.log('Valid scripts after filtering:', validScripts.length);
            console.log('✅ Backend should now be scanning correct site due to token regeneration');
            
            // If no scripts passed filtering and backend doesn't provide siteId, show a warning
            if (validScripts.length === 0 && scriptsResponse.length > 0) {
                console.warn('⚠️ All scripts were filtered out. This might indicate:');
                console.warn('1. Backend is not providing siteId in script data');
                console.warn('2. Domain filtering is too aggressive');
                console.warn('3. Session token siteId mismatch');
                console.warn('Consider temporarily disabling filtering for debugging');
            }
            
            // Debug: Add a global function to manually regenerate token
            (window as any).regenerateToken = regenerateSessionToken;
            (window as any).testSiteChange = async () => {
                console.log('🧪 Testing site change and token regeneration...');
                const newToken = await regenerateSessionToken();
                if (newToken) {
                    console.log('✅ Token regenerated, now fetching scripts...');
                    // Trigger a new script fetch
                    fetchScriptData();
                }
            };
            
            (window as any).forceTokenRegeneration = async () => {
                console.log('🚀 Force regenerating token...');
                // Clear everything first
                localStorage.removeItem("consentbit-userinfo");
                localStorage.removeItem("scriptContext_scripts");
                
                // Wait a bit then regenerate
                setTimeout(async () => {
                    const newToken = await regenerateSessionToken();
                    if (newToken) {
                        console.log('✅ Force regeneration complete, fetching scripts...');
                        fetchScriptData();
                    }
                }, 1000);
            };
            
            // Debug: Add function to bypass filtering temporarily
            (window as any).bypassFiltering = () => {
                console.log('🚨 BYPASSING SCRIPT FILTERING - FOR DEBUGGING ONLY');
                console.log('Raw scripts from API:', scriptsResponse);
                setScripts(scriptsResponse.map(script => ({
                    ...script,
                    selectedCategories: script.selectedCategories || ["Essential"],
                    isActive: script.isActive !== undefined ? script.isActive : true
                })));
            };
            
            // Debug: Add function to show filtered vs unfiltered scripts
            (window as any).compareScripts = () => {
                console.log('📊 SCRIPT COMPARISON:');
                console.log('Raw scripts count:', scriptsResponse.length);
                console.log('Filtered scripts count:', validScripts.length);
                console.log('Raw scripts:', scriptsResponse.map(s => ({ identifier: s.identifier, siteId: s.siteId, hasFullTag: !!s.fullTag })));
                console.log('Filtered scripts:', validScripts.map(s => ({ identifier: s.identifier, siteId: s.siteId, hasFullTag: !!s.fullTag })));
            };
            
            // Debug: Add function to manually fetch and print server response
            (window as any).printServerResponse = async () => {
                console.log('🔄 Manually fetching server response...');
                try {
                    const userinfo = localStorage.getItem("consentbit-userinfo");
                    const userInfo = JSON.parse(userinfo || "{}");
                    const tokens = userInfo?.sessionToken;
                    
                    if (!tokens) {
                        console.error('❌ No session token found');
                        return;
                    }
                    
                    const currentSiteInfo = await webflow.getSiteInfo();
                    const currentSiteId = currentSiteInfo?.siteId;
                    
                    console.log('🎯 Fetching for site ID:', currentSiteId);
                    console.log('🔑 Using token:', tokens.substring(0, 50) + '...');
                    
                    const result = await customCodeApi.analyticsScript(tokens, currentSiteId);
                    
                    console.log('🔍 MANUAL SERVER RESPONSE:');
                    console.log('Full result:', JSON.stringify(result, null, 2));
                    
                    if (result?.data?.analyticsScripts) {
                        console.log('📜 All scripts from server:');
                        result.data.analyticsScripts.forEach((script, index) => {
                            console.log(`Script ${index + 1}:`, JSON.stringify(script, null, 2));
                        });
                    }
                    
                } catch (error) {
                    console.error('❌ Error fetching server response:', error);
                }
            };
            
            // Debug: Add function to show all scripts without any filtering
            (window as any).showAllScripts = () => {
                console.log('🚨 SHOWING ALL SCRIPTS WITHOUT FILTERING');
                console.log('Raw scripts from API:', scriptsResponse);
                console.log('Scripts count:', scriptsResponse.length);
                
                // Set all scripts directly without filtering
                const allScripts = scriptsResponse.map(script => ({
                    ...script,
                    selectedCategories: script.selectedCategories || 
                                     (script.category ? (Array.isArray(script.category) ? script.category : script.category.split(',').map(c => c.trim())) : ["Essential"]),
                    isActive: script.isActive !== undefined ? script.isActive : true
                }));
                
                console.log('Setting all scripts:', allScripts);
                setScripts(allScripts);
            };

            const formattedScripts = validScripts.map(script => {
                // Add or update type attribute in the script tag
                let modifiedTag = script.fullTag || '';
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
                    
                    // Update or add type attribute
                    if (attrs.includes('type=')) {
                        attrs = attrs.replace(/type\s*=\s*"[^"]*"/i, 'type="text/plain"');
                    } else {
                        attrs += ' type="text/plain"';
                    }
                    
                    const newTag = `<script${attrs}>`;
                    modifiedTag = modifiedTag.replace(tagRegex, newTag);
                }

                return {
                    identifier: getScriptIdentifier(script),
                    url: script.src || null,
                    script: modifiedTag || null,
                    fullTag: modifiedTag || null,
                    isDismissed: false,
                    isSaved: false,
                    selectedCategories: hasDataCategoryAttribute ? existingCategories : [], // Only set if data-category exists
                    hasAutoDetectedCategories: hasDataCategoryAttribute && existingCategories.length > 0, // Track if categories were auto-detected
                    group: script.category || 'Other', // Use backend's category
                    ...script,
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
                setIsLoading(false);
                return mergedScripts.filter(script => script.identifier !== null);
            });
        } catch (error) {
            setSaveStatus({
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch scripts",
            });
            setIsLoading(false);
        }
    }, [setScripts, getScriptIdentifier, siteInfo]);

  

    useEffect(() => {
        if (fetchScripts) {
            fetchScriptData();
            setFetchScripts(false);
        }
    }, [fetchScripts, fetchScriptData, setFetchScripts]);

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const userinfo = localStorage.getItem("consentbit-userinfo");
            const tokens = JSON.parse(userinfo || "{}")?.sessionToken;
            if (!tokens) {
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
                return;
            }

            const result = await customCodeApi.saveScriptCategorizations(tokens, scriptsToSave);

            if (result.success) {
                setSaveStatus({
                    success: true,
                    message: "Script categories saved successfully!",
                });
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
            } else {
                throw new Error(result.error || "Failed to save categories");
            }
        } catch (error) {
            setSaveStatus({
                success: false,
                message: error instanceof Error ? error.message : "Failed to save categories",
            });
        } finally {
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
    }, [setScripts]);

    // ... existing code ...

    const handleToggle = useCallback((category: string, scriptIndex: number) => {
        // Remove the Essential restriction - allow Essential to be toggled like other categories
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
                                
                                // Update or add type attribute
                                if (attrs.includes('type=')) {
                                    attrs = attrs.replace(/type\s*=\s*"[^"]*"/i, 'type="text/plain"');
                                } else {
                                    attrs += ' type="text/plain"';
                                }
                                
                                // Add category attribute if needed (including Essential)
                                const categoryAttr = updatedCategories.length > 0
                                    ? ` data-category="${updatedCategories.join(',')}"`
                                    : '';
                                const newTag = `<script${attrs}${categoryAttr}>`;
                                updatedTag = updatedTag.replace(tagRegex, newTag);
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
                        
                        // Create clean script tag
                        originalTag = originalTag.replace(tagRegex, `<script${attrs}>`);
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
            
            // Add type attribute
            attrs += ' type="text/plain"';
            
            // Get the categories from the script's selectedCategories (including Essential)
            const scriptObj = scripts[index];
            if (scriptObj?.selectedCategories?.length > 0) {
                // Add all selected categories including Essential
                attrs += ` data-category="${scriptObj.selectedCategories.join(',')}"`;
            }
            
            // Create clean script tag
            cleanScript = script.replace(tagRegex, `<script${attrs}>`);
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

            {scripts.length > 0 && (
                <div className="save-btn-container">
                    <button className="save-all-btn" onClick={handleSaveAll} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Categories"}
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
                    <p>Click 'Scan Project' to analyze your project.</p>
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
                                                                const isChecked = script.selectedCategories.includes(category);
                                                                
                                                                return (
                                                                    <label key={category} className="toggle-switch">
                                                                        <input
                                                                            type="checkbox"
                                                                            value={category}
                                                                            checked={isChecked}
                                                                            onChange={() => handleToggle(category, index)}
                                                                        />
                                                                        <span className="slider"></span>
                                                                        <span className="category-label">{category}</span>
                                                                        <div className="tooltip-containers">
                                                                            <img src={questionmark} alt="info" className="tooltip-icon" />
                                                                            <span className="tooltip-text">Categorize this script based on its purpose.</span>
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