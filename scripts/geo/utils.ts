import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import type { MapFeature, MapFeatureCollection } from "../../src/types/mapData";
import type { Position } from "geojson";

export const getNeighborhoodForPoint = (point: Position, neighborhoods: MapFeatureCollection) => {
  const matchedNeighborhood = neighborhoods.features.find(neighborhood =>
    booleanPointInPolygon(point, neighborhood)); 
   return matchedNeighborhood?.properties.MAPNAME;
} 