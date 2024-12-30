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

export const apiTileDetails = async ({ x, y }: TilePosition) => {
  const data = await fetch("/api/v1/map/tile-details", {
    method: "POST",
    body: JSON.stringify({ x: x, y: y }),
    headers: {
      Accept: "application/json, text/javascript, */*",
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  const { html } = (await data.json()) as { html: string };
  return html;
};

export const apiProfile = async (uid: number) => {
  const data = await fetch(`/profile/${uid}`, { method: "GET" });
  return await data.text();
};

export const apiWriteMessage = (form: FormData) => {
  return fetch("/messages/write", { method: "POST", body: form });
};

export const apiStatistics = (page = 1) => {
  return fetch(`/statistics/player/overview?page=${page}`, { method: "GET" });
};
