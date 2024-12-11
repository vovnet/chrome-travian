import { useEffect, useState } from "react";
import { currentVillageId, STORAGE_NAME } from "..";

type Farm = {
  lastPosition: number;
  list: string[];
};

export const useFarmList = () => {
  const NAME = STORAGE_NAME + currentVillageId;
  const [farms, setFarms] = useState<Set<string>>(new Set());
  const [lastPosition, setLastPosition] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem(NAME);
    if (data) {
      const { lastPosition, list } = JSON.parse(data) as Farm;
      setFarms(new Set(list));
      setLastPosition(lastPosition);
    }
  }, []);

  const saveFarms = (lastPosition: number, farms: Set<string>) => {
    localStorage.setItem(NAME, JSON.stringify({ lastPosition, list: Array.from(farms) }));
  };

  const add = (value: string) => {
    if (farms.has(value)) {
      return false;
    }
    const copyFarms = new Set(farms);
    copyFarms.add(value);
    setFarms(copyFarms);
    saveFarms(lastPosition, copyFarms);
    return true;
  };

  const remove = (value: string) => {
    if (!farms.has(value)) {
      return false;
    }
    const copyFarms = new Set(farms);
    copyFarms.delete(value);
    setFarms(copyFarms);
    saveFarms(lastPosition, copyFarms);
    return true;
  };

  return {
    farms,
    setFarms,
    saveFarms,
    add,
    remove,
    lastPosition,
    setLastPosition: (last: number) => {
      setLastPosition(last);
      saveFarms(last, farms);
    },
  };
};
