import React, { FC, useEffect, useRef, useState } from "react";
import { Flex } from "../../ui/flex";
import { TroopForm } from "../troop-form";
import { sleep } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";
import { Typography } from "../../ui/text";
import { Button } from "../../ui/button";
import { apiTileDetails } from "../../client";
import { isFailedLastAttack, lastLootedResources } from "../../client/parser";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";
import { CloseIcon } from "../../icons/close-icon";
import { Layout } from "../../ui/layout";

type Farm = { x: string; y: string };

const LAST_POSITION = "bot-last-farm-position";

export const Farmlist: FC = () => {
  const { farms, add, remove, lastPosition, setLastPosition } = useFarmList();
  const inputRef = useRef<HTMLInputElement>(null);
  const troopFormRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingCount, setSendingCount] = useState(0);
  const [stopList, setStopList] = useState(new Set());

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
          } catch (e) {
            console.log("send farm error!");
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
        setLastPosition(0);
      }
    }

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
          <Table<{ id: string; x: string; y: string; index: number }>
            columns={[
              {
                label: "🔪",
                renderCell: ({ index }) => (
                  <Flex justifyContent="center">{index === lastPosition && <CurrentPoint />}</Flex>
                ),
              },
              { label: "#", renderCell: ({ index }) => <>{index + 1}</> },
              {
                label: "Pos",
                renderCell: ({ id, x, y, index }) => (
                  <FarmLink
                    href={`/karte.php?x=${x}&y=${y}`}
                    isDanger={stopList.has(id)}
                  >{`(${x}|${y})`}</FarmLink>
                ),
              },
              {
                label: "Del",
                renderCell: ({ id }) => (
                  <StyledIconButton
                    disabled={isLoading}
                    onClick={() => {
                      const removedIndex = Array.from(farms).findIndex((i) => i === id);
                      const isRemoved = remove(id);
                      if (isRemoved && lastPosition > removedIndex) {
                        setLastPosition(lastPosition - 1);
                      }
                    }}
                  >
                    <CloseIcon />
                  </StyledIconButton>
                ),
              },
            ]}
            data={Array.from(farms).map((v, index) => {
              const [x, y] = v.split("|");
              return { id: v, x, y, index };
            })}
          />
        </TableContainer>
      </Flex>
    </Layout>
  );
};

/////////// Styles

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextInput = styled.input`
  width: 60px;
`;

const List = styled(Flex)`
  flex-wrap: wrap;
  max-width: 340px;
  max-height: 600px;
  overflow: auto;
`;

const FarmLink = styled.a<{ isDanger?: boolean }>`
  min-width: 60px;
  background-color: ${(props) => (props.isDanger ? "#290201" : "inherit")};
`;

const TableContainer = styled.div`
  max-height: 600px;
  overflow: auto;
`;

const CurrentPoint = styled.div`
  width: 12px;
  height: 12px;
  background-color: #ecb501;
  border-radius: 50%;
`;

const StyledText = styled.div<{ color?: string }>`
  color: ${(props) => props.color};
`;

const StyledIconButton = styled.button`
  padding: 0;

  & svg {
    width: 14px;
    height: 14px;
    color: ${(props) => (props.disabled ? "#e7250c55" : "#e75936")};
  }

  &:hover {
    & svg {
      color: ${(props) => (props.disabled ? "#e7250c55" : "#faa23e")};
    }
  }
`;
