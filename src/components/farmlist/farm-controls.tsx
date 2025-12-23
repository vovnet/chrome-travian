import React, { FC, useRef } from "react";
import { Flex } from "../../ui/flex";
import { Button } from "../../ui/button";
import styled from "@emotion/styled";

interface FarmControlsProps {
  addFarm: (value: string) => boolean;
  farmsCount: number;
  isLoading: boolean;
  mappedFarms: { x: string; y: string, distance: number }[];
  setFarms: (newFarms: Set<string>) => void;
  resetPosition: () => void;
}

export const FarmControls: FC<FarmControlsProps> = ({
  addFarm,
  farmsCount,
  isLoading,
  mappedFarms,
  setFarms,
  resetPosition,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (addFarm(value)) {
        inputRef.current.value = "";
      }
    }
  };

  const handleSort = () => {
    const sorted = mappedFarms.sort((a, b) => a.distance - b.distance).map((v) => `${v.x}|${v.y}`);
    setFarms(new Set(sorted));
  };

  return (
    <InputContainer>
      <label>x|y:</label>
      <TextInput ref={inputRef} type="text" className="text" />
      <Button onClick={handleAdd}>{chrome.i18n.getMessage("add")}</Button>
      <Button disabled={!farmsCount || isLoading} onClick={handleSort}>
        Sort
      </Button>
      <Button disabled={isLoading} onClick={resetPosition}>
        {chrome.i18n.getMessage("reset")}
      </Button>
    </InputContainer>
  );
};

/////////// Styles

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextInput = styled.input`
  width: 60px;
`;
