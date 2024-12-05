import { useEffect, useState } from "react";
import { Nations } from "../utils/unit";

const NATION_NAME = "bot-nation";

export const useNation = () => {
  const [nation, setNation] = useState<Nations>();

  useEffect(() => {
    const n = localStorage.getItem(NATION_NAME);
    if (n) {
      setNation(Number(n) as Nations);
    }
  }, []);

  const changeNation = (nation: Nations) => {
    setNation(nation);
    localStorage.setItem(NATION_NAME, nation.toString());
  };

  return { nation, changeNation };
};
