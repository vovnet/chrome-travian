import { getPositionFromRow, getAllPositions, normalizeDistance } from "./map";

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
    expect(normalizeDistance(1, 8, 43)).toEqual(7);
  });
  it("normalize with negative values not required", () => {
    expect(normalizeDistance(-15, -10, 43)).toEqual(5);
  });
  it("value must be normalize", () => {
    expect(normalizeDistance(16, -20, 43)).toEqual(7);
  });
  it("normalize bordreline case", () => {
    expect(normalizeDistance(-11, 11, 43)).toEqual(21);
    expect(normalizeDistance(-10, 11, 43)).toEqual(21);
  });
});
