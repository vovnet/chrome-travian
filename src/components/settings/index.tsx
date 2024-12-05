import React, { FC } from "react";
import { Container } from "./styles";
import { Typography } from "../../ui/text";
import { Flex } from "../../ui/flex";
import { useNation } from "../../hooks/use-nation";
import { Nations } from "../../utils/unit";

export const Settings: FC = () => {
  const { nation, changeNation } = useNation();
  return (
    <Container>
      <Flex flexDirection="column" gap={8}>
        <Typography size="large">Настройки</Typography>
        <select value={nation} onChange={(e) => changeNation(Number(e.target.value) as Nations)}>
          <option value="">Выберите народ</option>
          <option value={0}>Римляне</option>
          <option value={1}>Германцы</option>
          <option value={2}>Галы</option>
        </select>
      </Flex>
    </Container>
  );
};
