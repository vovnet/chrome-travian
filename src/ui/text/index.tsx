import styled from "styled-components";

type TextSize = "small" | "medium" | "large";

type TextProps = {
  size?: TextSize;
};

export const Typography = styled.div<TextProps>`
  font-size: ${(props) => getSize(props.size)};
`;

const getSize = (s?: TextSize) => {
  switch (s) {
    case "small":
      return "0.8em";
    case "medium":
      return "1em";
    case "large":
      return "1.4em";
    default:
      return "1em";
  }
};
