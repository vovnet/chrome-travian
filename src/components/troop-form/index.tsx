import React, { FC, forwardRef, useRef } from "react";
import { UNITS } from "../../utils/unit";
import { TroopInput, TroopItem, TroopsContainer } from "./styles";
import { useNation } from "../../hooks/use-nation";

type TroopFormProps = {
  onChange?: (formData: TroopsData) => void;
};

export const TroopForm = forwardRef<HTMLFormElement, TroopFormProps>(({ onChange }, ref) => {
  const { nation } = useNation();
  const CURRENT_NATION = nation !== undefined ? nation : 0;

  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    if (!onChange) return;

    onChange(getTroopsData(e.currentTarget));
  };

  return (
    <form ref={ref} method="post" onChange={handleChange}>
      <TroopsContainer>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][1].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][1].name}`}
          />
          <TroopInput type="text" className="text" name="troop[t1]" />
        </TroopItem>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][2].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][2].name}`}
          />
          <TroopInput type="text" className="text " name="troop[t2]" />
        </TroopItem>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][3].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][3].name}`}
          />
          <TroopInput type="text" className="text " name="troop[t3]" />
        </TroopItem>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][4].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][4].name}`}
          />
          <TroopInput type="text" className="text " name="troop[t4]" />
        </TroopItem>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][5].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][5].name}`}
          />
          <TroopInput type="text" className="text" name="troop[t5]" />
        </TroopItem>
        <TroopItem>
          <img
            className={`unit ${UNITS[CURRENT_NATION][6].type}`}
            src="/img/x.gif"
            alt={`${UNITS[CURRENT_NATION][6].name}`}
          />
          <TroopInput type="text" className="text " name="troop[t6]" />
        </TroopItem>
      </TroopsContainer>
    </form>
  );
});

export type TroopsData = {
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  t5: string;
  t6: string;
};

function getTroopsData(form: HTMLFormElement): TroopsData {
  const fd = new FormData(form);

  return {
    t1: (fd.get("troop[t1]") ?? "").toString(),
    t2: (fd.get("troop[t2]") ?? "").toString(),
    t3: (fd.get("troop[t3]") ?? "").toString(),
    t4: (fd.get("troop[t4]") ?? "").toString(),
    t5: (fd.get("troop[t5]") ?? "").toString(),
    t6: (fd.get("troop[t6]") ?? "").toString(),
  };
}
