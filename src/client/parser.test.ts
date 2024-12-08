import { isFailedLastAttack, lastLootedResources } from "./parser";

describe("Check failed attacks", () => {
  it("is warning", () => expect(isFailedLastAttack("iReport iReport2 iReport3")).toBeTruthy());
  it("is warning", () =>
    expect(isFailedLastAttack("iReport iReport3 iReport1 iReport1")).toBeTruthy());
  it("is ok", () => expect(isFailedLastAttack("iReport1 iReport2 iReport3")).toBeFalsy());
  it("is ok", () => expect(isFailedLastAttack("some text...")).toBeFalsy());
});

describe("Check last looted resources", () => {
  it("without last loot", () => expect(lastLootedResources("234343 /2343 test")).toBeUndefined());
  it("one attack with empty loot", () => expect(lastLootedResources("0/200")).toEqual("0/200"));
  it("few success attacks", () =>
    expect(lastLootedResources("100/2000 alt=`200/300`")).toEqual("100/2000"));
});
