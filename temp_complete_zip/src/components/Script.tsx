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


const Script: React.FC<{
    fetchScripts: boolean;
    setFetchScripts: React.Dispatch<React.SetStateAction<boolean>>;
    isWelcome?: boolean;
}> = ({ fetchScripts, setFetchScripts, isWelcome }) => {
    const { scripts, setScripts } = useScriptContext();
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
    const categories = ["Essential", "Personalization", "Analytics", "Marketing"];
    const userinfo = localStorage.getItem("wf_hybrid_user");
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

    // Debug logs for siteInfo
    useEffect(() => {
    }, [siteInfo]);

    const getScriptIdentifier = useCallback((script: { src?: string | null; fullTag?: string | null }) => {
        return script.src || script.fullTag?.replace(/\s*data-category\s*=\s*"[^"]*"/i, '') || null;
    }, []);

    // Function to determine script group based on common patterns
    const getScriptGroup = useCallback((script: { src?: string | null; fullTag?: string | null }) => {
        const src = script.src || '';
        const fullTag = script.fullTag || '';
        const content = (src + ' ' + fullTag).toLowerCase();
        
        // Define script group patterns
        const groups = [
            { 
                name: 'Google Analytics', 
                patterns: [
                    'googletagmanager.com', 
                    'google-analytics.com', 
                    'gtag.js',
                    'gtag(',
                    'ga(',
                    'g-',
                    'ga_measurement_id', 
                    'ga_tracking_id',
                    'datalayer',
                    'window.datalayer'
                ] 
            },
            { name: 'Hotjar', patterns: ['hotjar.com', 'hj(', 'hjid', '_hjsettings'] },
            { name: 'HubSpot', patterns: ['hubspot.com', 'hs-analytics', 'hsforms', '_hsq', 'hubspot'] },
            { name: 'Facebook Pixel', patterns: ['facebook.com/tr', 'fbevents.js', 'fbq(', 'facebook pixel'] },
            { name: 'Intercom', patterns: ['intercom.io', 'intercom.com', 'intercom(', 'intercomsettings'] },
            { name: 'Mixpanel', patterns: ['mixpanel.com', 'mixpanel.init', 'mixpanel.track'] },
            { name: 'Segment', patterns: ['segment.io', 'segment.com', 'analytics.js', 'analytics.load'] },
            { name: 'Amplitude', patterns: ['amplitude.com', 'amplitude.getinstance', 'amplitude.init'] },
            { name: 'Drift', patterns: ['drift.com', 'drift.snippet_version', 'drift.load'] },
            { name: 'Crisp', patterns: ['crisp.chat', 'crisp.im', '$crisp'] },
            { name: 'Zendesk', patterns: ['zendesk.com', 'zopim.com', 'ze('] },
            { name: 'Mailchimp', patterns: ['mailchimp.com', 'chimpstatic.com', 'mc.us'] },
            { name: 'LinkedIn', patterns: ['linkedin.com/insight', 'snap.type', '_linkedin_partner_id'] },
            { name: 'Twitter', patterns: ['twitter.com/analytics', 'twq(', 'twitter pixel'] },
            { name: 'Pinterest', patterns: ['pinterest.com/tag', 'pintrk(', 'pinterest tag'] },
            { name: 'TikTok', patterns: ['tiktok.com/analytics', 'ttq.', 'tiktok pixel'] },
            { name: 'Snapchat', patterns: ['snap.com/analytics', 'snaptr(', 'snapchat pixel'] },
            { name: 'Reddit', patterns: ['reddit.com/analytics', 'rdt(', 'reddit pixel'] }
        ];
        
        for (const group of groups) {
            if (group.patterns.some(pattern => content.includes(pattern))) {
                return group.name;
            }
        }
        
        return 'Other'; // Default group for unrecognized scripts
    }, []);

    const fetchScriptData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userInfo = JSON.parse(userinfo || "{}");
            const tokens = userInfo?.sessionToken;
            
            if (!tokens) {
                setIsLoading(false);
                return;
            }

            const result = await customCodeApi.analyticsScript(tokens);

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
            const validScripts = scriptsResponse.filter(script => script.fullTag?.trim() !== "");

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
                    group: getScriptGroup(script), // Add group information
                    ...script,
                };
            });

            // Group scripts by their group name
            const scriptGroups = new Map<string, typeof formattedScripts>();
            formattedScripts.forEach(script => {
                const groupName = script.group || 'Other';
                if (!scriptGroups.has(groupName)) {
                    scriptGroups.set(groupName, []);
                }
                scriptGroups.get(groupName)!.push(script);
            });

            // Create grouped scripts with combined content
            const groupedScripts = Array.from(scriptGroups.entries()).map(([groupName, scripts]) => {
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

                return {
                    identifier: `${groupName}-group-${scripts.map(s => s.identifier).join('-')}`,
                    id: `${groupName}-group-${scripts.map(s => s.identifier).join('-')}`,
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
                };
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
    }, [setScripts, userinfo, getScriptIdentifier, siteInfo]);

  

    useEffect(() => {
        if (fetchScripts) {
            const fetchDataAndResetFlag = async () => {
                await fetchScriptData();
                // Only reset the flag if not in welcome mode
                if (!isWelcome) {
                    setFetchScripts(false);
                }
            };
            fetchDataAndResetFlag();
        }
    }, [fetchScripts, fetchScriptData, setFetchScripts, isWelcome]);

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
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

                scripts
                    .filter(script => script.identifier !== null) 
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
                                                        <div className="flex">
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
                                                        </div>
                                                        <button className="dismiss-btn" onClick={() => handleDismiss(index)}>  <img src={dismiss} alt="Dismiss icon" style={{ marginRight: '8px' }} />Dismiss</button>
                                                    </div>
                                                    <p>Select a category:</p>
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
                                                        <div className="code-block">
                                                            <div className="script-header">
                                                                <textarea
                                                                    value={script.fullTag || ''}
                                                                    readOnly
                                                                    className={`script-input ${copiedScriptIndex === index ? 'copied' : ''}`}
                                                                    rows={8}
                                                                    placeholder="Script content..."
                                                                />
                                                                <button 
                                                                    className="copy-button"
                                                                    onClick={() => handleCopyScript(script.fullTag || '', index)}
                                                                    title="Copy script"
                                                                >
                                                                    {copiedScriptIndex === index ? (
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                                                                        </svg>
                                                                    )}
                                                                </button>
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