import React, { FC, forwardRef, ReactNode, useRef, useState } from "react";
import { Layout } from "../../ui/layout";
import styled from "@emotion/styled";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { Button } from "../../ui/button";
import { useNation } from "../../hooks/use-nation";
import { UNITS } from "../../utils/unit";
import { apiTileDetails } from "../../client";
import { sleep } from "../../utils";

export const Waves: FC = () => {
  const [coord, setCoord] = useState("");
  const [troops, setTroops] = useState([1]);
  const [isLoading, setIsLoading] = useState(false);
  const formsRefs = useRef<Array<HTMLFormElement | null>>([]);

  const prepareForms = async ({ x, y }: { x: number; y: number }) => {
    let action;
    let checksum;
    let villageId;
    const forms = new Array<FormData>();
    for (let i = 0; i < formsRefs.current.length; i++) {
      const currentRef = formsRefs.current[i];
      if (!currentRef) {
        continue;
      }
      const formData = new FormData(currentRef);
      formData.append("eventType", "3");
      formData.append("x", x.toString());
      formData.append("y", y.toString());
      formData.append("ok", "ok");

      const response = await fetch("/build.php?gid=16&tt=2", {
        method: "POST",
        body: formData,
      });

      const htmlText = await response.text();
      action = htmlText.match(/troopsSend\/\d*\/\d*/g)?.[0];

      checksum = htmlText.match(/\[name=checksum]'\).value = '\w*/g)?.[0].split(`= '`)?.[1];
      villageId = htmlText.match(/troops\[\d]\[villageId]" value="\d*/g)?.[0].split('="')?.[1];

      const t1 = formData.get("troop[t1]") as string;
      const t2 = formData.get("troop[t2]") as string;
      const t3 = formData.get("troop[t3]") as string;
      const t4 = formData.get("troop[t4]") as string;
      const t5 = formData.get("troop[t5]") as string;
      const t6 = formData.get("troop[t6]") as string;
      const t7 = formData.get("troop[t7]") as string;
      const t8 = formData.get("troop[t8]") as string;
      const t9 = formData.get("troop[t9]") as string;
      const t10 = formData.get("troop[t10]") as string;
      const t11 = formData.get("troop[t11]") as string;
      const catTarget1 = formData.get("troops[0][catapultTarget1]") as string;

      const sendFormData = new FormData();
      sendFormData.append("checksum", checksum?.toString() || "");
      sendFormData.append("action", action?.toString() || "");
      sendFormData.append("eventType", "3");
      sendFormData.append("x", x.toString());
      sendFormData.append("y", y.toString());
      sendFormData.append("troops[0][villageId]", villageId?.toString() || "");
      sendFormData.append("troops[0][t1]", t1);
      sendFormData.append("troops[0][t2]", t2);
      sendFormData.append("troops[0][t3]", t3);
      sendFormData.append("troops[0][t4]", t4);
      sendFormData.append("troops[0][t5]", t5);
      sendFormData.append("troops[0][t6]", t6);
      sendFormData.append("troops[0][t7]", t7);
      sendFormData.append("troops[0][t8]", t8);
      sendFormData.append("troops[0][t9]", t9);
      sendFormData.append("troops[0][t10]", t10);
      sendFormData.append("troops[0][t11]", t11);
      sendFormData.append("troops[0][catapultTarget1]", catTarget1);
      forms[i] = sendFormData;
    }

    for (let i = 0; i < forms.length; i++) {
      const sendFormData = forms[i];
      fetch("/build.php?gid=16&tt=2", {
        method: "POST",
        body: sendFormData,
      });
      await sleep(200);
    }
  };

  const sendHandler = async () => {
    setIsLoading(true);
    const sanitized = coord
      .trim()
      .match(/-{0,1}\d+\|-{0,1}\d+/g)?.[0]
      .split("|");
    if (!sanitized?.length || sanitized?.length < 2) {
      throw new Error("Coordinates is invalid!");
    }
    const [x, y] = sanitized.map(Number);
    const html = await apiTileDetails({ x, y });
    const find = html.match(/targetMapId=\d*/);
    if (!find) {
      console.log("Coordinates not found.");
      return;
    }

    await prepareForms({ x, y });

    setTroops([1]);
    formsRefs.current = [];
    setIsLoading(false);
  };

  return (
    <Layout title={<Typography size="large">{chrome.i18n.getMessage("waves")}</Typography>}>
      <Flex alignItems="center" flexDirection="column" gap={12}>
        <Flex gap={8} alignItems="center">
          <TextInput
            value={coord}
            onChange={(e) => setCoord(e.target.value)}
            type="text"
            className="text"
            placeholder="x|y"
          />
          <Button
            disabled={!coord.match(/-{0,1}\d+\|-{0,1}\d+/g)?.length || isLoading}
            onClick={sendHandler}
          >
            Отправить
          </Button>
        </Flex>

        {troops.map((t, i) => (
          <TroopForm key={t} ref={(el) => (formsRefs.current[i] = el)} />
        ))}

        <Button
          onClick={() => {
            setTroops((prev) => [...prev, prev[prev.length - 1]++]);
          }}
          disabled={isLoading}
        >
          Еще
        </Button>
      </Flex>
    </Layout>
  );
};

