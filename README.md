# react-code-input

A lightweight component that turns `<input type="text" />` into a mini code editor.

Provides basic tokenisation, parsing, syntax highlighting, validation and code completion for simple code expressions.

There are zero dependencies and you can style the input in any way that you want.

[View examples →](http://react-code-input.netlify.app)

## Quick start

```tsx
import { CodeInput } from "@djgrant/react-code-input";

export default () => (
  <CodeInput
    placeholder="price - vat"
    symbols={["price", "vat"]}
    customInputComponent={MyInput}
    style={{ width: "300px" }}
    onChange={event => {
      console.log(event.tokens);
      console.log(event.currentTarget.value);
    }}
  />
);
```
