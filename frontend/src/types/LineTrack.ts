import type { LatLngExpression } from "leaflet";

export type LineTrackType = {
  color?: string;
  track: Array<LatLngExpression> | null;
};
