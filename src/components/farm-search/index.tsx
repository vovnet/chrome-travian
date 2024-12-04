import React, { FC, useState } from "react";
import { Container, Table, Cell, TextInput } from "./styles";
import { Flex } from "../../ui/flex";
import { Tile, TilePosition } from "../../types";
import { getDistance } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";

const getPosition = (pos: string): TilePosition => {
  const splitted = pos.trim().split("|");
  if (splitted.length < 2) {
    throw new Error("Invalid position format!");
  }
  const [x, y] = splitted.map(Number);
  return { x, y };
};

type VilliageTile = Tile & { distance: number; population?: string; alliance?: string };

export const FarmSearch: FC = () => {
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [villiages, setVilliages] = useState<VilliageTile[]>();
  const { farms, add, remove } = useFarmList();

  const searchHandler = async () => {
    setIsLoading(true);
    const { x, y } = getPosition(position);
    console.log("serach: ", { x, y });

    const data = await fetch("/api/v1/map/position", {
      method: "POST",
      body: JSON.stringify({ data: { x, y, zoomLevel: 3, ignorePositions: [] } }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const { tiles } = (await data.json()) as { tiles: Tile[] };

    const villiages = tiles
      .filter((t) => t.title?.includes("{k.dt}"))
      .map((t) => {
        const population = t.text?.match(/{k.einwohner} \d*/)?.[0].split("} ")?.[1];
        const alliance = t.text?.match(/{k.allianz} \w*/)?.[0].split("} ")?.[1];
        const distance = getDistance(x, t.position.x, y, t.position.y);
        const title = t.title?.split("} ")?.[1];
        return { ...t, title, population, alliance, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    setVilliages(villiages);

    // console.log({ villiages });
    setIsLoading(false);
  };

  return (
    <Container>
      <Flex gap={8} alignItems="center">
        <label>x|y:</label>
        <TextInput
          type="text"
          className="text"
          value={position}
          disabled={isLoading}
          onChange={(e) => setPosition(e.target.value)}
        />
        <button className="textButtonV1 green" disabled={isLoading} onClick={searchHandler}>
          Поиск
        </button>
      </Flex>

      <Table>
        <Cell>Дист.</Cell>
        <Cell>Поз.</Cell>
        <Cell>Альянс</Cell>
        <Cell>Нас.</Cell>
        <Cell>✅</Cell>
        {villiages?.map((v) => {
          const vPos = `${v.position.x}|${v.position.y}`;
          const isCurrentVilliage = position === vPos;
          const isChecked = farms.has(vPos);
          return (
            <>
              <Cell isWarning={isCurrentVilliage}>{v.distance}</Cell>
              <Cell isWarning={isCurrentVilliage}>
                <a
                  href={`/karte.php?x=${v.position.x}&y=${v.position.y}`}
                >{`(${v.position.x}|${v.position.y})`}</a>
              </Cell>
              <Cell isWarning={isCurrentVilliage}>{v.alliance}</Cell>
              <Cell isWarning={isCurrentVilliage}>{v.population}</Cell>
              <Cell isWarning={isCurrentVilliage}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (isChecked) {
                      remove(vPos);
                    } else {
                      add(vPos);
                    }
                  }}
                />
              </Cell>
            </>
          );
        })}
      </Table>
    </Container>
  );
};
