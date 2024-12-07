import styled from "@emotion/styled";
import React, { FC, useEffect, useMemo, useState } from "react";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { apiMapPosition } from "../../client";
import { getAllPositions } from "../../utils/map";
import { Tile } from "../../types";
import { getDistance } from "../../utils";

const Container = styled.div`
  padding: 16px;
`;

const Table = styled.div`
  display: grid;
  max-width: 400px;
  max-height: 500px;
  overflow: auto;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

export const TextInput = styled.input`
  width: 60px;
`;

const FARM_15 = "{k.vt} {k.f6}";

type TileWithDist = Tile & { distance?: number };

export const Find15: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [allTiles, setAllTiles] = useState<TileWithDist[]>();
  const [start, setStart] = useState("");

  useEffect(() => {
    console.log({ allTiles });
  }, [allTiles]);

  const filtered = useMemo(() => {
    const filtered = allTiles?.filter(({ title }) => title === FARM_15);

    const spl = start.split("|");
    if (spl.length !== 2) {
      return filtered;
    }
    const [startX, startY] = spl.map(Number);

    return filtered
      ?.map((tile) => {
        return {
          ...tile,
          distance: getDistance(tile.position.x, startX, tile.position.y, startY),
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [allTiles, start]);

  return (
    <Container>
      <Flex flexDirection="column" gap={12}>
        <Typography size="large">find 15</Typography>
        <label>x|y:</label>
        <TextInput
          type="text"
          className="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <button
          className="textButtonV1 green"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);

            const positions = getAllPositions({ size: 401, step: 31 });
            if (!positions) return;
            const tiles = new Map<string, Tile>();
            for (let i = 0; i < positions?.length; i++) {
              const res = await apiMapPosition(positions[i]);
              res.forEach((tile) => {
                tiles.set(`${tile.position.x}|${tile.position.y}`, tile);
              });
              setProgress(`${((i / (positions.length - 1)) * 100).toFixed()} %`);
            }
            setAllTiles(Array.from(tiles.values()));

            setIsLoading(false);
          }}
        >
          Поиск
        </button>

        <Typography>Прогресс: {progress}</Typography>

        <Table>
          {filtered?.map((tile) => {
            const { x, y } = tile.position;
            return (
              <Flex alignItems="center" gap={4}>
                <Typography>{tile.distance}</Typography>
                <a href={`/karte.php?x=${x}&y=${y}`}>{`(${x}|${y})`}</a>
              </Flex>
            );
          })}
        </Table>
      </Flex>
    </Container>
  );
};
