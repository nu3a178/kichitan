import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseAnonKey);

const STATIONS_DIR = path.resolve("batch/csv/stations");
const LINES_DIR = path.resolve("batch/csv/lines");

function parseCsv<T extends Record<string, string>>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line: string) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((h: string, i: number) => [
        h.trim(),
        (values[i] ?? "").trim(),
      ]),
    ) as T;
  });
}

function readCsvDir<T extends Record<string, string>>(dir: string): T[] {
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".csv"));
  return files.flatMap((file: string) => parseCsv<T>(path.join(dir, file)));
}

export const initStationTable = async () => {
  const { data, error } = await client.from("stations").delete().gte("id", 0);
  if (error) {
    console.error("Error deleting stations:", error);
  } else {
    console.log("Stations deleted successfully:", data);
  }
};

export const initTrainLineTable = async () => {
  const { data, error } = await client
    .from("train_lines")
    .delete()
    .gte("id", 0);
  if (error) {
    console.error("Error deleting lines:", error);
  } else {
    console.log("Lines deleted successfully:", data);
  }
};

export const initPrefectureLinesTable = async () => {
  const { data, error } = await client
    .from("prefecture_train_lines")
    .delete()
    .gte("id", 0);
  if (error) {
    console.error("Error deleting prefecture_train_lines:", error);
  } else {
    console.log("Prefecture_train_lines deleted successfully:", data);
  }
};

export const importStationsCsv = async () => {
  const stations = readCsvDir(STATIONS_DIR);
  const stationsParams = stations.map((station, i) => ({
    id: i + 1,
    code: station.station_cd,
    prefecture_code: station.pref_cd,
    line_code: station.line_cd,
    name: station.station_name,
    latitude: parseFloat(station.lat),
    longitude: parseFloat(station.lon),
  }));

  const { data, error } = await client.from("stations").insert(stationsParams);
  if (error) {
    console.error("Error inserting stations:", error);
  } else {
    console.log("Stations inserted successfully:", data);
  }
};

export const importTrainLinesCsv = async () => {
  const lines = readCsvDir(LINES_DIR);
  const lineParams = lines.map((line, i) => ({
    id: i + 1,
    code: line.line_cd,
    name: line.line_name,
    color: line.line_color_c,
    latitude: parseFloat(line.lat),
    longitude: parseFloat(line.lon),
    zoom: line.zoom,
  }));
  const { data, error } = await client.from("train_lines").insert(lineParams);
  if (error) {
    console.error("Error inserting lines:", error);
  } else {
    console.log("Lines inserted successfully:", data);
  }
};

export const importPrefectureTrainLines = async () => {
  const stations = readCsvDir(STATIONS_DIR);
  const prefectureAndLinesColumns = stations.map((station, i) => {
    return {
      id: i + 1,
      prefecture_code: station.pref_cd,
      train_line_code: station.line_cd,
    };
  });
  const uniqueRelations = Array.from(
    new Map(
      prefectureAndLinesColumns.map((r) => [
        `${r.prefecture_code}-${r.train_line_code}`,
        r,
      ]),
    ).values(),
  );
  const { data, error } = await client
    .from("prefecture_train_lines")
    .insert(uniqueRelations);
  if (error) {
    console.error("Error inserting prefecture_train_lines:", error);
  } else {
    console.log("Prefecture_train_lines inserted successfully:", data);
  }
};
