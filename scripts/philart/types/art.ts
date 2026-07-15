export interface Link {
  rel: 'self' | 'parent',
  href: string; 
}

export interface Head {
  title: string, 
  type: 'art' | 'listnav'
}

export interface TopLevelArtEntry {
  name: string, 
  links: Link[]
}

export interface TopLevelBody {
  list: TopLevelArtEntry[] 
}

export interface TopLevelArtResponse {
  links: Link[],
  head: Head, 
  body: TopLevelBody
}