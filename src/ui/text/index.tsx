import styled from "@emotion/styled";

type TextSize = "small" | "medium" | "large";

type TextProps = {
  size?: TextSize;
  kind?: "default" | "danger" | "warning" | "success";
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
