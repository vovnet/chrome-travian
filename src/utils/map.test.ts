import { getPositionFromRow, getPositions } from "./map";

test("Get positions from row", () => {
  expect(getPositionFromRow({ size: 11, step: 3 })).toEqual([-4, -1, 2, 5]);
  expect(getPositionFromRow({ size: 3, step: 1 })).toEqual([-1, 0, 1]);
  expect(getPositionFromRow({ size: 43, step: 5 })).toEqual([-19, -14, -9, -4, 1, 6, 11, 16, 21]);
});

test("Get thow errors", () => {
  expect(() => getPositions({ size: 20, step: 3 })).toThrow();
  expect(() => getPositions({ size: 11, step: 30 })).toThrow();
});

test("Get map positions", () => {
  expect(getPositions({ size: 11, step: 3 })).toEqual([
    { x: -4, y: 4 },
    { x: -1, y: 4 },
    { x: 2, y: 4 },
    { x: 5, y: 4 },

    { x: -4, y: 1 },
    { x: -1, y: 1 },
    { x: 2, y: 1 },
    { x: 5, y: 1 },

    { x: -4, y: -2 },
    { x: -1, y: -2 },
    { x: 2, y: -2 },
    { x: 5, y: -2 },

    { x: -4, y: -5 },
    { x: -1, y: -5 },
    { x: 2, y: -5 },
    { x: 5, y: -5 },
  ]);
});
