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
import { latLngBounds, type LatLngExpression } from "leaflet";

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
  const { mapView, markers, lineTrack, isochronePolygons, stationLocation } =
    useMapContext();
  const { latitude, longitude, zoom } = mapView;
  const color = lineTrack.color?.length ? lineTrack.color : "3388ff";
  const polyline = lineTrack.track ?? [];

  const isochroneColor = isochronePolygons.color ?? "#fff";

  return (
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
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.latitude, marker.longitude]} />
        ))}
        <Polyline
          pathOptions={{ color: "#ffffff", weight: 8 }}
          positions={polyline}
        />
        <Polyline
          pathOptions={{ color: `#${color}`, weight: 4 }}
          positions={polyline}
        />

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
          />
        )}
      </MapContent>
    </MapContainer>
  );
};
