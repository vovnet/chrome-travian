import React, { createContext } from "react";

export type VillageInfo = {
  id: number;
  x: string;
  y: string;
};

export type VillagesContextValue = {
  currentVillageId: number | null;
  villages: Map<number, VillageInfo>;
};

export const VillagesContext = createContext<VillagesContextValue | null>(null);
