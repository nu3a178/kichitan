import { type LatLngExpression } from "leaflet";
import { createContext, useContext, useState } from "react";

type MapView = {
  latitude: number;
  longitude: number;
  zoom: number;
};
type MarkersType = {
  latitude: number;
  longitude: number;
}[];

type LineTrackType = {
  color?: string;
  track: Array<LatLngExpression> | null;
};

type MapContextType = {
  mapView: MapView;
  markers: MarkersType;
  lineTrack: LineTrackType;
  setMapView: (view: MapView) => void;
  setMarkers: (markers: MarkersType) => void;
  setLineTrack: (lineTrack: LineTrackType) => void;
  isochronePolygons: IsochronePolygon;
  setIsochronePolygons: (isochronePolygons: IsochronePolygon) => void;
};

type IsochronePolygon = {
  color?: string;
  coordinates: Array<LatLngExpression | null>;
};

const MapContext = createContext<MapContextType | null>(null);

const DEFAULT_MAP_VIEW: MapView = {
  latitude: 35.6895,
  longitude: 139.6917,
  zoom: 13,
};

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapView, setMapView] = useState<MapView>(DEFAULT_MAP_VIEW);
  const [markers, setMarkers] = useState<MarkersType>([]);
  const [lineTrack, setLineTrack] = useState<LineTrackType>({
    color: undefined,
    track: [],
  });
  const [isochronePolygons, setIsochronePolygons] = useState<IsochronePolygon>({
    color: undefined,
    coordinates: [],
  });
  return (
    <MapContext.Provider
      value={{
        mapView,
        markers,
        setMapView,
        setMarkers,
        lineTrack,
        setLineTrack,
        isochronePolygons,
        setIsochronePolygons,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
