import React, { FC, useState } from "react";
import { Container, Item } from "./styles";

type TabsProps = {
  items?: { id: string; title: string }[];
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
        <Item key={item.id} isSelected={selected === item.id} onClick={() => setSelected(item.id)}>
          {item.title}
        </Item>
      ))}
    </Container>
  );
};
