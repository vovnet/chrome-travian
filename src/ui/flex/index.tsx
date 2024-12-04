import styled from "styled-components";

export const Flex = styled.div<{
  flexDirection?: "column" | "column-reverse" | "row" | "row-reverse";
  gap?: number;
  alignItems?: "left" | "right" | "center" | "baseline";
  justifyContent?: "left" | "right" | "center" | "baseline" | "space-between" | "space-around";
}>`
  display: flex;
  flex-direction: ${(props) => props.flexDirection || "row"};
  gap: ${({ gap }) => `${gap}px` || "0px"};
  align-items: ${({ alignItems }) => alignItems || "normal"};
  justify-content: ${({ justifyContent }) => justifyContent || "normal"};
`;
