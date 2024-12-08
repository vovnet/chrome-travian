import React, { ChangeEventHandler, FC } from "react";
import MuiTextField from "@mui/material/TextField";

type TextFieldProps = {
  disabled?: boolean;
  placeholder?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined;
};

export const TextField: FC<TextFieldProps> = ({ disabled, placeholder, value, onChange }) => {
  return (
    <MuiTextField
      sx={{ ".MuiInputBase-input": {} }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
