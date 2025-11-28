// src/services/scriptCategorization.ts
import { ScriptCategory } from '../types/types';
import { EncryptionUtils } from '../util/Encryption-Utils';

const BASE_URL = "https://app.consentbit.com";
const SAVE_TIMEOUT_MS = 2000; // 2 seconds

export const scriptCategorizationService = {
  

  saveScriptCategorizations : async (token: string, categorizations: ScriptCategory[], onComplete?: (result: any) => void) => {
      // Create a promise that resolves after 2 seconds with success
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Script categories saved successfully!',
            isEarlyResponse: true // Flag to indicate this is an early response
          });
        }, SAVE_TIMEOUT_MS);
      });

      // Create the actual save promise
      const savePromise = (async () => {
        try {
          // Generate encryption key and IV
          const { key, iv } = await EncryptionUtils.generateKey();
      
          // Encrypt the categorizations data
          const encryptedData = await EncryptionUtils.encrypt(
            JSON.stringify({ scripts: categorizations }),
            key,
            iv
          );
      
          // Export the key for transmission
          const exportedKey = await crypto.subtle.exportKey('raw', key);
      
          const response = await fetch(`${BASE_URL}/api/save-categories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              scripts:encryptedData,
              key: Array.from(new Uint8Array(exportedKey)),
              iv: Array.from(iv)
            })
          });
          const result = await response.json();
          
          // Normalize response to ensure consistent format
          const normalizedResult = {
            success: response.ok && !result.error,
            message: result.message || 'Script categories saved successfully!',
            data: result.data || result,
            error: result.error || null
          };
          
          // Call onComplete callback if provided (for background completion)
          if (onComplete) {
            onComplete(normalizedResult);
          }
          
          return normalizedResult;
        } catch (error) {
          const errorResult = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to save script categorizations',
            data: null,
            error: {
              message: error instanceof Error ? error.message : 'Failed to save script categorizations'
            }
          };
          
          // Call onComplete callback with error if provided
          if (onComplete) {
            onComplete(errorResult);
          }
          
          return errorResult;
        }
      })();

      // Race between timeout and actual save
      // If timeout wins (2 seconds), return early success and continue save in background
      // If save completes first (< 2 seconds), return actual result
      try {
        const result = await Promise.race([timeoutPromise, savePromise]);
        
        // If we got an early response, continue the save in background
        if ((result as any).isEarlyResponse) {
          // Continue save in background - don't await, just let it complete silently
          // No UI updates will be triggered - the success message was already shown
          savePromise.then((finalResult) => {
            // Background save completed silently - no UI updates
            // Only call onComplete if provided (components don't pass it, so no updates)
            if (onComplete) {
              onComplete(finalResult);
            }
          }).catch(() => {
            // Background save failed silently - no UI updates
            // Only call onComplete if provided (components don't pass it, so no updates)
            if (onComplete) {
              onComplete({ success: false, error: { message: 'Background save failed' } });
            }
          });
        }
        return result;
      } catch (error) {
        // If the race itself fails, return error result
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to save script categorizations',
          error: {
            message: error instanceof Error ? error.message : 'Failed to save script categorizations'
          }
        };
      }
    },


    updateScriptCategorizations: async ( token: string, newCategorizations: ScriptCategory[]) => {
        try {
            // Save new categorizations
            await scriptCategorizationService.saveScriptCategorizations( token, newCategorizations);
            
            // Return success response
            return {
                success: true,
                message: 'Script categorizations updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update script categorizations'
            };
        }
    }
};