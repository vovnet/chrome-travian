import styled from "@emotion/styled";
import React, { FC, ReactNode, useState } from "react";
import { tokens } from "../../variables/tokens";

type TabsProps = {
  items?: { id: string; title: ReactNode; styles?: { background?: `#${string}` } }[];
  selected?: string;
  onChange?: (id: string) => void;
};

export const Tabs: FC<TabsProps> = ({
  items,
  selected: controlledSelected,
  onChange: setControlledSelected,
}) => {
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string>();

  const selected = controlledSelected ?? uncontrolledSelected;
  const setSelected = setControlledSelected ?? setUncontrolledSelected;

  return (
    <Container>
      {items?.map((item) => (
        <Item
          key={item.id}
          isSelected={selected === item.id}
          onClick={() => setSelected(item.id)}
          {...item.styles}
        >
          {item.title}
        </Item>
      ))}
    </Container>
  );
};

////////// Styles

export const Container = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  background-color: #1f1f1f;
`;

export const Item = styled.div<{ isSelected?: boolean; background?: `#${string}` }>`
  flex: 1;
  height: 100%;
  text-align: center;
  padding: 8px 14px;
  border-bottom: ${(props) =>
    props.isSelected ? `2px solid ${tokens.colors.accent}` : "2px solid #1f1f1f"};
  transition: color 0.3s;
  color: ${(props) => (props.isSelected ? tokens.colors.accent : tokens.colors.primary)};
  user-select: none;

  &:hover {
    cursor: pointer;
    border-bottom: 2px solid ${tokens.colors.accent};
  }
`;
