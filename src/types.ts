export type TilePosition = { x: number; y: number };

export type Tile = {
  position: TilePosition;
  title?: string;
  text?: string;
  aid?: number;
  did?: number;
  uid?: number;
};

export type Farm = {
  lastPosition: number;
  list: string[];
};
