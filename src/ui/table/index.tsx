import styled from "@emotion/styled";
import React, { FC } from "react";
import { tokens } from "../../variables/tokens";

type TableProps<T> = {
  columns?: { label: string; renderCell: (item: T) => React.ReactElement }[];
  data?: T[];
};

export function Table<T>({ columns, data }: TableProps<T>) {
  return (
    <StyledTable>
      <StyledRow>
        {columns?.map((column) => (
          <StyledHead key={column.label}>{column.label}</StyledHead>
        ))}
      </StyledRow>
      {data?.map((d, i) => (
        <StyledRow key={i}>
          {columns?.map((col, i) => (
            <StyledData key={`cell-${i}`}>{col.renderCell(d)}</StyledData>
          ))}
        </StyledRow>
      ))}
    </StyledTable>
  );
}

/////////////// Styles

const StyledTable = styled.table`
  color: #ffffffae;
  background-color: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.accent};
  border-collapse: collapse;
  text-align: center;
`;

const StyledRow = styled.tr`
  border: 1px solid ${tokens.colors.accent};

  &:hover {
    background-color: #2e2e2e;
  }
`;

const StyledHead = styled.th`
  border: 1px solid ${tokens.colors.accent};
  background-color: inherit;
  border: 1px solid ${tokens.colors.accent};
  text-align: inherit;
  padding: 6px;
`;

const StyledData = styled.td`
  border: 1px solid ${tokens.colors.accent};
  background-color: inherit;
  border: 1px solid ${tokens.colors.accent};
  text-align: inherit;
  padding: 6px;
`;
