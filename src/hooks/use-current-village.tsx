import { currentVillageId, userVilliages } from "..";

export const useCurrentVillage = () => {
  return userVilliages.get(currentVillageId);
};
