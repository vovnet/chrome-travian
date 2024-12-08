import { Meta, StoryObj } from "@storybook/react/*";
import { TextField } from ".";

type Story = StoryObj<typeof TextField>;

const meta: Meta<typeof TextField> = {
  component: TextField,
};

export default meta;

export const Default: Story = {
  args: {
    placeholder: "type this",
  },
};

export const Disabled: Story = {
  args: {
    value: "Some text...",
    disabled: true,
  },
};
