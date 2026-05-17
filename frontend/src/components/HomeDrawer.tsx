import { useDrawerContext } from "@/contexts/DrawerContext";
import { Card } from "./ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { useMapContext } from "@/contexts/MapContext";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";

export function HomeDrawer() {
  const { openDrawer, setOpenDrawer } = useDrawerContext();
  const { estateList, selectedEstate, setSelectedEstate, setMapView } =
    useMapContext();
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef<number>(0);

  const scrollCallbackRef = (el: HTMLDivElement | null) => {
    if (el) {
      el.scrollTop = savedScrollTop.current;
    }
    scrollRef.current = el;
  };

  useEffect(() => {
    if (selectedEstate?.id == null) return;
    const timer = setTimeout(() => {
      cardRefs.current
        .get(selectedEstate.id)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedEstate]);
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
          <div
            ref={scrollCallbackRef}
            className="flex flex-col gap-2 overflow-y-auto p-4"
            onScroll={() => {
              if (scrollRef.current)
                savedScrollTop.current = scrollRef.current.scrollTop;
            }}
          >
            {`検索結果: ${estateList.length}件`}
            {estateList.map((estate, i) => (
              <div
                key={estate.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(estate.id, el);
                  else cardRefs.current.delete(estate.id);
                }}
              >
                <Card
                  className={`w-full shrink-0 hover:shadow-lg hover:scale-105 transition-transform ${selectedEstate?.id === estate.id ? "bg-blue-100" : ""}`}
                  data-testid={`estate-${i}`}
                  onClick={() => {
                    setSelectedEstate(estate);
                    setMapView({
                      latitude: estate.latitude,
                      longitude: estate.longitude,
                      zoom: 18,
                    });
                  }}
                >
                  <p>{estate.name}</p>
                  <p className="text-sm text-gray-500">{estate.address}</p>
                  <img
                    src={estate.img ?? "https://picsum.photos/300/300"}
                    alt={estate.name}
                  />
                  <p>{`家賃:¥${estate.rent_price?.toLocaleString()}${estate.fee_info ? `(${estate.fee_info})` : ""}`}</p>
                  <p>{`間取り: ${estate.floor_plan}`}</p>
                  <p>{`面積: ${estate.area}㎡`}</p>
                  <p>{`築年数: ${estate.years_old}年`}</p>
                  <p>{`階数: ${estate.floor_num}階`}</p>

                  <Button
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_YAHOO_ESTATE_DOMAIN}${estate.url}`,
                        "_blank",
                      )
                    }
                    className="cursor-pointer"
                  >
                    物件詳細
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
