import React from "react";
import { Meta, Story } from "@storybook/react";
import { CodeInput, CodeInputProps } from "../src";

const meta: Meta = {
  title: "CodeInput",
  component: CodeInput,
  argTypes: {
    symbols: { control: { type: "array" } },
  },
  args: {
    symbols: [
      "accruedInterest",
      "adjustedDiscountPrice",
      "all",
      "any",
      "commission",
      "costs",
      "cpa",
      "cvr",
      "price",
      "profit",
      "salePrice",
      "vat",
    ],
    placeholder: "any(salePrice - vat, cpa)",
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<CodeInputProps> = args => <CodeInput {...args} />;

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

export const ControlledInput = () => {
  const [state, setState] = React.useState("123");
  return (
    <CodeInput
      symbols={["HEY", "THERE"]}
      value={state}
      onChange={e => {
        setState(e.currentTarget.value.toUpperCase());
      }}
    />
  );
};

const ExampleCustomInput = React.forwardRef<HTMLInputElement>((props, ref) => (
  <input className="input" ref={ref} {...props} />
));

export const CustomComponent = Template.bind({});
CustomComponent.args = {
  customInputComponent: ExampleCustomInput,
};
