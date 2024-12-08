import { Meta, StoryObj } from "@storybook/react/*";
import { Button } from ".";

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

export const Default: Story = {
  args: {
    children: "Click me",
  },
};

export const Disabled: Story = {
  args: {
    children: "Click me",
    disabled: true,
  },
};
