import { HomeSidebar } from "@/components/HomeSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DrawerProvider, useDrawerContext } from "@/contexts/DrawerContext";
import { MapProvider, useMapContext } from "@/contexts/MapContext";
import { MapViewer } from "@/layout/MapViewer";
import { FaHouseUser } from "react-icons/fa";

const HomeContent = () => {
  const { isMobile, openMobile } = useSidebar();
  const { openDrawer, setOpenDrawer } = useDrawerContext();
  const { estateList, setSelectedEstate, setMapView } = useMapContext();
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
        {!openDrawer && estateList.length > 0 && (
          <Button
            onClick={() => setOpenDrawer(true)}
            className="absolute right-4 bottom-1/2 rounded-full"
          >
            ←
          </Button>
        )}

        <Drawer
          direction="right"
          open={openDrawer}
          onOpenChange={setOpenDrawer}
        >
          <DrawerContent
            className="flex flex-col justify-end"
            data-testid="drawer"
          >
            <div className="flex flex-col gap-2 overflow-y-auto p-4">
              {`検索結果: ${estateList.length}件`}
              {estateList.map((estate, i) => (
                <Card
                  className="w-full shrink-0 hover:shadow-lg hover:scale-105 transition-transform"
                  data-testid={`estate-${i}`}
                  onClick={() => {
                    setSelectedEstate(estate);
                    setMapView({
                      latitude: estate.latitude,
                      longitude: estate.longitude,
                      zoom: 18,
                    });
                  }}
                  key={i}
                >
                  <p>{estate.name}</p>
                  <p className="text-sm text-gray-500">{estate.address}</p>
                  <img src="https://picsum.photos/300/300" />
                  <p>{`家賃:¥${estate.rent_price?.toLocaleString()}`}</p>
                </Card>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export const Home = () => {
  return (
    <MapProvider>
      <SidebarProvider>
        <DrawerProvider>
          <HomeContent />
        </DrawerProvider>
      </SidebarProvider>
    </MapProvider>
  );
};
