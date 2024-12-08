import React, { FC, useEffect, useRef, useState } from "react";
import { TextInput, InputContainer, Container, List, FarmLink, ListItem } from "./styles";
import { Flex } from "../../ui/flex";
import { TroopForm } from "../troop-form";
import { sleep } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";
import { Typography } from "../../ui/text";
import { Button } from "../../ui/button";
import { apiTileDetails } from "../../client";
import { isFailedLastAttack, lastLootedResources } from "../../client/parser";

type Farm = { x: string; y: string };

const LAST_POSITION = "bot-last-farm-position";

export const Farmlist: FC = () => {
  const { farms, add, remove } = useFarmList();
  const inputRef = useRef<HTMLInputElement>(null);
  const troopFormRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingCount, setSendingCount] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [stopList, setStopList] = useState(new Set());

  useEffect(() => {
    const pos = Number(localStorage.getItem(LAST_POSITION));
    setLastPosition(pos);
  }, []);

  const sendFarmHandler = async () => {
    setIsLoading(true);
    let count = 0;
    setSendingCount(count);
    const farmsArray = Array.from(farms);
    const missedAttacks = new Set<string>();

    const index = lastPosition < farmsArray.length ? lastPosition : 0;
    for (let i = index; i < farmsArray.length; i++) {
      const v = farmsArray[i];
      count++;
      console.log("send troop to: ", v);
      const [x, y] = v.split("|");

      const html = await apiTileDetails({ x: parseFloat(x), y: parseFloat(y) });
      const find = html.match(/targetMapId=\d*/);
      if (find) {
        // const [, mapId] = find[0].split("=");
        if (isFailedLastAttack(html)) {
          console.log("Last attack was failed! ", v);
          missedAttacks.add(v);
          setStopList(missedAttacks);
          continue;
        }
        const lastLoot = lastLootedResources(html);
        if (lastLoot) {
          console.log({ v, lastLoot });
        }

        if (troopFormRef.current) {
          try {
            const formData = new FormData(troopFormRef.current);
            formData.append("eventType", "4");
            formData.append("x", x);
            formData.append("y", y);
            formData.append("ok", "ok");
            const response = await fetch("/build.php?gid=16&tt=2", {
              method: "POST",
              body: formData,
            });
            const htmlText = await response.text();
            const [action] = htmlText.match(/troopsSend\/\d*\/\d*/);

            const [, checksum] = htmlText
              .match(/\[name=checksum]'\).value = '\w*/)?.[0]
              .split(`= '`);
            const [, villageId] = htmlText
              .match(/troops\[\d]\[villageId]" value="\d*/)?.[0]
              .split('="');

            const t1 = formData.get("troop[t1]") as string;
            const t2 = formData.get("troop[t2]") as string;
            const t3 = formData.get("troop[t3]") as string;
            const t4 = formData.get("troop[t4]") as string;
            const t5 = formData.get("troop[t5]") as string;
            const t6 = formData.get("troop[t6]") as string;

            const sendFormData = new FormData();
            sendFormData.append("checksum", checksum);
            sendFormData.append("action", action);
            sendFormData.append("eventType", "4");
            sendFormData.append("x", x);
            sendFormData.append("y", y);
            sendFormData.append("troops[0][villageId]", villageId);
            sendFormData.append("troops[0][t1]", t1);
            sendFormData.append("troops[0][t2]", t2);
            sendFormData.append("troops[0][t3]", t3);
            sendFormData.append("troops[0][t4]", t4);
            sendFormData.append("troops[0][t5]", t5);
            sendFormData.append("troops[0][t6]", t6);

            await fetch("/build.php?gid=16&tt=2", {
              method: "POST",
              body: sendFormData,
            });

            setLastPosition(i);
            setSendingCount(count);
            const sleepRes = await sleep(300);
            console.log({ sleepRes, count });
          } catch (e) {
            console.log("send farm error!");
            localStorage.setItem(LAST_POSITION, i.toString());
            setLastPosition(i);
            setIsLoading(false);
            break;
          }
        }
      } else {
        console.log("Wrong villiage position: ", v);
        missedAttacks.add(v);
        setStopList(missedAttacks);
      }

      if (i === farmsArray.length - 1) {
        localStorage.setItem(LAST_POSITION, "0");
        setLastPosition(0);
      }
    }

    setIsLoading(false);
  };

  return (
    <Container>
      <Flex flexDirection="column" gap={12}>
        <Typography size="large">{chrome.i18n.getMessage("listOfFarmsTitle")}</Typography>
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
            disabled={isLoading}
            onClick={() => {
              setLastPosition(0);
              localStorage.setItem(LAST_POSITION, "0");
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
              <div>{`${chrome.i18n.getMessage("errors")}: ${stopList.size}`}</div>
            </Flex>
            <TroopForm ref={troopFormRef} />
            <Button disabled={!farms.size || isLoading} onClick={sendFarmHandler}>
              {chrome.i18n.getMessage("sendToFarm")}
            </Button>
          </Flex>
        )}

        <List gap={8}>
          {Array.from(farms)
            .map((v) => {
              const [x, y] = v.split("|");
              return { id: v, x, y };
            })
            .map(({ id, x, y }, index) => (
              <ListItem key={id} alignItems="center" gap={8} isCurrent={index === lastPosition}>
                <FarmLink
                  href={`/karte.php?x=${x}&y=${y}`}
                  isDanger={stopList.has(id)}
                >{`(${x}|${y})`}</FarmLink>
                <button
                  type="button"
                  className="icon"
                  onClick={() => {
                    const removedIndex = Array.from(farms).findIndex((i) => i === id);
                    const isRemoved = remove(id);
                    if (isRemoved && lastPosition > removedIndex) {
                      setLastPosition(lastPosition - 1);
                      localStorage.setItem(LAST_POSITION, (lastPosition - 1).toString());
                    }
                  }}
                >
                  <img src="/img/x.gif" className="del" />
                </button>
              </ListItem>
            ))}
        </List>
      </Flex>
    </Container>
  );
};
