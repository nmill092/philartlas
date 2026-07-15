import type { TopLevelArtResponse, TopLevelBody } from "./types/art";

const TOP_LEVEL_ART_URL = 'https://www.philart.net/api/art.json'; 

const fetchArtJson = async (url: string): Promise<TopLevelArtResponse> => {
  const res = await fetch(url); 
  if (res.ok) {
    return res.json(); 
  } else {
    throw new Error(`${res.status} ${res.statusText} — ${url}`)
  }
}

const getArtIdFromUrl = (url: string): string => {
  const href = new URL(url); 
  const { pathname } = href; 
  const id = pathname.match(/\/(\d+)\.json/)?.[1];

  if(!id) {
    throw new Error(`Could not parse id from ${url}`)
  }

  return id;
}; 

const parseTopLevelBody = (body: TopLevelBody) => 
  body.list.map(item => {
    const link = item.links.find(l => l.rel === 'self')?.href;
    const id = getArtIdFromUrl(link); 
    const name = item.name; 
    return { id, name, url: link }; 
  }); 

  async function main() {
    const data = await fetchArtJson(TOP_LEVEL_ART_URL); 
    const entries = parseTopLevelBody(data.body);
  }

main().catch((err) => {
  console.error(err);
  process.exit(1); 
});