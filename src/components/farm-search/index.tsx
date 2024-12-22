import React, { FC, useMemo, useState } from "react";
import { Flex } from "../../ui/flex";
import { Tile, TilePosition } from "../../types";
import { getDistance } from "../../utils";
import { useFarmList } from "../../hooks/use-farm-list";
import { Typography } from "../../ui/text";
import { apiMapPosition } from "../../client";
import { Button } from "../../ui/button";
import { currentVillageId, userVilliages } from "../../index";
import { Layout } from "../../ui/layout";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";

type VilliageTile = Tile & { distance: number; population?: string; alliance?: string };

export const FarmSearch: FC = () => {
  const currentVilliage = userVilliages.get(currentVillageId);
  const [position, setPosition] = useState(`${currentVilliage?.x}|${currentVilliage?.y}`);
  const [isLoading, setIsLoading] = useState(false);
  const [villiages, setVilliages] = useState<VilliageTile[]>();
  const { farms, add, remove } = useFarmList();
  const [withoutAlly, setWithoutAlly] = useState(false);
  const [onlyUnchecked, setOnlyUnchecked] = useState(false);
  const filtered = useMemo(() => {
    let result = villiages;
    if (withoutAlly) {
      result = result?.filter((v) => !v.alliance);
    }
    if (onlyUnchecked) {
      result = result?.filter((v) => {
        const vPos = `${v.position.x}|${v.position.y}`;
        const isChecked = farms.has(vPos);
        return !isChecked;
      });
    }
    return result;
  }, [villiages, withoutAlly, onlyUnchecked]);

  const searchHandler = async () => {
    setIsLoading(true);
    const { x, y } = getPosition(position);

    const tiles = await apiMapPosition({ x, y });

    const villiages = tiles
      .filter((t) => t.title?.includes("{k.dt}") && t.did && !userVilliages.has(t.did))
      .map((t) => {
        const population = t.text?.match(/{k.einwohner} \d*/)?.[0].split("} ")?.[1];
        const alliance = t.text?.match(/{k.allianz} \w*/)?.[0].split("} ")?.[1];
        const distance = getDistance(
          Number(currentVilliage?.x),
          t.position.x,
          Number(currentVilliage?.y),
          t.position.y
        );
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
      <Flex flexDirection="column" gap={12} alignItems="center">
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

        <Flex gap={12}>
          <Flex gap={8}>
            <label htmlFor="ally">Без альянса</label>
            <input
              name="ally"
              id="ally"
              type="checkbox"
              onChange={(e) => setWithoutAlly(e.target.checked)}
            />
          </Flex>
          <Flex gap={8}>
            <label htmlFor="unchecked">Не выбранные</label>
            <input
              name="unchecked"
              id="unchecked"
              type="checkbox"
              onChange={(e) => setOnlyUnchecked(e.target.checked)}
            />
          </Flex>
        </Flex>
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
            data={filtered}
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
