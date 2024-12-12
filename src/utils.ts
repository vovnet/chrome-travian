import { normilizeDistance } from "./utils/map";

export const getDistance = (x1: number, x2: number, y1: number, y2: number) => {
  const x = normilizeDistance(x1, x2, 401);
  const y = normilizeDistance(y1, y2, 401);
  return Number(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(1));
};

export const sleep = (timeout = 100): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};
