import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import { cors } from "hono/cors";

const EstateInputSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  rent_price: z.number().int().optional(),
  fee_info: z.string().optional(),
  img: z.string().optional(),
  url: z.string().optional(),
  floor_plan: z.string().optional(),
  area: z.number().optional(),
  years_old: z.number().int().optional(),
  floor_num: z.string().optional(),
  geo_code: z.string().optional(),
});
const VALHALLA_URL =
  process.env.NODE_ENV === "development"
    ? process.env.VALHALLA_URL_DEV
    : process.env.VALHALLA_URL_PROD;
const app = new Hono();
const api = app.basePath("/api");

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

api.get("/prefectures", async (c) => {
  const prefectures = await prisma.prefecture.findMany({
    select: {
      name: true,
      code: true,
      latitude: true,
      longitude: true,
      zoom: true,
    },
  });
  return c.json(prefectures);
});

api.get("/train_lines", async (c) => {
  const prefectureCode = c.req.query("p_code");
  const trainLines = await prisma.trainLine.findMany({
    select: {
      name: true,
      code: true,
      latitude: true,
      longitude: true,
      zoom: true,
    },
    where: {
      prefecture_train_line: { some: { prefecture_code: prefectureCode } },
    },
  });
  return c.json(trainLines);
});

api.get("/stations", async (c) => {
  const trainLineCode = c.req.query("l_code");
  const stations = await prisma.station.findMany({
    select: {
      name: true,
      code: true,
      latitude: true,
      longitude: true,
    },
    where: {
      line_code: trainLineCode,
    },
  });
  return c.json(stations);
});

api.get("/suggest_station", async (c) => {
  const query = c.req.query("q");
  const suggestions = await prisma.station.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    select: {
      name: true,
      code: true,
      latitude: true,
      longitude: true,
      train_line: { select: { name: true, code: true } },
      prefecture: { select: { name: true, code: true } },
    },
  });
  return c.json(suggestions);
});
api.post("/set_geom", async (c) => {
  const geoCode = c.req.query("geo_code");
  const result = await prisma.$executeRaw`
    UPDATE "Estate" 
    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE geo_code = ${geoCode}
  `;
  return c.json({ updated: result });
});

api.get("/estate_route", async (c) => {
  if (!VALHALLA_URL) {
    return c.json({ error: "Valhalla URL is not configured" }, 503);
  }
  const q = c.req.query();
  const valhallaJson = {
    locations: JSON.parse(q.locations),
    costing: q.costing,
  };
  let response: Response;
  try {
    response = await fetch(
      `${VALHALLA_URL}/optimized_route?json=${encodeURIComponent(JSON.stringify(valhallaJson))}`,
    );
  } catch (e) {
    return c.json(
      { error: `Valhalla unreachable: ${(e as Error).message}` },
      503,
    );
  }
  const responseData = await response.json();
  const encodedRoute = responseData.trip.legs[0].shape;
  const time = responseData.trip.legs[0].summary.time;
  return c.json({ encodedRoute, time });
});
api.delete("/estates", async (c) => {
  const geoCode = c.req.query("geo_code");
  const result = await prisma.estate.deleteMany({
    where: {
      geo_code: geoCode,
    },
  });
  return c.json({ deleted: result.count });
});

api.post(
  "/estates",
  zValidator("json", z.array(EstateInputSchema)),
  async (c) => {
    const data = c.req.valid("json");
    const result = await prisma.estate.createMany({ data });
    return c.json({ created: result });
  },
);
api.get("/estates", async (c) => {
  const geoCode = c.req.query("geo_code");
  const date = new Date(c.req.query("date") ?? "1900-01-01");
  const estates = await prisma.estate.findMany({
    where: {
      geo_code: geoCode,
      created_at: { gte: date },
    },
  });
  return c.json(estates);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
