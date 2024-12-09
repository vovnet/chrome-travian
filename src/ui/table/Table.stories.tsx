import React from "react";
import { Meta, StoryObj } from "@storybook/react/*";
import { Table } from ".";

type Story = StoryObj<typeof Table>;

const meta: Meta<typeof Table> = {
  component: Table,
};

export default meta;

export const Default: Story = {
  args: {
    columns: [
      { label: "Name", renderCell: (item) => <>{item.name}</> },
      { label: "Age", renderCell: (item) => <>{item.age}</> },
    ],
    data: [
      { name: "Vasya", age: 20 },
      { name: "Petya", age: 44 },
      { name: "Masha", age: 32 },
      { name: "Oleg", age: 23 },
    ],
  },
};