type TroopFormProps = {};

const TroopForm = forwardRef<HTMLFormElement, TroopFormProps>((props, ref) => {
  const { nation } = useNation();
  const CURRENT_NATION = nation !== undefined ? nation : 0;

  return (
    <form ref={ref} method="post">
      <TroopsContainer>
        <TroopBlock>
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
        </TroopBlock>

        <TroopBlock>
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
        </TroopBlock>

        <TroopBlock>
          <TroopItem>
            <img
              className={`unit ${UNITS[CURRENT_NATION][7].type}`}
              src="/img/x.gif"
              alt={`${UNITS[CURRENT_NATION][7].name}`}
            />
            <TroopInput type="text" className="text " name="troop[t7]" />
          </TroopItem>
          <TroopItem>
            <img
              className={`unit ${UNITS[CURRENT_NATION][8].type}`}
              src="/img/x.gif"
              alt={`${UNITS[CURRENT_NATION][8].name}`}
            />
            <TroopInput type="text" className="text " name="troop[t8]" />
          </TroopItem>
          <TroopItem>
            <img
              className={`unit ${UNITS[CURRENT_NATION][9].type}`}
              src="/img/x.gif"
              alt={`${UNITS[CURRENT_NATION][9].name}`}
            />
            <TroopInput type="text" className="text " name="troop[t9]" />
          </TroopItem>
        </TroopBlock>

        <TroopBlock>
          <TroopItem>
            <img className={`unit uhero`} src="/img/x.gif" alt="hero" />
            <TroopInput type="text" className="text " name="troop[t11]" />
          </TroopItem>
          <select name="troops[0][catapultTarget1]">
            <option value="99" selected>
              Случайная цель
            </option>
            <optgroup label="Сырье">
              <option value="1">Лесопилка</option>
              <option value="2">Глиняный карьер</option>
              <option value="3">Железный рудник</option>
              <option value="4">Ферма</option>
              <option value="5">Лесопильный завод</option>
              <option value="6">Кирпичный завод</option>
              <option value="7">Чугунолитейный завод</option>
              <option value="8">Мукомольная мельница</option>
              <option value="9">Пекарня</option>
            </optgroup>
            <optgroup label="Инфраструктура">
              <option value="10">Склад</option>
              <option value="11">Амбар</option>
              <option value="15">Главное здание</option>
              <option value="17">Рынок</option>
              <option value="18">Посольство</option>
              <option value="24">Ратуша</option>
              <option value="25">Резиденция</option>
              <option value="26">Дворец</option>
              <option value="27">Сокровищница</option>
              <option value="28">Торговая палата</option>
            </optgroup>
            <optgroup label="Армия">
              <option value="13">Кузница</option>
              <option value="14">Арена</option>
              <option value="16">Пункт сбора</option>
              <option value="19">Казарма</option>
              <option value="20">Конюшня</option>
              <option value="21">Мастерская</option>
              <option value="22">Академия</option>
              <option value="35">Пивоварня</option>
              <option value="37">Таверна</option>
              <option value="41">Водопой</option>
              <option value="46">Госпиталь</option>
            </optgroup>
          </select>
        </TroopBlock>
      </TroopsContainer>
    </form>
  );
});

const TroopsContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  background-color: #a3a3a3;
`;

const TroopItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TroopInput = styled.input`
  width: 48px;
`;

const TroopBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TextInput = styled.input`
  max-width: 64px;
`;
