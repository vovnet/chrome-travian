import React, { FC, useState } from "react";
import { Flex } from "../../ui/flex";
import { Tile, TilePosition } from "../../types";
import { getDistance } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";
import { Typography } from "../../ui/text";
import { apiMapPosition } from "../../client";
import { Button } from "../../ui/button";
import { villiages as userVilliages } from "../../index";
import { Layout } from "../../ui/layout";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";

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

    const tiles = await apiMapPosition({ x, y });

    const villiages = tiles
      .filter((t) => t.title?.includes("{k.dt}") && !Array.from(userVilliages).includes(t.did))
      .map((t) => {
        const population = t.text?.match(/{k.einwohner} \d*/)?.[0].split("} ")?.[1];
        const alliance = t.text?.match(/{k.allianz} \w*/)?.[0].split("} ")?.[1];
        const distance = getDistance(x, t.position.x, y, t.position.y);
        const title = t.title?.split("} ")?.[1];
        return { ...t, title, population, alliance, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    setVilliages(villiages);
    setIsLoading(false);
  };

  return (
    <Layout
      title={
        <Typography size="large">{chrome.i18n.getMessage("searchOfOasisVilliages")}</Typography>
      }
    >
      <Flex gap={8} alignItems="center">
        <label>x|y:</label>
        <TextInput
          type="text"
          className="text"
          value={position}
          disabled={isLoading}
          onChange={(e) => setPosition(e.target.value)}
        />
        <Button disabled={isLoading} onClick={searchHandler}>
          Поиск
        </Button>
      </Flex>

      {!!villiages?.length && (
        <TableWrapper>
          <Table<VilliageTile>
            columns={[
              {
                label: chrome.i18n.getMessage("tableDist"),
                renderCell: ({ distance }) => <>{distance}</>,
              },
              {
                label: chrome.i18n.getMessage("tablePos"),
                renderCell: ({ position }) => (
                  <>
                    {
                      <a
                        href={`/karte.php?x=${position.x}&y=${position.y}`}
                      >{`(${position.x}|${position.y})`}</a>
                    }
                  </>
                ),
              },
              {
                label: chrome.i18n.getMessage("tableAlly"),
                renderCell: ({ alliance }) => <>{alliance}</>,
              },
              {
                label: chrome.i18n.getMessage("tablePop"),
                renderCell: ({ population }) => <>{population}</>,
              },
              {
                label: "✅",
                renderCell: ({ position }) => {
                  const vPos = `${position.x}|${position.y}`;
                  const isChecked = farms.has(vPos);

                  return (
                    <>
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
                    </>
                  );
                },
              },
            ]}
            data={villiages}
          />
        </TableWrapper>
      )}
    </Layout>
  );
};

const getPosition = (pos: string): TilePosition => {
  const splitted = pos.trim().split("|");
  if (splitted.length < 2) {
    throw new Error("Invalid position format!");
  }
  const [x, y] = splitted.map(Number);
  return { x, y };
};

//////////// Styles
const TableWrapper = styled.div`
  max-height: 600px;
  overflow: auto;
`;

const TextInput = styled.input`
  width: 60px;
`;
