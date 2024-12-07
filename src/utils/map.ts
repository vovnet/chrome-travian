import { TilePosition } from "../types";

type GetPositions = { size: number; step: number; start?: TilePosition };

export const getPositionFromRow = ({ size, step }: GetPositions) => {
  const half = (step + 1) / 2;
  let start = -(size - 1) / 2;
  const end = Math.abs(start);
  const results: Array<number> = [];

  while (start <= end) {
    const x = start + half - 1;
    results.push(x);
    start += step;
  }

  return results;
};

export const getAllPositions = ({ size, step }: GetPositions): TilePosition[] | undefined => {
  if (size % 2 === 0 || step % 2 === 0) throw new Error("Value must be odd");

  const xRows = getPositionFromRow({ size, step });
  const yRows = xRows.map((x) => x * -1);
  const result = yRows.map((y) => xRows.map((x) => ({ x, y }))).flat();

  return result;
};
