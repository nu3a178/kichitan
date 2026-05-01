import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prisma } from "./lib/prisma";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/prefectures", async (c) => {
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

app.get("/train_lines", async (c) => {
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

app.get("/stations", async (c) => {
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

app.get("/suggest_station", async (c) => {
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
app.post("/set_geom", async (c) => {
  const geoCode = c.req.query("geo_code");
  const result = await prisma.$executeRaw`
    UPDATE "Estate" 
    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE geo_code = ${geoCode}
  `;
  return c.json({ updated: result });
});

app.get("/reachable_estate", async (c) => {
  const q = c.req.query();
  const valhallaJson = {
    locations: JSON.parse(q.locations),
    costing: q.costing,
    contours: JSON.parse(q.contours),
    ...(q.costing_options
      ? { costing_options: JSON.parse(q.costing_options) }
      : {}),
  };
  const geoResult = await fetch(
    `http://localhost:8002/isochrone?json=${encodeURIComponent(JSON.stringify(valhallaJson))}`,
  );
  if (!geoResult.ok) {
    return c.json({ error: await geoResult.text() }, geoResult.status as any);
  }
  const geoData = await geoResult.json();
  const coordinates = geoData.features[0].geometry.coordinates;
  const geoJson = JSON.stringify({
    type: "Polygon",
    coordinates: [[...coordinates, coordinates[0]]],
  });
  const searchResult = await prisma.$queryRaw`
    SELECT id, name, address, latitude, longitude, rent_price, fee_info, img, url, floor_plan, area, years_old, floor_num
    FROM "Estate"
    WHERE ST_Within(geom::geometry, ST_GeomFromGeoJSON(${geoJson}))
  `;
  return c.json({ estates: searchResult, polygon: geoData });
});

app.get("/estate_route", async (c) => {
  const q = c.req.query();
  console.log();
  const valhallaJson = {
    locations: JSON.parse(q.locations),
    costing: q.costing,
  };
  const response = await fetch(
    `http://localhost:8002/optimized_route?json=${encodeURIComponent(JSON.stringify(valhallaJson))}`,
  );
  const responseData = await response.json();
  const encodedRoute = responseData.trip.legs[0].shape;
  const time = responseData.trip.legs[0].summary.time;
  return c.json({ encodedRoute, time });
});
app.delete("/estates", async (c) => {
  const geoCode = c.req.query("geo_code");
  const result = await prisma.estate.deleteMany({
    where: {
      geo_code: geoCode,
    },
  });
  return c.json({ deleted: result.count });
});

app.post("/estates", async (c) => {
  const data = await c.req.json();
  const result = await prisma.estate.createMany({
    data,
  });
  return c.json({ created: result });
});
app.get("/estates", async (c) => {
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
