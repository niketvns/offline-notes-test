"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface IAppContextValue {
  selectedTags: string[];
  handleSelectedTags: (tags: string[]) => {};
}

const AppContext = createContext<IAppContextValue>({} as IAppContextValue);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSelectedTags = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const value: IAppContextValue = useMemo(() => {
    return {
      selectedTags,
      handleSelectedTags,
    } as IAppContextValue;
  }, [selectedTags, handleSelectedTags]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return appContext;
};
