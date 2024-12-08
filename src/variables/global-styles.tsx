import React, { FC } from "react";
import { css, Global } from "@emotion/react";

export const GlobalStyles: FC = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
      }
    `}
  />
);
