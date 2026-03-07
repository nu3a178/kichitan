import { createClient } from "@supabase/supabase-js";

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

export const searchReachableEstate = async (requestJson: any) => {
  const result = await client.functions.invoke("search-estate", {
    body: requestJson,
  });
  return result;
};

export const getStationsByQuery = async (query: string) => {
  const { data, error } = await client
    .from("stations")
    .select("*,train_lines(name)")
    .ilike("name", `%${query}%`);
  if (error) {
    throw error;
  }
  return data;
};
