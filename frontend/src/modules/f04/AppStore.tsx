import React, { createContext, useContext, useState } from 'react';

interface AppState {
  activeInspectionId: string | null;
  activeFilterState: Record<string, any>;
  draftInspectionData: Record<string, any>;
  setActiveInspectionId: (id: string | null) => void;
  setFilterState: (key: string, value: any) => void;
  saveDraft: (key: string, data: any) => void;
  clearDraft: (key: string) => void;
}

const AppStoreContext = createContext<AppState | undefined>(undefined);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeFilterState, setActiveFilterState] = useState<Record<string, any>>({});
  const [draftInspectionData, setDraftInspectionData] = useState<Record<string, any>>({});

  const setFilterState = (key: string, value: any) => {
    setActiveFilterState(prev => ({ ...prev, [key]: value }));
  };

  const saveDraft = (key: string, data: any) => {
    setDraftInspectionData(prev => ({ ...prev, [key]: data }));
  };

  const clearDraft = (key: string) => {
    setDraftInspectionData(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <AppStoreContext.Provider
      value={{
        activeInspectionId,
        activeFilterState,
        draftInspectionData,
        setActiveInspectionId,
        setFilterState,
        saveDraft,
        clearDraft
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = (): AppState => {
  const context = useContext(AppStoreContext);
  if (!context) {
    return {
      activeInspectionId: null,
      activeFilterState: {},
      draftInspectionData: {},
      setActiveInspectionId: () => {},
      setFilterState: () => {},
      saveDraft: () => {},
      clearDraft: () => {},
    };
  }
  return context;
};
