import type { Line } from "./Line";

export type Station = {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  prefecture_code?: string;
  line_code?: string;
  train_lines?: Line;
};
