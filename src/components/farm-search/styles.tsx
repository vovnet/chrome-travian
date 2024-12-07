import styled from "@emotion/styled";

export const Container = styled.div`
  display: flex;
  gap: 14px;
  flex-direction: column;
  padding: 8px;
  min-width: 250px;
`;

export const TextInput = styled.input`
  width: 60px;
`;

export const Table = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  padding: 4px;
  max-height: 600px;
  overflow: auto;
`;

export const Cell = styled.div<{ isWarning?: boolean }>`
  border: 1px solid #a79f908d;
  padding: 4px 6px;
  text-align: center;
  background-color: ${(props) => (props.isWarning ? "#f0ae8f" : "transparent")};
`;
