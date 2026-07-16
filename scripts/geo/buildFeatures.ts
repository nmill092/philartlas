import { readdir, readFile, writeFile } from 'fs/promises';
import type { Feature, FeatureCollection, Point } from 'geojson';

import type { FinalArtBody, ArtFeatureProperty, MapFeatureCollection } from '../../src/types/mapData';
import { getNeighborhoodForPoint } from './utils.ts';

const DETAILS_PATH = 'public/data/details';
const NEIGHBORHOODS_PATH = new URL('../data/philadelphia-neighborhoods.geojson', import.meta.url);

const buildGeojsonFeatures = async (neighborhoodData: MapFeatureCollection) => {
  const failures: { file: string, error: unknown }[] = []; 

  const files = await readdir(DETAILS_PATH); 

  const featurePromises = files.map(async (file) => {
    try {
      const fileContent = await readFile(`${DETAILS_PATH}/${file}`, { encoding: 'utf-8' });
      const data = JSON.parse(fileContent) as FinalArtBody;
      return buildGeojsonFeature(data, neighborhoodData);
    } catch(err) {
      failures.push({ file, error: err instanceof Error ? err.message : String(err)})
    }
  });

  const features = await Promise.all(featurePromises);
  return { 
    features: features.filter((f): f is Feature<Point, ArtFeatureProperty> => f !== undefined),
    failures
  }
}

const buildGeojsonFeature = (data: FinalArtBody, neighborhoodData: MapFeatureCollection): Feature<Point, ArtFeatureProperty>  => {
  const { latitude, longitude } = data.location;
  const [latParsed, lngParsed] = [Number(latitude), Number(longitude)]; 
  const coords = [lngParsed, latParsed]; 

  if (isNaN(latParsed) || isNaN(lngParsed) || lngParsed === 0 || latParsed === 0) {
    throw new Error(`Coords for id ${data.id} could not be parsed. Coords: lat ${latitude}, lng ${longitude}`)
  }

  const neighborhood = getNeighborhoodForPoint(coords, neighborhoodData); 
  
  return {
    type: 'Feature',
    id: data.id, 
    geometry: {
      type: 'Point',
      coordinates: coords
    },
    properties: {
      id: data.id,
      name: data.title.display,
      artists: data.artists?.map(artist => artist.name).join(', '), 
      years: data.years, 
      locationDescription: data.location.description,
      neighborhood
    }
  }
}

const buildFinalGeoJson = async (features: Feature<Point, ArtFeatureProperty>[]): Promise<void> => {

  const geojson: FeatureCollection<Point, ArtFeatureProperty> = {
    type: 'FeatureCollection',
    features
  }; 

  try {
    await writeFile(`public/data/geojson.json`, JSON.stringify(geojson, null, 2)); 
  } catch(err) {
   throw new Error(`Failed to write final geojson file: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function main() {

  const neighborhoodData = await readFile(NEIGHBORHOODS_PATH, { encoding: 'utf-8'}); 
  const data = JSON.parse(neighborhoodData) as MapFeatureCollection; 

  const { features, failures } = await buildGeojsonFeatures(data); 
  await buildFinalGeoJson(features); 

  console.log(`Successfully wrote ${features.length} features.`) 
  if (failures.length) {
    console.log(`${failures.length} features could not be created:`)
    failures.forEach(failure => {
      console.log(`${failure.file}, ${failure.error}`); 
    })
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1); 
})