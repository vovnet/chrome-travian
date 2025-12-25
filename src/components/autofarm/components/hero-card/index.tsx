import React, { FC } from "react";
import { Flex } from "../../../../ui/flex";
import { Button } from "../../../../ui/button";

type HeroCardProps = {
  minHealth?: number;
  heroStrength?: number;
  isStarted?: boolean;
  interval?: number;
  formattedLastRun?: string;
  onChangeHealth?: (val: number) => void;
  onChangeHeroStrength?: (val: number) => void;
  onStart?: () => void;
  onChageInterval?: (val: number) => void;
};

export const HeroCard: FC<HeroCardProps> = ({
  minHealth,
  heroStrength,
  isStarted,
  interval,
  formattedLastRun,
  onChangeHealth,
  onChangeHeroStrength,
  onStart,
  onChageInterval,
}) => {
  return (
    <Flex flexDirection="column" gap={10}>
      Hero
      <Flex gap={8}>
        <span>{`Интервал: `}</span>
        <input
          type="number"
          min={1}
          value={interval ?? 5}
          onChange={(e) => onChageInterval?.(+e.currentTarget.value)}
        />
        <span>мин</span>
      </Flex>
      <span>{`Последий запуск: ${formattedLastRun}`}</span>
      <Flex gap={8} alignItems="center">
        <span>Min HP %:</span>
        <input
          type="number"
          step={1}
          min={1}
          max={100}
          value={minHealth}
          onChange={(e) => onChangeHealth?.(+e.currentTarget.value)}
        />
      </Flex>
      <Flex gap={8} alignItems="center">
        <span>Сила:</span>
        <input
          type="number"
          min={1}
          value={heroStrength}
          onChange={(e) => onChangeHeroStrength?.(+e.currentTarget.value)}
        />
      </Flex>
      <Button onClick={onStart}>{isStarted ? `Stop` : "Start"}</Button>
    </Flex>
  );
};
