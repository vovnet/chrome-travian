import styled from "@emotion/styled";
import React, { FC, useEffect, useMemo, useState } from "react";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { apiMapPosition } from "../../client";
import { getAllPositions } from "../../utils/map";
import { Tile } from "../../types";
import { getDistance } from "../../utils";
import { Button } from "../../ui/button";

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

const TextInput = styled.input`
  width: 60px;
`;

const Crop = styled.div<{ isNine?: boolean }>`
  display: flex;
  gap: 4px;
  justify-content: center;
  background-color: ${(props) => (props.isNine ? "#cec47b" : "#DAC734")};
`;

const FARM_15 = "{k.vt} {k.f6}";
const FARM_9 = "{k.vt} {k.f1}";

type TileWithDist = Tile & { distance?: number };

export const Find15: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [allTiles, setAllTiles] = useState<TileWithDist[]>();
  const [start, setStart] = useState("");
  const [isNine, setIsNine] = useState(false);

  useEffect(() => {
    console.log({ allTiles });
  }, [allTiles]);

  const filtered = useMemo(() => {
    const filterFn: (value: TileWithDist) => boolean = isNine
      ? ({ title }) => title === FARM_15 || title === FARM_9
      : ({ title }) => title === FARM_15;

    const filtered = allTiles?.filter(filterFn);

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
  }, [allTiles, start, isNine]);

  return (
    <Container>
      <Flex flexDirection="column" gap={12}>
        <Typography size="large">Поиск кроповых клеток</Typography>
        <Flex gap={12} alignItems="center">
          <div>
            <label>Ближе:</label>
            <TextInput
              type="text"
              className="text"
              placeholder="x|y"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label>9:</label>
            <input type="checkbox" checked={isNine} onChange={(e) => setIsNine(e.target.checked)} />
          </div>
        </Flex>

        <Button
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
        </Button>

        <Typography>Прогресс: {progress}</Typography>

        <Table>
          {filtered?.map((tile) => {
            const { x, y } = tile.position;
            return (
              <Crop isNine={tile.title === FARM_9}>
                <Typography>{tile.distance}</Typography>
                <a href={`/karte.php?x=${x}&y=${y}`}>{`(${x}|${y})`}</a>
              </Crop>
            );
          })}
        </Table>
      </Flex>
    </Container>
  );
};
