import type { Link } from './types/art';

export function stripLinks<T extends { links: Link[] }>(item: T): Omit<T, 'links'> {
  const { links, ...rest } = item;
  return rest;
}