import type { Link } from './types/art';
import type { ArtBody, FinalArtBody } from './types/artId';

export function stripLinks<T extends { links: Link[] }>(item: T): Omit<T, 'links'> {
  const { links, ...rest } = item;
  return rest;
}

export const cleanArtResponseBody = (id: string, body: ArtBody): FinalArtBody => {
  return {
    id,
    title: body.title, 
    artists: body.artists?.map(artist => stripLinks(artist)),
    years: body.years?.map(year => stripLinks(year)), 
    yearmodifier: body.yearmodifier, 
    location: body.location, 
    comments: body.comments, 
    inscription: body.inscription,
    architecture: body.architecture && stripLinks(body.architecture), 
    content: body.content.map(content => stripLinks(content)), 
    landmark: body.landmark && stripLinks(body.landmark),
    peopleprefix: body.peopleprefix,
    people: body.people?.map(person => stripLinks(person)),
    externallinks: body.externallinks, 
    pictures: body.pictures, 
    tours: body.tours?.map(tour => stripLinks(tour))
  }
}