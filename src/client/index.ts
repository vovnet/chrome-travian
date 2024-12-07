import { Tile, TilePosition } from "../types";

export const apiMapPosition = async ({ x, y }: TilePosition) => {
  const data = await fetch("/api/v1/map/position", {
    method: "POST",
    body: JSON.stringify({ data: { x, y, zoomLevel: 3, ignorePositions: [] } }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const { tiles } = (await data.json()) as { tiles: Tile[] };

  return tiles;
};
