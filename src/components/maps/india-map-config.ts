import type { LatLngBoundsExpression } from "leaflet";

// Covers India's mainland and island territories while keeping every TRAVELY
// destination and circuit inside a single, non-wrapping map viewport.
export const INDIA_CENTER: [number, number] = [22.8, 79.4];
export const INDIA_BOUNDS: LatLngBoundsExpression = [
  [5.2, 67.0],
  [38.6, 99.5],
];
export const INDIA_MIN_ZOOM = 4;

