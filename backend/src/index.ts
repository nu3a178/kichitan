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
      PrefectureTrainLine: { some: { prefecture_code: prefectureCode } },
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

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
