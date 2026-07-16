import { mkdir, readdir, writeFile } from "fs/promises";

import type { TopLevelArtResponse, ArtIdResponse, TopLevelBody } from "../../src/types/api.ts";
import { cleanArtResponseBody } from "./utils.ts";

const TOP_LEVEL_ART_URL = 'https://www.philart.net/api/art.json';
const DETAILS_PATH = 'public/data/details';
const WORKER_COUNT = 5;

interface MetaEntry {
  url: string,
  name: string,
  id: string
}

const sleep = (ms: number) =>
  new Promise(res => setTimeout(res, ms));

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

  if (!id) {
    throw new Error(`Could not parse id from ${url}`)
  }

  return id;
};

const parseTopLevelBody = (body: TopLevelBody) =>
  body.list.map(item => {
    const link = item.links.find(l => l.rel === 'self')?.href;

    if (!link) {
      throw new Error(`Bad/missing link for ${item.name}`);
    }

    const id = getArtIdFromUrl(link);
    const name = item.name;
    return { id, name, url: link };
  });



const getExistingIdSet = async () => {
  const files = await readdir(DETAILS_PATH);
  const idsFromFiles = files.map(file => file?.match(/(\d+)\.json/)?.[1])
  return new Set(idsFromFiles.filter((id): id is string => id !== undefined));
}

const getNewEntries = (entries: Array<MetaEntry>, existing: Set<string>) =>
  entries.filter(entry => !(existing.has(entry.id)));

const runPool = (entries: Array<MetaEntry>) => {
  let cursor = 0;
  let successfulWrites = 0;
  const failures: Array<{ id: string, error: unknown }> = [];

  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const entry = entries[index];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      try {
        const res = await fetch(entry.url, { signal: controller.signal });
        if (res.ok) {
         const resText = await res.text();
          const sanitized = resText.replace(/[\u0000-\u001F]/g, ' ');
          const data = JSON.parse(sanitized) as ArtIdResponse;
          const bodyCleaned = cleanArtResponseBody(entry.id, data.body);
          await writeFile(`${DETAILS_PATH}/${entry.id}.json`, JSON.stringify(bodyCleaned, null, 2));
          successfulWrites++;
        } else {
          throw new Error(`${res.status} ${res.statusText} — ${entry.url}`)
        }
      } catch (err) {
        failures.push({ id: entry.id, error: err });
      } finally {
        clearTimeout(timeout);
      }
      await sleep(100);
    }
  }

  return Promise.all(Array.from({ length: WORKER_COUNT }, () => worker())).then(() => ({
    successfulWrites,
    failures,
  }))
}

const printSummary = (successfulWrites: number, failures: Array<{id: string, error: unknown}>) => {
  console.log(`
    Run completed. \n 
    Successfully processed and wrote ${successfulWrites} files to disk. \n 
  `); 

  if (failures.length) {
    console.log(`Failed to process ${failures.length} items:`); 
    failures.forEach(failure => {
      console.log(`id: ${failure.id}; error: ${failure.error instanceof Error ? failure.error.message : String(failure.error)}`)
    })
  }
};

async function main() {
  await mkdir(DETAILS_PATH, { recursive: true });
  const data = await fetchArtJson(TOP_LEVEL_ART_URL);
  const entries = parseTopLevelBody(data.body);
  console.log(`Total entries fetched: ${entries.length}`);

  const existingSet = await getExistingIdSet();
  console.log(`Total existing entries: ${existingSet.size}`);

  const newEntries = getNewEntries(entries, existingSet);
  console.log(`${newEntries.length} new entries will be fetched.`)

  const { failures, successfulWrites } = await runPool(newEntries);
  printSummary(successfulWrites, failures); 
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});