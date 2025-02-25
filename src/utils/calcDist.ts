import { getDistance } from "../utils";

type User = { name: string; x: number; y: number };

const distance = (u1: User, u2: User) => {
  const dist = getDistance(u1.x, u2.x, u1.y, u2.y);
  return { u1, u2, dist };
};

window.calcDist = (list: User[]) => {
  const results: { u1: User; u2: User; dist: number }[] = [];
  list.forEach((u1) => {
    list.forEach((u2) => {
      if (u1.name === u2.name) {
        return;
      }
      const isRepeat = !!results.find(
        (r) =>
          (r.u1.name === u1.name && r.u2.name === u2.name) ||
          (r.u1.name === u2.name && r.u2.name === u1.name)
      );
      if (isRepeat) {
        return;
      }
      results.push(distance(u1, u2));
    });
  });
  return results
    .sort((a, b) => a.dist - b.dist)
    .map(({ u1, u2, dist }) => ({ a: u1.name, b: u2.name, dist }));
};
