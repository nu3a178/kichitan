import { HomeDrawer } from "@/components/HomeDrawer";
import { HomeSidebar } from "@/components/HomeSidebar";

import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { MapProvider } from "@/contexts/MapContext";
import { RouteProvider } from "@/contexts/RouteContext";
import { MapViewer } from "@/layout/MapViewer";
import { FaHouseUser } from "react-icons/fa";

const HomeContent = () => {
  const { isMobile, openMobile } = useSidebar();

  return (
    <div
      className={
        isMobile
          ? "relative w-[100dvw] h-[100dvh]"
          : "flex w-[100dvw] h-[100dvh]"
      }
    >
      <div className={isMobile ? "absolute left-0 z-[1000]" : ""}>
        <HomeSidebar />
        {isMobile && !openMobile && (
          <SidebarTrigger className="bg-green-800 text-white">
            <FaHouseUser />
            検索する
          </SidebarTrigger>
        )}
      </div>
      <div className={isMobile ? "absolute inset-0" : "flex-1 min-w-0"}>
        <MapViewer />
      </div>
      <HomeDrawer />
    </div>
  );
};

export const Home = () => {
  return (
    <MapProvider>
      <RouteProvider>
        <SidebarProvider>
          <DrawerProvider>
            <HomeContent />
          </DrawerProvider>
        </SidebarProvider>
      </RouteProvider>
    </MapProvider>
  );
};
