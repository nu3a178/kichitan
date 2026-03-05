import { HomeSidebar } from "@/components/HomeSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { MapProvider } from "@/contexts/MapContext";
import { MapViewer } from "@/layout/MapViewer";
import { useEffect } from "react";

const HomeContent = () => {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(true);
    }
  }, [isMobile, setOpenMobile]);
  return (
    <div
      className={
        isMobile ? "relative w-screen h-screen" : "flex w-screen h-screen"
      }
    >
      <div className={isMobile ? "absolute left-0 z-[1000]" : ""}>
        <HomeSidebar />
        {!openMobile && <SidebarTrigger />}
      </div>
      <MapViewer />
    </div>
  );
};

export const Home = () => {
  return (
    <MapProvider>
      <SidebarProvider>
        <HomeContent />
      </SidebarProvider>
    </MapProvider>
  );
};
