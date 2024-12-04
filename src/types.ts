export type TilePosition = { x: number; y: number };

export type Tile = {
  position: TilePosition;
  title?: string;
  text?: string;
};