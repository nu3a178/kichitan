import { useDrawerContext } from "@/contexts/DrawerContext";
import { Card } from "./ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { useMapContext } from "@/contexts/MapContext";
import { Button } from "./ui/button";

export function HomeDrawer() {
  const { openDrawer, setOpenDrawer } = useDrawerContext();
  const { estateList, setSelectedEstate, setMapView } = useMapContext();
  return (
    <>
      {!openDrawer && estateList.length > 0 && (
        <Button
          onClick={() => setOpenDrawer(true)}
          className="absolute right-4 bottom-1/2 rounded-full"
        >
          ←
        </Button>
      )}

      <Drawer direction="right" open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent
          className="flex flex-col justify-end"
          data-testid="drawer"
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>検索結果</DrawerTitle>
            <DrawerDescription>物件の検索結果一覧</DrawerDescription>
          </DrawerHeader>
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
    </>
  );
}
