import styled from "@emotion/styled";
import React, { FC, useMemo, useState } from "react";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { apiMapPosition } from "../../client";
import { getAllPositions } from "../../utils/map";
import { Tile } from "../../types";
import { getDistance } from "../../utils";
import { Button } from "../../ui/button";
import { Layout } from "../../ui/layout";
import { Table } from "../../ui/table";

const FARM_15 = "{k.vt} {k.f6}";
const FARM_9 = "{k.vt} {k.f1}";

type TileWithDist = Tile & { distance?: number };

export const Find15: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [allTiles, setAllTiles] = useState<TileWithDist[]>();
  const [start, setStart] = useState("");
  const [isNine, setIsNine] = useState(false);

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
    <Layout
      title={<Typography size="large">{chrome.i18n.getMessage("searchOfCropTitle")}</Typography>}
    >
      <Flex flexDirection="column" gap={12}>
        <Flex gap={12} alignItems="center">
          <div>
            <label>{chrome.i18n.getMessage("closer")}:</label>
            <TextInput
              type="text"
              className="text"
              placeholder="x|y"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label>{chrome.i18n.getMessage("nineCrop")}:</label>
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
          {chrome.i18n.getMessage("search")}
        </Button>

        {isLoading && (
          <Typography>
            {chrome.i18n.getMessage("progress")}: {progress}
          </Typography>
        )}

        {!!filtered?.length && (
          <Flex flexDirection="column" gap={8}>
            <Typography>
              {chrome.i18n.getMessage("found")}: {filtered.length}
            </Typography>

            <TableWrapper>
              <Table<TileWithDist>
                columns={[
                  { label: "Dist", renderCell: ({ distance }) => <>{distance}</> },
                  {
                    label: "Type",
                    renderCell: ({ title }) => <>{title === FARM_9 ? "9" : "15"}</>,
                  },
                  {
                    label: "X|Y",
                    renderCell: ({ position }) => (
                      <a
                        href={`/karte.php?x=${position.x}&y=${position.y}`}
                      >{`(${position.x}|${position.y})`}</a>
                    ),
                  },
                ]}
                data={filtered}
              />
            </TableWrapper>
          </Flex>
        )}
      </Flex>
    </Layout>
  );
};

//////////// Styles

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow: auto;
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
