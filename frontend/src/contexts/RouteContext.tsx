import { type LatLngExpression } from "leaflet";
import {
  createContext,
  useContext,
  useState,
  startTransition,
  useEffect,
} from "react";
import { getTwoPointsRoute } from "@/utils/api";
import { useMapContext } from "@/contexts/MapContext";

type RouteContextType = {
  route: LatLngExpression[] | null;
  setRoute: (route: LatLngExpression[] | null) => void;
};

const RouteContext = createContext<RouteContextType | null>(null);

export const RouteProvider = ({ children }: { children: React.ReactNode }) => {
  const [route, setRoute] = useState<LatLngExpression[] | null>(null);
  const { selectedEstate, stationLocation, transportationMode } =
    useMapContext();

  useEffect(() => {
    if (!selectedEstate) return;
    getTwoPointsRoute({
      locations: [
        { lat: selectedEstate.latitude, lon: selectedEstate.longitude },
        {
          lat: stationLocation?.latitude ?? 0,
          lon: stationLocation?.longitude ?? 0,
        },
      ],
      costing: transportationMode,
      costing_options: { bicycle: { cycling_speed: 18 } },
    }).then((data) => {
      startTransition(() => {
        setRoute(data.polyline);
      });
    });
  }, [selectedEstate, stationLocation]);

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRouteContext = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRouteContext must be used within a RouteProvider");
  }
  return context;
};
