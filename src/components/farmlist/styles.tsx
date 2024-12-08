import styled from "@emotion/styled";
import { Flex } from "../../ui/flex";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-width: 250px;
`;

export const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const TextInput = styled.input`
  width: 60px;
`;

export const List = styled(Flex)`
  flex-wrap: wrap;
  max-width: 340px;
  max-height: 600px;
  overflow: auto;
`;

export const ListItem = styled(Flex)<{ isCurrent?: boolean }>`
  background-color: ${(props) => (props.isCurrent ? "#ffec3f" : "#f5efe0")};
  transition: 0.4s;
`;

export const FarmLink = styled.a<{ isDanger?: boolean }>`
  min-width: 60px;
  background-color: ${(props) => (props.isDanger ? "#290201" : "inherit")};
`;
