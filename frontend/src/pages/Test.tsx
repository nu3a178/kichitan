import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline"; // 座標デコード用
import "leaflet/dist/leaflet.css";

// Leafletのデフォルトアイコン設定（Next.js/Vite等でアイコンが消える対策）
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 型定義
interface Location {
  lat: number;
  lon: number;
}

const Test: React.FC = () => {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const startPos: Location = { lat: 35.6912, lon: 139.7671 }; // 東京駅
  const endPos: Location = { lat: 35.6663, lon: 139.7583 }; // 新橋駅

  const fetchRoute = async () => {
    const query = {
      locations: [startPos, endPos],
      costing: "pedestrian", // 徒歩モード
      units: "kilometers",
    };

    try {
      // Valhallaコンテナへのリクエスト
      const response = await fetch(
        `http://localhost:8002/route?json=${JSON.stringify(query)}`,
      );
      const data = await response.json();

      if (data.trip && data.trip.legs) {
        // Valhalla特有のEncoded Polylineをデコード ([lat, lon]の配列に変換)
        const encodedShape = data.trip.legs[0].shape;
        const decodedCoords = polyline.decode(encodedShape, 6); // Valhallaは精度6
        const latLngCoords = decodedCoords.map(
          ([lat, lon]) => [lat, lon] as [number, number],
        );
        setRoutePath(latLngCoords);
      }
    } catch (error) {
      console.error("Valhalla API Error:", error);
    }
  };

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <button
        onClick={fetchRoute}
        style={{ marginBottom: "10px", zIndex: 1000, position: "relative" }}
      >
        経路を検索
      </button>

      <MapContainer
        center={[startPos.lat, startPos.lon]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* 始点と終点のマーカー */}
        <Marker position={[startPos.lat, startPos.lon]}>
          <Popup>Start</Popup>
        </Marker>
        <Marker position={[endPos.lat, endPos.lon]}>
          <Popup>End</Popup>
        </Marker>

        {/* 取得した経路の描画 */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="blue"
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Test;
