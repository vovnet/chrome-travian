import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { Flex } from "../../ui/flex";
import { TroopForm } from "../troop-form";
import { getDistance, sleep } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";
import { Typography } from "../../ui/text";
import { Button } from "../../ui/button";
import { apiTileDetails } from "../../client";
import { isFailedLastAttack, lastLootedResources } from "../../client/parser";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";
import { CloseIcon } from "../../icons/close-icon";
import { Layout } from "../../ui/layout";
import { useCurrentVillage } from "../../hooks/use-current-village";
import { FarmsTable } from "./farms-table";

type Farm = { x: string; y: string };

const LAST_POSITION = "bot-last-farm-position";

export const Farmlist: FC = () => {
  const { farms, add, remove, set: setFarms, lastPosition, setLastPosition } = useFarmList();
  const inputRef = useRef<HTMLInputElement>(null);
  const troopFormRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingCount, setSendingCount] = useState(0);
  const [stopList, setStopList] = useState(new Set<string>());
  const currentVillage = useCurrentVillage();

  const mappedFarms = useMemo(() => {
    return Array.from(farms).map((v, index) => {
      const [x, y] = v.split("|");
      const distance = getDistance(
        Number(x),
        Number(currentVillage?.x),
        Number(y),
        Number(currentVillage?.y)
      );
      return { id: v, x, y, index, distance };
    });
  }, [farms, currentVillage]);

  const sendFarmHandler = async () => {
    setIsLoading(true);
    let count = 0;
    setSendingCount(count);
    const farmsArray = Array.from(farms);
    const missedAttacks = new Set<string>();

    const startIndex = lastPosition < farmsArray.length ? lastPosition : 0;

    for (let i = startIndex; i < farmsArray.length; i++) {
      const v = farmsArray[i];
      count++;
      console.log("send troop to:", v);

      const [x, y] = v.split("|");
      const html = await apiTileDetails({ x: parseFloat(x), y: parseFloat(y) });

      if (!html.match(/targetMapId=\d*/)) {
        console.log("Wrong village position:", v);
        missedAttacks.add(v);
        setStopList(new Set(missedAttacks));
        continue;
      }

      if (isFailedLastAttack(html)) {
        console.log("Last attack failed:", v);
        missedAttacks.add(v);
        setStopList(new Set(missedAttacks));
        continue;
      }

      const lastLoot = lastLootedResources(html);
      if (lastLoot) console.log({ v, lastLoot });

      if (troopFormRef.current) {
        try {
          const formData = new FormData(troopFormRef.current);
          formData.append("eventType", "4");
          formData.append("x", x);
          formData.append("y", y);
          formData.append("ok", "ok");

          const htmlText = await sendTroops(formData);
          const parsed = parseTroopResponse(htmlText);
          const sendFormData = createSendFormData(x, y, formData, parsed);

          await fetch("/build.php?gid=16&tt=2", { method: "POST", body: sendFormData });

          setLastPosition(i);
          setSendingCount(count);
        } catch (err) {
          console.log("send farm error!", err);
          setLastPosition(i);
          break;
        }
      }

      if (i === farmsArray.length - 1) setLastPosition(0);
    }

    setStopList(missedAttacks);
    setIsLoading(false);
  };

  return (
    <Layout
      title={<Typography size="large">{chrome.i18n.getMessage("listOfFarmsTitle")}</Typography>}
    >
      <Flex flexDirection="column" gap={12}>
        <InputContainer>
          <label>x|y:</label>
          <TextInput ref={inputRef} type="text" className="text" />

          <Button
            onClick={() => {
              if (inputRef.current) {
                const value = inputRef.current.value.trim();
                const isAdded = add(value);
                if (isAdded) {
                  inputRef.current.value = "";
                }
              }
            }}
          >
            {chrome.i18n.getMessage("add")}
          </Button>

          <Button
            disabled={!farms.size || isLoading}
            onClick={() => {
              const sorted = mappedFarms
                .sort((a, b) => a.distance - b.distance)
                .map((v) => `${v.x}|${v.y}`);
              setFarms(new Set(sorted));
            }}
          >
            Sort
          </Button>

          <Button
            disabled={isLoading}
            onClick={() => {
              setLastPosition(0);
            }}
          >
            {chrome.i18n.getMessage("reset")}
          </Button>
        </InputContainer>

        {!!farms.size && (
          <Flex flexDirection="column" gap={8}>
            <Flex gap={24} alignItems="center">
              <div>{`${chrome.i18n.getMessage("inList")}: ${farms.size}`}</div>
              <div>{`${chrome.i18n.getMessage("current")}: ${lastPosition + 1}`}</div>
              <StyledText color={stopList.size ? "#e90800" : undefined}>{`${chrome.i18n.getMessage(
                "errors"
              )}: ${stopList.size}`}</StyledText>
            </Flex>
            <TroopForm ref={troopFormRef} />
            <Button disabled={!farms.size || isLoading} onClick={sendFarmHandler}>
              {chrome.i18n.getMessage("sendToFarm")}
            </Button>
          </Flex>
        )}

        <TableContainer>
          <FarmsTable
            farms={mappedFarms}
            lastPosition={lastPosition}
            stopList={stopList}
            isLoading={isLoading}
            removeFarm={remove}
            setLastPosition={setLastPosition}
          />
        </TableContainer>
      </Flex>
    </Layout>
  );
};

// Отправка формы на сервер и получение ответа
async function sendTroops(formData: FormData): Promise<string> {
  const response = await fetch("/build.php?gid=16&tt=2", { method: "POST", body: formData });
  return response.text();
}

// Извлечение данных из html-ответа
function parseTroopResponse(htmlText: string) {
  const [action] = htmlText.match(/troopsSend\/\d*\/\d*/) ?? [];
  const [, checksum] = htmlText.match(/\[name=checksum]'\).value = '\w*/)?.[0].split("= '") ?? [];
  const [, villageId] =
    htmlText.match(/troops\[\d]\[villageId]" value="\d*/)?.[0].split('="') ?? [];
  return { action, checksum, villageId };
}

// Создание FormData для повторной отправки
function createSendFormData(
  x: string,
  y: string,
  formData: FormData,
  parsed: { action: string; checksum: string; villageId: string }
) {
  const sendFormData = new FormData();
  sendFormData.append("checksum", parsed.checksum);
  sendFormData.append("action", parsed.action);
  sendFormData.append("eventType", "4");
  sendFormData.append("x", x);
  sendFormData.append("y", y);
  sendFormData.append("troops[0][villageId]", parsed.villageId);

  for (let i = 1; i <= 6; i++) {
    const t = formData.get(`troop[t${i}]`) as string;
    sendFormData.append(`troops[0][t${i}]`, t);
  }
  return sendFormData;
}

/////////// Styles

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextInput = styled.input`
  width: 60px;
`;

const TableContainer = styled.div`
  max-height: 600px;
  overflow: auto;
`;

const StyledText = styled.div<{ color?: string }>`
  color: ${(props) => props.color};
`;
