import { useEffect, useState } from "react";
import { STORAGE_NAME } from "..";

export const useFarmList = () => {
  const [farms, setFarms] = useState<Set<string>>(new Set());

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_NAME);
    if (data) {
      const parsedFarms = JSON.parse(data) as string[];
      setFarms(new Set(parsedFarms));
    }
  }, []);

  const saveFarms = (farms: Set<string>) => {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(Array.from(farms)));
  };

  const add = (value: string) => {
    if (farms.has(value)) {
      return false;
    }
    const copyFarms = new Set(farms);
    copyFarms.add(value);
    setFarms(copyFarms);
    saveFarms(copyFarms);
    return true;
  };

  const remove = (value: string) => {
    if (!farms.has(value)) {
      return false;
    }
    const copyFarms = new Set(farms);
    copyFarms.delete(value);
    setFarms(copyFarms);
    saveFarms(copyFarms);
    return true;
  };

  return { farms, setFarms, saveFarms, add, remove };
};
