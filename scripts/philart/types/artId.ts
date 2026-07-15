import type { Head, Link } from "./art";

export interface ExternalLink {
  url: string,
  label: string; 
}

export interface Artist {
  name: string, 
  externallinks?: ExternalLink[], 
  links: Link[]
}

export interface Year {
  year: string, 
  links: Link[]
}

export interface Location {
  latitude: string,
  longitude: string, 
  description?: string 
}

export interface Architecture {
  description: string, 
  links: Link[]
}

export interface PictureUrl {
  url: string, 
  mimetype: 'image/jpeg' | 'image/gif'
}

export interface Picture {
    small: PictureUrl, 
    large: PictureUrl 
}

export interface Tour { 
  name: string, 
  links: Link[]
}

export interface Person {
  name: string, 
  links: Link[],
  comment?: string, 
  externallinks?: ExternalLink[]
}

export interface Landmark {
  name: string, 
  prefix?: string, 
  links: Link[],
  externallinks?: ExternalLink[] 
} 

export interface Content {
  description: string, 
  separator?: string, 
  links: Link[] 
}

/**
 * @see https://www.philart.net/api.html
 */
export interface ArtBody {
  title: {
    display: string, 
    list: string; 
  },
  /**
   * An optional array of objects with three members: name (a required string), external links, and HATEOAS links.
   */
  artists?: Artist[],
  /**
   * An optional array of one or two objects with two members: year (a required string), and HATEOAS links. If there is one element in the array, then the date is definitive. If there are two elements in the array, then the dates are a range.
   */
  years?: Year[],
  /**
   * An optional string that provides some textual context for the years.
   */
  yearmodifier?: string, 
  /**
   * An object with three members: latitude (a required string), longitude (a required string), and description (an optional string). If the art has been physically removed, then the description will be blank, and the latitude and longitude will refer to the last known location.
   */
  location: Location, 
  /**
   * An optional string. This string may contain the HTML tags "b", "i", and "br". Double quotes are escaped in the JSON, ASCII line breaks are converted to spaces.
   */
  comments?: string, 
  /**
   * An optional string. This string may contain the HTML tags "b", "i", and "br". Double quotes are escaped in the JSON, ASCII line breaks are converted to spaces.
   */
  inscription?: string, 
  /**
   * An optional object with two members: description (a required string) and HATEOAS links.
   */
  architecture?: Architecture,
  /**
   * An array of objects with three members: description (a required string), separator (an optional string), and HATEOAS links. The array is sequenced both in terms of imporance of the content and to make it possible to construct a reasonably syntactic English list of content elements. If the elements are to be listed in the form of a sentence, the seperator should be displayed after the description. Currently the only supported value of the separator is a comma, but that is subject to change without warning.
   */
  content: Content[], 
  /**
   * An optional object with four members: name (a required string), prefix (an optional string), external links, and HATEOAS links.
   */
  landmark?: Landmark, 
  /**
   * An optional string describing how the people in the people field are referenced by the art, such as "statue of" or "quotes from".
   */
  peopleprefix?: string, 
  /**
   * An optional array of objects with four members: name (a string), comment (an optional string up to 32 characters which further qualifies peopleprefix for an individual person), external links, and HATEOAS links.
   */
  people?: Person[],
  /**
   * External links for the art itself, such as articles or pictures on other sites
   */
  externallinks?: ExternalLink[],
  /**
   * An array of objects with two members: small, and large, which are required objects with two members: url (a required string) and mimetype (a required string).
   */
  pictures: Picture[], 
  /**
   * An optional array of objects with two members: name, and HATEOAS links.
   */
  tours?: Tour[]
}

export interface ArtIdResponse {
  links: Link[], 
  head: Head, 
  body: ArtBody
}