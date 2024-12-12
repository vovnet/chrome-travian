import { getPositionFromRow, getAllPositions, normilizeDistance } from "./map";

test("Get X positions from row", () => {
  expect(getPositionFromRow({ size: 11, step: 3 })).toEqual([-4, -1, 2, 5]);
  expect(getPositionFromRow({ size: 3, step: 1 })).toEqual([-1, 0, 1]);
  expect(getPositionFromRow({ size: 43, step: 5 })).toEqual([-19, -14, -9, -4, 1, 6, 11, 16, 21]);
});

test("Get thow errors", () => {
  expect(() => getAllPositions({ size: 20, step: 3 })).toThrow();
  expect(() => getAllPositions({ size: 11, step: 30 })).toThrow();
});

test("Get all map positions", () => {
  expect(getAllPositions({ size: 11, step: 3 })).toEqual([
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

describe("Normalization of value", () => {
  it("normalize not required", () => {
    expect(normilizeDistance(1, 8, 21)).toEqual(7);
  });
  it("normalize with negative values not required", () => {
    expect(normilizeDistance(-15, -10, 21)).toEqual(5);
  });
  it("value must be dormalize", () => {
    expect(normilizeDistance(16, -20, 21)).toEqual(7);
  });
  it("normilize bordreline case", () => {
    expect(normilizeDistance(-11, 11, 21)).toEqual(21);
    expect(normilizeDistance(-10, 11, 21)).toEqual(21);
  });
});
