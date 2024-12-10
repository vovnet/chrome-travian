import React, { FC, useRef, useState } from "react";
import { getDistance } from "../../utils";
import { TroopForm } from "../troop-form";
import { TilePosition, Tile } from "../../types";
import { Typography } from "../../ui/text";
import { apiMapPosition, apiTileDetails } from "../../client";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/text-field";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";
import { Flex } from "../../ui/flex";
import { Layout } from "../../ui/layout";

type OasisTile = Tile & { distance: number };

export const OasisFarmer: FC = () => {
  const [tiles, setTiles] = useState<OasisTile[]>([]);
  const [position, setPosition] = useState<TilePosition>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [checkedFarm, setCheckedFarm] = useState<string[]>([]);
  const troopFormRef = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const sendFarm = async () => {
    for (let i = 0; i < checkedFarm.length; i++) {
      const v = checkedFarm[i];
      console.log("send troop to: ", v);
      const [x, y] = v.split("|");

      const html = await apiTileDetails({ x: parseFloat(x), y: parseFloat(y) });
      const find = html.match(/targetMapId=\d*/);
      if (find) {
        const [, mapId] = find[0].split("=");
        if (troopFormRef.current) {
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

          const [, checksum] = htmlText.match(/\[name=checksum]'\).value = '\w*/)?.[0].split(`= '`);
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

          await fetch("/build.php?gid=16&tt=2", { method: "POST", body: sendFormData });
        }
      }
    }
  };

  const sendFarmHandler = async () => {
    console.log("start farming...");
    setIsSending(true);
    await sendFarm();
    setIsSending(false);
  };

  const searchHandler = async () => {
    setIsLoading(true);
    setCheckedFarm([]);

    const tiles = await apiMapPosition(position);

    const oaz = tiles
      .filter((t) => t.title === "{k.fo}")
      .map((t) => {
        return {
          ...t,
          distance: getDistance(t.position.x, position.x, t.position.y, position.y),
        };
      })
      .sort((a, b) => a.distance - b.distance);

    setTiles(oaz);
    setIsLoading(false);
    console.log(oaz);
  };

  console.log({ checkedFarm });
  return (
    <Layout
      title={<Typography size="large">{chrome.i18n.getMessage("searchOfOasisTitle")}</Typography>}
    >
      <SearchForm>
        <div>
          <label>x:</label>
          <TextField
            value={position.x}
            disabled={isLoading}
            onChange={(e) => {
              setPosition((prev) => ({ ...prev, x: Number(e.target.value) }));
            }}
          />
        </div>
        <div>
          <label>y: </label>
          <TextField
            value={position.y}
            disabled={isLoading}
            onChange={(e) => {
              setPosition((prev) => ({ ...prev, y: Number(e.target.value) }));
            }}
          />
        </div>

        <Button disabled={isLoading} onClick={searchHandler}>
          {chrome.i18n.getMessage("search")}
        </Button>
      </SearchForm>

      {!!tiles.length && (
        <>
          <span>{`Выбрано: ${checkedFarm.length} из ${tiles.length}`}</span>
          <TroopForm ref={troopFormRef} />
          <Button
            disabled={isLoading || !checkedFarm.length || isSending}
            onClick={sendFarmHandler}
          >
            {chrome.i18n.getMessage("sendToFarm")}
          </Button>
          <TableContainer>
            <Table<OasisTile>
              columns={[
                {
                  label: "Ch",
                  renderCell: (item) => (
                    <input
                      type="checkbox"
                      checked={checkedFarm.includes(`${item.position.x}|${item.position.y}`)}
                      disabled={isSending}
                      onChange={(e) => {
                        const id = `${item.position.x}|${item.position.y}`;
                        if (e.target.checked) {
                          setCheckedFarm([...checkedFarm, id]);
                        } else {
                          const state = [...checkedFarm];
                          state.splice(checkedFarm.indexOf(id), 1);
                          setCheckedFarm(state);
                        }
                      }}
                    />
                  ),
                },
                {
                  label: "Dist",
                  renderCell: (item) => <>{item.distance}</>,
                },
                {
                  label: "Type",
                  renderCell: (item) => {
                    const make = item.text?.match(/\d+%/g)?.join(" ");
                    return <>{make}</>;
                  },
                },
                {
                  label: "Pos",
                  renderCell: (item) => (
                    <a
                      href={`/karte.php?x=${item.position.x}&y=${item.position.y}`}
                    >{`${item.position.x}|${item.position.y}`}</a>
                  ),
                },
                {
                  label: "Info",
                  renderCell: (item) => {
                    const lines = item.text?.split("<br>") as string[];
                    const animals = item.text?.match(
                      /<i class="unit u\d+"><\/i><span class="value ">\d+<\/span>/g
                    );
                    return (
                      <Flex gap={8}>
                        {animals?.map((a) => (
                          <Flex gap={2} dangerouslySetInnerHTML={{ __html: a }} />
                        ))}
                      </Flex>
                    );
                  },
                },
                {
                  label: "Last",
                  renderCell: ({ text }) => {
                    const res = text?.match(/;\d+&#x202c;\/&#x202d;\d+/g)?.[0];
                    const strArr = res?.match(/;\d+/g)?.map((v) => v.slice(1)) || [];
                    const isAccent = strArr.length > 1 && Number(strArr[0]) >= Number(strArr[1]);
                    const dateArr = text?.match(/{b:ri\d*}.*{b.ri\d}/g)?.[0].split(" ");
                    const date =
                      dateArr && dateArr?.length > 3 ? `${dateArr[1]}${dateArr[2]}` : undefined;
                    return (
                      <Flex flexDirection="column">
                        <StyledResources isAccent={isAccent}>
                          {strArr.length > 1 && `${strArr[0]} / ${strArr[1]}`}
                        </StyledResources>
                        {date}
                      </Flex>
                    );
                  },
                },
              ]}
              data={tiles}
            />
          </TableContainer>
        </>
      )}
    </Layout>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
  padding: 24px 16px;
`;

const SearchForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const TableContainer = styled.div`
  max-height: 600px;
  overflow: auto;
`;

const StyledResources = styled.span<{ isAccent?: boolean }>`
  color: ${(props) => (props.isAccent ? "#02e202" : "inherit")};
`;
