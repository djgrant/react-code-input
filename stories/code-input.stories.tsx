import React from "react";
import { Meta, Story } from "@storybook/react";
import { CodeInput, CodeInputProps } from "../src/code-input";

const meta: Meta = {
  title: "CodeInput",
  component: CodeInput,
  argTypes: {
    operators: { control: { type: "array" } },
    variables: { control: { type: "array" } },
  },
  args: {
    operators: ["+", "-", "/", "*"],
    variables: [
      "accruedInterest",
      "adjustedDiscountPrice",
      "commision",
      "costs",
      "cpa",
      "cvr",
      "price",
      "profit",
      "salePrice",
      "vat",
    ],
    placeholder: "salePrice - vat",
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<CodeInputProps> = (args) => <CodeInput {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  style: {
    width: "350px",
    padding: "10px",
    fontSize: "14px",
    fontFamily: "monospace",
  },
};

const ExampleCustomInput = React.forwardRef<HTMLInputElement>((props, ref) => (
  <input className="input" ref={ref} {...props} />
));

export const CustomComponent = Template.bind({});
CustomComponent.args = {
  customInput: ExampleCustomInput,
};
