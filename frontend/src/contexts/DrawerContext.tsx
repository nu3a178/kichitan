import { createContext, useContext, useState } from "react";

type DrawerContextType = {
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
};
const DrawerContext = createContext<DrawerContextType | null>(null);
export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <DrawerContext.Provider value={{ openDrawer, setOpenDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a DrawerProvider");
  }
  return context;
};
