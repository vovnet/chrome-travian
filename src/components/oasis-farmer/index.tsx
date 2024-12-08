import React, { FC, useRef, useState } from "react";
import { getDistance } from "../../utils";
import { Container, SearchForm, VillageContainer } from "./styles";
import { TroopForm } from "../troop-form";
import { Village } from "../village";
import { TilePosition, Tile } from "../../types";
import { Typography } from "../../ui/text";
import { apiMapPosition } from "../../client";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/text-field";

export const OasisFarmer: FC = () => {
  const [tiles, setTiles] = useState<(Tile & { distance: number })[]>([]);
  const [position, setPosition] = useState<TilePosition>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [checkedFarm, setCheckedFarm] = useState<string[]>([]);
  const troopFormRef = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const sendFarm = async () => {
    checkedFarm.map(async (v) => {
      console.log("send troop to: ", v);
      const [x, y] = v.split("|");
      const data = await fetch("/api/v1/map/tile-details", {
        method: "POST",
        body: JSON.stringify({ x, y }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const { html } = (await data.json()) as { html: string };
      const find = html.match(/targetMapId=\d*/);
      if (find) {
        const [, mapId] = find[0].split("=");
        // console.log("loaded map: ", { mapId });
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
    });
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
        const find = t.text?.match(/<div class="inlineIcon/);
        return {
          ...t,
          distance: getDistance(t.position.x, position.x, t.position.y, position.y),
          text: find ? t.text?.slice(find.index, t.text.length) : "",
        };
      })
      .sort((a, b) => a.distance - b.distance);

    setTiles(oaz);
    setIsLoading(false);
    console.log(oaz);
  };

  console.log({ checkedFarm });
  return (
    <Container>
      <Typography size="large">Поиск оазисов</Typography>
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
          Поиск
        </Button>
      </SearchForm>

      {!!tiles.length && (
        <>
          <span>{`Выбрано: ${checkedFarm.length} из ${tiles.length}`}</span>
          <TroopForm ref={troopFormRef} />
        </>
      )}

      <VillageContainer>
        {tiles?.map((t) => (
          <Village
            key={`${t.position.x}|${t.position.y}`}
            distance={t.distance}
            position={t.position}
            text={t.text}
            disabled={isSending}
            checked={checkedFarm.includes(`${t.position.x}|${t.position.y}`)}
            onChecked={(id, checked) => {
              console.log({ id, checked });
              if (checked) {
                setCheckedFarm([...checkedFarm, id]);
              } else {
                const state = [...checkedFarm];
                state.splice(checkedFarm.indexOf(id), 1);
                setCheckedFarm(state);
              }
            }}
          />
        ))}
      </VillageContainer>

      {!!tiles.length && (
        <Button disabled={isLoading || !checkedFarm.length || isSending} onClick={sendFarmHandler}>
          Отправить фармить
        </Button>
      )}
    </Container>
  );
};
