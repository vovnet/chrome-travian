import React, { FC } from "react";
import { Flex } from "../../ui/flex";
import { Table } from "../../ui/table";
import styled from "@emotion/styled";
import { CloseIcon } from "../../icons/close-icon";

type FarmRow = {
  id: string;
  x: string;
  y: string;
  index: number;
  distance: number;
};

interface FarmsTableProps {
  farms: FarmRow[];
  lastPosition: number;
  stopList: Set<string>;
  isLoading: boolean;
  removeFarm: (id: string) => boolean;
  setLastPosition: (pos: number) => void;
}

export const FarmsTable: FC<FarmsTableProps> = ({
  farms,
  lastPosition,
  stopList,
  isLoading,
  removeFarm,
  setLastPosition,
}) => {
  return (
    <Table<FarmRow>
      columns={[
        {
          label: "🔪",
          renderCell: ({ index }) => (
            <Flex justifyContent="center">{index === lastPosition && <CurrentPoint />}</Flex>
          ),
        },
        { label: "#", renderCell: ({ index }) => <>{index + 1}</> },
        { label: "Dist", renderCell: ({ distance }) => <>{distance}</> },
        {
          label: "Pos",
          renderCell: ({ id, x, y }) => (
            <FarmLink href={`/karte.php?x=${x}&y=${y}`} isDanger={stopList.has(id)}>
              {`(${x}|${y})`}
            </FarmLink>
          ),
        },
        {
          label: "Del",
          renderCell: ({ id, index }) => (
            <StyledIconButton
              disabled={isLoading}
              onClick={() => {
                const removedIndex = farms.findIndex((f) => f.id === id);
                if (removeFarm(id) && lastPosition > removedIndex) {
                  setLastPosition(lastPosition - 1);
                }
              }}
            >
              <CloseIcon />
            </StyledIconButton>
          ),
        },
      ]}
      data={farms}
    />
  );
};

/////////// Styles

const FarmLink = styled.a<{ isDanger?: boolean }>`
  min-width: 60px;
  background-color: ${(props) => (props.isDanger ? "#290201" : "inherit")};
`;

const CurrentPoint = styled.div`
  width: 12px;
  height: 12px;
  background-color: #ecb501;
  border-radius: 50%;
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
