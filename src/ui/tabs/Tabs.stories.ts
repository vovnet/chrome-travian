import { Meta, StoryObj } from "@storybook/react/*";
import { Tabs } from ".";

type Story = StoryObj<typeof Tabs>;

const meta: Meta<typeof Tabs> = {
  component: Tabs,
};

export default meta;

export const Default: Story = {
  args: {
    items: [
      {
        id: "1",
        title: "First",
      },
      {
        id: "2",
        title: "Second",
      },
      {
        id: "3",
        title: "Third",
      },
    ],
  },
};
