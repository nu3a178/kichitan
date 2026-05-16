import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/lib/prisma";

import sql from "../src/db.js";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIONS_DIR = path.resolve(__dirname, "csv/stations");
const LINES_DIR = path.resolve(__dirname, "csv/lines");
const PREFECTURES_DIR = path.resolve(__dirname, "csv/prefectures");
const ESTATES_DIR = path.resolve(__dirname, "csv/estates");

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
  try {
    const result = await prisma.station.deleteMany();
    console.log("Stations deleted successfully:", result.count);
  } catch (error) {
    console.error("Error deleting stations:", error);
  }
};

export const initTrainLineTable = async () => {
  try {
    const result = await prisma.trainLine.deleteMany();
    console.log("Train lines deleted successfully:", result.count);
  } catch (error) {
    console.error("Error deleting lines:", error);
  }
};

export const initPrefectureTable = async () => {
  try {
    const result = await prisma.prefecture.deleteMany();
    console.log("Prefectures deleted successfully:", result.count);
  } catch (error) {
    console.error("Error deleting prefectures:", error);
  }
};

export const initPrefectureLinesTable = async () => {
  try {
    const result = await prisma.prefectureTrainLine.deleteMany();
    console.log("Prefecture_train_lines deleted successfully:", result.count);
  } catch (error) {
    console.error("Error deleting prefecture_train_lines:", error);
  }
};

export const importPrefecturesCsv = async () => {
  const prefectures = readCsvDir(PREFECTURES_DIR);
  const prefectureParams = prefectures.map((p, i) => ({
    id: i + 1,
    code: p.code,
    name: p.name,
    latitude: parseFloat(p.latitude),
    longitude: parseFloat(p.longitude),
    zoom: parseInt(p.zoom, 10),
  }));
  try {
    const result = await prisma.prefecture.createMany({
      data: prefectureParams,
    });
    console.log("Prefectures inserted successfully:", result.count);
  } catch (error) {
    console.error("Error inserting prefectures:", error);
  }
};

export const importStationsCsv = async () => {
  const prefectures = (
    await prisma.prefecture.findMany({ select: { code: true } })
  ).map((prefecture) => prefecture.code.toString());

  const stations = readCsvDir(STATIONS_DIR);
  // csv内の駅のうち、prefecturesテーブルにある都道府県に属する駅だけを保存する
  const stationsParams = stations
    .filter((station) => {
      return prefectures ? prefectures.includes(station.pref_cd) : true;
    })
    .map((station, i) => {
      return {
        id: i + 1,
        code: station.station_cd,
        prefecture_code: station.pref_cd,
        line_code: station.line_cd,
        name: station.station_name,
        latitude: parseFloat(station.lat),
        longitude: parseFloat(station.lon),
        zoom: 13,
      };
    });

  const result = await prisma.station.createMany({
    data: stationsParams,
  });
  if (result.count === 0) {
    console.error("Error inserting stations:", result);
  } else {
    console.log("Stations inserted successfully:", result.count);
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
    zoom: parseInt(line.zoom, 10),
  }));
  const result = await prisma.trainLine.createMany({
    data: lineParams,
  });
  if (result.count === 0) {
    console.error("Error inserting lines:", result);
  } else {
    console.log("Lines inserted successfully:", result.count);
  }
};

export const initEstateTable = async () => {
  if (process.env.ENV !== "development") return;
  try {
    const result = await prisma.estate.deleteMany();
    console.log("Estates deleted successfully:", result.count);
  } catch (error) {
    console.error("Error deleting estates:", error);
  }
};

export const importEstatesCsv = async () => {
  if (process.env.ENV !== "development") return;
  const estates = readCsvDir(ESTATES_DIR);
  const estateParams = estates.map((e) => ({
    name: e.name,
    address: e.address ?? "",
    latitude: parseFloat(e.latitude),
    longitude: parseFloat(e.longitude),
    rent_price: e.rent_price ? parseInt(e.rent_price, 10) : 0,
  }));
  try {
    const result = await prisma.estate.createMany({ data: estateParams });
    console.log("Estates inserted successfully:", result.count);
  } catch (error) {
    console.error("Error inserting estates:", error);
  }
};

export const setGeomIntoEstates = async () => {
  if (process.env.ENV !== "development") return;
  try {
    const result = await fetch(`http://localhost:3000/set_geom`, {
      method: "POST",
    });
    console.log("Geom set into estates successfully");
  } catch (error) {
    console.error("Error setting geom into estates:", error);
  }
};

export const importPrefectureTrainLines = async () => {
  const prefectures = (
    await prisma.prefecture.findMany({ select: { code: true } })
  ).map((prefecture) => prefecture.code.toString());
  const stations = readCsvDir(STATIONS_DIR);
  // prefecturesテーブルに無い都道府県の駅は無視する
  const prefectureAndLinesColumns = stations
    .filter((station) =>
      prefectures ? prefectures.includes(station.pref_cd) : true,
    )
    .map((station, i) => {
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
  const result = await prisma.prefectureTrainLine.createMany({
    data: uniqueRelations,
  });
  if (result.count === 0) {
    console.error("Error inserting prefecture_train_lines:", result);
  } else {
    console.log("Prefecture_train_lines inserted successfully:", result.count);
  }
};
