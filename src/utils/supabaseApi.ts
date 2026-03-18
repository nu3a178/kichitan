import { createClient } from "@supabase/supabase-js";
import { decodePolyline } from "./decodePolyline";
import type { Estate } from "@/types/Estate";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseAnonKey);

export const getPrefectures = async () => {
  const { data, error } = await client
    .from("prefectures")
    .select("code, name, latitude, longitude, zoom");
  if (error) {
    throw error;
  }
  return data;
};

export const getLinesInPrefecture = async (prefectureId: number) => {
  const { data, error } = await client
    .from("prefecture_train_lines")
    .select("train_lines(code,name,latitude,longitude,zoom,color)")
    .eq("prefecture_code", prefectureId);
  if (error) {
    throw error;
  }
  const trainLines = (
    data as unknown as {
      train_lines: {
        code: number;
        name: string;
        latitude: number;
        longitude: number;
        zoom: number;
        color: string;
      };
    }[]
  ).map((item) => item.train_lines);
  return trainLines;
};

export const getStationsInLine = async (lineId: number) => {
  const { data, error } = await client
    .from("stations")
    .select("code,name,latitude,longitude")
    .eq("line_code", lineId);
  if (error) {
    throw error;
  }

  const stations = data as unknown as {
    code: number;
    name: string;
    latitude: number;
    longitude: number;
  }[];
  return stations;
};

export const searchReachableEstate = async (requestJson: {
  locations: { lat: number; lon: number }[];
  costing: string;
  costing_options: { bicycle: { cycling_speed: number } } | undefined;
  contours: { time: number; color: string }[];
}) => {
  const { data, error } = await client.functions.invoke("search-estate", {
    body: requestJson,
  });
  if (error) {
    throw error;
  }
  const estatesAndPolygon = data as unknown as {
    estates: Estate[];
    polygon: { features: any[]; types: string };
  };
  return estatesAndPolygon;
};

export const getStationsByQuery = async (query: string) => {
  const { data, error } = await client
    .from("stations")
    .select("*,train_lines(name)")
    .ilike("name", `%${query}%`);
  if (error) {
    throw error;
  }
  const stations = data as unknown as {
    code: number;
    name: string;
    latitude: number;
    longitude: number;
  }[];
  return stations;
};

export const getTwoPointsRoute = async (requestJson: {
  locations: { lat: number; lon: number }[];
  costing: string;
  costing_options: { bicycle: { cycling_speed: number } } | undefined;
}) => {
  const { data, error } = await client.functions.invoke(
    "get-two-points-route",
    {
      body: requestJson,
    },
  );
  if (error) {
    throw error;
  }

  const polyline = decodePolyline(data.encodedRoute, 6);
  const time = data.time;
  return { polyline, time };
};
