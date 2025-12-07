import type { Meta, StoryObj } from "@storybook/react";
import ReportPreview from "./report-preview";

const meta: Meta<typeof ReportPreview> = {
    title: "App/ReportPreview",
    component: ReportPreview,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
    argTypes: {
        isVisible: { control: "boolean" },
    },
};

export default meta;
type Story = StoryObj<typeof ReportPreview>;

export const Visible: Story = {
    args: {
        isVisible: true,
    },
};

export const Hidden: Story = {
    args: {
        isVisible: false,
    },
};
