import type { Line } from "./Line";
import type { Prefecture } from "./Prefecture";

export type Station = {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  train_line: Line;
  prefecture: Prefecture;
};
