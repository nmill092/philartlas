import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { Architecture, ArtBody, Artist, Content, ExternalLink, Landmark, Location, Person, Picture, Tour, Year } from "./api";

export interface FinalArtBody {
  id: string, 
  title: ArtBody['title'];
  artists?: Omit<Artist, 'links'>[];
  years?: Omit<Year, 'links'>[];
  yearmodifier?: string;
  location: Location;
  comments?: string;
  inscription?: string;
  architecture?: Omit<Architecture, 'links'>;
  content: Omit<Content, 'links'>[];
  landmark?: Omit<Landmark, 'links'>;
  peopleprefix?: string;
  people?: Omit<Person, 'links'>[];
  externallinks?: ExternalLink[];
  pictures: Picture[];
  tours?: Omit<Tour, 'links'>[];
}

// geojson feature properties
export interface ArtFeatureProperty {
  name: string, 
  id: string,
  artists: string | undefined,
  years: FinalArtBody['years'],
  locationDescription: string | undefined, 
  neighborhood: string | undefined
}

export interface NeighborhoodProperties {
  MAPNAME: string, 
  LISTNAME: string, 
  NAME: string
}

export type MapFeature = Feature<Polygon | MultiPolygon, NeighborhoodProperties>; 
export type MapFeatureCollection = FeatureCollection<Polygon | MultiPolygon, NeighborhoodProperties>; 