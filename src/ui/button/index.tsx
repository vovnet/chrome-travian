import React, { FC, PropsWithChildren, ReactElement, ReactNode } from "react";
import MUIButton from "@mui/material/Button";
import { tokens } from "../../variables/tokens";

type ButtonProps = {
  children?: string | number | JSX.Element | ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export const Button: FC<ButtonProps> = ({ children, disabled, onClick }) => {
  return (
    <MUIButton
      sx={{ backgroundColor: "#1f1f1f", color: tokens.colors.accent, fontSize: "0.6rem" }}
      variant="contained"
      disableElevation
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </MUIButton>
  );
};
