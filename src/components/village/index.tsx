import React, { FC } from "react";
import { Container, Info } from "./styles";

type VillageProps = {
  distance: number;
  position: { x: number; y: number };
  text?: string;
  checked?: boolean;
  disabled?: boolean;
  onChecked?: (id: string, checked: boolean) => void;
};

export const Village: FC<VillageProps> = ({
  distance,
  position,
  text,
  disabled,
  checked,
  onChecked,
}) => {
  return (
    <Container>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChecked?.(`${position.x}|${position.y}`, e.target.checked)}
      />
      <a
        href={`/karte.php?x=${position.x}&y=${position.y}`}
      >{`${distance} (${position.x}|${position.y})`}</a>
      <Info dangerouslySetInnerHTML={{ __html: text }} />
    </Container>
  );
};
