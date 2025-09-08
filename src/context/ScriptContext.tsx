import React, { createContext, useContext, useEffect } from "react";
import { ScriptType } from "../types/types"; // adjust the path
import { usePersistentState } from "../hooks/usePersistentState";

type ExtendedScriptType = ScriptType & { isSaved?: boolean };

type ScriptContextType = {
  scripts: ExtendedScriptType[];
  setScripts: React.Dispatch<React.SetStateAction<ExtendedScriptType[]>>;
  clearScripts: () => void;
};

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export { ScriptContext };

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = usePersistentState<ExtendedScriptType[]>("scriptContext_scripts", []);

  // Clear scripts on component mount to prevent cross-site contamination
  useEffect(() => {
    setScripts([]);
    // Also clear from localStorage directly to ensure complete cleanup
    localStorage.removeItem('scriptContext_scripts');
  }, [setScripts]);

  const clearScripts = () => {
    setScripts([]);
    // Also clear from localStorage directly
    localStorage.removeItem('scriptContext_scripts');
  };

  return (
    <ScriptContext.Provider value={{ scripts, setScripts, clearScripts }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScriptContext = () => {
  const context = useContext(ScriptContext);
  if (!context) throw new Error("useScriptContext must be used within a ScriptProvider");
  return context;
};

export default ScriptContext;
