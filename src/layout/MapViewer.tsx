import "leaflet/dist/leaflet.css";
import { useMapContext } from "@/contexts/MapContext";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L, { latLngBounds, type LatLngExpression } from "leaflet";

import trainPng from "@/assets/train.png";
import { useDrawerContext } from "@/contexts/DrawerContext";

const MapContent = ({
  latitude,
  longitude,
  zoom,
  children,
  coordinates,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
  children?: React.ReactNode;
  coordinates: LatLngExpression[];
}) => {
  const map = useMap();

  useEffect(() => {
    // DOMが確定した後にサイズを再計算させる（モバイルでタイルが欠ける問題の修正）
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: true });
  }, [map, latitude, longitude, zoom]);

  useEffect(() => {
    if (coordinates.length === 0) return;
    map.fitBounds(latLngBounds(coordinates), {
      animate: true,
      padding: [40, 40],
    });
  }, [map, coordinates]);

  return (
    <>
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </>
  );
};
export const MapViewer = () => {
  const {
    mapView,
    estateList,
    lineTrack,
    isochronePolygons,
    stationLocation,
    selectedEstate,
    route,
    setSelectedEstate,
  } = useMapContext();
  const { setOpenDrawer } = useDrawerContext();
  const { latitude, longitude, zoom } = mapView;

  const color = lineTrack.color?.length ? lineTrack.color : "3388ff";
  const polyline = lineTrack.track ?? [];

  const isochroneColor = isochronePolygons.color ?? "#fff";
  const stationIcon = L.divIcon({
    html: `<div style="width:36px;height:36px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
      <img src="${trainPng}" style="width:24px;height:24px;" />
    </div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
  return (
    <>
      <div className="relative w-full h-full">
        <div
          className={`top-1 right-1 absolute z-[1000] text-xs text-gray-600 bg-white/70 px-1 rounded pointer-events-none`}
        >
          ※現在関東地方にのみ対応しています。
        </div>
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          <MapContent
            latitude={latitude}
            longitude={longitude}
            zoom={zoom}
            coordinates={isochronePolygons?.coordinates ?? []}
          >
            {estateList.map((estate, index) => {
              const rentIcon = L.divIcon({
                html: `<div style="display:inline-block;position:relative;">
  <div style="background:${selectedEstate === estate ? "#3388ff" : "white"};border:2px solid #333;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:${selectedEstate === estate ? "white" : "black"};line-height:1.4;">¥${estate.rent_price?.toLocaleString()}</div>
  <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #333;"></div>
  <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${selectedEstate === estate ? "#3388ff" : "white"};"></div>
</div>`,
                className: "",
                iconSize: undefined,
                iconAnchor: [40, 36],
              });
              return (
                <Marker
                  key={index}
                  position={[estate.latitude, estate.longitude]}
                  icon={rentIcon}
                  eventHandlers={{
                    click: () => {
                      setOpenDrawer(true);
                      setSelectedEstate(estate);
                    },
                  }}
                />
              );
            })}

            <Polyline
              pathOptions={{ color: "#ffffff", weight: 8 }}
              positions={polyline}
            />
            <Polyline
              pathOptions={{ color: `#${color}`, weight: 4 }}
              positions={polyline}
            />
            {route && (
              <Polyline
                pathOptions={{ color: "#ff3333", weight: 4 }}
                positions={route}
              />
            )}
            {isochronePolygons && (
              <>
                <Polygon
                  pathOptions={{ color: `${isochroneColor}`, weight: 6 }}
                  color={`#${isochroneColor}`}
                  positions={isochronePolygons.coordinates}
                />
              </>
            )}

            {stationLocation && (
              <Marker
                position={[stationLocation.latitude, stationLocation.longitude]}
                icon={stationIcon}
              />
            )}
          </MapContent>
        </MapContainer>
      </div>
    </>
  );
};
