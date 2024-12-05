import React, { FC, forwardRef, useRef } from "react";
import { UNITS } from "../../utils/unit";
import { TroopInput, TroopItem, TroopsContainer } from "./styles";
import { useNation } from "../../hooks/use-nation";

type TroopFormProps = {};

export const TroopForm = forwardRef<HTMLFormElement, TroopFormProps>((props, ref) => {
  const { nation } = useNation();
  const CURRENT_NATION = nation !== undefined ? nation : 0;

  return (
    <form ref={ref} method="post">
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
