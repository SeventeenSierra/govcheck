import type { Meta, StoryObj } from "@storybook/react";
import AgentInterface from "./agent-interface";

const meta: Meta<typeof AgentInterface> = {
    title: "App/AgentInterface",
    component: AgentInterface,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        activeProject: { control: "text" },
        startDemo: { action: "startDemo" },
    },
};

export default meta;
type Story = StoryObj<typeof AgentInterface>;

export const Idle: Story = {
    args: {
        activeProject: null,
        startDemo: () => { },
    },
};

export const ActiveProject: Story = {
    args: {
        activeProject: "proj-1",
        startDemo: () => { },
    },
};
