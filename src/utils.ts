export const getDistance = (x1: number, x2: number, y1: number, y2: number) => {
  const x = x2 - x1;
  const y = y2 - y1;
  return Number(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(1));
};

export const sleep = (timeout = 100): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};
