import { decodePolyline } from "./decodePolyline";
import type { Estate } from "@/types/Estate";
import type { Line } from "@/types/Line";
import type { Prefecture } from "@/types/Prefecture";
import type { Station } from "@/types/Station";
const apiUrl = import.meta.env.VITE_HONO_API_URL;

export const getPrefectures = async () => {
  const data = await fetch(`${apiUrl}/prefectures`);
  const prefectures = (await data.json()) as Prefecture[];
  const prefectureNames = prefectures.map((prefecture) => ({
    ...prefecture,
  }));
  return prefectureNames;
};

export const getLinesInPrefecture = async (prefectureCode: string) => {
  const data = await fetch(`${apiUrl}/train_lines?p_code=${prefectureCode}`);
  const trainLines = (await data.json()) as Line[];

  return trainLines;
};

export const getStationsInLine = async (lineCode: string) => {
  const data = await fetch(`${apiUrl}/stations?l_code=${lineCode}`);
  const stations = (await data.json()) as Station[];

  return stations;
};

export const searchReachableEstate = async (requestJson: {
  locations: { lat: number; lon: number }[];
  costing: string;
  costing_options: { bicycle: { cycling_speed: number } } | undefined;
  contours: { time: number; color: string }[];
}) => {
  const params = new URLSearchParams({
    locations: JSON.stringify(requestJson.locations),
    costing: requestJson.costing,
    costing_options: JSON.stringify(requestJson.costing_options),
    contours: JSON.stringify(requestJson.contours),
  });
  const data = await fetch(`${apiUrl}/reachable_estate?${params}`);
  if (!data.ok) {
    throw new Error("Failed to fetch reachable estate");
  }
  const estatesAndPolygon = (await data.json()) as {
    estates: Estate[];
    polygon: {
      features: any[];
      types: string;
    };
  };
  return estatesAndPolygon;
};

export const getStationsByQuery = async (query: string) => {
  const data = await fetch(`${apiUrl}/suggest_station?q=${query}`);
  const stations = (await data.json()) as Station[];
  return stations;
};

export const getTwoPointsRoute = async (requestJson: {
  locations: { lat: number; lon: number }[];
  costing: string;
  costing_options: { bicycle: { cycling_speed: number } } | undefined;
}) => {
  const params = new URLSearchParams({
    locations: JSON.stringify(requestJson.locations),
    costing: requestJson.costing,
    costing_options: JSON.stringify(requestJson.costing_options),
  });
  const data = await fetch(`${apiUrl}/estate_route?${params}`);
  const json = await data.json();

  const polyline = decodePolyline(json.encodedRoute, 6);
  const time = json.time;
  return { polyline, time };
};
